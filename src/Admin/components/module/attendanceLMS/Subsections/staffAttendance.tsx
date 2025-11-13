import React, { useEffect, useMemo, useState } from 'react';
import {
  Card,
  Table,
  Tag,
  Space,
  Statistic,
  Row,
  Col,
  Select,
  DatePicker,
  Button,
  Drawer,
  Empty,
  message,
  Skeleton,
} from 'antd';
import {
  UserOutlined,
  FieldTimeOutlined,
  TeamOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import attendanceAPI, { AttendanceRecord } from '@/api/attendance.api';
import { academicAPI, CourseSection } from '@/api/academic.api';
import { userAPI, User } from '@/api/user.api';
import dayjs, { Dayjs } from 'dayjs';

const { Option } = Select;
const { RangePicker } = DatePicker;

type StaffSummary = {
  staffId: string;
  name: string;
  totalSessions: number;
  presentCount: number;
  absentCount: number;
  lateCount: number;
  excusedCount: number;
};

type DayRange = [Dayjs, Dayjs] | null;

interface Filters {
  sectionId?: string;
  status?: AttendanceRecord['status'];
  dateRange?: DayRange;
}

const statusColor: Record<AttendanceRecord['status'], string> = {
  present: 'green',
  absent: 'red',
  late: 'orange',
  excused: 'blue',
};

const StaffAttendancePage: React.FC = () => {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [sections, setSections] = useState<CourseSection[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [filters, setFilters] = useState<Filters>({});
  const [selectedStaff, setSelectedStaff] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    loadReferenceData();
    fetchRecords(filters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadReferenceData = async () => {
    try {
      const [sectionResponse, userResponse] = await Promise.all([
        academicAPI.getSections(1, 500, {}),
        userAPI.getUsers(1, 500, 'staff'),
      ]);
      setSections(sectionResponse.sections);
      setUsers(userResponse.users);
    } catch (error) {
      message.warning('Unable to load full staff metadata. Some labels may be missing.');
    }
  };

  const fetchRecords = async (currentFilters: Filters) => {
    try {
      setLoading(true);
      const params: any = {
        limit: 500,
        sectionId: currentFilters.sectionId,
        status: currentFilters.status,
      };
      if (currentFilters.dateRange) {
        params.startDate = currentFilters.dateRange[0].format('YYYY-MM-DD');
        params.endDate = currentFilters.dateRange[1].format('YYYY-MM-DD');
      }
      const response = await attendanceAPI.getAttendanceRecords(params);
      const data = Array.isArray(response?.records)
        ? response.records
        : Array.isArray(response?.data?.records)
        ? response.data.records
        : Array.isArray(response?.data)
        ? response.data
        : Array.isArray(response)
        ? response
        : [];
      setRecords(data);
    } catch (error: any) {
      message.error(error.message || 'Failed to load attendance records');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (patch: Partial<Filters>) => {
    const updated = { ...filters, ...patch };
    setFilters(updated);
    fetchRecords(updated);
  };

  const userLookup = useMemo(() => {
    const map = new Map<string, User>();
    users.forEach((user) => map.set(user.id, user));
    return map;
  }, [users]);

  const staffSummaries = useMemo<StaffSummary[]>(() => {
    const map = new Map<string, StaffSummary>();
    records.forEach((record) => {
      const staffId = record.markedBy || 'unassigned';
      if (!map.has(staffId)) {
        const user = userLookup.get(staffId);
        map.set(staffId, {
          staffId,
          name: user ? `${user.firstName} ${user.lastName}` : staffId === 'unassigned' ? 'System Generated' : staffId,
          totalSessions: 0,
          presentCount: 0,
          absentCount: 0,
          lateCount: 0,
          excusedCount: 0,
        });
      }
      const summary = map.get(staffId)!;
      summary.totalSessions += 1;
      if (record.status === 'present') summary.presentCount += 1;
      if (record.status === 'absent') summary.absentCount += 1;
      if (record.status === 'late') summary.lateCount += 1;
      if (record.status === 'excused') summary.excusedCount += 1;
    });
    return Array.from(map.values()).sort((a, b) => b.totalSessions - a.totalSessions);
  }, [records, userLookup]);

  const summaryCards = useMemo(() => {
    const uniqueStaff = staffSummaries.length;
    const totalSessions = staffSummaries.reduce((sum, summary) => sum + summary.totalSessions, 0);
    const lateIncidents = staffSummaries.reduce((sum, summary) => sum + summary.lateCount, 0);
    return { uniqueStaff, totalSessions, lateIncidents };
  }, [staffSummaries]);

  const columns = [
    {
      title: 'Staff Member',
      dataIndex: 'name',
      key: 'name',
      render: (name: string, record: StaffSummary) => (
        <Space direction="vertical" size={0}>
          <span style={{ fontWeight: 600 }}>{name}</span>
          <span style={{ color: '#888' }}>{record.staffId}</span>
        </Space>
      ),
    },
    {
      title: 'Sessions',
      dataIndex: 'totalSessions',
      key: 'totalSessions',
    },
    {
      title: 'Present',
      dataIndex: 'presentCount',
      key: 'presentCount',
      render: (value: number) => <Tag color="green">{value}</Tag>,
    },
    {
      title: 'Absent',
      dataIndex: 'absentCount',
      key: 'absentCount',
      render: (value: number) => <Tag color="red">{value}</Tag>,
    },
    {
      title: 'Late',
      dataIndex: 'lateCount',
      key: 'lateCount',
      render: (value: number) => <Tag color="orange">{value}</Tag>,
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: StaffSummary) => (
        <Button type="link" onClick={() => handleOpenDrawer(record)}>
          View Sessions
        </Button>
      ),
    },
  ];

  const handleOpenDrawer = (summary: StaffSummary) => {
    setSelectedStaff(summary.staffId);
    setDrawerOpen(true);
  };

  const staffSessions = useMemo(() => {
    if (!selectedStaff) return [];
    return records.filter((record) => (record.markedBy || 'unassigned') === selectedStaff);
  }, [records, selectedStaff]);

  return (
    <div style={{ padding: 24 }}>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <Row gutter={[16, 16]}>
          <Col xs={24} md={8}>
            <Card bordered={false} style={{ borderRadius: 12, background: '#f0f5ff' }}>
              <Statistic title="Active Staff" value={summaryCards.uniqueStaff} prefix={<TeamOutlined />} />
            </Card>
          </Col>
          <Col xs={24} md={8}>
            <Card bordered={false} style={{ borderRadius: 12, background: '#f6ffed' }}>
              <Statistic title="Sessions Recorded" value={summaryCards.totalSessions} prefix={<FieldTimeOutlined />} />
            </Card>
          </Col>
          <Col xs={24} md={8}>
            <Card bordered={false} style={{ borderRadius: 12, background: '#fff7e6' }}>
              <Statistic title="Late / Excused" value={summaryCards.lateIncidents} prefix={<UserOutlined />} />
            </Card>
          </Col>
        </Row>

        <Card bordered={false} style={{ borderRadius: 12, background: '#fafafa' }}>
          <Space wrap style={{ width: '100%' }}>
            <Select
              placeholder="Filter by Section"
              allowClear
              showSearch
              optionFilterProp="children"
              style={{ minWidth: 220 }}
              value={filters.sectionId}
              onChange={(value) => handleFilterChange({ sectionId: value || undefined })}
            >
              {sections.map((section) => (
                <Option key={section.id} value={section.id}>
                  {section.sectionCode}
                </Option>
              ))}
            </Select>
            <Select
              placeholder="Status"
              allowClear
              style={{ width: 160 }}
              value={filters.status}
              onChange={(value) => handleFilterChange({ status: value as AttendanceRecord['status'] | undefined })}
            >
              {(['present', 'absent', 'late', 'excused'] as AttendanceRecord['status'][]).map((option) => (
                <Option key={option} value={option}>
                  {option.toUpperCase()}
                </Option>
              ))}
            </Select>
            <RangePicker
              value={filters.dateRange}
              onChange={(value) => {
                const normalized =
                  value && value[0] && value[1] ? ([value[0], value[1]] as [Dayjs, Dayjs]) : null;
                handleFilterChange({ dateRange: normalized ?? undefined });
              }}
            />
            <Button icon={<ReloadOutlined />} onClick={() => fetchRecords(filters)}>
              Refresh
            </Button>
          </Space>
        </Card>

        <Card bordered={false} style={{ borderRadius: 12 }}>
          {loading ? (
            <Skeleton active paragraph={{ rows: 6 }} />
          ) : staffSummaries.length === 0 ? (
            <Empty description="No staff attendance recorded" />
          ) : (
            <Table
              rowKey={(record) => record.staffId}
              columns={columns}
              dataSource={staffSummaries}
              pagination={{ pageSize: 10 }}
            />
          )}
        </Card>
      </Space>

      <Drawer
        width={480}
        title={selectedStaff ? userLookup.get(selectedStaff)?.firstName ? `${userLookup.get(selectedStaff)!.firstName} ${userLookup.get(selectedStaff)!.lastName}` : selectedStaff : 'Staff Sessions'}
        open={drawerOpen}
        onClose={() => {
          setDrawerOpen(false);
          setSelectedStaff(null);
        }}
      >
        {drawerOpen ? (
          staffSessions.length === 0 ? (
            <Empty description="No sessions found" />
          ) : (
            <Table
              rowKey={(record) => record.id}
              dataSource={staffSessions}
              pagination={{ pageSize: 8 }}
              columns={[
                {
                  title: 'Date',
                  dataIndex: 'attendanceDate',
                  key: 'attendanceDate',
                  render: (value: string) => dayjs(value).format('DD MMM YYYY'),
                },
                {
                  title: 'Status',
                  dataIndex: 'status',
                  key: 'status',
                  render: (status: AttendanceRecord['status']) => <Tag color={statusColor[status]}>{status.toUpperCase()}</Tag>,
                },
                {
                  title: 'Enrollment',
                  dataIndex: 'enrollmentId',
                  key: 'enrollmentId',
                },
                {
                  title: 'Remarks',
                  dataIndex: 'remarks',
                  key: 'remarks',
                },
              ]}
            />
          )
        ) : null}
      </Drawer>
    </div>
  );
};

export default StaffAttendancePage;
