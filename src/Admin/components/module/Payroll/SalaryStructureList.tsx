import React, { useState, useEffect } from 'react';
import { Table, Button, Select, Space, Tag, Card, message, Input } from 'antd';
import { PlusOutlined, EditOutlined, EyeOutlined, SearchOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import payrollAPI, { SalaryStructure } from '@/api/payroll.api';
import PermissionGuard from '@/components/common/PermissionGuard';

const { Search } = Input;
const { Option } = Select;

const SalaryStructureList: React.FC = () => {
  const navigate = useNavigate();
  const [salaryStructures, setSalaryStructures] = useState<SalaryStructure[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 20,
    total: 0,
  });
  const [filters, setFilters] = useState({
    employeeId: undefined as string | undefined,
    isActive: undefined as boolean | undefined,
  });

  useEffect(() => {
    fetchSalaryStructures();
  }, [pagination.current, pagination.pageSize, filters]);

  const fetchSalaryStructures = async () => {
    setLoading(true);
    try {
      const response = await payrollAPI.getAllSalaryStructures({
        employeeId: filters.employeeId,
        isActive: filters.isActive,
        page: pagination.current,
        limit: pagination.pageSize,
      });

      setSalaryStructures(response.salaryStructures || []);
      setPagination({
        ...pagination,
        total: response.pagination?.total || 0,
      });
    } catch (error: any) {
      message.error(error.message || 'Failed to fetch salary structures');
    } finally {
      setLoading(false);
    }
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
      title: 'Basic Salary',
      dataIndex: 'basicSalary',
      key: 'basicSalary',
      render: (amount: number) => formatCurrency(amount),
      sorter: true,
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
      title: 'Effective Date',
      dataIndex: 'effectiveDate',
      key: 'effectiveDate',
      render: (date: string) => new Date(date).toLocaleDateString(),
      sorter: true,
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
      render: (_: any, record: SalaryStructure) => (
        <Space size="middle">
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => navigate(`/payroll/salary-structures/${record.id}`)}
          >
            View
          </Button>
          <PermissionGuard permission="payroll" action="update">
            <Button
              type="link"
              icon={<EditOutlined />}
              onClick={() => navigate(`/payroll/salary-structures/${record.id}/edit`)}
            >
              Edit
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
            <Search
              placeholder="Search by Employee ID"
              allowClear
              enterButton={<SearchOutlined />}
              style={{ width: 300 }}
              onSearch={(value) => setFilters({ ...filters, employeeId: value || undefined })}
            />
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
          <PermissionGuard permission="payroll" action="create">
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => navigate('/payroll/salary-structures/new')}
            >
              New Salary Structure
            </Button>
          </PermissionGuard>
        </Space>

        <Table
          columns={columns}
          dataSource={salaryStructures}
          rowKey="id"
          loading={loading}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} salary structures`,
            onChange: (page, pageSize) => {
              setPagination({ ...pagination, current: page, pageSize });
            },
          }}
        />
      </Space>
    </Card>
  );
};

export default SalaryStructureList;

