import React, { useState, useEffect, useMemo } from 'react';
import {
  Card,
  Table,
  Button,
  Select,
  Space,
  Tag,
  Input,
  InputNumber,
  Modal,
  Form,
  message,
  Statistic,
  Row,
  Col,
  Typography,
  Empty,
  Skeleton,
  Tooltip,
  Progress,
} from 'antd';
import {
  CheckOutlined,
  EyeOutlined,
  FileTextOutlined,
  ReloadOutlined,
  FilterOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import learningAPI, { AssignmentSubmission, Assignment, GradeSubmissionDTO } from '@/api/learning.api';
import { academicAPI, Course } from '@/api/academic.api';
import PermissionGuard from '@/components/common/PermissionGuard';
import { route } from '@/routes/constant';

const { Option } = Select;
const { TextArea } = Input;
const { Title, Text } = Typography;

interface GradingFilters {
  assignmentId?: string;
  courseId?: string;
  status?: string;
  search?: string;
}

const Grading: React.FC = () => {
  const navigate = useNavigate();
  const [submissions, setSubmissions] = useState<AssignmentSubmission[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(false);
  const [gradingModal, setGradingModal] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState<AssignmentSubmission | null>(null);
  const [gradingForm] = Form.useForm();
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 20,
    total: 0,
  });
  const [filters, setFilters] = useState<GradingFilters>({
    assignmentId: undefined,
    courseId: undefined,
    status: undefined,
    search: undefined,
  });

  useEffect(() => {
    fetchData();
  }, [pagination.current, pagination.pageSize, filters]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [submissionsResponse, assignmentsResponse, coursesResponse] = await Promise.all([
        learningAPI.getAllSubmissions({
          assignmentId: filters.assignmentId,
          status: filters.status,
          page: pagination.current,
          limit: pagination.pageSize,
        }),
        learningAPI.getAllAssignments({ page: 1, limit: 500, isPublished: true }),
        academicAPI.getCourses(1, 500, { isActive: true }),
      ]);

      let filteredSubmissions = submissionsResponse.submissions || [];

      // Filter by course if selected
      if (filters.courseId) {
        const assignmentIds = (assignmentsResponse.assignments || [])
          .filter((a: Assignment) => a.courseId === filters.courseId)
          .map((a: Assignment) => a.id);
        filteredSubmissions = filteredSubmissions.filter((s: AssignmentSubmission) =>
          assignmentIds.includes(s.assignmentId)
        );
      }

      // Filter by search term
      if (filters.search) {
        filteredSubmissions = filteredSubmissions.filter(
          (s: AssignmentSubmission) =>
            s.studentId.toLowerCase().includes(filters.search!.toLowerCase())
        );
      }

      setSubmissions(filteredSubmissions);
      setAssignments(assignmentsResponse.assignments || []);
      setCourses(coursesResponse.courses || []);
      setPagination({
        ...pagination,
        total: filteredSubmissions.length,
      });
    } catch (error: any) {
      message.error(error.message || 'Failed to load grading data');
    } finally {
      setLoading(false);
    }
  };

  const stats = useMemo(() => {
    const total = submissions.length;
    const pending = submissions.filter((s) => s.status === 'submitted' || s.status === 'late').length;
    const graded = submissions.filter((s) => s.status === 'graded').length;
    const late = submissions.filter((s) => s.status === 'late').length;
    const gradingProgress = total > 0 ? Math.round((graded / total) * 100) : 0;

    return { total, pending, graded, late, gradingProgress };
  }, [submissions]);

  const handleGrade = (submission: AssignmentSubmission) => {
    setSelectedSubmission(submission);
    gradingForm.setFieldsValue({
      obtainedMarks: submission.obtainedMarks || 0,
      feedback: submission.feedback || '',
    });
    setGradingModal(true);
  };

  const handleGradingSubmit = async (values: any) => {
    if (!selectedSubmission) return;

    try {
      setLoading(true);
      const gradeData: GradeSubmissionDTO = {
        submissionId: selectedSubmission.id,
        obtainedMarks: values.obtainedMarks,
        feedback: values.feedback,
      };

      await learningAPI.gradeSubmission(selectedSubmission.id, gradeData);
      message.success('Submission graded successfully');
      setGradingModal(false);
      setSelectedSubmission(null);
      gradingForm.resetFields();
      fetchData();
    } catch (error: any) {
      message.error(error.message || 'Failed to grade submission');
    } finally {
      setLoading(false);
    }
  };

  const getStatusTag = (status: string) => {
    const statusConfig: Record<string, { color: string; text: string }> = {
      submitted: { color: 'blue', text: 'Submitted' },
      late: { color: 'orange', text: 'Late' },
      graded: { color: 'green', text: 'Graded' },
      returned: { color: 'purple', text: 'Returned' },
    };

    const config = statusConfig[status] || { color: 'default', text: status };
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  const getAssignmentTitle = (assignmentId: string) => {
    const assignment = assignments.find((a) => a.id === assignmentId);
    return assignment?.title || assignmentId;
  };

  const getMaxMarks = (assignmentId: string) => {
    const assignment = assignments.find((a) => a.id === assignmentId);
    return assignment?.maxMarks || 0;
  };

  const columns = [
    {
      title: 'Student ID',
      dataIndex: 'studentId',
      key: 'studentId',
      width: 120,
    },
    {
      title: 'Assignment',
      key: 'assignment',
      render: (_: any, record: AssignmentSubmission) => (
        <Tooltip title={getAssignmentTitle(record.assignmentId)}>
          <Text ellipsis style={{ maxWidth: 200 }}>
            {getAssignmentTitle(record.assignmentId)}
          </Text>
        </Tooltip>
      ),
    },
    {
      title: 'Submitted',
      dataIndex: 'submittedAt',
      key: 'submittedAt',
      render: (date: string) => new Date(date).toLocaleString(),
      sorter: (a: AssignmentSubmission, b: AssignmentSubmission) =>
        new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime(),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => getStatusTag(status),
      filters: [
        { text: 'Submitted', value: 'submitted' },
        { text: 'Late', value: 'late' },
        { text: 'Graded', value: 'graded' },
        { text: 'Returned', value: 'returned' },
      ],
      onFilter: (value: any, record: AssignmentSubmission) => record.status === value,
    },
    {
      title: 'Marks',
      key: 'marks',
      render: (_: any, record: AssignmentSubmission) => {
        const maxMarks = getMaxMarks(record.assignmentId);
        if (record.obtainedMarks !== undefined) {
          const percentage = maxMarks > 0 ? Math.round((record.obtainedMarks / maxMarks) * 100) : 0;
          return (
            <Space direction="vertical" size={0}>
              <Text strong>
                {record.obtainedMarks} / {maxMarks}
              </Text>
              <Progress
                percent={percentage}
                size="small"
                status={percentage >= 50 ? 'success' : percentage >= 40 ? 'normal' : 'exception'}
                showInfo={false}
              />
            </Space>
          );
        }
        return <Text type="secondary">—</Text>;
      },
    },
    {
      title: 'Files',
      key: 'files',
      render: (_: any, record: AssignmentSubmission) => (
        <Text>{record.submissionFiles?.length || 0} file(s)</Text>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 150,
      render: (_: any, record: AssignmentSubmission) => (
        <Space size="small">
          <Tooltip title="View Submission">
            <Button
              type="link"
              icon={<EyeOutlined />}
              onClick={() => navigate(route.LEARNING_SUBMISSION_DETAIL.replace(':id', record.id))}
            />
          </Tooltip>
          {record.status !== 'graded' && (
            <PermissionGuard permission="learning" action="update">
              <Tooltip title="Grade Submission">
                <Button
                  type="link"
                  icon={<CheckOutlined />}
                  onClick={() => handleGrade(record)}
                  style={{ color: '#52c41a' }}
                />
              </Tooltip>
            </PermissionGuard>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        {/* Header */}
        <Card
          bordered={false}
          style={{
            background: 'linear-gradient(135deg, rgba(82,196,26,0.1) 0%, rgba(82,196,26,0.05) 100%)',
          }}
        >
          <Row gutter={[16, 16]} align="middle">
            <Col flex="auto">
              <Title level={3} style={{ marginBottom: 4 }}>
                <FileTextOutlined /> Assignment Grading Center
              </Title>
              <Text type="secondary">
                Review, grade, and provide feedback on student assignment submissions.
              </Text>
            </Col>
            <Col>
              <Button icon={<ReloadOutlined />} onClick={fetchData} loading={loading}>
                Refresh
              </Button>
            </Col>
          </Row>
        </Card>

        {/* Statistics */}
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} lg={6}>
            <Card bordered={false}>
              <Statistic
                title="Total Submissions"
                value={stats.total}
                prefix={<FileTextOutlined />}
                loading={loading}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card bordered={false}>
              <Statistic
                title="Pending Grading"
                value={stats.pending}
                prefix={<ClockCircleOutlined style={{ color: '#faad14' }} />}
                loading={loading}
                valueStyle={{ color: '#faad14' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card bordered={false}>
              <Statistic
                title="Graded"
                value={stats.graded}
                prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
                loading={loading}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card bordered={false}>
              <Statistic
                title="Grading Progress"
                value={stats.gradingProgress}
                suffix="%"
                prefix={<Progress type="circle" percent={stats.gradingProgress} size={40} />}
                loading={loading}
              />
            </Card>
          </Col>
        </Row>

        {/* Filters */}
        <Card
          title={
            <Space>
              <FilterOutlined />
              Filters
            </Space>
          }
          bordered={false}
        >
          <Space wrap style={{ width: '100%' }}>
            <Select
              placeholder="Filter by Assignment"
              allowClear
              showSearch
              optionFilterProp="children"
              style={{ width: 200 }}
              value={filters.assignmentId}
              onChange={(value) => {
                setFilters({ ...filters, assignmentId: value });
                setPagination({ ...pagination, current: 1 });
              }}
            >
              {assignments.map((assignment) => (
                <Option key={assignment.id} value={assignment.id}>
                  {assignment.title}
                </Option>
              ))}
            </Select>

            <Select
              placeholder="Filter by Course"
              allowClear
              showSearch
              optionFilterProp="children"
              style={{ width: 200 }}
              value={filters.courseId}
              onChange={(value) => {
                setFilters({ ...filters, courseId: value });
                setPagination({ ...pagination, current: 1 });
              }}
            >
              {courses.map((course) => (
                <Option key={course.id} value={course.id}>
                  {course.code} - {course.title}
                </Option>
              ))}
            </Select>

            <Select
              placeholder="Filter by Status"
              allowClear
              style={{ width: 150 }}
              value={filters.status}
              onChange={(value) => {
                setFilters({ ...filters, status: value });
                setPagination({ ...pagination, current: 1 });
              }}
            >
              <Option value="submitted">Submitted</Option>
              <Option value="late">Late</Option>
              <Option value="graded">Graded</Option>
              <Option value="returned">Returned</Option>
            </Select>

            <Input.Search
              placeholder="Search by Student ID"
              allowClear
              style={{ width: 200 }}
              onSearch={(value) => {
                setFilters({ ...filters, search: value });
                setPagination({ ...pagination, current: 1 });
              }}
            />
          </Space>
        </Card>

        {/* Submissions Table */}
        <Card bordered={false}>
          {loading ? (
            <Skeleton active paragraph={{ rows: 8 }} />
          ) : submissions.length === 0 ? (
            <Empty description="No submissions found" />
          ) : (
            <Table
              rowKey="id"
              columns={columns}
              dataSource={submissions}
              loading={loading}
              pagination={{
                current: pagination.current,
                pageSize: pagination.pageSize,
                total: pagination.total,
                showSizeChanger: true,
                showTotal: (total) => `Total ${total} submissions`,
                onChange: (page, pageSize) => {
                  setPagination({ ...pagination, current: page, pageSize: pageSize || 20 });
                },
              }}
            />
          )}
        </Card>
      </Space>

      {/* Grading Modal */}
      <Modal
        title={
          <Space>
            <CheckOutlined />
            Grade Submission
          </Space>
        }
        open={gradingModal}
        onCancel={() => {
          setGradingModal(false);
          setSelectedSubmission(null);
          gradingForm.resetFields();
        }}
        footer={null}
        width={600}
        destroyOnClose
      >
        {selectedSubmission && (
          <Space direction="vertical" style={{ width: '100%' }} size="large">
            <Card size="small" style={{ background: '#f0f0f0' }}>
              <Space direction="vertical" style={{ width: '100%' }} size="small">
                <div>
                  <Text strong>Student ID: </Text>
                  <Text>{selectedSubmission.studentId}</Text>
                </div>
                <div>
                  <Text strong>Assignment: </Text>
                  <Text>{getAssignmentTitle(selectedSubmission.assignmentId)}</Text>
                </div>
                <div>
                  <Text strong>Submitted At: </Text>
                  <Text>{new Date(selectedSubmission.submittedAt).toLocaleString()}</Text>
                </div>
                <div>
                  <Text strong>Max Marks: </Text>
                  <Text>{getMaxMarks(selectedSubmission.assignmentId)}</Text>
                </div>
                {selectedSubmission.submissionFiles && selectedSubmission.submissionFiles.length > 0 && (
                  <div>
                    <Text strong>Files: </Text>
                    <ul style={{ marginTop: 4, marginBottom: 0, paddingLeft: 20 }}>
                      {selectedSubmission.submissionFiles.map((file, index) => (
                        <li key={index}>
                          <a href={file.fileUrl} target="_blank" rel="noopener noreferrer">
                            {file.fileName} ({(file.fileSize / 1024).toFixed(2)} KB)
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {selectedSubmission.submittedText && (
                  <div>
                    <Text strong>Submitted Text: </Text>
                    <div
                      style={{
                        marginTop: 4,
                        padding: 8,
                        background: 'white',
                        borderRadius: 4,
                        whiteSpace: 'pre-wrap',
                        maxHeight: 150,
                        overflowY: 'auto',
                      }}
                    >
                      {selectedSubmission.submittedText}
                    </div>
                  </div>
                )}
              </Space>
            </Card>

            <Form form={gradingForm} layout="vertical" onFinish={handleGradingSubmit}>
              <Form.Item
                label="Obtained Marks"
                name="obtainedMarks"
                rules={[
                  { required: true, message: 'Please enter obtained marks' },
                  {
                    type: 'number',
                    min: 0,
                    max: getMaxMarks(selectedSubmission.assignmentId),
                    message: `Marks must be between 0 and ${getMaxMarks(selectedSubmission.assignmentId)}`,
                  },
                ]}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  min={0}
                  max={getMaxMarks(selectedSubmission.assignmentId)}
                  placeholder={`Max: ${getMaxMarks(selectedSubmission.assignmentId)}`}
                />
              </Form.Item>

              <Form.Item label="Feedback" name="feedback">
                <TextArea
                  rows={6}
                  placeholder="Enter feedback for the student (optional)"
                  showCount
                  maxLength={1000}
                />
              </Form.Item>

              <Form.Item>
                <Space>
                  <Button type="primary" htmlType="submit" loading={loading} icon={<CheckOutlined />}>
                    Submit Grade
                  </Button>
                  <Button
                    onClick={() => {
                      setGradingModal(false);
                      setSelectedSubmission(null);
                      gradingForm.resetFields();
                    }}
                  >
                    Cancel
                  </Button>
                </Space>
              </Form.Item>
            </Form>
          </Space>
        )}
      </Modal>
    </div>
  );
};

export default Grading;
