import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Card, message, Space, Select, InputNumber } from 'antd';
import { SaveOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { academicAPI, CreateProgramDTO, Program } from '../../../../api/academic.api';
import { useNavigate, useParams } from 'react-router-dom';
import { route } from '../../../routes/constant';

const { Option } = Select;
const { TextArea } = Input;

interface ProgramFormProps {
  isEdit?: boolean;
}

const ProgramForm: React.FC<ProgramFormProps> = ({ isEdit = false }) => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isEdit && id) {
      loadProgram(id);
    }
  }, [id, isEdit]);

  const loadProgram = async (programId: string) => {
    try {
      setLoading(true);
      const program = await academicAPI.getProgram(programId);
      form.setFieldsValue({
        code: program.code,
        name: program.name,
        degreeLevel: program.degreeLevel,
        duration: program.duration,
        totalCreditHours: program.totalCreditHours,
        departmentId: program.departmentId,
        description: program.description,
        isActive: program.isActive,
      });
    } catch (error: any) {
      message.error(error.message || 'Failed to load program');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values: any) => {
    try {
      setLoading(true);
      
      if (isEdit && id) {
        await academicAPI.updateProgram(id, values);
        message.success('Program updated successfully');
      } else {
        const programData: CreateProgramDTO = {
          code: values.code,
          name: values.name,
          degreeLevel: values.degreeLevel,
          duration: values.duration,
          totalCreditHours: values.totalCreditHours,
          departmentId: values.departmentId,
          description: values.description,
        };
        await academicAPI.createProgram(programData);
        message.success('Program created successfully');
      }
      
      navigate(route.ACADEMIC_PROGRAM_LIST);
    } catch (error: any) {
      message.error(error.message || 'Failed to save program');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card
      title={isEdit ? 'Edit Program' : 'New Academic Program'}
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
        initialValues={{
          degreeLevel: 'undergraduate',
          duration: 4,
          totalCreditHours: 130,
        }}
      >
        <Form.Item
          name="code"
          label="Program Code"
          rules={[
            { required: true, message: 'Please enter program code' },
            { pattern: /^[A-Z0-9-]+$/, message: 'Code should contain only uppercase letters, numbers, and hyphens' },
          ]}
        >
          <Input placeholder="e.g., BS-CS, MS-IT" disabled={isEdit} />
        </Form.Item>

        <Form.Item
          name="name"
          label="Program Name"
          rules={[{ required: true, message: 'Please enter program name' }]}
        >
          <Input placeholder="Bachelor of Science in Computer Science" />
        </Form.Item>

        <Form.Item
          name="degreeLevel"
          label="Degree Level"
          rules={[{ required: true, message: 'Please select degree level' }]}
        >
          <Select placeholder="Select Degree Level">
            <Option value="undergraduate">Undergraduate</Option>
            <Option value="graduate">Graduate</Option>
            <Option value="doctoral">Doctoral</Option>
          </Select>
        </Form.Item>

        <Space style={{ width: '100%' }} direction="horizontal">
          <Form.Item
            name="duration"
            label="Duration (Years)"
            rules={[
              { required: true, message: 'Please enter duration' },
              { type: 'number', min: 1, max: 10, message: 'Duration must be between 1 and 10 years' },
            ]}
            style={{ flex: 1 }}
          >
            <InputNumber min={1} max={10} style={{ width: '100%' }} placeholder="4" />
          </Form.Item>

          <Form.Item
            name="totalCreditHours"
            label="Total Credit Hours"
            rules={[
              { required: true, message: 'Please enter total credit hours' },
              { type: 'number', min: 1, message: 'Credit hours must be greater than 0' },
            ]}
            style={{ flex: 1 }}
          >
            <InputNumber min={1} style={{ width: '100%' }} placeholder="130" />
          </Form.Item>
        </Space>

        <Form.Item
          name="departmentId"
          label="Department (Optional)"
        >
          <Select placeholder="Select Department" allowClear>
            {/* Departments would come from API */}
            <Option value="dept1">Computer Science</Option>
            <Option value="dept2">Information Technology</Option>
            <Option value="dept3">Software Engineering</Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="description"
          label="Description (Optional)"
        >
          <TextArea rows={4} placeholder="Program description..." />
        </Form.Item>

        {isEdit && (
          <Form.Item
            name="isActive"
            label="Status"
            valuePropName="checked"
          >
            <Select>
              <Option value={true}>Active</Option>
              <Option value={false}>Inactive</Option>
            </Select>
          </Form.Item>
        )}

        <Form.Item>
          <Space>
            <Button type="primary" htmlType="submit" loading={loading} icon={<SaveOutlined />}>
              {isEdit ? 'Update Program' : 'Create Program'}
            </Button>
            <Button onClick={() => navigate(-1)}>Cancel</Button>
          </Space>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default ProgramForm;

