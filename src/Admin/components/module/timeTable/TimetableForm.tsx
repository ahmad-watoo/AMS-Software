import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Card, message, Space, Select, TimePicker } from 'antd';
import { SaveOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { timetableAPI, CreateTimetableDTO, Timetable } from '../../../../api/timetable.api';
import { useNavigate, useParams } from 'react-router-dom';
import { route } from '../../../routes/constant';
import dayjs from 'dayjs';

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

interface TimetableFormProps {
  isEdit?: boolean;
}

const TimetableForm: React.FC<TimetableFormProps> = ({ isEdit = false }) => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(false);
  const [rooms, setRooms] = useState<any[]>([]);

  useEffect(() => {
    if (isEdit && id) {
      loadTimetable(id);
    }
    loadRooms();
  }, [id, isEdit]);

  const loadTimetable = async (timetableId: string) => {
    try {
      setLoading(true);
      const timetable = await timetableAPI.getTimetable(timetableId);
      form.setFieldsValue({
        sectionId: timetable.sectionId,
        dayOfWeek: timetable.dayOfWeek,
        startTime: dayjs(timetable.startTime, 'HH:mm'),
        endTime: dayjs(timetable.endTime, 'HH:mm'),
        roomId: timetable.roomId,
        facultyId: timetable.facultyId,
        semester: timetable.semester,
      });
    } catch (error: any) {
      message.error(error.message || 'Failed to load timetable');
    } finally {
      setLoading(false);
    }
  };

  const loadRooms = async () => {
    try {
      const response = await timetableAPI.getRooms(1, 100);
      setRooms(response.rooms);
    } catch (error) {
      console.error('Failed to load rooms');
    }
  };

  const handleSubmit = async (values: any) => {
    try {
      setLoading(true);
      
      const timetableData: CreateTimetableDTO = {
        sectionId: values.sectionId,
        dayOfWeek: values.dayOfWeek,
        startTime: values.startTime.format('HH:mm'),
        endTime: values.endTime.format('HH:mm'),
        roomId: values.roomId,
        facultyId: values.facultyId,
        semester: values.semester,
      };

      if (isEdit && id) {
        await timetableAPI.updateTimetable(id, timetableData);
        message.success('Timetable updated successfully');
      } else {
        const result = await timetableAPI.createTimetable(timetableData);
        if (result.conflicts && result.conflicts.length > 0) {
          message.warning(`Timetable created but conflicts detected: ${result.conflicts.map((c: any) => c.message).join(', ')}`);
        } else {
          message.success('Timetable created successfully');
        }
      }
      
      navigate(route.TIMETABLE_LIST);
    } catch (error: any) {
      message.error(error.message || 'Failed to save timetable');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card
      title={isEdit ? 'Edit Schedule' : 'New Schedule'}
      style={{ margin: 20, boxShadow: 'rgba(0, 0, 0, 0.16) 0px 1px 4px' }}
      extra={
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)}>
          Back
        </Button>
      }
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{}}
      >
        <Form.Item
          name="sectionId"
          label="Section ID"
          rules={[{ required: true, message: 'Please select a section' }]}
        >
          <Input placeholder="Section ID" />
        </Form.Item>

        <Form.Item
          name="semester"
          label="Semester"
          rules={[{ required: true, message: 'Please enter semester' }]}
        >
          <Input placeholder="e.g., 2024-Fall" />
        </Form.Item>

        <Form.Item
          name="dayOfWeek"
          label="Day of Week"
          rules={[{ required: true, message: 'Please select day of week' }]}
        >
          <Select placeholder="Select Day">
            {DAYS_OF_WEEK.map((day) => (
              <Option key={day.value} value={day.value}>
                {day.label}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Space style={{ width: '100%' }} direction="horizontal">
          <Form.Item
            name="startTime"
            label="Start Time"
            rules={[{ required: true, message: 'Please select start time' }]}
            style={{ flex: 1 }}
          >
            <TimePicker format="HH:mm" style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            name="endTime"
            label="End Time"
            rules={[{ required: true, message: 'Please select end time' }]}
            style={{ flex: 1 }}
          >
            <TimePicker format="HH:mm" style={{ width: '100%' }} />
          </Form.Item>
        </Space>

        <Form.Item
          name="roomId"
          label="Room (Optional)"
        >
          <Select placeholder="Select Room" allowClear showSearch>
            {rooms.map((room) => (
              <Option key={room.id} value={room.id}>
                {room.roomNumber} ({room.capacity || 'N/A'} capacity)
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="facultyId"
          label="Faculty (Optional)"
        >
          <Input placeholder="Faculty ID" />
        </Form.Item>

        <Form.Item>
          <Space>
            <Button type="primary" htmlType="submit" loading={loading} icon={<SaveOutlined />}>
              {isEdit ? 'Update Schedule' : 'Create Schedule'}
            </Button>
            <Button onClick={() => navigate(-1)}>Cancel</Button>
          </Space>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default TimetableForm;

