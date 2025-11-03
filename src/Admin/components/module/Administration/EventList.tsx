import React, { useState, useEffect } from 'react';
import { Table, Button, Select, Space, Tag, Card, message, DatePicker } from 'antd';
import { PlusOutlined, EditOutlined, EyeOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import administrationAPI, { Event } from '@/api/administration.api';
import PermissionGuard from '@/components/common/PermissionGuard';
import dayjs from 'dayjs';

const { Option } = Select;
const { RangePicker } = DatePicker;

const EventList: React.FC = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 20,
    total: 0,
  });
  const [filters, setFilters] = useState({
    eventType: undefined as string | undefined,
    isActive: undefined as boolean | undefined,
    dateRange: undefined as [dayjs.Dayjs, dayjs.Dayjs] | undefined,
  });

  useEffect(() => {
    fetchEvents();
  }, [pagination.current, pagination.pageSize, filters]);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const params: any = {
        eventType: filters.eventType,
        isActive: filters.isActive,
        page: pagination.current,
        limit: pagination.pageSize,
      };

      if (filters.dateRange) {
        params.startDate = filters.dateRange[0].format('YYYY-MM-DD');
        params.endDate = filters.dateRange[1].format('YYYY-MM-DD');
      }

      const response = await administrationAPI.getAllEvents(params);

      setEvents(response.events || []);
      setPagination({
        ...pagination,
        total: response.pagination?.total || 0,
      });
    } catch (error: any) {
      message.error(error.message || 'Failed to fetch events');
    } finally {
      setLoading(false);
    }
  };

  const getEventTypeTag = (type: string) => {
    const typeConfig: Record<string, { color: string; text: string }> = {
      academic: { color: 'blue', text: 'Academic' },
      cultural: { color: 'purple', text: 'Cultural' },
      sports: { color: 'green', text: 'Sports' },
      workshop: { color: 'orange', text: 'Workshop' },
      seminar: { color: 'cyan', text: 'Seminar' },
      conference: { color: 'red', text: 'Conference' },
      holiday: { color: 'default', text: 'Holiday' },
      other: { color: 'default', text: 'Other' },
    };

    const config = typeConfig[type] || { color: 'default', text: type };
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  const columns = [
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: 'Type',
      dataIndex: 'eventType',
      key: 'eventType',
      render: (type: string) => getEventTypeTag(type),
      filters: [
        { text: 'Academic', value: 'academic' },
        { text: 'Cultural', value: 'cultural' },
        { text: 'Sports', value: 'sports' },
        { text: 'Workshop', value: 'workshop' },
        { text: 'Seminar', value: 'seminar' },
        { text: 'Conference', value: 'conference' },
        { text: 'Holiday', value: 'holiday' },
      ],
    },
    {
      title: 'Start Date',
      dataIndex: 'startDate',
      key: 'startDate',
      render: (date: string) => new Date(date).toLocaleDateString(),
      sorter: true,
    },
    {
      title: 'End Date',
      dataIndex: 'endDate',
      key: 'endDate',
      render: (date: string) => (date ? new Date(date).toLocaleDateString() : '-'),
    },
    {
      title: 'Location',
      dataIndex: 'location',
      key: 'location',
      render: (location: string) => location || '-',
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
      render: (_: any, record: Event) => (
        <Space size="middle">
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => navigate(`/administration/events/${record.id}`)}
          >
            View
          </Button>
          <PermissionGuard permission="admin" action="update">
            <Button
              type="link"
              icon={<EditOutlined />}
              onClick={() => navigate(`/administration/events/${record.id}/edit`)}
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
              placeholder="Filter by Type"
              style={{ width: 150 }}
              allowClear
              value={filters.eventType}
              onChange={(value) => setFilters({ ...filters, eventType: value })}
            >
              <Option value="academic">Academic</Option>
              <Option value="cultural">Cultural</Option>
              <Option value="sports">Sports</Option>
              <Option value="workshop">Workshop</Option>
              <Option value="seminar">Seminar</Option>
              <Option value="conference">Conference</Option>
              <Option value="holiday">Holiday</Option>
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
          <PermissionGuard permission="admin" action="create">
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => navigate('/administration/events/new')}
            >
              New Event
            </Button>
          </PermissionGuard>
        </Space>

        <Table
          columns={columns}
          dataSource={events}
          rowKey="id"
          loading={loading}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} events`,
            onChange: (page, pageSize) => {
              setPagination({ ...pagination, current: page, pageSize });
            },
          }}
        />
      </Space>
    </Card>
  );
};

export default EventList;

