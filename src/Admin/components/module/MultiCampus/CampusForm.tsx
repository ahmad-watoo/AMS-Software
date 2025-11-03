import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Card, message, Space, Select, InputNumber, DatePicker, Switch } from 'antd';
import { SaveOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import multicampusAPI, { CreateCampusDTO, Campus } from '@/api/multicampus.api';
import dayjs from 'dayjs';

const { Option } = Select;
const { TextArea } = Input;

interface CampusFormProps {
  isEdit?: boolean;
}

const CampusForm: React.FC<CampusFormProps> = ({ isEdit = false }) => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isEdit && id) {
      loadCampus(id);
    }
  }, [id, isEdit]);

  const loadCampus = async (campusId: string) => {
    try {
      setLoading(true);
      const campus = await multicampusAPI.getCampusById(campusId);
      form.setFieldsValue({
        name: campus.name,
        code: campus.code,
        address: campus.address,
        city: campus.city,
        province: campus.province,
        postalCode: campus.postalCode,
        phone: campus.phone,
        email: campus.email,
        website: campus.website,
        establishedDate: campus.establishedDate ? dayjs(campus.establishedDate) : undefined,
        capacity: campus.capacity,
        description: campus.description,
        isActive: campus.isActive,
      });
    } catch (error: any) {
      message.error(error.message || 'Failed to load campus');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values: any) => {
    try {
      setLoading(true);

      const campusData: CreateCampusDTO = {
        name: values.name,
        code: values.code,
        address: values.address,
        city: values.city,
        province: values.province,
        postalCode: values.postalCode,
        phone: values.phone,
        email: values.email,
        website: values.website,
        establishedDate: values.establishedDate ? values.establishedDate.format('YYYY-MM-DD') : undefined,
        capacity: values.capacity,
        description: values.description,
      };

      if (isEdit && id) {
        await multicampusAPI.updateCampus(id, { ...campusData });
        message.success('Campus updated successfully');
      } else {
        await multicampusAPI.createCampus(campusData);
        message.success('Campus created successfully');
      }

      navigate('/multicampus/campuses');
    } catch (error: any) {
      message.error(error.message || 'Failed to save campus');
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
      >
        <Form.Item
          label="Campus Name"
          name="name"
          rules={[{ required: true, message: 'Please enter campus name' }]}
        >
          <Input placeholder="Enter campus name" />
        </Form.Item>

        <Form.Item
          label="Campus Code"
          name="code"
          rules={[{ required: true, message: 'Please enter campus code' }]}
        >
          <Input placeholder="Enter campus code" disabled={isEdit} />
        </Form.Item>

        <Form.Item
          label="Address"
          name="address"
          rules={[{ required: true, message: 'Please enter address' }]}
        >
          <Input placeholder="Enter complete address" />
        </Form.Item>

        <Space style={{ width: '100%' }} size="middle">
          <Form.Item
            label="City"
            name="city"
            rules={[{ required: true, message: 'Please enter city' }]}
            style={{ width: '48%' }}
          >
            <Input placeholder="Enter city" />
          </Form.Item>

          <Form.Item
            label="Province"
            name="province"
            rules={[{ required: true, message: 'Please select province' }]}
            style={{ width: '48%' }}
          >
            <Select placeholder="Select Province">
              <Option value="Punjab">Punjab</Option>
              <Option value="Sindh">Sindh</Option>
              <Option value="Khyber Pakhtunkhwa">Khyber Pakhtunkhwa</Option>
              <Option value="Balochistan">Balochistan</Option>
              <Option value="Islamabad">Islamabad</Option>
            </Select>
          </Form.Item>
        </Space>

        <Space style={{ width: '100%' }} size="middle">
          <Form.Item
            label="Postal Code"
            name="postalCode"
            style={{ width: '48%' }}
          >
            <Input placeholder="Enter postal code" />
          </Form.Item>

          <Form.Item
            label="Phone"
            name="phone"
            style={{ width: '48%' }}
          >
            <Input placeholder="Enter phone number" />
          </Form.Item>
        </Space>

        <Space style={{ width: '100%' }} size="middle">
          <Form.Item
            label="Email"
            name="email"
            rules={[{ type: 'email', message: 'Please enter valid email' }]}
            style={{ width: '48%' }}
          >
            <Input placeholder="Enter email" />
          </Form.Item>

          <Form.Item
            label="Website"
            name="website"
            style={{ width: '48%' }}
          >
            <Input placeholder="Enter website URL" />
          </Form.Item>
        </Space>

        <Space style={{ width: '100%' }} size="middle">
          <Form.Item
            label="Established Date"
            name="establishedDate"
            style={{ width: '48%' }}
          >
            <DatePicker style={{ width: '100%' }} format="YYYY-MM-DD" />
          </Form.Item>

          <Form.Item
            label="Capacity"
            name="capacity"
            style={{ width: '48%' }}
          >
            <InputNumber style={{ width: '100%' }} min={0} placeholder="Enter capacity" />
          </Form.Item>
        </Space>

        <Form.Item label="Description" name="description">
          <TextArea rows={4} placeholder="Enter campus description (optional)" />
        </Form.Item>

        {isEdit && (
          <Form.Item label="Active Status" name="isActive" valuePropName="checked">
            <Switch />
          </Form.Item>
        )}

        <Form.Item>
          <Space>
            <Button type="primary" htmlType="submit" loading={loading} icon={<SaveOutlined />}>
              {isEdit ? 'Update Campus' : 'Create Campus'}
            </Button>
            <Button onClick={() => navigate('/multicampus/campuses')} icon={<ArrowLeftOutlined />}>
              Cancel
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default CampusForm;

