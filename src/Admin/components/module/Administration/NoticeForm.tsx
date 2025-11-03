import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Card, message, Space, Select, DatePicker, Switch, Checkbox } from 'antd';
import { SaveOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import administrationAPI, { CreateNoticeDTO, Notice } from '@/api/administration.api';
import dayjs from 'dayjs';

const { Option } = Select;
const { TextArea } = Input;

interface NoticeFormProps {
  isEdit?: boolean;
}

const NoticeForm: React.FC<NoticeFormProps> = ({ isEdit = false }) => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isEdit && id) {
      loadNotice(id);
    }
  }, [id, isEdit]);

  const loadNotice = async (noticeId: string) => {
    try {
      setLoading(true);
      const notice = await administrationAPI.getNoticeById(noticeId);
      form.setFieldsValue({
        title: notice.title,
        content: notice.content,
        noticeType: notice.noticeType,
        priority: notice.priority,
        targetAudience: notice.targetAudience,
        publishedDate: dayjs(notice.publishedDate),
        expiryDate: notice.expiryDate ? dayjs(notice.expiryDate) : undefined,
        isPublished: notice.isPublished,
      });
    } catch (error: any) {
      message.error(error.message || 'Failed to load notice');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values: any) => {
    try {
      setLoading(true);

      const noticeData: CreateNoticeDTO = {
        title: values.title,
        content: values.content,
        noticeType: values.noticeType,
        priority: values.priority,
        targetAudience: values.targetAudience,
        publishedDate: values.publishedDate.format('YYYY-MM-DD'),
        expiryDate: values.expiryDate ? values.expiryDate.format('YYYY-MM-DD') : undefined,
        isPublished: values.isPublished,
      };

      if (isEdit && id) {
        await administrationAPI.updateNotice(id, noticeData);
        message.success('Notice updated successfully');
      } else {
        await administrationAPI.createNotice(noticeData);
        message.success('Notice created successfully');
      }

      navigate('/administration/notices');
    } catch (error: any) {
      message.error(error.message || 'Failed to save notice');
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
          noticeType: 'general',
          priority: 'medium',
          isPublished: false,
        }}
      >
        <Form.Item
          label="Notice Title"
          name="title"
          rules={[{ required: true, message: 'Please enter notice title' }]}
        >
          <Input placeholder="Enter notice title" />
        </Form.Item>

        <Space style={{ width: '100%' }} size="middle">
          <Form.Item
            label="Notice Type"
            name="noticeType"
            rules={[{ required: true, message: 'Please select notice type' }]}
            style={{ width: '48%' }}
          >
            <Select placeholder="Select Notice Type">
              <Option value="announcement">Announcement</Option>
              <Option value="important">Important</Option>
              <Option value="general">General</Option>
              <Option value="exam">Exam</Option>
              <Option value="fee">Fee</Option>
              <Option value="holiday">Holiday</Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="Priority"
            name="priority"
            rules={[{ required: true, message: 'Please select priority' }]}
            style={{ width: '48%' }}
          >
            <Select placeholder="Select Priority">
              <Option value="low">Low</Option>
              <Option value="medium">Medium</Option>
              <Option value="high">High</Option>
              <Option value="urgent">Urgent</Option>
            </Select>
          </Form.Item>
        </Space>

        <Form.Item
          label="Content"
          name="content"
          rules={[{ required: true, message: 'Please enter notice content' }]}
        >
          <TextArea rows={6} placeholder="Enter notice content" />
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
          <Form.Item
            label="Published Date"
            name="publishedDate"
            rules={[{ required: true, message: 'Please select published date' }]}
            style={{ width: '48%' }}
          >
            <DatePicker style={{ width: '100%' }} format="YYYY-MM-DD" />
          </Form.Item>

          <Form.Item
            label="Expiry Date"
            name="expiryDate"
            style={{ width: '48%' }}
          >
            <DatePicker style={{ width: '100%' }} format="YYYY-MM-DD" />
          </Form.Item>
        </Space>

        <Form.Item label="Publish Notice" name="isPublished" valuePropName="checked">
          <Switch />
        </Form.Item>

        <Form.Item>
          <Space>
            <Button type="primary" htmlType="submit" loading={loading} icon={<SaveOutlined />}>
              {isEdit ? 'Update Notice' : 'Create Notice'}
            </Button>
            <Button onClick={() => navigate('/administration/notices')} icon={<ArrowLeftOutlined />}>
              Cancel
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default NoticeForm;

