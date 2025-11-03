import React, { useState, useEffect } from 'react';
import { Table, Button, Input, Space, Card, message, Tag, Select, Tooltip } from 'antd';
import { SearchOutlined, EyeOutlined, FileTextOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { admissionAPI, AdmissionApplication } from '../../../../api/admission.api';
import { useNavigate } from 'react-router-dom';
import { PermissionGuard } from '../../../common/PermissionGuard';
import { route } from '../../../routes/constant';

const { Search } = Input;
const { Option } = Select;

const ApplicationList: React.FC = () => {
  const [applications, setApplications] = useState<AdmissionApplication[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    programId: '',
  });
  const navigate = useNavigate();

  const fetchApplications = async (page: number = 1, currentFilters?: any) => {
    try {
      setLoading(true);
      const response = await admissionAPI.getApplications(page, pagination.limit, currentFilters || filters);
      setApplications(response.applications);
      setPagination(response.pagination);
    } catch (error: any) {
      message.error(error.message || 'Failed to load applications');
      console.error('Error fetching applications:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications(1);
  }, []);

  const handleSearch = (value: string) => {
    const newFilters = { ...filters, search: value };
    setFilters(newFilters);
    fetchApplications(1, newFilters);
  };

  const handleStatusFilter = (value: string) => {
    const newFilters = { ...filters, status: value };
    setFilters(newFilters);
    fetchApplications(1, newFilters);
  };

  const handleTableChange = (page: number) => {
    fetchApplications(page, filters);
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      submitted: 'default',
      under_review: 'processing',
      eligible: 'success',
      interview_scheduled: 'warning',
      selected: 'success',
      waitlisted: 'warning',
      rejected: 'error',
      fee_submitted: 'processing',
      enrolled: 'success',
    };
    return colors[status] || 'default';
  };

  const formatStatus = (status: string) => {
    return status.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  const columns = [
    {
      title: 'Application Number',
      dataIndex: 'applicationNumber',
      key: 'applicationNumber',
      render: (text: string) => (
        <Space>
          <FileTextOutlined />
          <strong>{text}</strong>
        </Space>
      ),
    },
    {
      title: 'Applicant Name',
      key: 'name',
      render: (record: AdmissionApplication) =>
        record.user
          ? `${record.user.firstName} ${record.user.lastName}`
          : 'N/A',
    },
    {
      title: 'Program',
      key: 'program',
      render: (record: AdmissionApplication) =>
        record.program ? record.program.name : 'N/A',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>{formatStatus(status)}</Tag>
      ),
    },
    {
      title: 'Eligibility',
      dataIndex: 'eligibilityStatus',
      key: 'eligibilityStatus',
      render: (status: string) => {
        if (!status) return '-';
        const colors: Record<string, string> = {
          eligible: 'success',
          not_eligible: 'error',
          pending: 'warning',
        };
        return <Tag color={colors[status] || 'default'}>{status.toUpperCase()}</Tag>;
      },
    },
    {
      title: 'Merit Rank',
      dataIndex: 'meritRank',
      key: 'meritRank',
      render: (rank: number) => (rank ? `#${rank}` : '-'),
    },
    {
      title: 'Application Date',
      dataIndex: 'applicationDate',
      key: 'applicationDate',
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: AdmissionApplication) => (
        <Space>
          <Tooltip title="View Details">
            <Button
              type="link"
              icon={<EyeOutlined />}
              onClick={() => navigate(route.ADMISSION_APPLICATION_DETAIL.replace(':id', record.id))}
            />
          </Tooltip>
          <PermissionGuard permission="admission" action="approve">
            <Tooltip title="Check Eligibility">
              <Button
                type="link"
                icon={<CheckCircleOutlined />}
                onClick={() => navigate(`${route.ADMISSION_ELIGIBILITY_CHECK}?applicationId=${record.id}`)}
              />
            </Tooltip>
          </PermissionGuard>
        </Space>
      ),
    },
  ];

  return (
    <Card
      title="Admission Applications"
      style={{ margin: 20, boxShadow: 'rgba(0, 0, 0, 0.16) 0px 1px 4px' }}
      extra={
        <PermissionGuard permission="admission" action="create">
          <Button type="primary" onClick={() => navigate(route.ADMISSION_APPLICATION_CREATE)}>
            New Application
          </Button>
        </PermissionGuard>
      }
    >
      <Space direction="vertical" style={{ width: '100%' }} size="large">
        <Space>
          <Search
            placeholder="Search by application number..."
            allowClear
            enterButton={<SearchOutlined />}
            size="large"
            onSearch={handleSearch}
            style={{ width: 300 }}
          />
          <Select
            placeholder="Filter by Status"
            allowClear
            style={{ width: 200 }}
            onChange={handleStatusFilter}
          >
            <Option value="submitted">Submitted</Option>
            <Option value="under_review">Under Review</Option>
            <Option value="eligible">Eligible</Option>
            <Option value="selected">Selected</Option>
            <Option value="waitlisted">Waitlisted</Option>
            <Option value="rejected">Rejected</Option>
          </Select>
        </Space>

        <Table
          columns={columns}
          dataSource={applications}
          rowKey="id"
          loading={loading}
          pagination={{
            current: pagination.page,
            pageSize: pagination.limit,
            total: pagination.total,
            showSizeChanger: false,
            showTotal: (total) => `Total ${total} applications`,
            onChange: handleTableChange,
          }}
        />
      </Space>
    </Card>
  );
};

export default ApplicationList;

