import React, { useState, useEffect } from 'react';
import { Table, Button, Select, Space, Tag, Card, message, Input, Modal } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined, SearchOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import hrAPI, { Employee } from '@/api/hr.api';
import PermissionGuard from '@/components/common/PermissionGuard';

const { Search } = Input;
const { Option } = Select;

const EmployeeList: React.FC = () => {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 20,
    total: 0,
  });
  const [filters, setFilters] = useState({
    designation: undefined as string | undefined,
    employmentType: undefined as string | undefined,
    isActive: undefined as boolean | undefined,
  });

  useEffect(() => {
    fetchEmployees();
  }, [pagination.current, pagination.pageSize, filters]);

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const response = await hrAPI.getAllEmployees({
        designation: filters.designation,
        employmentType: filters.employmentType,
        isActive: filters.isActive,
        page: pagination.current,
        limit: pagination.pageSize,
      });

      setEmployees(response.employees || []);
      setPagination({
        ...pagination,
        total: response.pagination?.total || 0,
      });
    } catch (error: any) {
      message.error(error.message || 'Failed to fetch employees');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (id: string) => {
    Modal.confirm({
      title: 'Are you sure you want to deactivate this employee?',
      content: 'This action will mark the employee as inactive.',
      okText: 'Yes, Deactivate',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          await hrAPI.updateEmployee(id, {} as any);
          message.success('Employee deactivated successfully');
          fetchEmployees();
        } catch (error: any) {
          message.error(error.message || 'Failed to deactivate employee');
        }
      },
    });
  };

  const formatCurrency = (amount?: number) => {
    if (!amount) return '-';
    return `PKR ${amount.toLocaleString()}`;
  };

  const getEmploymentTypeTag = (type: string) => {
    const typeConfig: Record<string, { color: string; text: string }> = {
      permanent: { color: 'green', text: 'Permanent' },
      contract: { color: 'blue', text: 'Contract' },
      temporary: { color: 'orange', text: 'Temporary' },
      visiting: { color: 'purple', text: 'Visiting' },
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
      title: 'Designation',
      dataIndex: 'designation',
      key: 'designation',
      filters: [
        { text: 'Professor', value: 'Professor' },
        { text: 'Associate Professor', value: 'Associate Professor' },
        { text: 'Assistant Professor', value: 'Assistant Professor' },
        { text: 'Lecturer', value: 'Lecturer' },
        { text: 'Admin', value: 'Admin' },
      ],
    },
    {
      title: 'Qualification',
      dataIndex: 'qualification',
      key: 'qualification',
      render: (qual: string) => qual || '-',
    },
    {
      title: 'Specialization',
      dataIndex: 'specialization',
      key: 'specialization',
      render: (spec: string) => spec || '-',
    },
    {
      title: 'Employment Type',
      dataIndex: 'employmentType',
      key: 'employmentType',
      render: (type: string) => getEmploymentTypeTag(type),
      filters: [
        { text: 'Permanent', value: 'permanent' },
        { text: 'Contract', value: 'contract' },
        { text: 'Temporary', value: 'temporary' },
        { text: 'Visiting', value: 'visiting' },
      ],
    },
    {
      title: 'Joining Date',
      dataIndex: 'joiningDate',
      key: 'joiningDate',
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
    {
      title: 'Salary',
      dataIndex: 'salary',
      key: 'salary',
      render: (salary: number) => formatCurrency(salary),
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
      render: (_: any, record: Employee) => (
        <Space size="middle">
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => navigate(`/hr/employees/${record.id}`)}
          >
            View
          </Button>
          <PermissionGuard permission="hr" action="update">
            <Button
              type="link"
              icon={<EditOutlined />}
              onClick={() => navigate(`/hr/employees/${record.id}/edit`)}
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
            <Select
              placeholder="Filter by Designation"
              style={{ width: 200 }}
              allowClear
              value={filters.designation}
              onChange={(value) => setFilters({ ...filters, designation: value })}
            >
              <Option value="Professor">Professor</Option>
              <Option value="Associate Professor">Associate Professor</Option>
              <Option value="Assistant Professor">Assistant Professor</Option>
              <Option value="Lecturer">Lecturer</Option>
              <Option value="Admin">Admin</Option>
            </Select>
            <Select
              placeholder="Filter by Employment Type"
              style={{ width: 150 }}
              allowClear
              value={filters.employmentType}
              onChange={(value) => setFilters({ ...filters, employmentType: value })}
            >
              <Option value="permanent">Permanent</Option>
              <Option value="contract">Contract</Option>
              <Option value="temporary">Temporary</Option>
              <Option value="visiting">Visiting</Option>
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
          <PermissionGuard permission="hr" action="create">
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => navigate('/hr/employees/new')}
            >
              Add Employee
            </Button>
          </PermissionGuard>
        </Space>

        <Table
          columns={columns}
          dataSource={employees}
          rowKey="id"
          loading={loading}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} employees`,
            onChange: (page, pageSize) => {
              setPagination({ ...pagination, current: page, pageSize });
            },
          }}
        />
      </Space>
    </Card>
  );
};

export default EmployeeList;

