import React, { useEffect, useMemo, useState } from 'react';
import {
  Card,
  Space,
  Table,
  Button,
  Tag,
  Modal,
  Form,
  Select,
  Input,
  Switch,
  DatePicker,
  Upload,
  message,
  Empty,
  Tooltip,
} from 'antd';
import {
  FilePdfOutlined,
  UploadOutlined,
  PlusOutlined,
  LinkOutlined,
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
} from '@ant-design/icons';
import examinationAPI, {
  CreateQuestionPaperDTO,
  QuestionPaper,
  UpdateQuestionPaperDTO,
  Exam,
} from '@/api/examination.api';
import { academicAPI, Course } from '@/api/academic.api';
import dayjs, { Dayjs } from 'dayjs';

const { Option } = Select;

interface QuestionPaperFilters {
  examId?: string;
}

const toBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });

const QuestionPapers: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [questionPapers, setQuestionPapers] = useState<QuestionPaper[]>([]);
  const [exams, setExams] = useState<any[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [filters, setFilters] = useState<QuestionPaperFilters>({});
  const [uploadModal, setUploadModal] = useState(false);
  const [form] = Form.useForm();
  const [fileState, setFileState] = useState<{ fileName: string; base64: string } | null>(null);
  const [editingPaper, setEditingPaper] = useState<QuestionPaper | null>(null);

  useEffect(() => {
    loadReferenceData();
    fetchQuestionPapers(filters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadReferenceData = async () => {
    try {
      const [examResponse, courseResponse] = await Promise.all([
        examinationAPI.getAllExams({ page: 1, limit: 500 }),
        academicAPI.getCourses(1, 500, { isActive: true }),
      ]);
      const examData = Array.isArray((examResponse as any)?.exams)
        ? (examResponse as any).exams
        : Array.isArray((examResponse as any)?.data?.exams)
        ? (examResponse as any).data.exams
        : Array.isArray(examResponse as any)
        ? (examResponse as any)
        : [];
      setExams(examData);
      setCourses(courseResponse.courses);
    } catch (error) {
      console.warn('Failed to load question paper reference data', error);
    }
  };

  const fetchQuestionPapers = async (currentFilters: QuestionPaperFilters = filters) => {
    try {
      setLoading(true);
      const response = await examinationAPI.getQuestionPapers({
        examId: currentFilters.examId,
        page: 1,
        limit: 200,
      });
      const data = Array.isArray(response?.questionPapers)
        ? response.questionPapers
        : Array.isArray((response as any)?.data?.questionPapers)
        ? (response as any).data.questionPapers
        : Array.isArray(response as any)
        ? (response as any)
        : [];
      setQuestionPapers(data);
    } catch (error: any) {
      message.error(error.message || 'Failed to load question papers');
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async () => {
    try {
      const values = await form.validateFields();
      if (!fileState) {
        message.warning('Please attach a question paper file');
        return;
      }
      const payload: CreateQuestionPaperDTO = {
        examId: values.examId,
        version: values.version,
        notes: values.notes,
        isActive: values.isActive ?? true,
        secureUntil: values.secureUntil ? values.secureUntil.format('YYYY-MM-DD') : undefined,
        fileName: fileState.fileName,
        fileBase64: fileState.base64,
      };
      await examinationAPI.uploadQuestionPaper(payload);
      message.success('Question paper uploaded');
      setUploadModal(false);
      setFileState(null);
      form.resetFields();
      fetchQuestionPapers(filters);
    } catch (error: any) {
      if (error?.errorFields) return;
      message.error(error.message || 'Failed to upload question paper');
    }
  };

  const handleUpdate = async (paper: QuestionPaper, data: UpdateQuestionPaperDTO) => {
    try {
      await examinationAPI.updateQuestionPaper(paper.id, data);
      message.success('Question paper updated');
      fetchQuestionPapers(filters);
    } catch (error: any) {
      message.error(error.message || 'Failed to update question paper');
    }
  };

  const handleDelete = async (paper: QuestionPaper) => {
    try {
      await examinationAPI.deleteQuestionPaper(paper.id);
      message.success('Question paper deleted');
      fetchQuestionPapers(filters);
    } catch (error: any) {
      message.error(error.message || 'Failed to delete question paper');
    }
  };

  const handleGenerateLink = async (paper: QuestionPaper) => {
    try {
      const { signedUrl } = await examinationAPI.generateQuestionPaperLink(paper.id);
      await navigator.clipboard.writeText(signedUrl);
      message.success('Secure link copied to clipboard');
    } catch (error: any) {
      message.error(error.message || 'Failed to generate secure link');
    }
  };

  const examLookup = useMemo(() => {
    const map = new Map<string, Exam>();
    (exams as Exam[]).forEach((exam) => map.set(exam.id, exam));
    return map;
  }, [exams]);

  const courseLookup = useMemo(() => {
    const map = new Map<string, Course>();
    courses.forEach((course) => map.set(course.id, course));
    return map;
  }, [courses]);

  const columns = [
    {
      title: 'Exam',
      dataIndex: 'examId',
      key: 'examId',
      render: (examId: string) => {
        const exam = examLookup.get(examId);
        const course = exam ? courseLookup.get(exam.courseId) : undefined;
        return exam ? (
          <Space direction="vertical" size={0}>
            <span style={{ fontWeight: 600 }}>{exam.title}</span>
            {course && <span style={{ color: '#888' }}>{course.code}</span>}
          </Space>
        ) : (
          examId
        );
      },
    },
    {
      title: 'Version',
      dataIndex: 'version',
      key: 'version',
      render: (version: string, paper: QuestionPaper) => (
        <Space>
          <Tag color={paper.isActive ? 'blue' : 'default'}>{version}</Tag>
          {paper.secureToken && <Tag color="purple">Secure</Tag>}
        </Space>
      ),
    },
    {
      title: 'Uploaded',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (createdAt: string) => dayjs(createdAt).format('DD MMM YYYY, h:mm A'),
    },
    {
      title: 'Notes',
      dataIndex: 'notes',
      key: 'notes',
      ellipsis: true,
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: QuestionPaper) => (
        <Space>
          <Tooltip title="Preview">
            <Button type="link" icon={<EyeOutlined />} href={record.fileUrl} target="_blank" />
          </Tooltip>
          <Tooltip title="Secure Link">
            <Button type="link" icon={<LinkOutlined />} onClick={() => handleGenerateLink(record)} />
          </Tooltip>
          <Tooltip title="Edit">
            <Button type="link" icon={<EditOutlined />} onClick={() => setEditingPaper(record)} />
          </Tooltip>
          <Tooltip title="Delete">
            <Button danger type="link" icon={<DeleteOutlined />} onClick={() => handleDelete(record)} />
          </Tooltip>
        </Space>
      ),
    },
  ];

  const filteredPapers = useMemo(() => {
    if (!filters.examId) return questionPapers;
    return questionPapers.filter((paper) => paper.examId === filters.examId);
  }, [questionPapers, filters.examId]);

  return (
    <div style={{ padding: 24 }}>
      <Card
        style={{ borderRadius: 16 }}
        bodyStyle={{ padding: 24 }}
        title={
          <Space size="large">
            <FilePdfOutlined />
            <span style={{ fontSize: 20, fontWeight: 600 }}>Question Paper Repository</span>
          </Space>
        }
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setUploadModal(true)}>
            Upload Paper
          </Button>
        }
      >
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <Card bordered={false} style={{ borderRadius: 12, background: '#fafafa' }}>
            <Space wrap style={{ width: '100%' }}>
              <Select
                placeholder="Filter by exam"
                allowClear
                showSearch
                optionFilterProp="children"
                style={{ minWidth: 240 }}
                value={filters.examId}
                onChange={(value) => {
                  const updated = { examId: value || undefined };
                  setFilters(updated);
                  fetchQuestionPapers(updated);
                }}
              >
                {(exams as Exam[]).map((exam) => (
                  <Option key={exam.id} value={exam.id}>
                    {exam.title}
                  </Option>
                ))}
              </Select>
            </Space>
          </Card>

          <Table
            rowKey="id"
            loading={loading}
            dataSource={filteredPapers}
            columns={columns}
            locale={{ emptyText: loading ? <Empty description="Loading papers..." /> : <Empty description="No question papers uploaded" /> }}
          />
        </Space>
      </Card>

      <Modal
        title="Upload Question Paper"
        open={uploadModal}
        onCancel={() => {
          setUploadModal(false);
          setFileState(null);
          form.resetFields();
        }}
        onOk={handleUpload}
        okText="Upload"
        destroyOnClose
      >
        <Form layout="vertical" form={form}>
          <Form.Item name="examId" label="Exam" rules={[{ required: true, message: 'Select exam' }]}> 
            <Select placeholder="Select exam" showSearch optionFilterProp="children">
              {(exams as Exam[]).map((exam) => (
                <Option key={exam.id} value={exam.id}>
                  {exam.title}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="version" label="Version" rules={[{ required: true, message: 'Specify version' }]}> 
            <Input placeholder="e.g., Draft v1, Final" />
          </Form.Item>
          <Form.Item name="notes" label="Notes">
            <Input.TextArea rows={3} placeholder="Short description or reminders" />
          </Form.Item>
          <Form.Item name="isActive" label="Active" valuePropName="checked" initialValue>
            <Switch />
          </Form.Item>
          <Form.Item name="secureUntil" label="Secure Access Until">
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item label="File" required>
            <Upload.Dragger
              maxCount={1}
              accept=".pdf,.doc,.docx"
              beforeUpload={async (file) => {
                try {
                  const base64 = await toBase64(file);
                  setFileState({ fileName: file.name, base64 });
                } catch (error) {
                  message.error('Failed to read file');
                }
                return false;
              }}
              onRemove={() => setFileState(null)}
            >
              <p className="ant-upload-drag-icon">
                <UploadOutlined />
              </p>
              <p className="ant-upload-text">Click or drag file to upload (PDF, DOC)</p>
            </Upload.Dragger>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Update Question Paper"
        open={!!editingPaper}
        onCancel={() => setEditingPaper(null)}
        onOk={async () => {
          if (!editingPaper) return;
          const values = await form.validateFields();
          await handleUpdate(editingPaper, {
            version: values.version,
            notes: values.notes,
            isActive: values.isActive,
            secureUntil: values.secureUntil ? values.secureUntil.format('YYYY-MM-DD') : undefined,
          });
          setEditingPaper(null);
        }}
        okText="Save"
        destroyOnClose
        afterOpenChange={(open) => {
          if (open && editingPaper) {
            form.setFieldsValue({
              version: editingPaper.version,
              notes: editingPaper.notes,
              isActive: editingPaper.isActive,
              secureUntil: editingPaper.secureUntil ? dayjs(editingPaper.secureUntil) : undefined,
            });
          } else {
            form.resetFields(['version', 'notes', 'isActive', 'secureUntil']);
          }
        }}
      >
        <Form layout="vertical" form={form}>
          <Form.Item name="version" label="Version" rules={[{ required: true, message: 'Specify version' }]}> 
            <Input placeholder="e.g., Final v2" />
          </Form.Item>
          <Form.Item name="notes" label="Notes">
            <Input.TextArea rows={3} placeholder="Highlights or updates" />
          </Form.Item>
          <Form.Item name="isActive" label="Active" valuePropName="checked">
            <Switch />
          </Form.Item>
          <Form.Item name="secureUntil" label="Secure Access Until">
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default QuestionPapers;
