import React, { useEffect, useMemo, useState } from 'react';
import {
  Card,
  Space,
  Table,
  Tag,
  Button,
  Drawer,
  Form,
  Input,
  Select,
  message,
  Empty,
  Row,
  Col,
  Statistic,
  Popconfirm,
} from 'antd';
import {
  SafetyCertificateOutlined,
  FieldTimeOutlined,
  CheckOutlined,
  CloseOutlined,
  EyeOutlined,
} from '@ant-design/icons';
import examinationAPI, { Exam, ExamResult, ReEvaluation, ReEvaluationResponse } from '@/api/examination.api';
import { academicAPI, Course } from '@/api/academic.api';
import dayjs from 'dayjs';

const Revaluation: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [reEvaluations, setReEvaluations] = useState<ReEvaluation[]>([]);
  const [results, setResults] = useState<ExamResult[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [viewRequest, setViewRequest] = useState<ReEvaluation | null>(null);
  const [decisionForm] = Form.useForm();

  useEffect(() => {
    loadReferenceData();
    fetchReEvaluations();
  }, []);

  const loadReferenceData = async () => {
    try {
      const [resultsResponse, courseResponse, examResponse] = await Promise.all([
        examinationAPI.getAllResults({ page: 1, limit: 500 }),
        academicAPI.getCourses(1, 500, { isActive: true }),
        examinationAPI.getAllExams({ page: 1, limit: 500 }),
      ]);
      const resultsData = Array.isArray((resultsResponse as any)?.results)
        ? (resultsResponse as any).results
        : Array.isArray((resultsResponse as any)?.data)
        ? (resultsResponse as any).data
        : Array.isArray(resultsResponse)
        ? (resultsResponse as any)
        : [];
      const examsData = Array.isArray((examResponse as any)?.exams)
        ? (examResponse as any).exams
        : Array.isArray((examResponse as any)?.data?.exams)
        ? (examResponse as any).data.exams
        : Array.isArray(examResponse)
        ? (examResponse as any)
        : [];
      setResults(resultsData);
      setCourses(courseResponse.courses);
      setExams(examsData);
    } catch (error) {
      console.warn('Failed to load re-evaluation references', error);
    }
  };

  const fetchReEvaluations = async () => {
    try {
      setLoading(true);
      const response: ReEvaluationResponse | any = await examinationAPI.getAllReEvaluations({ page: 1, limit: 200 });
      const data = Array.isArray(response?.reEvaluations)
        ? response.reEvaluations
        : Array.isArray(response?.data?.reEvaluations)
        ? response.data.reEvaluations
        : Array.isArray(response?.data)
        ? response.data
        : Array.isArray(response)
        ? response
        : [];
      setReEvaluations(data);
    } catch (error: any) {
      message.error(error.message || 'Failed to load re-evaluations');
    } finally {
      setLoading(false);
    }
  };

  const resultLookup = useMemo(() => {
    const map = new Map<string, ExamResult>();
    results.forEach((result) => map.set(result.id, result));
    return map;
  }, [results]);

  const courseLookup = useMemo(() => {
    const map = new Map<string, Course>();
    courses.forEach((course) => map.set(course.id, course));
    return map;
  }, [courses]);

  const examLookup = useMemo(() => {
    const map = new Map<string, Exam>();
    exams.forEach((exam) => map.set(exam.id, exam));
    return map;
  }, [exams]);

  const summary = useMemo(() => {
    const pending = reEvaluations.filter((request) => request.status === 'pending' || request.status === 'under_review').length;
    const approved = reEvaluations.filter((request) => request.status === 'approved').length;
    const rejected = reEvaluations.filter((request) => request.status === 'rejected').length;
    return { total: reEvaluations.length, pending, approved, rejected };
  }, [reEvaluations]);

  const columns = [
    {
      title: 'Result',
      dataIndex: 'resultId',
      key: 'resultId',
      render: (resultId: string) => {
        const result = resultLookup.get(resultId);
        if (!result) return resultId;
        const exam = examLookup.get(result.examId);
        const course = exam ? courseLookup.get(exam.courseId) : undefined;
        return (
          <Space direction="vertical" size={0}>
            <span style={{ fontWeight: 600 }}>{exam ? exam.title : result.examId}</span>
            <span style={{ color: '#888' }}>
              {course ? course.code : ''} {course ? '•' : ''} {result.obtainedMarks}/{result.totalMarks}
            </span>
          </Space>
        );
      },
    },
    {
      title: 'Reason',
      dataIndex: 'reason',
      key: 'reason',
      ellipsis: true,
    },
    {
      title: 'Requested On',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (createdAt: string) => dayjs(createdAt).format('DD MMM YYYY, h:mm A'),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: ReEvaluation['status']) => {
        const colorMap: Record<ReEvaluation['status'], string> = {
          pending: 'orange',
          under_review: 'blue',
          approved: 'green',
          rejected: 'red',
        };
        return <Tag color={colorMap[status] || 'blue'}>{status.replace('_', ' ').toUpperCase()}</Tag>;
      },
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: ReEvaluation) => (
        <Space>
          <Button type="link" icon={<EyeOutlined />} onClick={() => setViewRequest(record)} />
          {record.status !== 'approved' && record.status !== 'rejected' && (
            <>
              <Popconfirm
                title="Approve re-evaluation?"
                onConfirm={() => handleDecision(record, 'approved')}
              >
                <Button type="link" icon={<CheckOutlined />} />
              </Popconfirm>
              <Popconfirm
                title="Reject re-evaluation?"
                onConfirm={() => handleDecision(record, 'rejected')}
              >
                <Button danger type="link" icon={<CloseOutlined />} />
              </Popconfirm>
            </>
          )}
        </Space>
      ),
    },
  ];

  const handleDecision = async (request: ReEvaluation, decision: 'approved' | 'rejected') => {
    try {
      await examinationAPI.approveReEvaluation(request.id, decision, undefined);
      message.success(`Request ${decision}`);
      fetchReEvaluations();
    } catch (error: any) {
      message.error(error.message || 'Failed to update re-evaluation');
    }
  };

  const handleSubmitDecision = async () => {
    if (!viewRequest) return;
    try {
      const values = await decisionForm.validateFields();
      await examinationAPI.approveReEvaluation(viewRequest.id, values.decision, values.remarks);
      message.success('Re-evaluation updated');
      setViewRequest(null);
      fetchReEvaluations();
    } catch (error: any) {
      if (error?.errorFields) return;
      message.error(error.message || 'Failed to process re-evaluation');
    }
  };

  return (
    <div style={{ padding: 24 }}>
      <Card
        style={{ borderRadius: 16 }}
        bodyStyle={{ padding: 24 }}
        title={
          <Space size="large">
            <SafetyCertificateOutlined />
            <span style={{ fontSize: 20, fontWeight: 600 }}>Re-evaluation Requests</span>
          </Space>
        }
      >
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <Row gutter={[16, 16]}>
            <Col xs={24} md={6}>
              <Card bordered={false} style={{ borderRadius: 12, background: '#f0f5ff' }}>
                <Statistic title="Total Requests" value={summary.total} prefix={<FieldTimeOutlined />} />
              </Card>
            </Col>
            <Col xs={24} md={6}>
              <Card bordered={false} style={{ borderRadius: 12, background: '#fff7e6' }}>
                <Statistic title="Pending" value={summary.pending} />
              </Card>
            </Col>
            <Col xs={24} md={6}>
              <Card bordered={false} style={{ borderRadius: 12, background: '#f6ffed' }}>
                <Statistic title="Approved" value={summary.approved} prefix={<CheckOutlined />} />
              </Card>
            </Col>
            <Col xs={24} md={6}>
              <Card bordered={false} style={{ borderRadius: 12, background: '#fff0f6' }}>
                <Statistic title="Rejected" value={summary.rejected} prefix={<CloseOutlined />} />
              </Card>
            </Col>
          </Row>

          <Table
            rowKey="id"
            loading={loading}
            columns={columns}
            dataSource={reEvaluations}
            locale={{ emptyText: loading ? <Empty description="Loading requests..." /> : <Empty description="No re-evaluation requests" /> }}
          />
        </Space>
      </Card>

      <Drawer
        width={420}
        title="Re-evaluation Details"
        open={!!viewRequest}
        onClose={() => setViewRequest(null)}
        extra={
          viewRequest && viewRequest.status !== 'approved' && viewRequest.status !== 'rejected' ? (
            <Space>
              <Button onClick={() => setViewRequest(null)}>Cancel</Button>
              <Button type="primary" onClick={handleSubmitDecision}>
                Submit
              </Button>
            </Space>
          ) : undefined
        }
        destroyOnClose
        afterOpenChange={(open) => {
          if (open && viewRequest) {
            decisionForm.setFieldsValue({ decision: 'approved', remarks: '' });
          } else {
            decisionForm.resetFields();
          }
        }}
      >
        {viewRequest ? (
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <Card bordered={false} style={{ borderRadius: 12, background: '#f5f9ff' }}>
              <Space direction="vertical" size={4}>
                <span style={{ fontWeight: 600 }}>Reason</span>
                <span>{viewRequest.reason}</span>
                <Tag color="blue">{viewRequest.status.toUpperCase()}</Tag>
                <span>Submitted {dayjs(viewRequest.createdAt).format('DD MMM YYYY, h:mm A')}</span>
              </Space>
            </Card>
            <Card bordered={false} style={{ borderRadius: 12 }}>
              <Space direction="vertical" size={4} style={{ width: '100%' }}>
                <span style={{ fontWeight: 600 }}>Result Reference</span>
                {(() => {
                  const result = resultLookup.get(viewRequest.resultId);
                  if (!result) return <span>No result data available</span>;
                  const exam = examLookup.get(result.examId);
                  const course = exam ? courseLookup.get(exam.courseId) : undefined;
                  return (
                    <Space direction="vertical" size={2}>
                      <span>{exam ? exam.title : result.examId}</span>
                      {course && <span style={{ color: '#888' }}>{course.code}</span>}
                      <Tag color="blue">{result.obtainedMarks}/{result.totalMarks}</Tag>
                    </Space>
                  );
                })()}
              </Space>
            </Card>
            {viewRequest.status !== 'approved' && viewRequest.status !== 'rejected' && (
              <Form layout="vertical" form={decisionForm}>
                <Form.Item name="decision" label="Decision" rules={[{ required: true, message: 'Select decision' }]}> 
                  <Select>
                    <Select.Option value="approved">Approve</Select.Option>
                    <Select.Option value="rejected">Reject</Select.Option>
                  </Select>
                </Form.Item>
                <Form.Item name="remarks" label="Remarks">
                  <Input.TextArea rows={3} placeholder="Optional remarks" />
                </Form.Item>
              </Form>
            )}
          </Space>
        ) : (
          <Empty />
        )}
      </Drawer>
    </div>
  );
};

export default Revaluation;
