import React, { useState, useEffect } from 'react';
import { Table, Button, Select, Space, Tag, Card, message, Modal } from 'antd';
import { PlusOutlined, CheckOutlined, CloseOutlined, EyeOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import multicampusAPI, { StudentTransfer, ApproveTransferDTO } from '@/api/multicampus.api';
import PermissionGuard from '@/components/common/PermissionGuard';

const { Option } = Select;

const StudentTransferList: React.FC = () => {
  const navigate = useNavigate();
  const [transfers, setTransfers] = useState<StudentTransfer[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 20,
    total: 0,
  });
  const [filters, setFilters] = useState({
    status: undefined as string | undefined,
    transferType: undefined as string | undefined,
    fromCampusId: undefined as string | undefined,
    toCampusId: undefined as string | undefined,
  });

  useEffect(() => {
    fetchTransfers();
  }, [pagination.current, pagination.pageSize, filters]);

  const fetchTransfers = async () => {
    setLoading(true);
    try {
      const response = await multicampusAPI.getAllStudentTransfers({
        status: filters.status,
        transferType: filters.transferType,
        fromCampusId: filters.fromCampusId,
        toCampusId: filters.toCampusId,
        page: pagination.current,
        limit: pagination.pageSize,
      });

      setTransfers(response.transfers || []);
      setPagination({
        ...pagination,
        total: response.pagination?.total || 0,
      });
    } catch (error: any) {
      message.error(error.message || 'Failed to fetch student transfers');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = (id: string) => {
    Modal.confirm({
      title: 'Approve Student Transfer',
      content: 'Are you sure you want to approve this student transfer?',
      okText: 'Yes, Approve',
      okType: 'primary',
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          const approveData: ApproveTransferDTO = {
            status: 'approved',
            remarks: 'Transfer approved',
          };
          await multicampusAPI.approveStudentTransfer(id, approveData);
          message.success('Student transfer approved successfully');
          fetchTransfers();
        } catch (error: any) {
          message.error(error.message || 'Failed to approve student transfer');
        }
      },
    });
  };

  const handleReject = (id: string) => {
    Modal.confirm({
      title: 'Reject Student Transfer',
      content: 'Are you sure you want to reject this student transfer?',
      okText: 'Yes, Reject',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          const rejectData: ApproveTransferDTO = {
            status: 'rejected',
            rejectionReason: 'Transfer rejected',
          };
          await multicampusAPI.approveStudentTransfer(id, rejectData);
          message.success('Student transfer rejected');
          fetchTransfers();
        } catch (error: any) {
          message.error(error.message || 'Failed to reject student transfer');
        }
      },
    });
  };

  const getStatusTag = (status: string) => {
    const statusConfig: Record<string, { color: string; text: string }> = {
      pending: { color: 'orange', text: 'Pending' },
      approved: { color: 'blue', text: 'Approved' },
      rejected: { color: 'red', text: 'Rejected' },
      completed: { color: 'green', text: 'Completed' },
      cancelled: { color: 'default', text: 'Cancelled' },
    };

    const config = statusConfig[status] || { color: 'default', text: status };
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  const getTransferTypeTag = (type: string) => {
    const typeConfig: Record<string, { color: string; text: string }> = {
      permanent: { color: 'blue', text: 'Permanent' },
      temporary: { color: 'orange', text: 'Temporary' },
      exchange: { color: 'green', text: 'Exchange' },
    };

    const config = typeConfig[type] || { color: 'default', text: type };
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  const columns = [
    {
      title: 'Student ID',
      dataIndex: 'studentId',
      key: 'studentId',
    },
    {
      title: 'From Campus',
      dataIndex: 'fromCampusId',
      key: 'fromCampusId',
    },
    {
      title: 'To Campus',
      dataIndex: 'toCampusId',
      key: 'toCampusId',
    },
    {
      title: 'Transfer Type',
      dataIndex: 'transferType',
      key: 'transferType',
      render: (type: string) => getTransferTypeTag(type),
      filters: [
        { text: 'Permanent', value: 'permanent' },
        { text: 'Temporary', value: 'temporary' },
        { text: 'Exchange', value: 'exchange' },
      ],
    },
    {
      title: 'Requested Date',
      dataIndex: 'requestedDate',
      key: 'requestedDate',
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
    {
      title: 'Effective Date',
      dataIndex: 'effectiveDate',
      key: 'effectiveDate',
      render: (date: string) => (date ? new Date(date).toLocaleDateString() : '-'),
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
        { text: 'Completed', value: 'completed' },
      ],
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: StudentTransfer) => (
        <Space size="middle">
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => navigate(`/multicampus/student-transfers/${record.id}`)}
          >
            View
          </Button>
          {record.status === 'pending' && (
            <PermissionGuard permission="admin" action="approve">
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
              <Option value="pending">Pending</Option>
              <Option value="approved">Approved</Option>
              <Option value="rejected">Rejected</Option>
              <Option value="completed">Completed</Option>
            </Select>
            <Select
              placeholder="Filter by Type"
              style={{ width: 150 }}
              allowClear
              value={filters.transferType}
              onChange={(value) => setFilters({ ...filters, transferType: value })}
            >
              <Option value="permanent">Permanent</Option>
              <Option value="temporary">Temporary</Option>
              <Option value="exchange">Exchange</Option>
            </Select>
          </Space>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => navigate('/multicampus/student-transfers/new')}
          >
            New Transfer
          </Button>
        </Space>

        <Table
          columns={columns}
          dataSource={transfers}
          rowKey="id"
          loading={loading}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} transfers`,
            onChange: (page, pageSize) => {
              setPagination({ ...pagination, current: page, pageSize });
            },
          }}
        />
      </Space>
    </Card>
  );
};

export default StudentTransferList;

