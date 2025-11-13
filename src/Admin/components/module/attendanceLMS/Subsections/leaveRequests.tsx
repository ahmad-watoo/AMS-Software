import React, { useEffect, useMemo, useState } from 'react';
import {
  Card,
  Table,
  Tag,
  Select,
  Button,
  Drawer,
  Form,
  DatePicker,
  Input,
  Space,
  message,
  Empty,
  Skeleton,
} from 'antd';
import {
  FileDoneOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  PlusOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import hrAPI, { ApproveLeaveDTO, CreateLeaveRequestDTO, LeaveRequest } from '@/api/hr.api';
import { userAPI, User } from '@/api/user.api';
import dayjs, { Dayjs } from 'dayjs';

const { RangePicker } = DatePicker;
const { Option } = Select;

type LeaveStatus = LeaveRequest['status'];
type LeaveType = LeaveRequest['leaveType'];

interface Filters {
  status?: LeaveStatus;
  leaveType?: LeaveType;
  employeeId?: string;
}

const LeaveRequestPage: React.FC = () => {
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<Filters>({});
  const [employees, setEmployees] = useState<User[]>([]);
  const [drawerState, setDrawerState] = useState<{ mode: 'view' | 'create'; record?: LeaveRequest | null }>({ mode: 'view', record: null });
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [decisionForm] = Form.useForm<ApproveLeaveDTO & { remarks?: string; rejectionReason?: string }>();
  const [createForm] = Form.useForm<{ employeeId: string; leaveType: LeaveType; dateRange: [Dayjs, Dayjs]; reason?: string }>();

  useEffect(() => {
    loadEmployees();
    fetchLeaveRequests(filters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadEmployees = async () => {
    try {
      const response = await hrAPI.getAllEmployees({ page: 1, limit: 500 });
      const data = Array.isArray(response?.employees)
        ? response.employees
        : Array.isArray(response?.data?.employees)
        ? response.data.employees
        : Array.isArray(response?.data)
        ? response.data
        : Array.isArray(response)
        ? response
        : [];
      const users = await userAPI.getUsers(1, 500);
      const userLookup = new Map<string, User>();
      users.users?.forEach((user) => userLookup.set(user.id, user));
      const mappedEmployees = data
        .map((employee: any) => userLookup.get(employee.userId))
        .filter(Boolean) as User[];
      setEmployees(mappedEmployees);
    } catch (error) {
      message.warning('Failed to load employee directory for leave requests.');
    }
  };

  const fetchLeaveRequests = async (currentFilters: Filters) => {
    try {
      setLoading(true);
      const response = await hrAPI.getAllLeaveRequests({
        status: currentFilters.status,
        leaveType: currentFilters.leaveType,
        employeeId: currentFilters.employeeId,
        page: 1,
        limit: 200,
      });
      const data = Array.isArray(response?.leaveRequests)
        ? response.leaveRequests
        : Array.isArray(response?.data?.leaveRequests)
        ? response.data.leaveRequests
        : Array.isArray(response?.data)
        ? response.data
        : Array.isArray(response)
        ? response
        : [];
      setLeaveRequests(data);
    } catch (error: any) {
      message.error(error.message || 'Failed to load leave requests');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (patch: Partial<Filters>) => {
    const updated = { ...filters, ...patch };
    setFilters(updated);
    fetchLeaveRequests(updated);
  };

  const summary = useMemo(() => {
    const total = leaveRequests.length;
    const approved = leaveRequests.filter((request) => request.status === 'approved').length;
    const pending = leaveRequests.filter((request) => request.status === 'pending').length;
    const rejected = leaveRequests.filter((request) => request.status === 'rejected').length;
    return { total, approved, pending, rejected };
  }, [leaveRequests]);

  const employeeLookup = useMemo(() => {
    const map = new Map<string, User>();
    employees.forEach((employee) => map.set(employee.id, employee));
    return map;
  }, [employees]);

  const columns = [
    {
      title: 'Employee',
      dataIndex: 'employeeId',
      key: 'employeeId',
      render: (employeeId: string) => {
        const employee = employeeLookup.get(employeeId);
        return employee ? (
          <Space direction="vertical" size={0}>
            <span style={{ fontWeight: 600 }}>{employee.firstName} {employee.lastName}</span>
            <span style={{ color: '#888' }}>{employee.email}</span>
          </Space>
        ) : (
          employeeId
        );
      },
    },
    {
      title: 'Leave',
      dataIndex: 'leaveType',
      key: 'leaveType',
      render: (leaveType: LeaveType) => <Tag>{leaveType.toUpperCase()}</Tag>,
    },
    {
      title: 'Dates',
      key: 'dates',
      render: (_: any, record: LeaveRequest) => (
        <span>
          {dayjs(record.startDate).format('DD MMM YYYY')} - {dayjs(record.endDate).format('DD MMM YYYY')}
        </span>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: LeaveStatus) => {
        const color = status === 'approved' ? 'green' : status === 'pending' ? 'orange' : 'red';
        return <Tag color={color}>{status.toUpperCase()}</Tag>;
      },
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: LeaveRequest) => (
        <Button type="link" onClick={() => openDrawer('view', record)}>
          Manage
        </Button>
      ),
    },
  ];

  const openDrawer = (mode: 'view' | 'create', record?: LeaveRequest) => {
    if (mode === 'create') {
      createForm.resetFields();
      setDrawerState({ mode: 'create', record: null });
    } else if (record) {
      decisionForm.resetFields();
      setDrawerState({ mode: 'view', record });
    }
    setDrawerVisible(true);
  };

  const handleDecision = async (status: 'approved' | 'rejected') => {
    try {
      const record = drawerState.record;
      if (!record) return;
      const values = await decisionForm.validateFields();
      await hrAPI.approveLeaveRequest(record.id, { status, remarks: values.remarks, rejectionReason: status === 'rejected' ? values.rejectionReason : undefined });
      message.success(`Leave ${status}`);
      setDrawerVisible(false);
      fetchLeaveRequests(filters);
    } catch (error: any) {
      if (error?.errorFields) return;
      message.error(error.message || 'Failed to update leave request');
    }
  };

  const handleCreateRequest = async () => {
    try {
      const values = await createForm.validateFields();
      const payload: CreateLeaveRequestDTO = {
        employeeId: values.employeeId,
        leaveType: values.leaveType,
        startDate: values.dateRange[0].format('YYYY-MM-DD'),
        endDate: values.dateRange[1].format('YYYY-MM-DD'),
        reason: values.reason,
      };
      await hrAPI.createLeaveRequest(payload);
      message.success('Leave request submitted');
      setDrawerVisible(false);
      fetchLeaveRequests(filters);
    } catch (error: any) {
      if (error?.errorFields) return;
      message.error(error.message || 'Failed to submit leave request');
    }
  };

  return (
    <div style={{ padding: 24 }}>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <Card bordered={false} style={{ borderRadius: 12, background: '#f0f5ff' }}>
          <Space size="large" wrap>
            <FileDoneOutlined style={{ fontSize: 36, color: '#1677ff' }} />
            <div>
              <div style={{ fontSize: 18, fontWeight: 600 }}>Leave Requests</div>
              <div style={{ color: '#888' }}>Review and decide on staff/student leave applications.</div>
            </div>
            <Space>
              <Button icon={<ReloadOutlined />} onClick={() => fetchLeaveRequests(filters)}>
                Refresh
              </Button>
              <Button type="primary" icon={<PlusOutlined />} onClick={() => openDrawer('create')}>
                Submit Request
              </Button>
            </Space>
          </Space>
        </Card>

        <Card bordered={false} style={{ borderRadius: 12 }}>
          <Space wrap style={{ width: '100%', marginBottom: 16 }}>
            <Select
              placeholder="Status"
              allowClear
              style={{ width: 160 }}
              value={filters.status}
              onChange={(value) => handleFilterChange({ status: value as LeaveStatus | undefined })}
            >
              {(['pending', 'approved', 'rejected', 'cancelled'] as LeaveStatus[]).map((status) => (
                <Option key={status} value={status}>
                  {status.toUpperCase()}
                </Option>
              ))}
            </Select>
            <Select
              placeholder="Leave Type"
              allowClear
              style={{ width: 180 }}
              value={filters.leaveType}
              onChange={(value) => handleFilterChange({ leaveType: value as LeaveType | undefined })}
            >
              {(['annual', 'sick', 'casual', 'emergency', 'maternity', 'paternity', 'unpaid'] as LeaveType[]).map((leave) => (
                <Option key={leave} value={leave}>
                  {leave.toUpperCase()}
                </Option>
              ))}
            </Select>
            <Select
              placeholder="Employee"
              allowClear
              showSearch
              optionFilterProp="children"
              style={{ minWidth: 220 }}
              value={filters.employeeId}
              onChange={(value) => handleFilterChange({ employeeId: value || undefined })}
            >
              {employees.map((employee) => (
                <Option key={employee.id} value={employee.id}>
                  {employee.firstName} {employee.lastName}
                </Option>
              ))}
            </Select>
          </Space>

          {loading ? (
            <Skeleton active paragraph={{ rows: 6 }} />
          ) : leaveRequests.length === 0 ? (
            <Empty description="No leave requests" />
          ) : (
            <Table rowKey={(record) => record.id} columns={columns} dataSource={leaveRequests} pagination={{ pageSize: 10 }} />
          )}
        </Card>
      </Space>

      <Drawer
        width={420}
        open={drawerVisible}
        onClose={() => setDrawerVisible(false)}
        title={drawerState.mode === 'create' ? 'Submit Leave Request' : 'Leave Request'}
        destroyOnClose
        extra={
          drawerState.mode === 'view' && drawerState.record && drawerState.record.status === 'pending' ? (
            <Space>
              <Button icon={<CheckCircleOutlined />} type="primary" onClick={() => handleDecision('approved')}>
                Approve
              </Button>
              <Button icon={<CloseCircleOutlined />} danger onClick={() => handleDecision('rejected')}>
                Reject
              </Button>
            </Space>
          ) : undefined
        }
      >
        {drawerState.mode === 'create' ? (
          <Form layout="vertical" form={createForm}>
            <Form.Item name="employeeId" label="Employee" rules={[{ required: true, message: 'Select employee' }]}> 
              <Select placeholder="Select employee" showSearch optionFilterProp="children">
                {employees.map((employee) => (
                  <Option key={employee.id} value={employee.id}>
                    {employee.firstName} {employee.lastName}
                  </Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item name="leaveType" label="Leave Type" rules={[{ required: true, message: 'Select leave type' }]}> 
              <Select placeholder="Select leave type">
                {(['annual', 'sick', 'casual', 'emergency', 'maternity', 'paternity', 'unpaid'] as LeaveType[]).map((leave) => (
                  <Option key={leave} value={leave}>
                    {leave.toUpperCase()}
                  </Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item name="dateRange" label="Date Range" rules={[{ required: true, message: 'Select leave dates' }]}> 
              <RangePicker style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item name="reason" label="Reason">
              <Input.TextArea rows={3} placeholder="Optional reason" />
            </Form.Item>
            <Button type="primary" onClick={handleCreateRequest} block icon={<PlusOutlined />}>
              Submit
            </Button>
          </Form>
        ) : drawerState.record ? (
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <Card bordered={false} style={{ borderRadius: 12, background: '#f6f9ff' }}>
              <Space direction="vertical" size={4}>
                <span style={{ fontWeight: 600 }}>{employeeLookup.get(drawerState.record.employeeId)?.firstName} {employeeLookup.get(drawerState.record.employeeId)?.lastName}</span>
                <Tag color="blue">{drawerState.record.leaveType.toUpperCase()}</Tag>
                <span>
                  {dayjs(drawerState.record.startDate).format('DD MMM YYYY')} - {dayjs(drawerState.record.endDate).format('DD MMM YYYY')}
                </span>
                <Tag color={drawerState.record.status === 'approved' ? 'green' : drawerState.record.status === 'pending' ? 'orange' : 'red'}>
                  {drawerState.record.status.toUpperCase()}
                </Tag>
              </Space>
            </Card>
            <Form layout="vertical" form={decisionForm} initialValues={{ remarks: drawerState.record.remarks }}>
              <Form.Item name="remarks" label="Remarks">
                <Input.TextArea rows={3} placeholder="Review remarks" />
              </Form.Item>
              {drawerState.record.status === 'pending' && (
                <Form.Item name="rejectionReason" label="Rejection Reason" hidden>
                  <Input.TextArea rows={2} />
                </Form.Item>
              )}
            </Form>
          </Space>
        ) : (
          <Empty />
        )}
      </Drawer>
    </div>
  );
};

export default LeaveRequestPage;
