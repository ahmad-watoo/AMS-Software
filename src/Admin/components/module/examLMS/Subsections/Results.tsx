import React, { useEffect, useMemo, useState } from 'react';
import {
  Card,
  Space,
  Table,
  Tag,
  Select,
  Button,
  Drawer,
  Form,
  InputNumber,
  Input,
  message,
  Empty,
  Row,
  Col,
  Statistic,
  Tooltip,
} from 'antd';
import {
  TrophyOutlined,
  CheckCircleOutlined,
  PlusOutlined,
  EditOutlined,
  SafetyOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import examinationAPI, { ExamResult, Exam } from '@/api/examination.api';
import { academicAPI, Course } from '@/api/academic.api';
import { studentAPI, Student } from '../../../../../api/student.api';
import dayjs from 'dayjs';

const { Option } = Select;

interface Filters {
  examId?: string;
  status?: string;
}

const ResultsPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<ExamResult[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [filters, setFilters] = useState<Filters>({});
  const [editingResult, setEditingResult] = useState<ExamResult | null>(null);
  const [isCreateDrawer, setIsCreateDrawer] = useState(false);
  const [form] = Form.useForm();
  const [createForm] = Form.useForm();

  useEffect(() => {
    loadReferenceData();
    fetchResults(filters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadReferenceData = async () => {
    try {
      const [examResponse, courseResponse, studentResponse] = await Promise.all([
        examinationAPI.getAllExams({ page: 1, limit: 200 }),
        academicAPI.getCourses(1, 500, { isActive: true }),
        studentAPI.getStudents(1, 500, { enrollmentStatus: 'active' }),
      ]);
      setExams(examResponse.exams || []);
      setCourses(courseResponse.courses);
      setStudents(studentResponse.students);
    } catch (error) {
      console.warn('Failed to load examination references', error);
    }
  };

  const fetchResults = async (currentFilters: Filters = filters) => {
    try {
      setLoading(true);
      const response = await examinationAPI.getAllResults({
        examId: currentFilters.examId,
        status: currentFilters.status,
        page: 1,
        limit: 200,
      });
      const data = Array.isArray((response as any)?.results)
        ? (response as any).results
        : Array.isArray((response as any)?.data?.results)
        ? (response as any).data.results
        : Array.isArray((response as any)?.data)
        ? (response as any).data
        : Array.isArray(response)
        ? (response as any)
        : [];
      setResults(data);
    } catch (error: any) {
      message.error(error.message || 'Failed to load results');
    } finally {
      setLoading(false);
    }
  };

  const studentLookup = useMemo(() => {
    const map = new Map<string, Student>();
    students.forEach((student) => map.set(student.id, student));
    return map;
  }, [students]);

  const examLookup = useMemo(() => {
    const map = new Map<string, Exam>();
    exams.forEach((exam) => map.set(exam.id, exam));
    return map;
  }, [exams]);

  const courseLookup = useMemo(() => {
    const map = new Map<string, Course>();
    courses.forEach((course) => map.set(course.id, course));
    return map;
  }, [courses]);

  const summary = useMemo(() => {
    const approved = results.filter((result) => result.status === 'approved').length;
    const pending = results.filter((result) => result.status === 'pending' || result.status === 're_evaluation').length;
    const percentages = results
      .map((result) => result.percentage)
      .filter((value): value is number => typeof value === 'number');
    const average = percentages.length
      ? (percentages.reduce((sum, value) => sum + value, 0) / percentages.length).toFixed(1)
      : '0.0';
    return { total: results.length, approved, pending, average };
  }, [results]);

  const columns = [
    {
      title: 'Student',
      dataIndex: 'studentId',
      key: 'studentId',
      render: (studentId: string) => {
        const student = studentLookup.get(studentId);
        return student ? (
          <Space direction="vertical" size={0}>
            <span style={{ fontWeight: 600 }}>{`${student.user?.firstName || ''} ${student.user?.lastName || ''}`}</span>
            <span style={{ color: '#888' }}>{student.rollNumber}</span>
          </Space>
        ) : (
          studentId
        );
      },
    },
    {
      title: 'Exam',
      dataIndex: 'examId',
      key: 'examId',
      render: (examId: string, record: ExamResult) => {
        const exam = examLookup.get(examId);
        const course = exam ? courseLookup.get(exam.courseId) : undefined;
        return (
          <Space direction="vertical" size={0}>
            <span>{exam ? exam.title : examId}</span>
            {course && <span style={{ color: '#888' }}>{course.code}</span>}
          </Space>
        );
      },
    },
    {
      title: 'Marks',
      dataIndex: 'obtainedMarks',
      key: 'marks',
      render: (_: number, record: ExamResult) => (
        <Space>
          <Tag color="blue">{record.obtainedMarks}</Tag>
          <span>/ {record.totalMarks}</span>
        </Space>
      ),
    },
    {
      title: 'Percentage',
      dataIndex: 'percentage',
      key: 'percentage',
      render: (percentage: number | undefined) =>
        typeof percentage === 'number' ? `${percentage.toFixed(2)}%` : '—',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: ExamResult['status']) => {
        const colorMap: Record<ExamResult['status'], string> = {
          pending: 'orange',
          graded: 'blue',
          approved: 'green',
          re_evaluation: 'red',
        };
        return <Tag color={colorMap[status] || 'blue'}>{status.replace('_', ' ').toUpperCase()}</Tag>;
      },
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: ExamResult) => (
        <Space>
          <Tooltip title="Edit">
            <Button type="link" icon={<EditOutlined />} onClick={() => handleEdit(record)} />
          </Tooltip>
          {record.status !== 'approved' && (
            <Tooltip title="Approve">
              <Button type="link" icon={<CheckCircleOutlined />} onClick={() => handleApprove(record)} />
            </Tooltip>
          )}
        </Space>
      ),
    },
  ];

  const handleFilterChange = (field: keyof Filters, value?: string) => {
    const updated = { ...filters, [field]: value || undefined };
    setFilters(updated);
    fetchResults(updated);
  };

  const handleEdit = (result: ExamResult) => {
    setEditingResult(result);
    form.setFieldsValue({
      obtainedMarks: result.obtainedMarks,
      remarks: result.remarks,
    });
  };

  const handleApprove = async (result: ExamResult) => {
    try {
      await examinationAPI.approveResult(result.id);
      message.success('Result approved');
      fetchResults(filters);
    } catch (error: any) {
      message.error(error.message || 'Failed to approve result');
    }
  };

  const handleUpdate = async () => {
    if (!editingResult) return;
    try {
      const values = await form.validateFields();
      await examinationAPI.updateResult(editingResult.id, {
        obtainedMarks: values.obtainedMarks,
        remarks: values.remarks,
      });
      message.success('Result updated');
      setEditingResult(null);
      fetchResults(filters);
    } catch (error: any) {
      if (error?.errorFields) return;
      message.error(error.message || 'Failed to update result');
    }
  };

  const handleCreateResult = async () => {
    try {
      const values = await createForm.validateFields();
      await examinationAPI.createResult({
        examId: values.examId,
        studentId: values.studentId,
        obtainedMarks: values.obtainedMarks,
        remarks: values.remarks,
      });
      message.success('Result recorded');
      setIsCreateDrawer(false);
      createForm.resetFields();
      fetchResults(filters);
    } catch (error: any) {
      if (error?.errorFields) return;
      message.error(error.message || 'Failed to create result');
    }
  };

  const tableData = useMemo(() => {
    if (!filters.examId && !filters.status) return results;
    return results.filter((result) => {
      const matchesExam = filters.examId ? result.examId === filters.examId : true;
      const matchesStatus = filters.status ? result.status === filters.status : true;
      return matchesExam && matchesStatus;
    });
  }, [results, filters]);

  return (
    <div style={{ padding: 24 }}>
      <Card
        style={{ borderRadius: 16 }}
        bodyStyle={{ padding: 24 }}
        title={
          <Space size="large">
            <TrophyOutlined />
            <span style={{ fontSize: 20, fontWeight: 600 }}>Exam Results</span>
            <Button icon={<ReloadOutlined />} onClick={() => fetchResults(filters)}>
              Refresh
            </Button>
          </Space>
        }
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsCreateDrawer(true)}>
            Add Result
          </Button>
        }
      >
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <Row gutter={[16, 16]}>
            <Col xs={24} md={8}>
              <Card bordered={false} style={{ borderRadius: 12, background: '#f0f5ff' }}>
                <Statistic title="Results Recorded" value={summary.total} prefix={<TrophyOutlined />} />
              </Card>
            </Col>
            <Col xs={24} md={8}>
              <Card bordered={false} style={{ borderRadius: 12, background: '#f6ffed' }}>
                <Statistic title="Approved" value={summary.approved} prefix={<CheckCircleOutlined />} />
              </Card>
            </Col>
            <Col xs={24} md={8}>
              <Card bordered={false} style={{ borderRadius: 12, background: '#fff7e6' }}>
                <Statistic title="Pending / Re-eval" value={summary.pending} prefix={<SafetyOutlined />} />
              </Card>
            </Col>
          </Row>

          <Card bordered={false} style={{ borderRadius: 12, background: '#fafafa' }}>
            <Space wrap style={{ width: '100%' }}>
              <Select
                placeholder="Filter by exam"
                allowClear
                showSearch
                style={{ minWidth: 220 }}
                value={filters.examId}
                optionFilterProp="children"
                onChange={(value) => handleFilterChange('examId', value as string)}
              >
                {exams.map((exam) => (
                  <Option key={exam.id} value={exam.id}>
                    {exam.title}
                  </Option>
                ))}
              </Select>
              <Select
                placeholder="Status"
                allowClear
                style={{ minWidth: 180 }}
                value={filters.status}
                onChange={(value) => handleFilterChange('status', value as string)}
              >
                {['pending', 'graded', 'approved', 're_evaluation'].map((status) => (
                  <Option key={status} value={status}>
                    {status.replace('_', ' ').toUpperCase()}
                  </Option>
                ))}
              </Select>
            </Space>
          </Card>

          <Table
            rowKey="id"
            loading={loading}
            columns={columns}
            dataSource={tableData}
            locale={{ emptyText: loading ? <Empty description="Loading results..." /> : <Empty description="No results recorded" /> }}
          />
        </Space>
      </Card>

      <Drawer
        width={360}
        title="Edit Result"
        open={!!editingResult}
        onClose={() => setEditingResult(null)}
        extra={
          <Space>
            <Button onClick={() => setEditingResult(null)}>Cancel</Button>
            <Button type="primary" onClick={handleUpdate}>
              Save
            </Button>
          </Space>
        }
      >
        <Form layout="vertical" form={form}>
          <Form.Item name="obtainedMarks" label="Obtained Marks" rules={[{ required: true, message: 'Enter marks' }]}> 
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="remarks" label="Remarks">
            <Input.TextArea rows={3} placeholder="Optional remarks" />
          </Form.Item>
        </Form>
      </Drawer>

      <Drawer
        width={420}
        title="Record Result"
        open={isCreateDrawer}
        onClose={() => setIsCreateDrawer(false)}
        extra={
          <Space>
            <Button onClick={() => setIsCreateDrawer(false)}>Cancel</Button>
            <Button type="primary" onClick={handleCreateResult}>
              Submit
            </Button>
          </Space>
        }
      >
        <Form layout="vertical" form={createForm}>
          <Form.Item name="examId" label="Exam" rules={[{ required: true, message: 'Select exam' }]}> 
            <Select placeholder="Select exam" showSearch optionFilterProp="children">
              {exams.map((exam) => (
                <Option key={exam.id} value={exam.id}>
                  {exam.title}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="studentId" label="Student" rules={[{ required: true, message: 'Select student' }]}> 
            <Select
              placeholder="Select student"
              showSearch
              optionFilterProp="children"
              filterOption={(input, option) =>
                ((option?.children as string | undefined) || '')
                  .toLowerCase()
                  .includes(input.toLowerCase())
              }
            >
              {students.map((student) => (
                <Option key={student.id} value={student.id}>
                  {student.user ? `${student.user.firstName} ${student.user.lastName} (${student.rollNumber})` : student.rollNumber}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="obtainedMarks" label="Obtained Marks" rules={[{ required: true, message: 'Enter marks' }]}> 
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="remarks" label="Remarks">
            <Input.TextArea rows={3} placeholder="Optional comments" />
          </Form.Item>
        </Form>
      </Drawer>
    </div>
  );
};

export default ResultsPage;
