import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Card, message, Space, Select, Switch } from 'antd';
import { SaveOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import administrationAPI, { CreateDepartmentDTO, Department } from '@/api/administration.api';

const { Option } = Select;
const { TextArea } = Input;

interface DepartmentFormProps {
  isEdit?: boolean;
}

const DepartmentForm: React.FC<DepartmentFormProps> = ({ isEdit = false }) => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(false);
  const [departments, setDepartments] = useState<Department[]>([]);

  useEffect(() => {
    if (isEdit && id) {
      loadDepartment(id);
    }
    loadDepartments();
  }, [id, isEdit]);

  const loadDepartment = async (departmentId: string) => {
    try {
      setLoading(true);
      const department = await administrationAPI.getDepartmentById(departmentId);
      form.setFieldsValue({
        name: department.name,
        code: department.code,
        description: department.description,
        headId: department.headId,
        parentDepartmentId: department.parentDepartmentId,
        isActive: department.isActive,
      });
    } catch (error: any) {
      message.error(error.message || 'Failed to load department');
    } finally {
      setLoading(false);
    }
  };

  const loadDepartments = async () => {
    try {
      const response = await administrationAPI.getAllDepartments({ page: 1, limit: 1000 });
      setDepartments(response.departments || []);
    } catch (error) {
      console.error('Failed to load departments');
    }
  };

  const handleSubmit = async (values: any) => {
    try {
      setLoading(true);

      const departmentData: CreateDepartmentDTO = {
        name: values.name,
        code: values.code,
        description: values.description,
        headId: values.headId,
        parentDepartmentId: values.parentDepartmentId,
      };

      if (isEdit && id) {
        await administrationAPI.updateDepartment(id, { ...departmentData });
        message.success('Department updated successfully');
      } else {
        await administrationAPI.createDepartment(departmentData);
        message.success('Department created successfully');
      }

      navigate('/administration/departments');
    } catch (error: any) {
      message.error(error.message || 'Failed to save department');
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
          label="Department Name"
          name="name"
          rules={[{ required: true, message: 'Please enter department name' }]}
        >
          <Input placeholder="Enter department name" />
        </Form.Item>

        <Form.Item
          label="Department Code"
          name="code"
          rules={[{ required: true, message: 'Please enter department code' }]}
        >
          <Input placeholder="Enter department code" disabled={isEdit} />
        </Form.Item>

        <Form.Item label="Description" name="description">
          <TextArea rows={4} placeholder="Enter department description (optional)" />
        </Form.Item>

        <Space style={{ width: '100%' }} size="middle">
          <Form.Item
            label="Head ID"
            name="headId"
            style={{ width: '48%' }}
          >
            <Input placeholder="Enter department head ID (optional)" />
          </Form.Item>

          <Form.Item
            label="Parent Department"
            name="parentDepartmentId"
            style={{ width: '48%' }}
          >
            <Select placeholder="Select Parent Department" allowClear>
              {departments
                .filter((dept) => dept.id !== id)
                .map((dept) => (
                  <Option key={dept.id} value={dept.id}>
                    {dept.code} - {dept.name}
                  </Option>
                ))}
            </Select>
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
              {isEdit ? 'Update Department' : 'Create Department'}
            </Button>
            <Button onClick={() => navigate('/administration/departments')} icon={<ArrowLeftOutlined />}>
              Cancel
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default DepartmentForm;

