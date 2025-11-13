import React, { useState, useEffect } from 'react';
import { Table, Button, Input, Space, Card, message, Tag, Select, Tooltip } from 'antd';
import { SearchOutlined, EyeOutlined, FileTextOutlined, CheckCircleOutlined, EditOutlined } from '@ant-design/icons';
import { admissionAPI, AdmissionApplication } from '../../../../api/admission.api';
import { useNavigate } from 'react-router-dom';
import { PermissionGuard } from '../../../common/PermissionGuard';
import { route } from '../../../routes/constant';
import { academicAPI, Program } from '../../../../api/academic.api';
import ApplicationReviewDrawer from './ApplicationReviewDrawer';

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
  const [programs, setPrograms] = useState<Program[]>([]);
  const [programLoading, setProgramLoading] = useState(false);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState<AdmissionApplication | null>(null);
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
    loadPrograms();
  }, []);

  const loadPrograms = async () => {
    try {
      setProgramLoading(true);
      const response = await academicAPI.getPrograms(1, 100, { isActive: true });
      setPrograms(response.programs);
    } catch (error: any) {
      message.error(error.message || 'Failed to load programs');
    } finally {
      setProgramLoading(false);
    }
  };

  const handleSearch = (value: string) => {
    const newFilters = { ...filters, search: value };
    setFilters(newFilters);
    fetchApplications(1, newFilters);
  };

  const handleStatusFilter = (value?: string) => {
    const newFilters = { ...filters, status: value || '' };
    setFilters(newFilters);
    fetchApplications(1, newFilters);
  };

  const handleProgramFilter = (value?: string) => {
    const newFilters = { ...filters, programId: value || '' };
    setFilters(newFilters);
    fetchApplications(1, newFilters);
  };

  const handleTableChange = (page: number) => {
    fetchApplications(page, filters);
  };

  const handleResetFilters = () => {
    const resetFilters = { search: '', status: '', programId: '' };
    setFilters(resetFilters);
    fetchApplications(1, resetFilters);
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
            <Tooltip title="Review / Update Application">
              <Button
                type="link"
                icon={<EditOutlined />}
                onClick={() => {
                  setSelectedApplication(record);
                  setReviewOpen(true);
                }}
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
            value={filters.status || undefined}
            onChange={(value) => handleStatusFilter(value)}
          >
            <Option value="submitted">Submitted</Option>
            <Option value="under_review">Under Review</Option>
            <Option value="eligible">Eligible</Option>
            <Option value="selected">Selected</Option>
            <Option value="waitlisted">Waitlisted</Option>
            <Option value="rejected">Rejected</Option>
          </Select>
          <Select
            placeholder="Filter by Program"
            allowClear
            loading={programLoading}
            style={{ width: 240 }}
            value={filters.programId || undefined}
            onChange={(value) => handleProgramFilter(value)}
          >
            {programs.map((program) => (
              <Option key={program.id} value={program.id}>
                {program.name}
              </Option>
            ))}
          </Select>
          <Button onClick={handleResetFilters}>Reset</Button>
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
      <ApplicationReviewDrawer
        open={reviewOpen}
        application={selectedApplication}
        onClose={() => {
          setReviewOpen(false);
          setSelectedApplication(null);
        }}
        onUpdated={() => {
          fetchApplications(pagination.page);
        }}
      />
    </Card>
  );
};

export default ApplicationList;

