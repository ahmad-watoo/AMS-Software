import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Card, message, Space, Select, InputNumber, DatePicker } from 'antd';
import { SaveOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import financeAPI, { CreateFeeStructureDTO, FeeStructure } from '@/api/finance.api';
import { academicAPI } from '@/api/academic.api';
import dayjs from 'dayjs';

const { Option } = Select;
const { TextArea } = Input;

interface FeeStructureFormProps {
  isEdit?: boolean;
}

const FeeStructureForm: React.FC<FeeStructureFormProps> = ({ isEdit = false }) => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(false);
  const [programs, setPrograms] = useState<any[]>([]);

  useEffect(() => {
    if (isEdit && id) {
      loadFeeStructure(id);
    }
    loadPrograms();
  }, [id, isEdit]);

  const loadFeeStructure = async (feeStructureId: string) => {
    try {
      setLoading(true);
      const feeStructure = await financeAPI.getFeeStructureById(feeStructureId);
      form.setFieldsValue({
        programId: feeStructure.programId,
        semester: feeStructure.semester,
        feeType: feeStructure.feeType,
        amount: feeStructure.amount,
        dueDate: feeStructure.dueDate ? dayjs(feeStructure.dueDate) : undefined,
        description: feeStructure.description,
      });
    } catch (error: any) {
      message.error(error.message || 'Failed to load fee structure');
    } finally {
      setLoading(false);
    }
  };

  const loadPrograms = async () => {
    try {
      const response = await academicAPI.getPrograms(1, 1000);
      setPrograms(response.programs);
    } catch (error) {
      console.error('Failed to load programs');
    }
  };

  const handleSubmit = async (values: any) => {
    try {
      setLoading(true);

      const feeStructureData: CreateFeeStructureDTO = {
        programId: values.programId,
        semester: values.semester,
        feeType: values.feeType,
        amount: values.amount,
        dueDate: values.dueDate ? values.dueDate.format('YYYY-MM-DD') : undefined,
        description: values.description,
      };

      if (isEdit && id) {
        await financeAPI.updateFeeStructure(id, feeStructureData);
        message.success('Fee structure updated successfully');
      } else {
        await financeAPI.createFeeStructure(feeStructureData);
        message.success('Fee structure created successfully');
      }

      navigate('/finance/fee-structures');
    } catch (error: any) {
      message.error(error.message || 'Failed to save fee structure');
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
          feeType: 'tuition',
          semester: 1,
        }}
      >
        <Form.Item
          label="Program"
          name="programId"
          rules={[{ required: true, message: 'Please select a program' }]}
        >
          <Select
            placeholder="Select Program"
            showSearch
            filterOption={(input, option) =>
              (option?.children as unknown as string)?.toLowerCase().includes(input.toLowerCase())
            }
          >
            {programs.map((program) => (
              <Option key={program.id} value={program.id}>
                {program.code} - {program.name}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Space style={{ width: '100%' }} size="middle">
          <Form.Item
            label="Semester"
            name="semester"
            rules={[
              { required: true, message: 'Please enter semester' },
              { type: 'number', min: 1, max: 16, message: 'Semester must be between 1 and 16' },
            ]}
            style={{ width: '48%' }}
          >
            <InputNumber style={{ width: '100%' }} min={1} max={16} />
          </Form.Item>

          <Form.Item
            label="Fee Type"
            name="feeType"
            rules={[{ required: true, message: 'Please select fee type' }]}
            style={{ width: '48%' }}
          >
            <Select placeholder="Select Fee Type">
              <Option value="tuition">Tuition</Option>
              <Option value="admission">Admission</Option>
              <Option value="registration">Registration</Option>
              <Option value="exam">Exam</Option>
              <Option value="library">Library</Option>
              <Option value="lab">Lab</Option>
              <Option value="other">Other</Option>
            </Select>
          </Form.Item>
        </Space>

        <Space style={{ width: '100%' }} size="middle">
          <Form.Item
            label="Amount (PKR)"
            name="amount"
            rules={[
              { required: true, message: 'Please enter amount' },
              { type: 'number', min: 1, message: 'Amount must be greater than 0' },
            ]}
            style={{ width: '48%' }}
          >
            <InputNumber
              style={{ width: '100%' }}
              min={1}
              formatter={(value) => `PKR ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={(value) => Number((value || '').replace(/PKR\s?|(,*)/g, '')) as any}
            />
          </Form.Item>

          <Form.Item
            label="Due Date"
            name="dueDate"
            style={{ width: '48%' }}
          >
            <DatePicker style={{ width: '100%' }} format="YYYY-MM-DD" />
          </Form.Item>
        </Space>

        <Form.Item label="Description" name="description">
          <TextArea rows={4} placeholder="Enter fee structure description (optional)" />
        </Form.Item>

        <Form.Item>
          <Space>
            <Button type="primary" htmlType="submit" loading={loading} icon={<SaveOutlined />}>
              {isEdit ? 'Update Fee Structure' : 'Create Fee Structure'}
            </Button>
            <Button onClick={() => navigate('/finance/fee-structures')} icon={<ArrowLeftOutlined />}>
              Cancel
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default FeeStructureForm;

