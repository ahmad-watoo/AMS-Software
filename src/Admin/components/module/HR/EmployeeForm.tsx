import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Card, message, Space, Select, InputNumber, DatePicker } from 'antd';
import { SaveOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import hrAPI, { CreateEmployeeDTO, Employee } from '../../../../api/hr.api';
import { userAPI } from '../../../../api/user.api';
import dayjs from 'dayjs';

const { Option } = Select;
const { TextArea } = Input;

interface EmployeeFormProps {
  isEdit?: boolean;
}

const EmployeeForm: React.FC<EmployeeFormProps> = ({ isEdit = false }) => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    if (isEdit && id) {
      loadEmployee(id);
    }
    loadUsers();
  }, [id, isEdit]);

  const loadEmployee = async (employeeId: string) => {
    try {
      setLoading(true);
      const employee = await hrAPI.getEmployeeById(employeeId);
      form.setFieldsValue({
        userId: employee.userId,
        employeeId: employee.employeeId,
        departmentId: employee.departmentId,
        designation: employee.designation,
        qualification: employee.qualification,
        specialization: employee.specialization,
        joiningDate: dayjs(employee.joiningDate),
        employmentType: employee.employmentType,
        salary: employee.salary,
      });
    } catch (error: any) {
      message.error(error.message || 'Failed to load employee');
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      const response = await userAPI.getUsers(1, 1000);
      setUsers(response.users || []);
    } catch (error) {
      console.error('Failed to load users');
    }
  };

  const handleSubmit = async (values: any) => {
    try {
      setLoading(true);

      const employeeData: CreateEmployeeDTO = {
        userId: values.userId,
        employeeId: values.employeeId,
        departmentId: values.departmentId,
        designation: values.designation,
        qualification: values.qualification,
        specialization: values.specialization,
        joiningDate: values.joiningDate.format('YYYY-MM-DD'),
        employmentType: values.employmentType,
        salary: values.salary,
      };

      if (isEdit && id) {
        await hrAPI.updateEmployee(id, employeeData);
        message.success('Employee updated successfully');
      } else {
        await hrAPI.createEmployee(employeeData);
        message.success('Employee created successfully');
      }

      navigate('/hr/employees');
    } catch (error: any) {
      message.error(error.message || 'Failed to save employee');
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
          employmentType: 'permanent',
        }}
      >
        <Form.Item
          label="User"
          name="userId"
          rules={[{ required: true, message: 'Please select a user' }]}
        >
          <Select
            placeholder="Select User"
            showSearch
            filterOption={(input, option) =>
              (option?.children as unknown as string)?.toLowerCase().includes(input.toLowerCase())
            }
            disabled={isEdit}
          >
            {users.map((user) => (
              <Option key={user.id} value={user.id}>
                {user.firstName} {user.lastName} ({user.email})
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          label="Employee ID"
          name="employeeId"
          rules={[{ required: true, message: 'Please enter employee ID' }]}
        >
          <Input placeholder="Enter employee ID" />
        </Form.Item>

        <Form.Item
          label="Designation"
          name="designation"
          rules={[{ required: true, message: 'Please select designation' }]}
        >
          <Select placeholder="Select Designation">
            <Option value="Professor">Professor</Option>
            <Option value="Associate Professor">Associate Professor</Option>
            <Option value="Assistant Professor">Assistant Professor</Option>
            <Option value="Lecturer">Lecturer</Option>
            <Option value="Admin">Admin</Option>
            <Option value="Staff">Staff</Option>
          </Select>
        </Form.Item>

        <Space style={{ width: '100%' }} size="middle">
          <Form.Item
            label="Qualification"
            name="qualification"
            style={{ width: '48%' }}
          >
            <Input placeholder="e.g., Ph.D., M.Phil., MS" />
          </Form.Item>

          <Form.Item
            label="Specialization"
            name="specialization"
            style={{ width: '48%' }}
          >
            <Input placeholder="e.g., Computer Science" />
          </Form.Item>
        </Space>

        <Space style={{ width: '100%' }} size="middle">
          <Form.Item
            label="Employment Type"
            name="employmentType"
            rules={[{ required: true, message: 'Please select employment type' }]}
            style={{ width: '48%' }}
          >
            <Select placeholder="Select Employment Type">
              <Option value="permanent">Permanent</Option>
              <Option value="contract">Contract</Option>
              <Option value="temporary">Temporary</Option>
              <Option value="visiting">Visiting</Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="Joining Date"
            name="joiningDate"
            rules={[{ required: true, message: 'Please select joining date' }]}
            style={{ width: '48%' }}
          >
            <DatePicker style={{ width: '100%' }} format="YYYY-MM-DD" />
          </Form.Item>
        </Space>

        <Form.Item
          label="Salary (PKR)"
          name="salary"
        >
          <InputNumber
            style={{ width: '100%' }}
            min={0}
            formatter={(value) => `PKR ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
            parser={(value) => Number((value || '').replace(/PKR\s?|(,*)/g, '')) as any}
          />
        </Form.Item>

        <Form.Item>
          <Space>
            <Button type="primary" htmlType="submit" loading={loading} icon={<SaveOutlined />}>
              {isEdit ? 'Update Employee' : 'Create Employee'}
            </Button>
            <Button onClick={() => navigate('/hr/employees')} icon={<ArrowLeftOutlined />}>
              Cancel
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default EmployeeForm;

