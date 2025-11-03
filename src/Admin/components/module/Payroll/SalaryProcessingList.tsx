import React, { useState, useEffect } from 'react';
import { Table, Button, Select, Space, Tag, Card, message, Modal, DatePicker } from 'antd';
import { CheckOutlined, EyeOutlined, DollarOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import payrollAPI, { SalaryProcessing, ApproveSalaryDTO } from '@/api/payroll.api';
import PermissionGuard from '@/components/common/PermissionGuard';
import dayjs from 'dayjs';

const { Option } = Select;

const SalaryProcessingList: React.FC = () => {
  const navigate = useNavigate();
  const [processings, setProcessings] = useState<SalaryProcessing[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 20,
    total: 0,
  });
  const [filters, setFilters] = useState({
    status: undefined as string | undefined,
    payrollPeriod: undefined as string | undefined,
    employeeId: undefined as string | undefined,
  });

  useEffect(() => {
    fetchProcessings();
  }, [pagination.current, pagination.pageSize, filters]);

  const fetchProcessings = async () => {
    setLoading(true);
    try {
      const response = await payrollAPI.getAllSalaryProcessings({
        status: filters.status,
        payrollPeriod: filters.payrollPeriod,
        employeeId: filters.employeeId,
        page: pagination.current,
        limit: pagination.pageSize,
      });

      setProcessings(response.processings || []);
      setPagination({
        ...pagination,
        total: response.pagination?.total || 0,
      });
    } catch (error: any) {
      message.error(error.message || 'Failed to fetch salary processings');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = (id: string) => {
    Modal.confirm({
      title: 'Approve Salary Processing',
      content: 'Are you sure you want to approve this salary processing?',
      okText: 'Yes, Approve',
      okType: 'primary',
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          const approveData: ApproveSalaryDTO = {
            status: 'approved',
            remarks: 'Salary approved',
          };
          await payrollAPI.approveSalary(id, approveData);
          message.success('Salary processing approved successfully');
          fetchProcessings();
        } catch (error: any) {
          message.error(error.message || 'Failed to approve salary processing');
        }
      },
    });
  };

  const handleMarkAsPaid = (id: string) => {
    Modal.confirm({
      title: 'Mark Salary as Paid',
      content: 'Are you sure you want to mark this salary as paid?',
      okText: 'Yes, Mark as Paid',
      okType: 'primary',
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          await payrollAPI.markAsPaid(id);
          message.success('Salary marked as paid successfully');
          fetchProcessings();
        } catch (error: any) {
          message.error(error.message || 'Failed to mark salary as paid');
        }
      },
    });
  };

  const getStatusTag = (status: string) => {
    const statusConfig: Record<string, { color: string; text: string }> = {
      pending: { color: 'orange', text: 'Pending' },
      processed: { color: 'blue', text: 'Processed' },
      approved: { color: 'green', text: 'Approved' },
      paid: { color: 'purple', text: 'Paid' },
    };

    const config = statusConfig[status] || { color: 'default', text: status };
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  const formatCurrency = (amount: number) => {
    return `PKR ${amount.toLocaleString()}`;
  };

  const columns = [
    {
      title: 'Employee ID',
      dataIndex: 'employeeId',
      key: 'employeeId',
    },
    {
      title: 'Payroll Period',
      dataIndex: 'payrollPeriod',
      key: 'payrollPeriod',
      render: (period: string) => {
        const [year, month] = period.split('-');
        const date = new Date(parseInt(year), parseInt(month) - 1);
        return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
      },
    },
    {
      title: 'Gross Salary',
      dataIndex: 'grossSalary',
      key: 'grossSalary',
      render: (amount: number) => formatCurrency(amount),
      sorter: true,
    },
    {
      title: 'Net Salary',
      dataIndex: 'netSalary',
      key: 'netSalary',
      render: (amount: number) => formatCurrency(amount),
      sorter: true,
    },
    {
      title: 'Tax',
      dataIndex: 'taxAmount',
      key: 'taxAmount',
      render: (amount: number) => formatCurrency(amount),
    },
    {
      title: 'Days Worked',
      key: 'days',
      render: (_: any, record: SalaryProcessing) => `${record.daysWorked}/${record.daysInMonth}`,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => getStatusTag(status),
      filters: [
        { text: 'Pending', value: 'pending' },
        { text: 'Processed', value: 'processed' },
        { text: 'Approved', value: 'approved' },
        { text: 'Paid', value: 'paid' },
      ],
    },
    {
      title: 'Payment Date',
      dataIndex: 'paymentDate',
      key: 'paymentDate',
      render: (date: string) => (date ? new Date(date).toLocaleDateString() : '-'),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: SalaryProcessing) => (
        <Space size="middle">
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => navigate(`/payroll/processings/${record.id}`)}
          >
            View
          </Button>
          {record.status === 'processed' && (
            <PermissionGuard permission="payroll" action="approve">
              <Button
                type="link"
                icon={<CheckOutlined />}
                onClick={() => handleApprove(record.id)}
                style={{ color: 'green' }}
              >
                Approve
              </Button>
            </PermissionGuard>
          )}
          {record.status === 'approved' && (
            <PermissionGuard permission="payroll" action="update">
              <Button
                type="link"
                icon={<DollarOutlined />}
                onClick={() => handleMarkAsPaid(record.id)}
                style={{ color: 'purple' }}
              >
                Mark Paid
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
              placeholder="Filter by Status"
              style={{ width: 150 }}
              allowClear
              value={filters.status}
              onChange={(value) => setFilters({ ...filters, status: value })}
            >
              <Option value="pending">Pending</Option>
              <Option value="processed">Processed</Option>
              <Option value="approved">Approved</Option>
              <Option value="paid">Paid</Option>
            </Select>
            <DatePicker
              picker="month"
              placeholder="Select Period"
              format="YYYY-MM"
              onChange={(date) =>
                setFilters({
                  ...filters,
                  payrollPeriod: date ? date.format('YYYY-MM') : undefined,
                })
              }
            />
          </Space>
          <PermissionGuard permission="payroll" action="create">
            <Button
              type="primary"
              onClick={() => navigate('/payroll/processings/new')}
            >
              Process Salary
            </Button>
          </PermissionGuard>
        </Space>

        <Table
          columns={columns}
          dataSource={processings}
          rowKey="id"
          loading={loading}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} processings`,
            onChange: (page, pageSize) => {
              setPagination({ ...pagination, current: page, pageSize });
            },
          }}
        />
      </Space>
    </Card>
  );
};

export default SalaryProcessingList;

