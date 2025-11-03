import React, { useState } from 'react';
import { Form, Input, Button, Card, message, Space, Select, DatePicker } from 'antd';
import { SaveOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import hrAPI, { CreateLeaveRequestDTO } from '@/api/hr.api';
import dayjs from 'dayjs';

const { Option } = Select;
const { TextArea } = Input;

const LeaveRequestForm: React.FC = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values: any) => {
    try {
      setLoading(true);

      const startDate = dayjs(values.dateRange[0]);
      const endDate = dayjs(values.dateRange[1]);
      const numberOfDays = endDate.diff(startDate, 'day') + 1;

      const leaveData: CreateLeaveRequestDTO = {
        employeeId: values.employeeId,
        leaveType: values.leaveType,
        startDate: startDate.format('YYYY-MM-DD'),
        endDate: endDate.format('YYYY-MM-DD'),
        reason: values.reason,
      };

      await hrAPI.createLeaveRequest(leaveData);
      message.success('Leave request submitted successfully');
      navigate('/hr/leave-requests');
    } catch (error: any) {
      message.error(error.message || 'Failed to submit leave request');
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
          leaveType: 'annual',
        }}
      >
        <Form.Item
          label="Employee ID"
          name="employeeId"
          rules={[{ required: true, message: 'Please enter employee ID' }]}
        >
          <Input placeholder="Enter employee ID" />
        </Form.Item>

        <Form.Item
          label="Leave Type"
          name="leaveType"
          rules={[{ required: true, message: 'Please select leave type' }]}
        >
          <Select placeholder="Select Leave Type">
            <Option value="annual">Annual</Option>
            <Option value="sick">Sick</Option>
            <Option value="casual">Casual</Option>
            <Option value="emergency">Emergency</Option>
            <Option value="maternity">Maternity</Option>
            <Option value="paternity">Paternity</Option>
            <Option value="unpaid">Unpaid</Option>
          </Select>
        </Form.Item>

        <Form.Item
          label="Date Range"
          name="dateRange"
          rules={[{ required: true, message: 'Please select date range' }]}
        >
          <DatePicker.RangePicker style={{ width: '100%' }} format="YYYY-MM-DD" />
        </Form.Item>

        <Form.Item
          label="Reason"
          name="reason"
        >
          <TextArea rows={4} placeholder="Enter reason for leave (optional)" />
        </Form.Item>

        <Form.Item>
          <Space>
            <Button type="primary" htmlType="submit" loading={loading} icon={<SaveOutlined />}>
              Submit Leave Request
            </Button>
            <Button onClick={() => navigate('/hr/leave-requests')} icon={<ArrowLeftOutlined />}>
              Cancel
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default LeaveRequestForm;

