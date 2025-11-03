import React, { useState, useEffect } from 'react';
import { Table, Button, Select, Space, Tag, Card, message, Modal } from 'antd';
import { PlusOutlined, EditOutlined, EyeOutlined, FileTextOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import hrAPI, { JobPosting } from '@/api/hr.api';
import PermissionGuard from '@/components/common/PermissionGuard';

const { Option } = Select;

const JobPostingList: React.FC = () => {
  const navigate = useNavigate();
  const [jobPostings, setJobPostings] = useState<JobPosting[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 20,
    total: 0,
  });
  const [filters, setFilters] = useState({
    status: undefined as string | undefined,
    employmentType: undefined as string | undefined,
  });

  useEffect(() => {
    fetchJobPostings();
  }, [pagination.current, pagination.pageSize, filters]);

  const fetchJobPostings = async () => {
    setLoading(true);
    try {
      const response = await hrAPI.getAllJobPostings({
        status: filters.status,
        employmentType: filters.employmentType,
        page: pagination.current,
        limit: pagination.pageSize,
      });

      setJobPostings(response.jobPostings || []);
      setPagination({
        ...pagination,
        total: response.pagination?.total || 0,
      });
    } catch (error: any) {
      message.error(error.message || 'Failed to fetch job postings');
    } finally {
      setLoading(false);
    }
  };

  const getStatusTag = (status: string) => {
    const statusConfig: Record<string, { color: string; text: string }> = {
      draft: { color: 'default', text: 'Draft' },
      published: { color: 'green', text: 'Published' },
      closed: { color: 'red', text: 'Closed' },
      filled: { color: 'blue', text: 'Filled' },
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

  const isDeadlinePassed = (deadline: string) => {
    return new Date(deadline) < new Date();
  };

  const columns = [
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: 'Employment Type',
      dataIndex: 'employmentType',
      key: 'employmentType',
      render: (type: string) => getEmploymentTypeTag(type),
      filters: [
        { text: 'Permanent', value: 'permanent' },
        { text: 'Contract', value: 'contract' },
        { text: 'Temporary', value: 'temporary' },
      ],
    },
    {
      title: 'Location',
      dataIndex: 'location',
      key: 'location',
      render: (location: string) => location || '-',
    },
    {
      title: 'Posted Date',
      dataIndex: 'postedDate',
      key: 'postedDate',
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
    {
      title: 'Deadline',
      dataIndex: 'deadline',
      key: 'deadline',
      render: (date: string) => {
        const passed = isDeadlinePassed(date);
        return (
          <span style={{ color: passed ? 'red' : 'inherit' }}>
            {new Date(date).toLocaleDateString()}
          </span>
        );
      },
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => getStatusTag(status),
      filters: [
        { text: 'Draft', value: 'draft' },
        { text: 'Published', value: 'published' },
        { text: 'Closed', value: 'closed' },
        { text: 'Filled', value: 'filled' },
      ],
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: JobPosting) => (
        <Space size="middle">
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => navigate(`/hr/job-postings/${record.id}`)}
          >
            View
          </Button>
          <PermissionGuard permission="hr" action="create">
            <Button
              type="link"
              icon={<FileTextOutlined />}
              onClick={() => navigate(`/hr/job-postings/${record.id}/applications`)}
            >
              Applications
            </Button>
          </PermissionGuard>
        </Space>
      ),
    },
  ];

  return (
    <Card>
      <Space direction="vertical" style={{ width: '100%' }} size="large">
        <Space style={{ width: '100%', justifyContent: 'space-between', flexWrap: 'wrap' }}>
          <Space wrap>
            <Select
              placeholder="Filter by Status"
              style={{ width: 150 }}
              allowClear
              value={filters.status}
              onChange={(value) => setFilters({ ...filters, status: value })}
            >
              <Option value="draft">Draft</Option>
              <Option value="published">Published</Option>
              <Option value="closed">Closed</Option>
              <Option value="filled">Filled</Option>
            </Select>
            <Select
              placeholder="Filter by Type"
              style={{ width: 150 }}
              allowClear
              value={filters.employmentType}
              onChange={(value) => setFilters({ ...filters, employmentType: value })}
            >
              <Option value="permanent">Permanent</Option>
              <Option value="contract">Contract</Option>
              <Option value="temporary">Temporary</Option>
            </Select>
          </Space>
          <PermissionGuard permission="hr" action="create">
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => navigate('/hr/job-postings/new')}
            >
              New Job Posting
            </Button>
          </PermissionGuard>
        </Space>

        <Table
          columns={columns}
          dataSource={jobPostings}
          rowKey="id"
          loading={loading}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} job postings`,
            onChange: (page, pageSize) => {
              setPagination({ ...pagination, current: page, pageSize });
            },
          }}
        />
      </Space>
    </Card>
  );
};

export default JobPostingList;

