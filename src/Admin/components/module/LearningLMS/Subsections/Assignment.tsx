import React, { useState, useEffect, useMemo } from 'react';
import {
  Card,
  Row,
  Col,
  Statistic,
  Space,
  Button,
  Table,
  Tag,
  Typography,
  Empty,
  Skeleton,
  message,
  Select,
  Input,
} from 'antd';
import {
  FileTextOutlined,
  PlusOutlined,
  ReloadOutlined,
  EyeOutlined,
  EditOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CalendarOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import learningAPI, { Assignment, AssignmentSubmission } from '@/api/learning.api';
import { academicAPI, Course } from '@/api/academic.api';
import PermissionGuard from '@/components/common/PermissionGuard';
import { route } from '@/routes/constant';

const { Option } = Select;
const { Search } = Input;
const { Title, Text } = Typography;

const AssignmentManagement: React.FC = () => {
  const navigate = useNavigate();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [submissions, setSubmissions] = useState<AssignmentSubmission[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    courseId: undefined as string | undefined,
    assignmentType: undefined as string | undefined,
    isPublished: undefined as boolean | undefined,
    search: undefined as string | undefined,
  });

  useEffect(() => {
    fetchData();
  }, [filters]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [assignmentsResponse, submissionsResponse, coursesResponse] = await Promise.all([
        learningAPI.getAllAssignments({
          courseId: filters.courseId,
          assignmentType: filters.assignmentType,
          isPublished: filters.isPublished,
          page: 1,
          limit: 500,
        }),
        learningAPI.getAllSubmissions({ page: 1, limit: 1000 }),
        academicAPI.getCourses(1, 500, { isActive: true }),
      ]);

      let filteredAssignments = assignmentsResponse.assignments || [];

      // Filter by search term
      if (filters.search) {
        filteredAssignments = filteredAssignments.filter((a: Assignment) =>
          a.title.toLowerCase().includes(filters.search!.toLowerCase())
        );
      }

      setAssignments(filteredAssignments);
      setSubmissions(submissionsResponse.submissions || []);
      setCourses(coursesResponse.courses || []);
    } catch (error: any) {
      message.error(error.message || 'Failed to load assignment data');
    } finally {
      setLoading(false);
    }
  };

  const stats = useMemo(() => {
    const total = assignments.length;
    const published = assignments.filter((a) => a.isPublished).length;
    const drafts = assignments.filter((a) => !a.isPublished).length;
    const overdue = assignments.filter(
      (a) => new Date(a.dueDate) < new Date() && a.isPublished
    ).length;
    const totalSubmissions = submissions.length;
    const pendingGrading = submissions.filter(
      (s) => s.status === 'submitted' || s.status === 'late'
    ).length;

    return { total, published, drafts, overdue, totalSubmissions, pendingGrading };
  }, [assignments, submissions]);

  const upcomingAssignments = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);

    return assignments
      .filter(
        (a) =>
          a.isPublished &&
          new Date(a.dueDate).getTime() >= today.getTime() &&
          new Date(a.dueDate).getTime() <= nextWeek.getTime()
      )
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
      .slice(0, 5);
  }, [assignments]);

  const recentAssignments = useMemo(() => {
    return [...assignments]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 6);
  }, [assignments]);

  const getAssignmentTypeTag = (type: string) => {
    const typeConfig: Record<string, { color: string; text: string }> = {
      individual: { color: 'blue', text: 'Individual' },
      group: { color: 'green', text: 'Group' },
      project: { color: 'purple', text: 'Project' },
    };

    const config = typeConfig[type] || { color: 'default', text: type };
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  const getCourseName = (courseId: string) => {
    const course = courses.find((c) => c.id === courseId);
    return course ? `${course.code} - ${course.title}` : courseId;
  };

  const getSubmissionCount = (assignmentId: string) => {
    return submissions.filter((s) => s.assignmentId === assignmentId).length;
  };

  const isOverdue = (dueDate: string) => {
    return new Date(dueDate) < new Date();
  };

  const quickActionButtons = [
    {
      title: 'Create Assignment',
      icon: <PlusOutlined />,
      action: () => navigate(route.LEARNING_ASSIGNMENT_CREATE),
      description: 'Create a new assignment for your course.',
      type: 'primary' as const,
    },
    {
      title: 'View All Assignments',
      icon: <FileTextOutlined />,
      action: () => navigate(route.LEARNING_ASSIGNMENT_LIST),
      description: 'Browse and manage all assignments.',
    },
    {
      title: 'Grading Center',
      icon: <CheckCircleOutlined />,
      action: () => navigate(route.LEARNING_GRADING),
      description: 'Grade student submissions and provide feedback.',
    },
  ];

  const columns = [
    {
      title: 'Assignment',
      key: 'assignment',
      render: (_: any, record: Assignment) => (
        <Space direction="vertical" size={0}>
          <Text strong>{record.title}</Text>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {getCourseName(record.courseId)}
          </Text>
        </Space>
      ),
    },
    {
      title: 'Type',
      dataIndex: 'assignmentType',
      key: 'assignmentType',
      render: (type: string) => getAssignmentTypeTag(type),
    },
    {
      title: 'Due Date',
      dataIndex: 'dueDate',
      key: 'dueDate',
      render: (date: string, record: Assignment) => {
        const isLate = isOverdue(date);
        return (
          <Space direction="vertical" size={0}>
            <Text style={{ color: isLate ? '#ff4d4f' : 'inherit' }}>
              {new Date(date).toLocaleDateString()}
            </Text>
            {isLate && record.isPublished && (
              <Tag color="red">Overdue</Tag>
            )}
          </Space>
        );
      },
    },
    {
      title: 'Submissions',
      key: 'submissions',
      render: (_: any, record: Assignment) => {
        const count = getSubmissionCount(record.id);
        return <Text>{count} submission(s)</Text>;
      },
    },
    {
      title: 'Status',
      dataIndex: 'isPublished',
      key: 'isPublished',
      render: (isPublished: boolean) => (
        <Tag color={isPublished ? 'green' : 'orange'}>
          {isPublished ? 'Published' : 'Draft'}
        </Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: Assignment) => (
        <Space size="small">
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() =>
              navigate(route.LEARNING_ASSIGNMENT_DETAIL.replace(':id', record.id))
            }
          >
            View
          </Button>
          <Button
            type="link"
            icon={<FileTextOutlined />}
            onClick={() =>
              navigate(route.LEARNING_ASSIGNMENT_SUBMISSIONS.replace(':id', record.id))
            }
          >
            Submissions
          </Button>
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
            background: 'linear-gradient(135deg, rgba(24,144,255,0.1) 0%, rgba(24,144,255,0.05) 100%)',
          }}
        >
          <Row gutter={[16, 16]} align="middle">
            <Col flex="auto">
              <Title level={3} style={{ marginBottom: 4 }}>
                <FileTextOutlined /> Assignment Management
              </Title>
              <Text type="secondary">
                Create, manage, and track assignments across all your courses.
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
                title="Total Assignments"
                value={stats.total}
                prefix={<FileTextOutlined />}
                loading={loading}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card bordered={false}>
              <Statistic
                title="Published"
                value={stats.published}
                prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
                loading={loading}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card bordered={false}>
              <Statistic
                title="Drafts"
                value={stats.drafts}
                prefix={<ClockCircleOutlined style={{ color: '#faad14' }} />}
                loading={loading}
                valueStyle={{ color: '#faad14' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card bordered={false}>
              <Statistic
                title="Pending Grading"
                value={stats.pendingGrading}
                prefix={<CheckCircleOutlined style={{ color: '#1890ff' }} />}
                loading={loading}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
        </Row>

        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} lg={6}>
            <Card bordered={false}>
              <Statistic
                title="Total Submissions"
                value={stats.totalSubmissions}
                prefix={<FileTextOutlined style={{ color: '#722ed1' }} />}
                loading={loading}
                valueStyle={{ color: '#722ed1' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card bordered={false}>
              <Statistic
                title="Overdue"
                value={stats.overdue}
                prefix={<CalendarOutlined style={{ color: '#ff4d4f' }} />}
                loading={loading}
                valueStyle={{ color: '#ff4d4f' }}
              />
            </Card>
          </Col>
        </Row>

        {/* Quick Actions */}
        <Card title="Quick Actions" bordered={false}>
          <Row gutter={[16, 16]}>
            {quickActionButtons.map((action) => (
              <Col xs={24} md={12} lg={8} key={action.title}>
                <Card
                  size="small"
                  actions={[
                    <Button
                      key="launch"
                      type={action.type}
                      icon={action.icon}
                      onClick={action.action}
                    >
                      {action.title}
                    </Button>,
                  ]}
                >
                  <Text>{action.description}</Text>
                </Card>
              </Col>
            ))}
          </Row>
        </Card>

        {/* Filters */}
        <Card
          title="Filters"
          bordered={false}
          extra={
            <PermissionGuard permission="learning" action="create">
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => navigate(route.LEARNING_ASSIGNMENT_CREATE)}
              >
                New Assignment
              </Button>
            </PermissionGuard>
          }
        >
          <Space wrap style={{ width: '100%' }}>
            <Select
              placeholder="Filter by Course"
              allowClear
              showSearch
              optionFilterProp="children"
              style={{ width: 200 }}
              value={filters.courseId}
              onChange={(value) => setFilters({ ...filters, courseId: value })}
            >
              {courses.map((course) => (
                <Option key={course.id} value={course.id}>
                  {course.code} - {course.title}
                </Option>
              ))}
            </Select>

            <Select
              placeholder="Filter by Type"
              allowClear
              style={{ width: 150 }}
              value={filters.assignmentType}
              onChange={(value) => setFilters({ ...filters, assignmentType: value })}
            >
              <Option value="individual">Individual</Option>
              <Option value="group">Group</Option>
              <Option value="project">Project</Option>
            </Select>

            <Select
              placeholder="Filter by Status"
              allowClear
              style={{ width: 150 }}
              value={filters.isPublished}
              onChange={(value) => setFilters({ ...filters, isPublished: value })}
            >
              <Option value={true}>Published</Option>
              <Option value={false}>Draft</Option>
            </Select>

            <Search
              placeholder="Search assignments"
              allowClear
              style={{ width: 250 }}
              onSearch={(value) => setFilters({ ...filters, search: value })}
            />
          </Space>
        </Card>

        <Row gutter={[16, 16]}>
          {/* Upcoming Assignments */}
          <Col xs={24} lg={14}>
            <Card
              title={
                <Space>
                  <CalendarOutlined />
                  Upcoming Due Dates (Next 7 Days)
                </Space>
              }
              extra={
                <Button
                  type="link"
                  onClick={() => navigate(route.LEARNING_ASSIGNMENT_LIST)}
                >
                  View All
                </Button>
              }
              bordered={false}
            >
              {loading ? (
                <Skeleton active paragraph={{ rows: 4 }} />
              ) : upcomingAssignments.length === 0 ? (
                <Empty description="No assignments due in the next 7 days" />
              ) : (
                <Table
                  dataSource={upcomingAssignments}
                  rowKey="id"
                  pagination={false}
                  size="small"
                  columns={columns}
                />
              )}
            </Card>
          </Col>

          {/* Assignment Status */}
          <Col xs={24} lg={10}>
            <Card title="Assignment Status" bordered={false}>
              {loading ? (
                <Skeleton active paragraph={{ rows: 4 }} />
              ) : (
                <Space direction="vertical" style={{ width: '100%' }} size="middle">
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Text>Published Assignments</Text>
                    <Text strong>{stats.published}</Text>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Text>Draft Assignments</Text>
                    <Text strong>{stats.drafts}</Text>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Text>Overdue Assignments</Text>
                    <Text strong style={{ color: '#ff4d4f' }}>
                      {stats.overdue}
                    </Text>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Text>Total Submissions</Text>
                    <Text strong>{stats.totalSubmissions}</Text>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Text>Pending Grading</Text>
                    <Text strong style={{ color: '#1890ff' }}>
                      {stats.pendingGrading}
                    </Text>
                  </div>
                </Space>
              )}
            </Card>
          </Col>
        </Row>

        {/* Recent Assignments */}
        <Card
          title="Recent Assignments"
          bordered={false}
          extra={
            <Button
              type="link"
              onClick={() => navigate(route.LEARNING_ASSIGNMENT_LIST)}
            >
              View All
            </Button>
          }
        >
          {loading ? (
            <Skeleton active paragraph={{ rows: 3 }} />
          ) : recentAssignments.length === 0 ? (
            <Empty description="No assignments created yet" />
          ) : (
            <Table
              dataSource={recentAssignments}
              rowKey="id"
              pagination={false}
              columns={columns}
            />
          )}
        </Card>
      </Space>
    </div>
  );
};

export default AssignmentManagement;
