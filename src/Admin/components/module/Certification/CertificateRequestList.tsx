import React, { useState, useEffect } from 'react';
import { Table, Button, Select, Space, Tag, Card, message, Modal } from 'antd';
import { PlusOutlined, CheckOutlined, CloseOutlined, EyeOutlined, DollarOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import certificationAPI, { CertificateRequest, ApproveCertificateRequestDTO } from '@/api/certification.api';
import PermissionGuard from '@/components/common/PermissionGuard';

const { Option } = Select;

const CertificateRequestList: React.FC = () => {
  const navigate = useNavigate();
  const [requests, setRequests] = useState<CertificateRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 20,
    total: 0,
  });
  const [filters, setFilters] = useState({
    certificateType: undefined as string | undefined,
    status: undefined as string | undefined,
    studentId: undefined as string | undefined,
  });

  useEffect(() => {
    fetchRequests();
  }, [pagination.current, pagination.pageSize, filters]);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const response = await certificationAPI.getAllCertificateRequests({
        certificateType: filters.certificateType,
        status: filters.status,
        studentId: filters.studentId,
        page: pagination.current,
        limit: pagination.pageSize,
      });

      setRequests(response.requests || []);
      setPagination({
        ...pagination,
        total: response.pagination?.total || 0,
      });
    } catch (error: any) {
      message.error(error.message || 'Failed to fetch certificate requests');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = (id: string) => {
    Modal.confirm({
      title: 'Approve Certificate Request',
      content: 'Are you sure you want to approve this certificate request?',
      okText: 'Yes, Approve',
      okType: 'primary',
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          const approveData: ApproveCertificateRequestDTO = {
            status: 'approved',
            remarks: 'Certificate request approved',
          };
          await certificationAPI.approveCertificateRequest(id, approveData);
          message.success('Certificate request approved successfully');
          fetchRequests();
        } catch (error: any) {
          message.error(error.message || 'Failed to approve certificate request');
        }
      },
    });
  };

  const handleReject = (id: string) => {
    Modal.confirm({
      title: 'Reject Certificate Request',
      content: 'Are you sure you want to reject this certificate request?',
      okText: 'Yes, Reject',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          const rejectData: ApproveCertificateRequestDTO = {
            status: 'rejected',
            rejectionReason: 'Certificate request rejected',
          };
          await certificationAPI.approveCertificateRequest(id, rejectData);
          message.success('Certificate request rejected');
          fetchRequests();
        } catch (error: any) {
          message.error(error.message || 'Failed to reject certificate request');
        }
      },
    });
  };

  const handleMarkFeePaid = (id: string) => {
    Modal.confirm({
      title: 'Mark Fee as Paid',
      content: 'Are you sure you want to mark the fee as paid?',
      okText: 'Yes, Mark as Paid',
      okType: 'primary',
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          await certificationAPI.markFeeAsPaid(id);
          message.success('Fee marked as paid successfully');
          fetchRequests();
        } catch (error: any) {
          message.error(error.message || 'Failed to mark fee as paid');
        }
      },
    });
  };

  const getStatusTag = (status: string) => {
    const statusConfig: Record<string, { color: string; text: string }> = {
      pending: { color: 'orange', text: 'Pending' },
      approved: { color: 'blue', text: 'Approved' },
      rejected: { color: 'red', text: 'Rejected' },
      processing: { color: 'cyan', text: 'Processing' },
      ready: { color: 'green', text: 'Ready' },
      delivered: { color: 'purple', text: 'Delivered' },
      cancelled: { color: 'default', text: 'Cancelled' },
    };

    const config = statusConfig[status] || { color: 'default', text: status };
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  const getCertificateTypeTag = (type: string) => {
    const typeConfig: Record<string, { color: string; text: string }> = {
      degree: { color: 'blue', text: 'Degree' },
      transcript: { color: 'green', text: 'Transcript' },
      character: { color: 'purple', text: 'Character' },
      bonafide: { color: 'orange', text: 'Bonafide' },
      course_completion: { color: 'cyan', text: 'Course Completion' },
      attendance: { color: 'default', text: 'Attendance' },
      other: { color: 'default', text: 'Other' },
    };

    const config = typeConfig[type] || { color: 'default', text: type };
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  const formatCurrency = (amount?: number) => {
    if (!amount) return '-';
    return `PKR ${amount.toLocaleString()}`;
  };

  const columns = [
    {
      title: 'Student ID',
      dataIndex: 'studentId',
      key: 'studentId',
    },
    {
      title: 'Certificate Type',
      dataIndex: 'certificateType',
      key: 'certificateType',
      render: (type: string) => getCertificateTypeTag(type),
      filters: [
        { text: 'Degree', value: 'degree' },
        { text: 'Transcript', value: 'transcript' },
        { text: 'Character', value: 'character' },
        { text: 'Bonafide', value: 'bonafide' },
        { text: 'Course Completion', value: 'course_completion' },
        { text: 'Attendance', value: 'attendance' },
      ],
    },
    {
      title: 'Purpose',
      dataIndex: 'purpose',
      key: 'purpose',
    },
    {
      title: 'Requested Date',
      dataIndex: 'requestedDate',
      key: 'requestedDate',
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
    {
      title: 'Fee Amount',
      dataIndex: 'feeAmount',
      key: 'feeAmount',
      render: (amount: number) => formatCurrency(amount),
    },
    {
      title: 'Fee Status',
      key: 'feeStatus',
      render: (_: any, record: CertificateRequest) => {
        if (!record.feeAmount) return '-';
        return (
          <Tag color={record.feePaid ? 'green' : 'red'}>
            {record.feePaid ? 'Paid' : 'Pending'}
          </Tag>
        );
      },
    },
    {
      title: 'Delivery Method',
      dataIndex: 'deliveryMethod',
      key: 'deliveryMethod',
      render: (method: string) => (
        <Tag>{method.charAt(0).toUpperCase() + method.slice(1)}</Tag>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => getStatusTag(status),
      filters: [
        { text: 'Pending', value: 'pending' },
        { text: 'Approved', value: 'approved' },
        { text: 'Rejected', value: 'rejected' },
        { text: 'Processing', value: 'processing' },
        { text: 'Ready', value: 'ready' },
        { text: 'Delivered', value: 'delivered' },
      ],
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: CertificateRequest) => (
        <Space size="middle">
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => navigate(`/certification/requests/${record.id}`)}
          >
            View
          </Button>
          {record.status === 'pending' && (
            <PermissionGuard permission="certification" action="approve">
              <>
                <Button
                  type="link"
                  icon={<CheckOutlined />}
                  onClick={() => handleApprove(record.id)}
                  style={{ color: 'green' }}
                >
                  Approve
                </Button>
                <Button
                  type="link"
                  danger
                  icon={<CloseOutlined />}
                  onClick={() => handleReject(record.id)}
                >
                  Reject
                </Button>
              </>
            </PermissionGuard>
          )}
          {record.status === 'approved' && !record.feePaid && record.feeAmount && (
            <PermissionGuard permission="certification" action="update">
              <Button
                type="link"
                icon={<DollarOutlined />}
                onClick={() => handleMarkFeePaid(record.id)}
              >
                Mark Fee Paid
              </Button>
            </PermissionGuard>
          )}
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
              placeholder="Filter by Type"
              style={{ width: 150 }}
              allowClear
              value={filters.certificateType}
              onChange={(value) => setFilters({ ...filters, certificateType: value })}
            >
              <Option value="degree">Degree</Option>
              <Option value="transcript">Transcript</Option>
              <Option value="character">Character</Option>
              <Option value="bonafide">Bonafide</Option>
              <Option value="course_completion">Course Completion</Option>
              <Option value="attendance">Attendance</Option>
            </Select>
            <Select
              placeholder="Filter by Status"
              style={{ width: 150 }}
              allowClear
              value={filters.status}
              onChange={(value) => setFilters({ ...filters, status: value })}
            >
              <Option value="pending">Pending</Option>
              <Option value="approved">Approved</Option>
              <Option value="rejected">Rejected</Option>
              <Option value="processing">Processing</Option>
              <Option value="ready">Ready</Option>
              <Option value="delivered">Delivered</Option>
            </Select>
          </Space>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => navigate('/certification/requests/new')}
          >
            New Request
          </Button>
        </Space>

        <Table
          columns={columns}
          dataSource={requests}
          rowKey="id"
          loading={loading}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} requests`,
            onChange: (page, pageSize) => {
              setPagination({ ...pagination, current: page, pageSize });
            },
          }}
        />
      </Space>
    </Card>
  );
};

export default CertificateRequestList;

