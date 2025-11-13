import React, { useEffect, useMemo, useState } from 'react';
import {
  Card,
  Table,
  Space,
  Input,
  Select,
  Button,
  Tag,
  Statistic,
  Row,
  Col,
  Drawer,
  message,
  Empty,
  Skeleton,
  Typography,
} from 'antd';
import {
  TeamOutlined,
  PlusOutlined,
  ReloadOutlined,
  UserOutlined,
  ArrowRightOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import hrAPI, { Employee } from '@/api/hr.api';
import { route } from '../../../../routes/constant';
import PermissionGuard from '@/components/common/PermissionGuard';

const { Search } = Input;
const { Option } = Select;

const normalizeEmployees = (response: any): { employees: Employee[]; total?: number } => {
  if (Array.isArray(response)) return { employees: response };
  if (Array.isArray(response?.employees)) return { employees: response.employees, total: response?.pagination?.total };
  if (Array.isArray(response?.data?.employees)) return { employees: response.data.employees, total: response?.data?.pagination?.total };
  if (Array.isArray(response?.data)) return { employees: response.data };
  return { employees: [] };
};

const StaffManagement: React.FC = () => {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<{ search?: string; employmentType?: string; designation?: string; isActive?: string }>(() => ({}));
  const [drawerState, setDrawerState] = useState<{ open: boolean; selected?: Employee | null }>({ open: false, selected: null });

  const fetchEmployees = async (nextFilters = filters) => {
    try {
      setLoading(true);
      const response = await hrAPI.getAllEmployees({
        search: nextFilters.search,
        employmentType: nextFilters.employmentType,
        designation: nextFilters.designation,
        isActive: nextFilters.isActive === undefined ? undefined : nextFilters.isActive === 'true',
        page: 1,
        limit: 200,
      } as any);
      const { employees: result } = normalizeEmployees(response);
      setEmployees(result);
    } catch (error: any) {
      message.error(error.message || 'Failed to load staff directory');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const summary = useMemo(() => {
    const total = employees.length;
    const active = employees.filter((employee) => employee.employmentType !== 'contract' && employee.employmentType !== 'temporary').length;
    const contract = employees.filter((employee) => employee.employmentType === 'contract').length;
    return { total, active, contract };
  }, [employees]);

  const columns = [
    {
      title: 'Employee',
      dataIndex: 'employeeId',
      key: 'employeeId',
      render: (_: string, record: Employee) => (
        <Space direction="vertical" size={0}>
          <span style={{ fontWeight: 600 }}>{record.employeeId}</span>
          <Tag color="blue">{record.designation}</Tag>
        </Space>
      ),
    },
    {
      title: 'Department',
      dataIndex: 'departmentId',
      key: 'departmentId',
      render: (value?: string) => value || '—',
    },
    {
      title: 'Employment Type',
      dataIndex: 'employmentType',
      key: 'employmentType',
      render: (type: string) => {
        const color = type === 'permanent' ? 'green' : type === 'visiting' ? 'purple' : type === 'contract' ? 'orange' : 'blue';
        return <Tag color={color}>{type.toUpperCase()}</Tag>;
      },
    },
    {
      title: 'Joining Date',
      dataIndex: 'joiningDate',
      key: 'joiningDate',
      render: (date?: string) => (date ? new Date(date).toLocaleDateString() : '—'),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: Employee) => (
        <Button type="link" onClick={() => setDrawerState({ open: true, selected: record })}>
          View Profile
        </Button>
      ),
    },
  ];

  const handleSearch = (value: string) => {
    const nextFilters = { ...filters, search: value || undefined };
    setFilters(nextFilters);
    fetchEmployees(nextFilters);
  };

  const handleFilterChange = (key: keyof typeof filters, value?: string) => {
    const nextFilters = { ...filters, [key]: value || undefined };
    setFilters(nextFilters);
    fetchEmployees(nextFilters);
  };

  return (
    <div style={{ padding: 24 }}>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <Card bordered={false} style={{ borderRadius: 16 }}>
          <Row gutter={[16, 16]} align="middle">
            <Col xs={24} md={16}>
              <Space size="large" align="center">
                <TeamOutlined style={{ fontSize: 40, color: '#1677ff' }} />
                <div>
                  <Typography.Title level={3} style={{ marginBottom: 0 }}>Staff Management</Typography.Title>
                  <Typography.Text type="secondary">Keep track of faculty and administrative personnel.</Typography.Text>
                </div>
              </Space>
            </Col>
            <Col xs={24} md={8}>
              <Space style={{ justifyContent: 'flex-end', width: '100%' }}>
                <Button icon={<ReloadOutlined />} onClick={() => fetchEmployees(filters)}>
                  Refresh
                </Button>
                <PermissionGuard permission="hr" action="create">
                  <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate(route.HR_EMPLOYEE_CREATE)}>
                    Add Employee
                  </Button>
                </PermissionGuard>
              </Space>
            </Col>
          </Row>
        </Card>

        <Row gutter={[16, 16]}>
          <Col xs={24} md={8}>
            <Card bordered={false} style={{ borderRadius: 12, background: '#f0f5ff' }}>
              <Statistic title="Total Staff" value={summary.total} prefix={<UserOutlined />} />
            </Card>
          </Col>
          <Col xs={24} md={8}>
            <Card bordered={false} style={{ borderRadius: 12, background: '#f6ffed' }}>
              <Statistic title="Core Faculty" value={summary.active} prefix={<TeamOutlined />} />
            </Card>
          </Col>
          <Col xs={24} md={8}>
            <Card bordered={false} style={{ borderRadius: 12, background: '#fff7e6' }}>
              <Statistic title="Contract / Visiting" value={summary.contract} prefix={<UserOutlined />} />
            </Card>
          </Col>
        </Row>

        <Card
          bordered={false}
          style={{ borderRadius: 12 }}
          title="Staff Directory"
          extra={
            <Space>
              <Button type="link" icon={<ArrowRightOutlined />} onClick={() => navigate(route.HR_EMPLOYEE_LIST)}>
                Open HR Module
              </Button>
            </Space>
          }
        >
          <Space wrap style={{ width: '100%', marginBottom: 16 }}>
            <Search
              placeholder="Search by employee ID or designation"
              allowClear
              onSearch={handleSearch}
              style={{ width: 260 }}
            />
            <Select
              placeholder="Employment Type"
              allowClear
              style={{ width: 200 }}
              value={filters.employmentType}
              onChange={(value) => handleFilterChange('employmentType', value)}
            >
              {['permanent', 'contract', 'temporary', 'visiting'].map((type) => (
                <Option key={type} value={type}>
                  {type.toUpperCase()}
                </Option>
              ))}
            </Select>
            <Select
              placeholder="Designation"
              allowClear
              style={{ width: 200 }}
              value={filters.designation}
              onChange={(value) => handleFilterChange('designation', value)}
            >
              {[...new Set(employees.map((employee) => employee.designation))]
                .filter(Boolean)
                .map((designation) => (
                  <Option key={designation} value={designation}>
                    {designation}
                  </Option>
                ))}
            </Select>
            <Select
              placeholder="Status"
              allowClear
              style={{ width: 180 }}
              value={filters.isActive}
              onChange={(value) => handleFilterChange('isActive', value)}
            >
              <Option value="true">Active</Option>
              <Option value="false">Inactive</Option>
            </Select>
          </Space>

          {loading ? (
            <Skeleton active paragraph={{ rows: 6 }} />
          ) : employees.length === 0 ? (
            <Empty description="No staff found" />
          ) : (
            <Table
              rowKey={(record) => record.id}
              columns={columns}
              dataSource={employees.slice(0, 25)}
              pagination={false}
            />
          )}
        </Card>
      </Space>

      <Drawer
        width={420}
        title={drawerState.selected ? `Employee ${drawerState.selected.employeeId}` : 'Employee Profile'}
        open={drawerState.open}
        onClose={() => setDrawerState({ open: false, selected: null })}
      >
        {!drawerState.selected ? (
          <Empty />
        ) : (
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <Card bordered={false} style={{ borderRadius: 12, background: '#f6f9ff' }}>
              <Space direction="vertical" size={4}>
                <span style={{ fontWeight: 600 }}>{drawerState.selected.employeeId}</span>
                <Tag color="blue">{drawerState.selected.designation}</Tag>
                <span>{drawerState.selected.employmentType?.toUpperCase()}</span>
                <span>Joined: {drawerState.selected.joiningDate ? new Date(drawerState.selected.joiningDate).toLocaleDateString() : '—'}</span>
              </Space>
            </Card>
            <Space direction="vertical" size={4}>
              <span>Department: {drawerState.selected.departmentId || '—'}</span>
              <span>Salary: {drawerState.selected.salary ? `PKR ${drawerState.selected.salary.toLocaleString()}` : '—'}</span>
            </Space>
          </Space>
        )}
      </Drawer>
    </div>
  );
};

export default StaffManagement;
