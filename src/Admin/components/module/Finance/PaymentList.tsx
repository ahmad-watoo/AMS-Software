import React, { useState, useEffect } from 'react';
import { Table, Button, Select, Space, Tag, Card, DatePicker, message } from 'antd';
import { FileTextOutlined, EyeOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import financeAPI, { Payment } from '@/api/finance.api';
import dayjs from 'dayjs';

const { Option } = Select;
const { RangePicker } = DatePicker;

const PaymentList: React.FC = () => {
  const navigate = useNavigate();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 20,
    total: 0,
  });
  const [filters, setFilters] = useState({
    paymentMethod: undefined as string | undefined,
    dateRange: undefined as [dayjs.Dayjs, dayjs.Dayjs] | undefined,
  });

  useEffect(() => {
    fetchPayments();
  }, [pagination.current, pagination.pageSize, filters]);

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const params: any = {
        page: pagination.current,
        limit: pagination.pageSize,
      };

      if (filters.paymentMethod) {
        params.paymentMethod = filters.paymentMethod;
      }
      if (filters.dateRange) {
        params.startDate = filters.dateRange[0].format('YYYY-MM-DD');
        params.endDate = filters.dateRange[1].format('YYYY-MM-DD');
      }

      const response = await financeAPI.getAllPayments(params);

      setPayments(response.payments || []);
      setPagination({
        ...pagination,
        total: response.pagination?.total || 0,
      });
    } catch (error: any) {
      message.error(error.message || 'Failed to fetch payments');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return `PKR ${amount.toLocaleString()}`;
  };

  const getPaymentMethodTag = (method: string) => {
    const methodConfig: Record<string, { color: string; text: string }> = {
      cash: { color: 'green', text: 'Cash' },
      bank_transfer: { color: 'blue', text: 'Bank Transfer' },
      online: { color: 'cyan', text: 'Online' },
      cheque: { color: 'purple', text: 'Cheque' },
      easypaisa: { color: 'orange', text: 'EasyPaisa' },
      jazzcash: { color: 'red', text: 'JazzCash' },
      other: { color: 'default', text: 'Other' },
    };

    const config = methodConfig[method] || { color: 'default', text: method };
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  const columns = [
    {
      title: 'Receipt Number',
      dataIndex: 'receiptNumber',
      key: 'receiptNumber',
    },
    {
      title: 'Payment Date',
      dataIndex: 'paymentDate',
      key: 'paymentDate',
      render: (date: string) => new Date(date).toLocaleDateString(),
      sorter: true,
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount: number) => formatCurrency(amount),
      sorter: true,
    },
    {
      title: 'Payment Method',
      dataIndex: 'paymentMethod',
      key: 'paymentMethod',
      render: (method: string) => getPaymentMethodTag(method),
      filters: [
        { text: 'Cash', value: 'cash' },
        { text: 'Bank Transfer', value: 'bank_transfer' },
        { text: 'Online', value: 'online' },
        { text: 'EasyPaisa', value: 'easypaisa' },
        { text: 'JazzCash', value: 'jazzcash' },
      ],
    },
    {
      title: 'Transaction ID',
      dataIndex: 'transactionId',
      key: 'transactionId',
      render: (id: string) => id || '-',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: Payment) => (
        <Space size="middle">
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => navigate(`/finance/payments/${record.id}`)}
          >
            View
          </Button>
          <Button
            type="link"
            icon={<FileTextOutlined />}
            onClick={() => message.info('Receipt generation coming soon')}
          >
            Receipt
          </Button>
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
              placeholder="Filter by Payment Method"
              style={{ width: 150 }}
              allowClear
              value={filters.paymentMethod}
              onChange={(value) => setFilters({ ...filters, paymentMethod: value })}
            >
              <Option value="cash">Cash</Option>
              <Option value="bank_transfer">Bank Transfer</Option>
              <Option value="online">Online</Option>
              <Option value="easypaisa">EasyPaisa</Option>
              <Option value="jazzcash">JazzCash</Option>
            </Select>
            <RangePicker
              onChange={(dates) =>
                setFilters({
                  ...filters,
                  dateRange: dates as [dayjs.Dayjs, dayjs.Dayjs] | undefined,
                })
              }
              value={filters.dateRange}
            />
          </Space>
          <Button
            type="primary"
            icon={<FileTextOutlined />}
            onClick={() => navigate('/finance/payments/new')}
          >
            New Payment
          </Button>
        </Space>

        <Table
          columns={columns}
          dataSource={payments}
          rowKey="id"
          loading={loading}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} payments`,
            onChange: (page, pageSize) => {
              setPagination({ ...pagination, current: page, pageSize });
            },
          }}
        />
      </Space>
    </Card>
  );
};

export default PaymentList;

