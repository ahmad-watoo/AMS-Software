import React, { useState, useEffect } from 'react';
import { Card, Table, Tag, Input, Select, Space, message, Button } from 'antd';
import { SearchOutlined, EyeOutlined } from '@ant-design/icons';
import { admissionAPI, AdmissionApplication } from '@/api/admission.api';
import { useAuthContext } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { route } from '../../../../routes/constant';

const { Search } = Input;
const { Option } = Select;

const AdmissionStatus: React.FC = () => {
  const { user } = useAuthContext();
  const navigate = useNavigate();
  const [applications, setApplications] = useState<AdmissionApplication[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    status: '',
  });

  useEffect(() => {
    if (user?.id) {
      fetchUserApplications();
    }
  }, [user]);

  const fetchUserApplications = async () => {
    if (!user?.id) return;
    try {
      setLoading(true);
      const apps = await admissionAPI.getUserApplications(user.id);
      setApplications(apps);
    } catch (error: any) {
      message.error(error.message || 'Failed to load applications');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value: string) => {
    const newFilters = { ...filters, search: value };
    setFilters(newFilters);
    // Filter applications locally
    if (value) {
      const filtered = applications.filter((app) =>
        app.applicationNumber.toLowerCase().includes(value.toLowerCase())
      );
      // In a real app, you'd filter from the API
    }
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
        <Button
          type="link"
          icon={<EyeOutlined />}
          onClick={() => navigate(route.ADMISSION_APPLICATION_DETAIL.replace(':id', record.id))}
        >
          View Details
        </Button>
      ),
    },
  ];

  return (
    <Card
      title="My Admission Applications"
      style={{ margin: 20, boxShadow: 'rgba(0, 0, 0, 0.16) 0px 1px 4px' }}
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
            onChange={(value) => setFilters({ ...filters, status: value })}
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
          pagination={false}
        />
      </Space>
    </Card>
  );
};

export default AdmissionStatus;
