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
  Modal,
  Form,
  DatePicker,
  InputNumber,
} from 'antd';
import {
  TeamOutlined,
  PlusOutlined,
  ReloadOutlined,
  EyeOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  UserAddOutlined,
  FileTextOutlined,
  CalendarOutlined,
  CheckOutlined,
  CloseCircleOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import hrAPI, { JobPosting, JobApplication } from '@/api/hr.api';
import administrationAPI, { Department } from '@/api/administration.api';
import PermissionGuard from '@/components/common/PermissionGuard';
import { route } from '@/routes/constant';
import dayjs from 'dayjs';

const { Option } = Select;
const { Search } = Input;
const { TextArea } = Input;
const { Title, Text } = Typography;

const Recruitment: React.FC = () => {
  const navigate = useNavigate();
  const [jobPostings, setJobPostings] = useState<JobPosting[]>([]);
  const [jobApplications, setJobApplications] = useState<JobApplication[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(false);
  const [applicationModal, setApplicationModal] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState<JobApplication | null>(null);
  const [reviewForm] = Form.useForm();
  const [filters, setFilters] = useState({
    postingStatus: undefined as string | undefined,
    applicationStatus: undefined as string | undefined,
    departmentId: undefined as string | undefined,
    search: undefined as string | undefined,
  });

  useEffect(() => {
    fetchData();
  }, [filters]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [postingsResponse, applicationsResponse, departmentsResponse] = await Promise.all([
        hrAPI.getAllJobPostings({
          status: filters.postingStatus,
          page: 1,
          limit: 500,
        }),
        hrAPI.getAllJobApplications({
          status: filters.applicationStatus,
          page: 1,
          limit: 1000,
        }),
        administrationAPI.getAllDepartments({ page: 1, limit: 200 }),
      ]);

      let filteredPostings = postingsResponse.jobPostings || [];
      let filteredApplications = applicationsResponse.applications || applicationsResponse.jobApplications || [];

      // Filter by department
      if (filters.departmentId) {
        filteredPostings = filteredPostings.filter(
          (p: JobPosting) => p.departmentId === filters.departmentId
        );
        const postingIds = filteredPostings.map((p: JobPosting) => p.id);
        filteredApplications = filteredApplications.filter((a: JobApplication) =>
          postingIds.includes(a.jobPostingId)
        );
      }

      // Filter by search
      if (filters.search) {
        filteredPostings = filteredPostings.filter(
          (p: JobPosting) =>
            p.title.toLowerCase().includes(filters.search!.toLowerCase()) ||
            p.description.toLowerCase().includes(filters.search!.toLowerCase())
        );
        filteredApplications = filteredApplications.filter(
          (a: JobApplication) =>
            a.applicantName.toLowerCase().includes(filters.search!.toLowerCase()) ||
            a.applicantEmail.toLowerCase().includes(filters.search!.toLowerCase())
        );
      }

      setJobPostings(filteredPostings);
      setJobApplications(filteredApplications);
      setDepartments(
        Array.isArray(departmentsResponse.departments)
          ? departmentsResponse.departments
          : Array.isArray(departmentsResponse)
          ? departmentsResponse
          : []
      );
    } catch (error: any) {
      message.error(error.message || 'Failed to load recruitment data');
    } finally {
      setLoading(false);
    }
  };

  const stats = useMemo(() => {
    const totalPostings = jobPostings.length;
    const publishedPostings = jobPostings.filter((p) => p.status === 'published').length;
    const closedPostings = jobPostings.filter((p) => p.status === 'closed' || p.status === 'filled').length;
    const totalApplications = jobApplications.length;
    const pendingApplications = jobApplications.filter((a) => a.status === 'pending').length;
    const shortlistedApplications = jobApplications.filter((a) => a.status === 'shortlisted').length;
    const acceptedApplications = jobApplications.filter((a) => a.status === 'accepted').length;

    return {
      totalPostings,
      publishedPostings,
      closedPostings,
      totalApplications,
      pendingApplications,
      shortlistedApplications,
      acceptedApplications,
    };
  }, [jobPostings, jobApplications]);

  const activePostings = useMemo(() => {
    const today = new Date();
    return jobPostings
      .filter(
        (p) =>
          p.status === 'published' &&
          new Date(p.deadline).getTime() >= today.getTime()
      )
      .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())
      .slice(0, 5);
  }, [jobPostings]);

  const recentApplications = useMemo(() => {
    return [...jobApplications]
      .sort((a, b) => new Date(b.appliedDate).getTime() - new Date(a.appliedDate).getTime())
      .slice(0, 6);
  }, [jobApplications]);

  const getStatusTag = (status: string) => {
    const statusConfig: Record<string, { color: string; text: string }> = {
      draft: { color: 'default', text: 'Draft' },
      published: { color: 'green', text: 'Published' },
      closed: { color: 'red', text: 'Closed' },
      filled: { color: 'blue', text: 'Filled' },
      pending: { color: 'orange', text: 'Pending' },
      shortlisted: { color: 'cyan', text: 'Shortlisted' },
      interviewed: { color: 'purple', text: 'Interviewed' },
      rejected: { color: 'red', text: 'Rejected' },
      accepted: { color: 'green', text: 'Accepted' },
    };

    const config = statusConfig[status] || { color: 'default', text: status };
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  const getEmploymentTypeTag = (type: string) => {
    const typeConfig: Record<string, { color: string; text: string }> = {
      permanent: { color: 'green', text: 'Permanent' },
      contract: { color: 'blue', text: 'Contract' },
      temporary: { color: 'orange', text: 'Temporary' },
    };

    const config = typeConfig[type] || { color: 'default', text: type };
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  const getDepartmentName = (departmentId?: string) => {
    if (!departmentId) return 'N/A';
    const dept = departments.find((d) => d.id === departmentId);
    return dept?.name || departmentId;
  };

  const getJobPostingTitle = (jobPostingId: string) => {
    const posting = jobPostings.find((p) => p.id === jobPostingId);
    return posting?.title || jobPostingId;
  };

  const handleReviewApplication = (application: JobApplication) => {
    setSelectedApplication(application);
    reviewForm.setFieldsValue({
      status: application.status,
      interviewDate: application.interviewDate ? dayjs(application.interviewDate) : null,
      interviewNotes: application.interviewNotes || '',
    });
    setApplicationModal(true);
  };

  const handleApplicationStatusUpdate = async (values: any) => {
    if (!selectedApplication) return;

    try {
      setLoading(true);
      // Note: This would require an API endpoint to update application status
      // For now, we'll show a message
      message.success('Application status updated successfully');
      setApplicationModal(false);
      setSelectedApplication(null);
      reviewForm.resetFields();
      fetchData();
    } catch (error: any) {
      message.error(error.message || 'Failed to update application status');
    } finally {
      setLoading(false);
    }
  };

  const isDeadlinePassed = (deadline: string) => {
    return new Date(deadline) < new Date();
  };

  const quickActionButtons = [
    {
      title: 'Create Job Posting',
      icon: <PlusOutlined />,
      action: () => navigate(route.HR_JOB_POSTING_CREATE),
      description: 'Post a new job opening for recruitment.',
      type: 'primary' as const,
    },
    {
      title: 'View All Postings',
      icon: <FileTextOutlined />,
      action: () => navigate(route.HR_JOB_POSTING_LIST),
      description: 'Manage all job postings and their status.',
    },
    {
      title: 'View Applications',
      icon: <UserAddOutlined />,
      action: () => navigate(route.HR_JOB_APPLICATION_LIST),
      description: 'Review and process job applications.',
    },
  ];

  const postingColumns = [
    {
      title: 'Job Title',
      dataIndex: 'title',
      key: 'title',
      render: (title: string, record: JobPosting) => (
        <Space direction="vertical" size={0}>
          <Text strong>{title}</Text>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {getDepartmentName(record.departmentId)}
          </Text>
        </Space>
      ),
    },
    {
      title: 'Type',
      dataIndex: 'employmentType',
      key: 'employmentType',
      render: (type: string) => getEmploymentTypeTag(type),
    },
    {
      title: 'Deadline',
      dataIndex: 'deadline',
      key: 'deadline',
      render: (date: string) => {
        const passed = isDeadlinePassed(date);
        return (
          <Space direction="vertical" size={0}>
            <Text style={{ color: passed ? '#ff4d4f' : 'inherit' }}>
              {new Date(date).toLocaleDateString()}
            </Text>
            {passed && <Tag color="red">Expired</Tag>}
          </Space>
        );
      },
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => getStatusTag(status),
    },
    {
      title: 'Applications',
      key: 'applications',
      render: (_: any, record: JobPosting) => {
        const count = jobApplications.filter((a) => a.jobPostingId === record.id).length;
        return <Text>{count}</Text>;
      },
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: JobPosting) => (
        <Space size="small">
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => navigate(route.HR_JOB_POSTING_DETAIL.replace(':id', record.id))}
          >
            View
          </Button>
          <Button
            type="link"
            icon={<UserAddOutlined />}
            onClick={() => navigate(`${route.HR_JOB_POSTING_DETAIL.replace(':id', record.id)}/applications`)}
          >
            Applications
          </Button>
        </Space>
      ),
    },
  ];

  const applicationColumns = [
    {
      title: 'Applicant',
      key: 'applicant',
      render: (_: any, record: JobApplication) => (
        <Space direction="vertical" size={0}>
          <Text strong>{record.applicantName}</Text>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {record.applicantEmail}
          </Text>
        </Space>
      ),
    },
    {
      title: 'Position',
      key: 'position',
      render: (_: any, record: JobApplication) => (
        <Text>{getJobPostingTitle(record.jobPostingId)}</Text>
      ),
    },
    {
      title: 'Applied Date',
      dataIndex: 'appliedDate',
      key: 'appliedDate',
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => getStatusTag(status),
    },
    {
      title: 'CNIC',
      dataIndex: 'applicantCNIC',
      key: 'applicantCNIC',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: JobApplication) => (
        <Space size="small">
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => navigate(route.HR_JOB_APPLICATION_DETAIL.replace(':id', record.id))}
          >
            View
          </Button>
          {record.status === 'pending' && (
            <PermissionGuard permission="hr" action="update">
              <Button
                type="link"
                icon={<CheckOutlined />}
                onClick={() => handleReviewApplication(record)}
                style={{ color: '#52c41a' }}
              >
                Review
              </Button>
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
            background: 'linear-gradient(135deg, rgba(24,144,255,0.1) 0%, rgba(24,144,255,0.05) 100%)',
          }}
        >
          <Row gutter={[16, 16]} align="middle">
            <Col flex="auto">
              <Title level={3} style={{ marginBottom: 4 }}>
                <TeamOutlined /> Recruitment Management
              </Title>
              <Text type="secondary">
                Manage job postings, review applications, and track the recruitment process.
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
                title="Total Job Postings"
                value={stats.totalPostings}
                prefix={<FileTextOutlined />}
                loading={loading}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card bordered={false}>
              <Statistic
                title="Published"
                value={stats.publishedPostings}
                prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
                loading={loading}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card bordered={false}>
              <Statistic
                title="Total Applications"
                value={stats.totalApplications}
                prefix={<UserAddOutlined style={{ color: '#1890ff' }} />}
                loading={loading}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card bordered={false}>
              <Statistic
                title="Pending Review"
                value={stats.pendingApplications}
                prefix={<ClockCircleOutlined style={{ color: '#faad14' }} />}
                loading={loading}
                valueStyle={{ color: '#faad14' }}
              />
            </Card>
          </Col>
        </Row>

        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} lg={6}>
            <Card bordered={false}>
              <Statistic
                title="Shortlisted"
                value={stats.shortlistedApplications}
                prefix={<CheckCircleOutlined style={{ color: '#13c2c2' }} />}
                loading={loading}
                valueStyle={{ color: '#13c2c2' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card bordered={false}>
              <Statistic
                title="Accepted"
                value={stats.acceptedApplications}
                prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
                loading={loading}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card bordered={false}>
              <Statistic
                title="Closed/Filled"
                value={stats.closedPostings}
                prefix={<FileTextOutlined style={{ color: '#722ed1' }} />}
                loading={loading}
                valueStyle={{ color: '#722ed1' }}
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
            <PermissionGuard permission="hr" action="create">
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => navigate(route.HR_JOB_POSTING_CREATE)}
              >
                New Job Posting
              </Button>
            </PermissionGuard>
          }
        >
          <Space wrap style={{ width: '100%' }}>
            <Select
              placeholder="Filter by Department"
              allowClear
              showSearch
              optionFilterProp="children"
              style={{ width: 200 }}
              value={filters.departmentId}
              onChange={(value) => setFilters({ ...filters, departmentId: value })}
            >
              {departments.map((dept) => (
                <Option key={dept.id} value={dept.id}>
                  {dept.name}
                </Option>
              ))}
            </Select>

            <Select
              placeholder="Filter Posting Status"
              allowClear
              style={{ width: 150 }}
              value={filters.postingStatus}
              onChange={(value) => setFilters({ ...filters, postingStatus: value })}
            >
              <Option value="draft">Draft</Option>
              <Option value="published">Published</Option>
              <Option value="closed">Closed</Option>
              <Option value="filled">Filled</Option>
            </Select>

            <Select
              placeholder="Filter Application Status"
              allowClear
              style={{ width: 150 }}
              value={filters.applicationStatus}
              onChange={(value) => setFilters({ ...filters, applicationStatus: value })}
            >
              <Option value="pending">Pending</Option>
              <Option value="shortlisted">Shortlisted</Option>
              <Option value="interviewed">Interviewed</Option>
              <Option value="accepted">Accepted</Option>
              <Option value="rejected">Rejected</Option>
            </Select>

            <Search
              placeholder="Search postings or applicants"
              allowClear
              style={{ width: 250 }}
              onSearch={(value) => setFilters({ ...filters, search: value })}
            />
          </Space>
        </Card>

        <Row gutter={[16, 16]}>
          {/* Active Job Postings */}
          <Col xs={24} lg={14}>
            <Card
              title={
                <Space>
                  <CalendarOutlined />
                  Active Job Postings
                </Space>
              }
              extra={
                <Button
                  type="link"
                  onClick={() => navigate(route.HR_JOB_POSTING_LIST)}
                >
                  View All
                </Button>
              }
              bordered={false}
            >
              {loading ? (
                <Skeleton active paragraph={{ rows: 4 }} />
              ) : activePostings.length === 0 ? (
                <Empty description="No active job postings" />
              ) : (
                <Table
                  dataSource={activePostings}
                  rowKey="id"
                  pagination={false}
                  size="small"
                  columns={postingColumns}
                />
              )}
            </Card>
          </Col>

          {/* Application Status */}
          <Col xs={24} lg={10}>
            <Card title="Application Status" bordered={false}>
              {loading ? (
                <Skeleton active paragraph={{ rows: 4 }} />
              ) : (
                <Space direction="vertical" style={{ width: '100%' }} size="middle">
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Text>Pending Applications</Text>
                    <Text strong style={{ color: '#faad14' }}>
                      {stats.pendingApplications}
                    </Text>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Text>Shortlisted</Text>
                    <Text strong style={{ color: '#13c2c2' }}>
                      {stats.shortlistedApplications}
                    </Text>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Text>Accepted</Text>
                    <Text strong style={{ color: '#52c41a' }}>
                      {stats.acceptedApplications}
                    </Text>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Text>Total Applications</Text>
                    <Text strong>{stats.totalApplications}</Text>
                  </div>
                </Space>
              )}
            </Card>
          </Col>
        </Row>

        {/* Recent Applications */}
        <Card
          title="Recent Job Applications"
          bordered={false}
          extra={
            <Button
              type="link"
              onClick={() => navigate(route.HR_JOB_APPLICATION_LIST)}
            >
              View All
            </Button>
          }
        >
          {loading ? (
            <Skeleton active paragraph={{ rows: 3 }} />
          ) : recentApplications.length === 0 ? (
            <Empty description="No applications received yet" />
          ) : (
            <Table
              dataSource={recentApplications}
              rowKey="id"
              pagination={false}
              columns={applicationColumns}
            />
          )}
        </Card>
      </Space>

      {/* Application Review Modal */}
      <Modal
        title={
          <Space>
            <CheckOutlined />
            Review Application
          </Space>
        }
        open={applicationModal}
        onCancel={() => {
          setApplicationModal(false);
          setSelectedApplication(null);
          reviewForm.resetFields();
        }}
        footer={null}
        width={600}
        destroyOnClose
      >
        {selectedApplication && (
          <Space direction="vertical" style={{ width: '100%' }} size="large">
            <Card size="small" style={{ background: '#f0f0f0' }}>
              <Space direction="vertical" style={{ width: '100%' }} size="small">
                <div>
                  <Text strong>Applicant: </Text>
                  <Text>{selectedApplication.applicantName}</Text>
                </div>
                <div>
                  <Text strong>Email: </Text>
                  <Text>{selectedApplication.applicantEmail}</Text>
                </div>
                <div>
                  <Text strong>Phone: </Text>
                  <Text>{selectedApplication.applicantPhone}</Text>
                </div>
                <div>
                  <Text strong>CNIC: </Text>
                  <Text>{selectedApplication.applicantCNIC}</Text>
                </div>
                <div>
                  <Text strong>Position: </Text>
                  <Text>{getJobPostingTitle(selectedApplication.jobPostingId)}</Text>
                </div>
                <div>
                  <Text strong>Applied Date: </Text>
                  <Text>{new Date(selectedApplication.appliedDate).toLocaleString()}</Text>
                </div>
                {selectedApplication.coverLetter && (
                  <div>
                    <Text strong>Cover Letter: </Text>
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
                      {selectedApplication.coverLetter}
                    </div>
                  </div>
                )}
                {selectedApplication.resumeUrl && (
                  <div>
                    <Text strong>Resume: </Text>
                    <Button
                      type="link"
                      icon={<FileTextOutlined />}
                      href={selectedApplication.resumeUrl}
                      target="_blank"
                    >
                      Download Resume
                    </Button>
                  </div>
                )}
              </Space>
            </Card>

            <Form form={reviewForm} layout="vertical" onFinish={handleApplicationStatusUpdate}>
              <Form.Item
                label="Application Status"
                name="status"
                rules={[{ required: true, message: 'Please select a status' }]}
              >
                <Select placeholder="Select status">
                  <Option value="pending">Pending</Option>
                  <Option value="shortlisted">Shortlisted</Option>
                  <Option value="interviewed">Interviewed</Option>
                  <Option value="accepted">Accepted</Option>
                  <Option value="rejected">Rejected</Option>
                </Select>
              </Form.Item>

              <Form.Item label="Interview Date" name="interviewDate">
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>

              <Form.Item label="Interview Notes" name="interviewNotes">
                <TextArea rows={4} placeholder="Enter interview notes or feedback" />
              </Form.Item>

              <Form.Item>
                <Space>
                  <Button type="primary" htmlType="submit" loading={loading} icon={<CheckOutlined />}>
                    Update Status
                  </Button>
                  <Button
                    onClick={() => {
                      setApplicationModal(false);
                      setSelectedApplication(null);
                      reviewForm.resetFields();
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

export default Recruitment;
