import React, { useState, useEffect } from 'react';
import { Table, Button, Select, Space, Tag, Card, message, Modal } from 'antd';
import { CheckOutlined, CloseOutlined, EyeOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import hrAPI, { LeaveRequest, ApproveLeaveDTO } from '@/api/hr.api';
import PermissionGuard from '@/components/common/PermissionGuard';

const { Option } = Select;

const LeaveRequestList: React.FC = () => {
  const navigate = useNavigate();
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 20,
    total: 0,
  });
  const [filters, setFilters] = useState({
    status: undefined as string | undefined,
    leaveType: undefined as string | undefined,
    employeeId: undefined as string | undefined,
  });

  useEffect(() => {
    fetchLeaveRequests();
  }, [pagination.current, pagination.pageSize, filters]);

  const fetchLeaveRequests = async () => {
    setLoading(true);
    try {
      const response = await hrAPI.getAllLeaveRequests({
        status: filters.status,
        leaveType: filters.leaveType,
        employeeId: filters.employeeId,
        page: pagination.current,
        limit: pagination.pageSize,
      });

      setLeaveRequests(response.leaveRequests || []);
      setPagination({
        ...pagination,
        total: response.pagination?.total || 0,
      });
    } catch (error: any) {
      message.error(error.message || 'Failed to fetch leave requests');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = (id: string) => {
    Modal.confirm({
      title: 'Approve Leave Request',
      content: 'Are you sure you want to approve this leave request?',
      okText: 'Yes, Approve',
      okType: 'primary',
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          const approveData: ApproveLeaveDTO = {
            status: 'approved',
            remarks: 'Leave approved',
          };
          await hrAPI.approveLeaveRequest(id, approveData);
          message.success('Leave request approved successfully');
          fetchLeaveRequests();
        } catch (error: any) {
          message.error(error.message || 'Failed to approve leave request');
        }
      },
    });
  };

  const handleReject = (id: string) => {
    Modal.confirm({
      title: 'Reject Leave Request',
      content: 'Are you sure you want to reject this leave request?',
      okText: 'Yes, Reject',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          const rejectData: ApproveLeaveDTO = {
            status: 'rejected',
            rejectionReason: 'Leave request rejected',
          };
          await hrAPI.approveLeaveRequest(id, rejectData);
          message.success('Leave request rejected');
          fetchLeaveRequests();
        } catch (error: any) {
          message.error(error.message || 'Failed to reject leave request');
        }
      },
    });
  };

  const getStatusTag = (status: string) => {
    const statusConfig: Record<string, { color: string; text: string }> = {
      pending: { color: 'orange', text: 'Pending' },
      approved: { color: 'green', text: 'Approved' },
      rejected: { color: 'red', text: 'Rejected' },
      cancelled: { color: 'default', text: 'Cancelled' },
    };

    const config = statusConfig[status] || { color: 'default', text: status };
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  const getLeaveTypeTag = (type: string) => {
    const typeConfig: Record<string, { color: string; text: string }> = {
      annual: { color: 'blue', text: 'Annual' },
      sick: { color: 'red', text: 'Sick' },
      casual: { color: 'green', text: 'Casual' },
      emergency: { color: 'orange', text: 'Emergency' },
      maternity: { color: 'purple', text: 'Maternity' },
      paternity: { color: 'cyan', text: 'Paternity' },
      unpaid: { color: 'default', text: 'Unpaid' },
    };

    const config = typeConfig[type] || { color: 'default', text: type };
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  const columns = [
    {
      title: 'Employee ID',
      dataIndex: 'employeeId',
      key: 'employeeId',
    },
    {
      title: 'Leave Type',
      dataIndex: 'leaveType',
      key: 'leaveType',
      render: (type: string) => getLeaveTypeTag(type),
      filters: [
        { text: 'Annual', value: 'annual' },
        { text: 'Sick', value: 'sick' },
        { text: 'Casual', value: 'casual' },
        { text: 'Emergency', value: 'emergency' },
        { text: 'Maternity', value: 'maternity' },
        { text: 'Paternity', value: 'paternity' },
      ],
    },
    {
      title: 'Start Date',
      dataIndex: 'startDate',
      key: 'startDate',
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
    {
      title: 'End Date',
      dataIndex: 'endDate',
      key: 'endDate',
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
    {
      title: 'Days',
      dataIndex: 'numberOfDays',
      key: 'numberOfDays',
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
      filters: [
        { text: 'Pending', value: 'pending' },
        { text: 'Approved', value: 'approved' },
        { text: 'Rejected', value: 'rejected' },
        { text: 'Cancelled', value: 'cancelled' },
      ],
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: LeaveRequest) => (
        <Space size="middle">
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => navigate(`/hr/leave-requests/${record.id}`)}
          >
            View
          </Button>
          {record.status === 'pending' && (
            <PermissionGuard permission="hr" action="approve">
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
              <Option value="cancelled">Cancelled</Option>
            </Select>
            <Select
              placeholder="Filter by Leave Type"
              style={{ width: 150 }}
              allowClear
              value={filters.leaveType}
              onChange={(value) => setFilters({ ...filters, leaveType: value })}
            >
              <Option value="annual">Annual</Option>
              <Option value="sick">Sick</Option>
              <Option value="casual">Casual</Option>
              <Option value="emergency">Emergency</Option>
              <Option value="maternity">Maternity</Option>
              <Option value="paternity">Paternity</Option>
            </Select>
          </Space>
          <Button
            type="primary"
            onClick={() => navigate('/hr/leave-requests/new')}
          >
            New Leave Request
          </Button>
        </Space>

        <Table
          columns={columns}
          dataSource={leaveRequests}
          rowKey="id"
          loading={loading}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} leave requests`,
            onChange: (page, pageSize) => {
              setPagination({ ...pagination, current: page, pageSize });
            },
          }}
        />
      </Space>
    </Card>
  );
};

export default LeaveRequestList;

