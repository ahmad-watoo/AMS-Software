import React, { useEffect, useMemo, useState } from 'react';
import {
  Card,
  Table,
  Button,
  Input,
  Space,
  message,
  Tag,
  Select,
  Tooltip,
  Row,
  Col,
  Statistic,
  Empty,
  Badge,
  Segmented,
  Drawer,
  Descriptions,
} from 'antd';
import {
  SearchOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  CalendarOutlined,
  ReloadOutlined,
  FieldTimeOutlined,
  TeamOutlined,
  BuildOutlined,
  EyeOutlined,
  WarningOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { timetableAPI, Timetable, Room } from '../../../../api/timetable.api';
import { academicAPI, CourseSection, Course } from '../../../../api/academic.api';
import { userAPI, User } from '../../../../api/user.api';
import { useNavigate } from 'react-router-dom';
import { PermissionGuard } from '../../../common/PermissionGuard';
import { route } from '../../../routes/constant';

const { Option } = Select;
const { Search } = Input;

const DAYS_OF_WEEK = [
  { value: 1, label: 'Monday' },
  { value: 2, label: 'Tuesday' },
  { value: 3, label: 'Wednesday' },
  { value: 4, label: 'Thursday' },
  { value: 5, label: 'Friday' },
  { value: 6, label: 'Saturday' },
  { value: 7, label: 'Sunday' },
];

interface Filters {
  search: string;
  semester?: string;
  dayOfWeek?: number;
  sectionId?: string;
  roomId?: string;
  facultyId?: string;
}

const timeOverlaps = (aStart: string, aEnd: string, bStart: string, bEnd: string) => {
  const startA = dayjs(aStart, 'HH:mm');
  const endA = dayjs(aEnd, 'HH:mm');
  const startB = dayjs(bStart, 'HH:mm');
  const endB = dayjs(bEnd, 'HH:mm');
  return startA.isBefore(endB) && startB.isBefore(endA);
};

const TimetableList: React.FC = () => {
  const navigate = useNavigate();
  const [timetables, setTimetables] = useState<Timetable[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });
  const [filters, setFilters] = useState<Filters>({
    search: '',
    semester: undefined,
    dayOfWeek: undefined,
    sectionId: undefined,
    roomId: undefined,
    facultyId: undefined,
  });
  const [sections, setSections] = useState<CourseSection[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [faculty, setFaculty] = useState<User[]>([]);
  const [viewMode, setViewMode] = useState<'table' | 'day'>('table');
  const [selectedTimetable, setSelectedTimetable] = useState<Timetable | null>(null);

  useEffect(() => {
    loadReferenceData();
    fetchTimetables(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadReferenceData = async () => {
    try {
      const [sectionResponse, courseResponse, roomResponse, facultyResponse] = await Promise.all([
        academicAPI.getSections(1, 200, {}),
        academicAPI.getCourses(1, 500, { isActive: true }),
        timetableAPI.getRooms(1, 200, { isActive: true }),
        userAPI.getUsers(1, 200),
      ]);
      setSections(sectionResponse.sections);
      setCourses(courseResponse.courses);
      setRooms(roomResponse.rooms);
      setFaculty(facultyResponse.users);
    } catch (error) {
      console.warn('Failed to load timetable reference data', error);
    }
  };

  const fetchTimetables = async (page: number = 1, currentFilters: Filters = filters) => {
    try {
      setLoading(true);
      const response = await timetableAPI.getTimetables(page, pagination.limit, {
        sectionId: currentFilters.sectionId,
        semester: currentFilters.semester,
        dayOfWeek: currentFilters.dayOfWeek,
        roomId: currentFilters.roomId,
        facultyId: currentFilters.facultyId,
      });
      setTimetables(response.timetables);
      setPagination(response.pagination);
    } catch (error: any) {
      message.error(error.message || 'Failed to load timetables');
      console.error('Error fetching timetables:', error);
    } finally {
      setLoading(false);
    }
  };

  const sectionLookup = useMemo(() => {
    const map = new Map<string, CourseSection>();
    sections.forEach((section) => map.set(section.id, section));
    return map;
  }, [sections]);

  const courseLookup = useMemo(() => {
    const map = new Map<string, Course>();
    courses.forEach((course) => map.set(course.id, course));
    return map;
  }, [courses]);

  const roomLookup = useMemo(() => {
    const map = new Map<string, Room>();
    rooms.forEach((room) => map.set(room.id, room));
    return map;
  }, [rooms]);

  const facultyLookup = useMemo(() => {
    const map = new Map<string, User>();
    faculty.forEach((member) => map.set(member.id, member));
    return map;
  }, [faculty]);

  const conflicts = useMemo(() => {
    const issues: Array<{
      id: string;
      type: 'room' | 'faculty';
      message: string;
    }> = [];
    timetables.forEach((entry, idx) => {
      for (let j = idx + 1; j < timetables.length; j += 1) {
        const compare = timetables[j];
        if (entry.dayOfWeek === compare.dayOfWeek && timeOverlaps(entry.startTime, entry.endTime, compare.startTime, compare.endTime)) {
          if (entry.roomId && compare.roomId && entry.roomId === compare.roomId) {
            issues.push({
              id: `${entry.id}-${compare.id}-room`,
              type: 'room',
              message: `${roomLookup.get(entry.roomId)?.roomNumber || 'Room'} double-booked ${dayjs(entry.startTime, 'HH:mm').format('h:mm A')}`,
            });
          }
          if (entry.facultyId && compare.facultyId && entry.facultyId === compare.facultyId) {
            issues.push({
              id: `${entry.id}-${compare.id}-faculty`,
              type: 'faculty',
              message: `${facultyLookup.get(entry.facultyId)?.firstName || 'Faculty'} has overlapping sessions`,
            });
          }
        }
      }
    });
    return issues;
  }, [timetables, roomLookup, facultyLookup]);

  const filteredTimetables = useMemo(() => {
    const searchTerm = filters.search.trim().toLowerCase();
    if (!searchTerm) return timetables;
    return timetables.filter((entry) => {
      const section = sectionLookup.get(entry.sectionId);
      const course = section ? courseLookup.get(section.courseId) : undefined;
      const room = entry.roomId ? roomLookup.get(entry.roomId) : undefined;
      const facultyMember = entry.facultyId ? facultyLookup.get(entry.facultyId) : undefined;
      const tokens = [
        section?.sectionCode,
        course?.code,
        course?.title,
        room?.roomNumber,
        facultyMember ? `${facultyMember.firstName} ${facultyMember.lastName}` : undefined,
        entry.semester,
      ]
        .filter(Boolean)
        .map((token) => token!.toLowerCase());
      return tokens.some((token) => token.includes(searchTerm));
    });
  }, [filters.search, timetables, sectionLookup, courseLookup, roomLookup, facultyLookup]);

  const handleTableChange = (page: number) => {
    fetchTimetables(page);
  };

  const handleDelete = async (id: string) => {
    try {
      await timetableAPI.deleteTimetable(id);
      message.success('Timetable deleted successfully');
      fetchTimetables(pagination.page, filters);
    } catch (error: any) {
      message.error(error.message || 'Failed to delete timetable');
    }
  };

  const columns = [
    {
      title: 'Section',
      dataIndex: 'sectionId',
      key: 'sectionId',
      render: (sectionId: string) => {
        const section = sectionLookup.get(sectionId);
        const course = section ? courseLookup.get(section.courseId) : undefined;
        return (
          <Space direction="vertical" size={0}>
            <Space>
              <CalendarOutlined />
              <strong>{section ? `${section.sectionCode}` : sectionId.slice(0, 6)}</strong>
            </Space>
            {course && <span style={{ color: '#888' }}>{course.code} • {course.title}</span>}
          </Space>
        );
      },
    },
    {
      title: 'Day',
      dataIndex: 'dayOfWeek',
      key: 'dayOfWeek',
      render: (day: number) => <Tag color="blue">{DAYS_OF_WEEK.find((d) => d.value === day)?.label || `Day ${day}`}</Tag>,
    },
    {
      title: 'Time',
      key: 'time',
      render: (record: Timetable) => (
        <Space>
          <FieldTimeOutlined />
          {`${dayjs(record.startTime, 'HH:mm').format('h:mm A')} - ${dayjs(record.endTime, 'HH:mm').format('h:mm A')}`}
        </Space>
      ),
    },
    {
      title: 'Room',
      dataIndex: 'roomId',
      key: 'roomId',
      render: (roomId?: string) => {
        if (!roomId) return <span style={{ color: '#999' }}>Not assigned</span>;
        const room = roomLookup.get(roomId);
        return <Tag icon={<BuildOutlined />}>{room ? room.roomNumber : roomId.slice(0, 6)}</Tag>;
      },
    },
    {
      title: 'Faculty',
      dataIndex: 'facultyId',
      key: 'facultyId',
      render: (facultyId?: string) => {
        if (!facultyId) return <span style={{ color: '#999' }}>Not assigned</span>;
        const member = facultyLookup.get(facultyId);
        return (
          <Space>
            <TeamOutlined />
            {member ? `${member.firstName} ${member.lastName}` : facultyId.slice(0, 6)}
          </Space>
        );
      },
    },
    {
      title: 'Semester',
      dataIndex: 'semester',
      key: 'semester',
      render: (semester: string) => <Tag color="geekblue">{semester}</Tag>,
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: Timetable) => (
        <Space>
          <Tooltip title="View Details">
            <Button type="link" icon={<EyeOutlined />} onClick={() => setSelectedTimetable(record)} />
          </Tooltip>
          <PermissionGuard permission="timetable" action="update">
            <Tooltip title="Edit">
              <Button
                type="link"
                icon={<EditOutlined />}
                onClick={() => navigate(route.TIMETABLE_EDIT.replace(':id', record.id))}
              />
            </Tooltip>
          </PermissionGuard>
          <PermissionGuard permission="timetable" action="delete">
            <Tooltip title="Delete">
              <Button
                type="link"
                danger
                icon={<DeleteOutlined />}
                onClick={() => {
                  if (window.confirm('Are you sure you want to delete this timetable entry?')) {
                    handleDelete(record.id);
                  }
                }}
              />
            </Tooltip>
          </PermissionGuard>
        </Space>
      ),
    },
  ];

  const currentDay = dayjs().day();
  const dayViewData = useMemo(() => {
    const dayEntries = filteredTimetables.filter((entry) => entry.dayOfWeek === (currentDay === 0 ? 7 : currentDay));
    return dayEntries.sort((a, b) => (dayjs(a.startTime, 'HH:mm').isBefore(dayjs(b.startTime, 'HH:mm')) ? -1 : 1));
  }, [filteredTimetables, currentDay]);

  const conflictBadge = conflicts.length ? (
    <Tooltip title={
      <span>
        {conflicts.slice(0, 5).map((conflict) => (
          <div key={conflict.id}>{conflict.message}</div>
        ))}
        {conflicts.length > 5 && <div>+{conflicts.length - 5} more potential conflicts</div>}
      </span>
    }>
      <Badge count={conflicts.length} status="error" offset={[0, 4]}>
        <Tag color="red" icon={<WarningOutlined />}>Conflicts</Tag>
      </Badge>
    </Tooltip>
  ) : (
    <Tag color="green">No conflicts detected</Tag>
  );

  return (
    <div style={{ padding: 24 }}>
      <Card
        style={{ borderRadius: 16 }}
        bodyStyle={{ padding: 24 }}
        title={
          <Space size="large">
            <span style={{ fontSize: 20, fontWeight: 600 }}>Class Schedules</span>
            <Button icon={<ReloadOutlined />} onClick={() => fetchTimetables(pagination.page)}>
              Refresh
            </Button>
          </Space>
        }
        extra={
          <Space size="large">
            {conflictBadge}
            <Segmented
              options={[
                { label: 'Table', value: 'table' },
                { label: 'Today', value: 'day' },
              ]}
              value={viewMode}
              onChange={(value) => setViewMode(value as 'table' | 'day')}
            />
            <PermissionGuard permission="timetable" action="create">
              <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate(route.TIMETABLE_CREATE)}>
                New Schedule
              </Button>
            </PermissionGuard>
          </Space>
        }
      >
        <Space direction="vertical" style={{ width: '100%' }} size="large">
          <Row gutter={[16, 16]}>
            <Col xs={24} md={6}>
              <Card bordered={false} style={{ borderRadius: 12, background: '#f0f5ff' }}>
                <Statistic title="Total Schedules" value={pagination.total} prefix={<CalendarOutlined />} />
              </Card>
            </Col>
            <Col xs={24} md={6}>
              <Card bordered={false} style={{ borderRadius: 12, background: '#f6ffed' }}>
                <Statistic title="Unique Sections" value={new Set(timetables.map((t) => t.sectionId)).size} />
              </Card>
            </Col>
            <Col xs={24} md={6}>
              <Card bordered={false} style={{ borderRadius: 12, background: '#fff7e6' }}>
                <Statistic
                  title="Rooms Utilised"
                  value={new Set(timetables.filter((t) => t.roomId).map((t) => t.roomId)).size}
                  prefix={<BuildOutlined />}
                />
              </Card>
            </Col>
            <Col xs={24} md={6}>
              <Card bordered={false} style={{ borderRadius: 12, background: '#fff0f6' }}>
                <Statistic
                  title="Faculty On Duty"
                  value={new Set(timetables.filter((t) => t.facultyId).map((t) => t.facultyId)).size}
                  prefix={<TeamOutlined />}
                />
              </Card>
            </Col>
          </Row>

          <Card bordered={false} style={{ borderRadius: 12, background: '#fafafa' }}>
            <Space wrap style={{ width: '100%' }}>
              <Search
                placeholder="Search by section, course, room, faculty"
                allowClear
                enterButton={<SearchOutlined />}
                style={{ minWidth: 260 }}
                value={filters.search}
                onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
                onSearch={(value) => setFilters((prev) => ({ ...prev, search: value }))}
              />
              <Select
                placeholder="Filter by semester"
                allowClear
                style={{ minWidth: 180 }}
                value={filters.semester}
                onChange={(value) => {
                  const updated = { ...filters, semester: value || undefined };
                  setFilters(updated);
                  fetchTimetables(1, updated);
                }}
              >
                {Array.from(new Set(timetables.map((entry) => entry.semester))).map((semester) => (
                  <Option key={semester} value={semester}>
                    {semester}
                  </Option>
                ))}
              </Select>
              <Select
                placeholder="Filter by day"
                allowClear
                style={{ minWidth: 180 }}
                value={filters.dayOfWeek}
                onChange={(value) => {
                  const updated = { ...filters, dayOfWeek: value || undefined };
                  setFilters(updated);
                  fetchTimetables(1, updated);
                }}
              >
                {DAYS_OF_WEEK.map((day) => (
                  <Option key={day.value} value={day.value}>
                    {day.label}
                  </Option>
                ))}
              </Select>
              <Select
                placeholder="Filter by section"
                allowClear
                showSearch
                optionFilterProp="children"
                style={{ minWidth: 220 }}
                value={filters.sectionId}
                onChange={(value) => {
                  const updated = { ...filters, sectionId: value || undefined };
                  setFilters(updated);
                  fetchTimetables(1, updated);
                }}
              >
                {sections.map((section) => (
                  <Option key={section.id} value={section.id}>
                    {section.sectionCode}
                  </Option>
                ))}
              </Select>
              <Select
                placeholder="Filter by room"
                allowClear
                showSearch
                optionFilterProp="children"
                style={{ minWidth: 200 }}
                value={filters.roomId}
                onChange={(value) => {
                  const updated = { ...filters, roomId: value || undefined };
                  setFilters(updated);
                  fetchTimetables(1, updated);
                }}
              >
                {rooms.map((room) => (
                  <Option key={room.id} value={room.id}>
                    {room.roomNumber}
                  </Option>
                ))}
              </Select>
              <Select
                placeholder="Filter by faculty"
                allowClear
                showSearch
                optionFilterProp="children"
                style={{ minWidth: 220 }}
                value={filters.facultyId}
                onChange={(value) => {
                  const updated = { ...filters, facultyId: value || undefined };
                  setFilters(updated);
                  fetchTimetables(1, updated);
                }}
              >
                {faculty.map((member) => (
                  <Option key={member.id} value={member.id}>
                    {member.firstName} {member.lastName}
                  </Option>
                ))}
              </Select>
            </Space>
          </Card>

          {viewMode === 'table' ? (
            <Table
              columns={columns}
              dataSource={filteredTimetables}
              rowKey="id"
              loading={loading}
              pagination={{
                current: pagination.page,
                pageSize: pagination.limit,
                total: pagination.total,
                showSizeChanger: false,
                showTotal: (total) => `Total ${total} schedules`,
                onChange: handleTableChange,
              }}
              locale={{
                emptyText: loading ? <Empty description="Loading schedules..." /> : <Empty description="No schedules found" />,
              }}
            />
          ) : (
            <Card bordered={false} style={{ borderRadius: 12 }}>
              <Space direction="vertical" style={{ width: '100%' }}>
                <span style={{ fontWeight: 600 }}>
                  Today • {DAYS_OF_WEEK.find((day) => day.value === (currentDay === 0 ? 7 : currentDay))?.label}
                </span>
                {dayViewData.length === 0 ? (
                  <Empty description="No classes scheduled for today" />
                ) : (
                  dayViewData.map((entry) => {
                    const section = sectionLookup.get(entry.sectionId);
                    const course = section ? courseLookup.get(section.courseId) : undefined;
                    const room = entry.roomId ? roomLookup.get(entry.roomId) : undefined;
                    const facultyMember = entry.facultyId ? facultyLookup.get(entry.facultyId) : undefined;
                    return (
                      <Card key={entry.id} bordered style={{ borderRadius: 12 }}>
                        <Space direction="vertical" size="small" style={{ width: '100%' }}>
                          <Space align="baseline" style={{ justifyContent: 'space-between', width: '100%' }}>
                            <Space>
                              <FieldTimeOutlined />
                              <strong>
                                {`${dayjs(entry.startTime, 'HH:mm').format('h:mm A')} - ${dayjs(entry.endTime, 'HH:mm').format('h:mm A')}`}
                              </strong>
                            </Space>
                            <Tag color="geekblue">{entry.semester}</Tag>
                          </Space>
                          {course && (
                            <span style={{ fontWeight: 600 }}>
                              {course.code} • {course.title}
                            </span>
                          )}
                          <Space size="large">
                            {section && <Tag>{section.sectionCode}</Tag>}
                            {room && <Tag icon={<BuildOutlined />}>{room.roomNumber}</Tag>}
                            {facultyMember && (
                              <Space>
                                <TeamOutlined />
                                {facultyMember.firstName} {facultyMember.lastName}
                              </Space>
                            )}
                          </Space>
                        </Space>
                      </Card>
                    );
                  })
                )}
              </Space>
            </Card>
          )}
        </Space>
      </Card>

      <Drawer
        width={420}
        title="Schedule Details"
        open={!!selectedTimetable}
        onClose={() => setSelectedTimetable(null)}
      >
        {selectedTimetable && (
          <Descriptions column={1} bordered size="small">
            <Descriptions.Item label="Section">
              {sectionLookup.get(selectedTimetable.sectionId)?.sectionCode || selectedTimetable.sectionId}
            </Descriptions.Item>
            <Descriptions.Item label="Course">
              {(() => {
                const section = sectionLookup.get(selectedTimetable.sectionId);
                if (!section) return '—';
                const course = courseLookup.get(section.courseId);
                return course ? `${course.code} • ${course.title}` : '—';
              })()}
            </Descriptions.Item>
            <Descriptions.Item label="Day">
              {DAYS_OF_WEEK.find((day) => day.value === selectedTimetable.dayOfWeek)?.label}
            </Descriptions.Item>
            <Descriptions.Item label="Time">
              {`${dayjs(selectedTimetable.startTime, 'HH:mm').format('h:mm A')} - ${dayjs(selectedTimetable.endTime, 'HH:mm').format('h:mm A')}`}
            </Descriptions.Item>
            <Descriptions.Item label="Room">
              {selectedTimetable.roomId ? roomLookup.get(selectedTimetable.roomId)?.roomNumber || selectedTimetable.roomId : 'Not assigned'}
            </Descriptions.Item>
            <Descriptions.Item label="Faculty">
              {selectedTimetable.facultyId
                ? (() => {
                    const member = facultyLookup.get(selectedTimetable.facultyId!);
                    return member ? `${member.firstName} ${member.lastName}` : selectedTimetable.facultyId;
                  })()
                : 'Not assigned'}
            </Descriptions.Item>
            <Descriptions.Item label="Semester">{selectedTimetable.semester}</Descriptions.Item>
            <Descriptions.Item label="Created">
              {dayjs(selectedTimetable.createdAt).format('DD MMM YYYY, h:mm A')}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Drawer>
    </div>
  );
};

export default TimetableList;

