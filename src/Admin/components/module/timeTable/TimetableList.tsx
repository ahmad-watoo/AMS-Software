import React, { useState, useEffect } from 'react';
import { Table, Button, Input, Space, Card, message, Tag, Select, Tooltip, TimePicker } from 'antd';
import { SearchOutlined, PlusOutlined, EditOutlined, DeleteOutlined, CalendarOutlined } from '@ant-design/icons';
import { timetableAPI, Timetable } from '../../../../api/timetable.api';
import { useNavigate } from 'react-router-dom';
import { PermissionGuard } from '../../../common/PermissionGuard';
import { route } from '../../../routes/constant';
import dayjs from 'dayjs';

const { Search } = Input;
const { Option } = Select;

const DAYS_OF_WEEK = [
  { value: 1, label: 'Monday' },
  { value: 2, label: 'Tuesday' },
  { value: 3, label: 'Wednesday' },
  { value: 4, label: 'Thursday' },
  { value: 5, label: 'Friday' },
  { value: 6, label: 'Saturday' },
  { value: 7, label: 'Sunday' },
];

const TimetableList: React.FC = () => {
  const [timetables, setTimetables] = useState<Timetable[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });
  const [filters, setFilters] = useState({
    search: '',
    semester: '',
    dayOfWeek: undefined as number | undefined,
  });
  const navigate = useNavigate();

  const fetchTimetables = async (page: number = 1, currentFilters?: any) => {
    try {
      setLoading(true);
      const response = await timetableAPI.getTimetables(page, pagination.limit, currentFilters || filters);
      setTimetables(response.timetables);
      setPagination(response.pagination);
    } catch (error: any) {
      message.error(error.message || 'Failed to load timetables');
      console.error('Error fetching timetables:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTimetables(1);
  }, []);

  const handleSearch = (value: string) => {
    const newFilters = { ...filters, search: value };
    setFilters(newFilters);
    fetchTimetables(1, newFilters);
  };

  const handleSemesterFilter = (value: string) => {
    const newFilters = { ...filters, semester: value };
    setFilters(newFilters);
    fetchTimetables(1, newFilters);
  };

  const handleDayFilter = (value: number) => {
    const newFilters = { ...filters, dayOfWeek: value };
    setFilters(newFilters);
    fetchTimetables(1, newFilters);
  };

  const handleTableChange = (page: number) => {
    fetchTimetables(page, filters);
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

  const getDayName = (day: number) => {
    return DAYS_OF_WEEK.find(d => d.value === day)?.label || `Day ${day}`;
  };

  const formatTime = (time: string) => {
    return dayjs(time, 'HH:mm').format('h:mm A');
  };

  const columns = [
    {
      title: 'Section',
      dataIndex: 'sectionId',
      key: 'sectionId',
      render: (sectionId: string) => (
        <Space>
          <CalendarOutlined />
          <strong>{sectionId.substring(0, 8)}...</strong>
        </Space>
      ),
    },
    {
      title: 'Day',
      dataIndex: 'dayOfWeek',
      key: 'dayOfWeek',
      render: (day: number) => <Tag color="blue">{getDayName(day)}</Tag>,
    },
    {
      title: 'Time',
      key: 'time',
      render: (record: Timetable) => (
        <span>
          {formatTime(record.startTime)} - {formatTime(record.endTime)}
        </span>
      ),
    },
    {
      title: 'Semester',
      dataIndex: 'semester',
      key: 'semester',
    },
    {
      title: 'Room',
      dataIndex: 'roomId',
      key: 'roomId',
      render: (roomId: string) => (roomId ? <Tag>{roomId.substring(0, 8)}...</Tag> : <span style={{ color: '#999' }}>Not assigned</span>),
    },
    {
      title: 'Faculty',
      dataIndex: 'facultyId',
      key: 'facultyId',
      render: (facultyId: string) => (facultyId ? <Tag>{facultyId.substring(0, 8)}...</Tag> : <span style={{ color: '#999' }}>Not assigned</span>),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: Timetable) => (
        <Space>
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

  return (
    <Card
      title="Class Schedules"
      style={{ margin: 20, boxShadow: 'rgba(0, 0, 0, 0.16) 0px 1px 4px' }}
      extra={
        <PermissionGuard permission="timetable" action="create">
          <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate(route.TIMETABLE_CREATE)}>
            New Schedule
          </Button>
        </PermissionGuard>
      }
    >
      <Space direction="vertical" style={{ width: '100%' }} size="large">
        <Space>
          <Search
            placeholder="Search by section..."
            allowClear
            enterButton={<SearchOutlined />}
            size="large"
            onSearch={handleSearch}
            style={{ width: 300 }}
          />
          <Input
            placeholder="Semester (e.g., 2024-Fall)"
            value={filters.semester}
            onChange={(e) => handleSemesterFilter(e.target.value)}
            style={{ width: 200 }}
          />
          <Select
            placeholder="Filter by Day"
            allowClear
            style={{ width: 150 }}
            onChange={handleDayFilter}
          >
            {DAYS_OF_WEEK.map((day) => (
              <Option key={day.value} value={day.value}>
                {day.label}
              </Option>
            ))}
          </Select>
        </Space>

        <Table
          columns={columns}
          dataSource={timetables}
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
        />
      </Space>
    </Card>
  );
};

export default TimetableList;

