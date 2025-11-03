import React, { useState, useEffect } from 'react';
import { Table, Button, Input, Select, Space, Tag, Card, message, Modal } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, DollarOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import financeAPI, { FeeStructure } from '@/api/finance.api';
import PermissionGuard from '@/components/common/PermissionGuard';

const { Search } = Input;
const { Option } = Select;

const FeeStructureList: React.FC = () => {
  const navigate = useNavigate();
  const [feeStructures, setFeeStructures] = useState<FeeStructure[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 20,
    total: 0,
  });
  const [filters, setFilters] = useState({
    programId: undefined as string | undefined,
    feeType: undefined as string | undefined,
    isActive: undefined as boolean | undefined,
  });

  useEffect(() => {
    fetchFeeStructures();
  }, [pagination.current, pagination.pageSize, filters]);

  const fetchFeeStructures = async () => {
    setLoading(true);
    try {
      const response = await financeAPI.getAllFeeStructures({
        programId: filters.programId,
        feeType: filters.feeType,
        isActive: filters.isActive,
        page: pagination.current,
        limit: pagination.pageSize,
      });

      setFeeStructures(response.feeStructures || []);
      setPagination({
        ...pagination,
        total: response.pagination?.total || 0,
      });
    } catch (error: any) {
      message.error(error.message || 'Failed to fetch fee structures');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (id: string) => {
    Modal.confirm({
      title: 'Are you sure you want to delete this fee structure?',
      content: 'This action cannot be undone.',
      okText: 'Yes, Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          // Delete API call would go here
          message.success('Fee structure deleted successfully');
          fetchFeeStructures();
        } catch (error: any) {
          message.error(error.message || 'Failed to delete fee structure');
        }
      },
    });
  };

  const getFeeTypeTag = (type: string) => {
    const typeConfig: Record<string, { color: string; text: string }> = {
      tuition: { color: 'blue', text: 'Tuition' },
      admission: { color: 'green', text: 'Admission' },
      registration: { color: 'cyan', text: 'Registration' },
      exam: { color: 'orange', text: 'Exam' },
      library: { color: 'purple', text: 'Library' },
      lab: { color: 'red', text: 'Lab' },
      other: { color: 'default', text: 'Other' },
    };

    const config = typeConfig[type] || { color: 'default', text: type };
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  const formatCurrency = (amount: number) => {
    return `PKR ${amount.toLocaleString()}`;
  };

  const columns = [
    {
      title: 'Program',
      key: 'program',
      render: (_: any, record: FeeStructure) => record.programId || '-',
    },
    {
      title: 'Semester',
      dataIndex: 'semester',
      key: 'semester',
    },
    {
      title: 'Fee Type',
      dataIndex: 'feeType',
      key: 'feeType',
      render: (type: string) => getFeeTypeTag(type),
      filters: [
        { text: 'Tuition', value: 'tuition' },
        { text: 'Admission', value: 'admission' },
        { text: 'Registration', value: 'registration' },
        { text: 'Exam', value: 'exam' },
        { text: 'Library', value: 'library' },
        { text: 'Lab', value: 'lab' },
        { text: 'Other', value: 'other' },
      ],
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount: number) => formatCurrency(amount),
      sorter: true,
    },
    {
      title: 'Due Date',
      dataIndex: 'dueDate',
      key: 'dueDate',
      render: (date: string) => (date ? new Date(date).toLocaleDateString() : '-'),
    },
    {
      title: 'Status',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (isActive: boolean) => (
        <Tag color={isActive ? 'green' : 'red'}>{isActive ? 'Active' : 'Inactive'}</Tag>
      ),
      filters: [
        { text: 'Active', value: true },
        { text: 'Inactive', value: false },
      ],
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: FeeStructure) => (
        <Space size="middle">
          <PermissionGuard permission="finance" action="update">
            <Button
              type="link"
              icon={<EditOutlined />}
              onClick={() => navigate(`/finance/fee-structures/${record.id}/edit`)}
            >
              Edit
            </Button>
          </PermissionGuard>
          <PermissionGuard permission="finance" action="delete">
            <Button
              type="link"
              danger
              icon={<DeleteOutlined />}
              onClick={() => handleDelete(record.id)}
            >
              Delete
            </Button>
          </PermissionGuard>
        </Space>
      ),
    },
  ];

  return (
    <Card>
      <Space direction="vertical" style={{ width: '100%' }} size="large">
        <Space style={{ width: '100%', justifyContent: 'space-between' }}>
          <Space>
            <Select
              placeholder="Filter by Fee Type"
              style={{ width: 150 }}
              allowClear
              value={filters.feeType}
              onChange={(value) => setFilters({ ...filters, feeType: value })}
            >
              <Option value="tuition">Tuition</Option>
              <Option value="admission">Admission</Option>
              <Option value="registration">Registration</Option>
              <Option value="exam">Exam</Option>
              <Option value="library">Library</Option>
              <Option value="lab">Lab</Option>
              <Option value="other">Other</Option>
            </Select>
            <Select
              placeholder="Filter by Status"
              style={{ width: 150 }}
              allowClear
              value={filters.isActive}
              onChange={(value) => setFilters({ ...filters, isActive: value })}
            >
              <Option value={true}>Active</Option>
              <Option value={false}>Inactive</Option>
            </Select>
          </Space>
          <PermissionGuard permission="finance" action="create">
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => navigate('/finance/fee-structures/new')}
            >
              New Fee Structure
            </Button>
          </PermissionGuard>
        </Space>

        <Table
          columns={columns}
          dataSource={feeStructures}
          rowKey="id"
          loading={loading}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} fee structures`,
            onChange: (page, pageSize) => {
              setPagination({ ...pagination, current: page, pageSize });
            },
          }}
        />
      </Space>
    </Card>
  );
};

export default FeeStructureList;

