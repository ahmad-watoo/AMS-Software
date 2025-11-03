import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Card, message, Space, Select, DatePicker, TimePicker, Switch, Checkbox, InputNumber } from 'antd';
import { SaveOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import administrationAPI, { CreateEventDTO, Event } from '@/api/administration.api';
import dayjs from 'dayjs';

const { Option } = Select;
const { TextArea } = Input;

interface EventFormProps {
  isEdit?: boolean;
}

const EventForm: React.FC<EventFormProps> = ({ isEdit = false }) => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isEdit && id) {
      loadEvent(id);
    }
  }, [id, isEdit]);

  const loadEvent = async (eventId: string) => {
    try {
      setLoading(true);
      const event = await administrationAPI.getEventById(eventId);
      form.setFieldsValue({
        title: event.title,
        description: event.description,
        eventType: event.eventType,
        startDate: dayjs(event.startDate),
        endDate: event.endDate ? dayjs(event.endDate) : undefined,
        startTime: event.startTime ? dayjs(event.startTime, 'HH:mm') : undefined,
        endTime: event.endTime ? dayjs(event.endTime, 'HH:mm') : undefined,
        location: event.location,
        targetAudience: event.targetAudience,
        registrationRequired: event.registrationRequired,
        maxParticipants: event.maxParticipants,
        isActive: event.isActive,
      });
    } catch (error: any) {
      message.error(error.message || 'Failed to load event');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values: any) => {
    try {
      setLoading(true);

      const eventData: CreateEventDTO = {
        title: values.title,
        description: values.description,
        eventType: values.eventType,
        startDate: values.startDate.format('YYYY-MM-DD'),
        endDate: values.endDate ? values.endDate.format('YYYY-MM-DD') : undefined,
        startTime: values.startTime ? values.startTime.format('HH:mm') : undefined,
        endTime: values.endTime ? values.endTime.format('HH:mm') : undefined,
        location: values.location,
        targetAudience: values.targetAudience,
        registrationRequired: values.registrationRequired,
        maxParticipants: values.maxParticipants,
      };

      if (isEdit && id) {
        await administrationAPI.updateEvent(id, { ...eventData });
        message.success('Event updated successfully');
      } else {
        await administrationAPI.createEvent(eventData);
        message.success('Event created successfully');
      }

      navigate('/administration/events');
    } catch (error: any) {
      message.error(error.message || 'Failed to save event');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          eventType: 'academic',
          registrationRequired: false,
        }}
      >
        <Form.Item
          label="Event Title"
          name="title"
          rules={[{ required: true, message: 'Please enter event title' }]}
        >
          <Input placeholder="Enter event title" />
        </Form.Item>

        <Form.Item
          label="Event Type"
          name="eventType"
          rules={[{ required: true, message: 'Please select event type' }]}
        >
          <Select placeholder="Select Event Type">
            <Option value="academic">Academic</Option>
            <Option value="cultural">Cultural</Option>
            <Option value="sports">Sports</Option>
            <Option value="workshop">Workshop</Option>
            <Option value="seminar">Seminar</Option>
            <Option value="conference">Conference</Option>
            <Option value="holiday">Holiday</Option>
            <Option value="other">Other</Option>
          </Select>
        </Form.Item>

        <Form.Item label="Description" name="description">
          <TextArea rows={4} placeholder="Enter event description (optional)" />
        </Form.Item>

        <Space style={{ width: '100%' }} size="middle">
          <Form.Item
            label="Start Date"
            name="startDate"
            rules={[{ required: true, message: 'Please select start date' }]}
            style={{ width: '48%' }}
          >
            <DatePicker style={{ width: '100%' }} format="YYYY-MM-DD" />
          </Form.Item>

          <Form.Item
            label="End Date"
            name="endDate"
            style={{ width: '48%' }}
          >
            <DatePicker style={{ width: '100%' }} format="YYYY-MM-DD" />
          </Form.Item>
        </Space>

        <Space style={{ width: '100%' }} size="middle">
          <Form.Item
            label="Start Time"
            name="startTime"
            style={{ width: '48%' }}
          >
            <TimePicker style={{ width: '100%' }} format="HH:mm" />
          </Form.Item>

          <Form.Item
            label="End Time"
            name="endTime"
            style={{ width: '48%' }}
          >
            <TimePicker style={{ width: '100%' }} format="HH:mm" />
          </Form.Item>
        </Space>

        <Form.Item label="Location" name="location">
          <Input placeholder="Enter event location (optional)" />
        </Form.Item>

        <Form.Item
          label="Target Audience"
          name="targetAudience"
          rules={[{ required: true, message: 'Please select target audience' }]}
        >
          <Checkbox.Group>
            <Checkbox value="students">Students</Checkbox>
            <Checkbox value="faculty">Faculty</Checkbox>
            <Checkbox value="staff">Staff</Checkbox>
            <Checkbox value="all">All</Checkbox>
          </Checkbox.Group>
        </Form.Item>

        <Space style={{ width: '100%' }} size="middle">
          <Form.Item label="Registration Required" name="registrationRequired" valuePropName="checked">
            <Switch />
          </Form.Item>

          <Form.Item
            label="Max Participants"
            name="maxParticipants"
            style={{ width: '48%' }}
          >
            <InputNumber style={{ width: '100%' }} min={1} placeholder="Enter max participants" />
          </Form.Item>
        </Space>

        {isEdit && (
          <Form.Item label="Active Status" name="isActive" valuePropName="checked">
            <Switch />
          </Form.Item>
        )}

        <Form.Item>
          <Space>
            <Button type="primary" htmlType="submit" loading={loading} icon={<SaveOutlined />}>
              {isEdit ? 'Update Event' : 'Create Event'}
            </Button>
            <Button onClick={() => navigate('/administration/events')} icon={<ArrowLeftOutlined />}>
              Cancel
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default EventForm;

