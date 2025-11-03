import React, { useEffect, useState } from 'react';
import { Form, Input, Button, Card, message, Select, DatePicker, Space } from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import { userAPI, CreateUserDTO, UpdateUserDTO } from '../../../../api/user.api';
import { User } from '../../../../api/auth.api';
import dayjs from 'dayjs';

const { Option } = Select;

interface UserFormProps {
  isEdit?: boolean;
}

const UserForm: React.FC<UserFormProps> = ({ isEdit = false }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  useEffect(() => {
    if (isEdit && id) {
      loadUser();
    }
  }, [isEdit, id]);

  const loadUser = async () => {
    try {
      setLoading(true);
      const userData = await userAPI.getUser(id!);
      setUser(userData);
      form.setFieldsValue({
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        phone: userData.phone,
        
      });
    } catch (error) {
      message.error('Failed to load user');
      console.error('Error loading user:', error);
    } finally {
      setLoading(false);
    }
  };

  const onFinish = async (values: any) => {
    try {
      setLoading(true);

      if (isEdit && id) {
        const updateData: UpdateUserDTO = {
          firstName: values.firstName,
          lastName: values.lastName,
          phone: values.phone,
          
        };
        await userAPI.updateUser(id, updateData);
        message.success('User updated successfully');
      } else {
        const createData: CreateUserDTO = {
          email: values.email,
          password: values.password,
          firstName: values.firstName,
          lastName: values.lastName,
          phone: values.phone,
          cnic: values.cnic,
          dateOfBirth: values.dateOfBirth?.format('YYYY-MM-DD'),
          gender: values.gender,
        };
        await userAPI.createUser(createData);
        message.success('User created successfully');
      }

      navigate('/users');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Operation failed';
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card
      title={isEdit ? 'Edit User' : 'Create New User'}
      style={{ margin: '20px', maxWidth: 800 }}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        autoComplete="off"
      >
        <Form.Item
          name="firstName"
          label="First Name"
          rules={[{ required: true, message: 'Please enter first name' }]}
        >
          <Input placeholder="First Name" />
        </Form.Item>

        <Form.Item
          name="lastName"
          label="Last Name"
          rules={[{ required: true, message: 'Please enter last name' }]}
        >
          <Input placeholder="Last Name" />
        </Form.Item>

        <Form.Item
          name="email"
          label="Email"
          rules={[
            { required: true, message: 'Please enter email' },
            { type: 'email', message: 'Please enter a valid email' },
          ]}
        >
          <Input placeholder="Email" disabled={isEdit} />
        </Form.Item>

        {!isEdit && (
          <Form.Item
            name="password"
            label="Password"
            rules={[
              { required: true, message: 'Please enter password' },
              { min: 8, message: 'Password must be at least 8 characters' },
              {
                pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/,
                message: 'Password must contain uppercase, lowercase, number, and special character',
              },
            ]}
          >
            <Input.Password placeholder="Password" />
          </Form.Item>
        )}

        <Form.Item
          name="phone"
          label="Phone"
          rules={[
            { pattern: /^[0-9+\-\s()]+$/, message: 'Please enter a valid phone number' },
          ]}
        >
          <Input placeholder="Phone" />
        </Form.Item>

        {!isEdit && (
          <Form.Item
            name="cnic"
            label="CNIC"
            rules={[
              {
                pattern: /^[0-9]{5}-[0-9]{7}-[0-9]{1}$/,
                message: 'CNIC format: 12345-1234567-1',
              },
            ]}
          >
            <Input placeholder="CNIC (Format: 12345-1234567-1)" />
          </Form.Item>
        )}

        <Form.Item name="gender" label="Gender">
          <Select placeholder="Select Gender">
            <Option value="male">Male</Option>
            <Option value="female">Female</Option>
            <Option value="other">Other</Option>
          </Select>
        </Form.Item>

        <Form.Item name="dateOfBirth" label="Date of Birth">
          <DatePicker style={{ width: '100%' }} format="YYYY-MM-DD" />
        </Form.Item>

        <Form.Item>
          <Space>
            <Button type="primary" htmlType="submit" loading={loading}>
              {isEdit ? 'Update User' : 'Create User'}
            </Button>
            <Button onClick={() => navigate('/users')}>Cancel</Button>
          </Space>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default UserForm;

