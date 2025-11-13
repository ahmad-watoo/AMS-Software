import React, { useEffect, useMemo, useState } from 'react';
import {
  Card,
  Table,
  Button,
  Modal,
  Form,
  DatePicker,
  Input,
  Space,
  Tag,
  message,
  Empty,
  Select,
  Skeleton,
} from 'antd';
import {
  CalendarOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import administrationAPI, { CreateEventDTO, Event } from '@/api/administration.api';
import dayjs, { Dayjs } from 'dayjs';

const { RangePicker } = DatePicker;
const { Option } = Select;

interface HolidayFormValues {
  title: string;
  description?: string;
  dateRange: [Dayjs, Dayjs];
  targetAudience: ('students' | 'faculty' | 'staff' | 'all')[];
}

const HolidayCalendar: React.FC = () => {
  const [holidays, setHolidays] = useState<Event[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingHoliday, setEditingHoliday] = useState<Event | null>(null);
  const [form] = Form.useForm<HolidayFormValues>();

  useEffect(() => {
    loadHolidays();
  }, []);

  const loadHolidays = async () => {
    try {
      setLoading(true);
      const response = await administrationAPI.getAllEvents({ eventType: 'holiday', limit: 200 });
      const data = Array.isArray(response?.events)
        ? response.events
        : Array.isArray(response?.data?.events)
        ? response.data.events
        : Array.isArray(response?.data)
        ? response.data
        : Array.isArray(response)
        ? response
        : [];
      setHolidays(data);
    } catch (error: any) {
      message.error(error.message || 'Failed to load holiday calendar');
    } finally {
      setLoading(false);
    }
  };

  const openModal = (event?: Event) => {
    if (event) {
      setEditingHoliday(event);
      form.setFieldsValue({
        title: event.title,
        description: event.description,
        dateRange: [dayjs(event.startDate), event.endDate ? dayjs(event.endDate) : dayjs(event.startDate)],
        targetAudience: event.targetAudience,
      });
    } else {
      setEditingHoliday(null);
      form.resetFields();
    }
    setModalVisible(true);
  };

  const handleDelete = async (event: Event) => {
    try {
      await administrationAPI.updateEvent(event.id, { isActive: false });
      message.success('Holiday removed');
      loadHolidays();
    } catch (error: any) {
      message.error(error.message || 'Failed to remove holiday');
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const payload: CreateEventDTO = {
        title: values.title,
        description: values.description,
        eventType: 'holiday',
        startDate: values.dateRange[0].format('YYYY-MM-DD'),
        endDate: values.dateRange[1].format('YYYY-MM-DD'),
        targetAudience: values.targetAudience,
      };
      if (editingHoliday) {
        await administrationAPI.updateEvent(editingHoliday.id, payload);
        message.success('Holiday updated');
      } else {
        await administrationAPI.createEvent(payload);
        message.success('Holiday created');
      }
      setModalVisible(false);
      loadHolidays();
    } catch (error: any) {
      if (error?.errorFields) return;
      message.error(error.message || 'Failed to save holiday');
    }
  };

  const upcoming = useMemo(() => {
    const now = dayjs();
    return holidays.filter((holiday) => dayjs(holiday.endDate || holiday.startDate).isSame(now, 'day') || dayjs(holiday.endDate || holiday.startDate).isAfter(now));
  }, [holidays]);

  const columns = [
    {
      title: 'Holiday',
      dataIndex: 'title',
      key: 'title',
      render: (title: string, record: Event) => (
        <Space direction="vertical" size={0}>
          <span style={{ fontWeight: 600 }}>{title}</span>
          <span style={{ color: '#888' }}>{record.description}</span>
        </Space>
      ),
    },
    {
      title: 'Dates',
      dataIndex: 'startDate',
      key: 'dates',
      render: (_: any, record: Event) => (
        <Space direction="vertical" size={0}>
          <span>
            {dayjs(record.startDate).format('DD MMM YYYY')} - {dayjs(record.endDate || record.startDate).format('DD MMM YYYY')}
          </span>
        </Space>
      ),
    },
    {
      title: 'Audience',
      dataIndex: 'targetAudience',
      key: 'audience',
      render: (audience: Event['targetAudience']) => (
        <Space>
          {audience.map((target: Event['targetAudience'][number]) => (
            <Tag key={target}>{target.toUpperCase()}</Tag>
          ))}
        </Space>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: Event) => (
        <Space>
          <Button type="link" icon={<EditOutlined />} onClick={() => openModal(record)} />
          <Button danger type="link" icon={<DeleteOutlined />} onClick={() => handleDelete(record)} />
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <Card bordered={false} style={{ borderRadius: 12, background: '#f0f5ff' }}>
          <Space size="large" wrap>
            <CalendarOutlined style={{ fontSize: 36, color: '#1677ff' }} />
            <div>
              <div style={{ fontSize: 18, fontWeight: 600 }}>Holiday Calendar</div>
              <div style={{ color: '#888' }}>Track institutional holidays and campus closures.</div>
            </div>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => openModal()}>
              Add Holiday
            </Button>
          </Space>
        </Card>

        <Card bordered={false} style={{ borderRadius: 12 }}>
          {loading ? (
            <Skeleton active paragraph={{ rows: 5 }} />
          ) : holidays.length === 0 ? (
            <Empty description="No holidays configured" />
          ) : (
            <Table rowKey={(record) => record.id} columns={columns} dataSource={holidays} pagination={{ pageSize: 8 }} />
          )}
        </Card>

        <Card bordered={false} style={{ borderRadius: 12, background: '#fafafa' }}>
          <div style={{ fontWeight: 600, marginBottom: 12 }}>Upcoming Holidays</div>
          {upcoming.length === 0 ? (
            <Empty description="No upcoming holidays" />
          ) : (
            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
              {upcoming.slice(0, 4).map((holiday) => (
                <Card key={holiday.id} size="small" style={{ borderRadius: 12 }}>
                  <Space direction="vertical" size={2}>
                    <span style={{ fontWeight: 600 }}>{holiday.title}</span>
                    <span>{dayjs(holiday.startDate).format('DD MMM')} - {dayjs(holiday.endDate || holiday.startDate).format('DD MMM')}</span>
                  </Space>
                </Card>
              ))}
            </Space>
          )}
        </Card>
      </Space>

      <Modal
        title={editingHoliday ? 'Edit Holiday' : 'Add Holiday'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={handleSubmit}
        okText="Save"
        destroyOnClose
      >
        <Form layout="vertical" form={form}>
          <Form.Item name="title" label="Holiday Name" rules={[{ required: true, message: 'Enter holiday name' }]}> 
            <Input placeholder="e.g., Eid ul-Fitr" />
          </Form.Item>
          <Form.Item name="description" label="Description">
            <Input.TextArea rows={3} placeholder="Brief description" />
          </Form.Item>
          <Form.Item name="dateRange" label="Date Range" rules={[{ required: true, message: 'Select date range' }]}> 
            <RangePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item
            name="targetAudience"
            label="Audience"
            rules={[{ required: true, message: 'Select target audience' }]}
            initialValue={['all']}
          >
            <Select mode="multiple" placeholder="Select audience">
              {['students', 'faculty', 'staff', 'all'].map((audience) => (
                <Option key={audience} value={audience as HolidayFormValues['targetAudience'][number]}>
                  {audience.toUpperCase()}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default HolidayCalendar;
