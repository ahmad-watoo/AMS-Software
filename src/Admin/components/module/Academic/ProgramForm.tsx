import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Card, message, Space, Select, InputNumber, Switch, Typography, Divider, Skeleton, Row, Col } from 'antd';
import { SaveOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { academicAPI, CreateProgramDTO, Program } from '../../../../api/academic.api';
import { useNavigate, useParams } from 'react-router-dom';
import { route } from '../../../routes/constant';

const { Option } = Select;
const { TextArea } = Input;
const { Title, Paragraph } = Typography;

interface ProgramFormProps {
  isEdit?: boolean;
}

interface DepartmentOption {
  id: string;
  name: string;
}

const ProgramForm: React.FC<ProgramFormProps> = ({ isEdit = false }) => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(false);
  const [departments, setDepartments] = useState<DepartmentOption[]>([]);

  useEffect(() => {
    loadDepartments();
    if (isEdit && id) {
      loadProgram(id);
    }
  }, [id, isEdit]);

  const loadDepartments = async () => {
    try {
      const response = await academicAPI.getPrograms(1, 1); // placeholder to reuse API client; ideally replace with dedicated departments API when available
      const uniqueDepartments = new Map<string, DepartmentOption>();
      (response.programs || []).forEach((program) => {
        if (program.departmentId && program.departmentId.length > 0 && program.departmentId !== 'unknown') {
          uniqueDepartments.set(program.departmentId, {
            id: program.departmentId,
            name: program.departmentId,
          });
        }
      });
      setDepartments(Array.from(uniqueDepartments.values()));
    } catch (error) {
      console.warn('Failed to load departments; using manual entry');
    }
  };

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
    <div style={{ padding: 24 }}>
      <Card
        style={{ maxWidth: 960, margin: '0 auto', borderRadius: 16 }}
        bodyStyle={{ padding: 32 }}
      >
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <Space align="baseline" style={{ justifyContent: 'space-between', width: '100%' }}>
            <div>
              <Title level={3} style={{ marginBottom: 4 }}>
                {isEdit ? 'Edit Academic Program' : 'Create Academic Program'}
              </Title>
              <Paragraph type="secondary" style={{ marginBottom: 0 }}>
                Define program structure, credit requirements, and publication status for your institution.
              </Paragraph>
            </div>
            <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)}>
              Back
            </Button>
          </Space>

          <Divider style={{ margin: '12px 0' }} />

          {loading && isEdit ? (
            <Skeleton active paragraph={{ rows: 6 }} />
          ) : (
            <Form
              form={form}
              layout="vertical"
              onFinish={handleSubmit}
              initialValues={{
                degreeLevel: 'undergraduate',
                duration: 4,
                totalCreditHours: 130,
              }}
              style={{ width: '100%' }}
            >
              <Row gutter={24}>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="code"
                    label="Program Code"
                    rules={[
                      { required: true, message: 'Please enter program code' },
                      {
                        pattern: /^[A-Z0-9-]+$/,
                        message: 'Use uppercase letters, numbers, and hyphens only',
                      },
                    ]}
                  >
                    <Input placeholder="e.g., BS-CS, MS-IT" disabled={isEdit} size="large" />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="name"
                    label="Program Name"
                    rules={[{ required: true, message: 'Please enter program name' }]}
                  >
                    <Input placeholder="Bachelor of Science in Computer Science" size="large" />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={24}>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="degreeLevel"
                    label="Degree Level"
                    rules={[{ required: true, message: 'Please select degree level' }]}
                  >
                    <Select placeholder="Select degree level" size="large">
                      <Option value="undergraduate">Undergraduate</Option>
                      <Option value="graduate">Graduate</Option>
                      <Option value="doctoral">Doctoral</Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col xs={24} md={6}>
                  <Form.Item
                    name="duration"
                    label="Duration (Years)"
                    rules={[
                      { required: true, message: 'Please enter duration' },
                      { type: 'number', min: 1, max: 10, message: 'Must be between 1 and 10 years' },
                    ]}
                  >
                    <InputNumber min={1} max={10} style={{ width: '100%' }} size="large" />
                  </Form.Item>
                </Col>
                <Col xs={24} md={6}>
                  <Form.Item
                    name="totalCreditHours"
                    label="Total Credit Hours"
                    rules={[
                      { required: true, message: 'Please enter total credit hours' },
                      { type: 'number', min: 1, message: 'Must be greater than 0' },
                    ]}
                  >
                    <InputNumber min={1} style={{ width: '100%' }} size="large" />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={24}>
                <Col xs={24} md={12}>
                  <Form.Item name="departmentId" label="Department">
                    <Select
                      placeholder="Select Department"
                      allowClear
                      size="large"
                      showSearch
                      optionFilterProp="children"
                    >
                      {departments.length === 0 ? (
                        <Option value="engineering">Engineering</Option>
                      ) : (
                        departments.map((department) => (
                          <Option key={department.id} value={department.id}>
                            {department.name}
                          </Option>
                        ))
                      )}
                    </Select>
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  {isEdit && (
                    <Form.Item name="isActive" label="Status">
                      <Select size="large">
                        <Option value={true}>Active</Option>
                        <Option value={false}>Inactive</Option>
                      </Select>
                    </Form.Item>
                  )}
                </Col>
              </Row>

              <Form.Item name="description" label="Program Description">
                <TextArea rows={4} placeholder="Program overview, learning outcomes, accreditation notes..." />
              </Form.Item>

              <Divider style={{ margin: '12px 0' }} />

              <Space>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  icon={<SaveOutlined />}
                  size="large"
                >
                  {isEdit ? 'Update Program' : 'Create Program'}
                </Button>
                <Button size="large" onClick={() => navigate(-1)}>
                  Cancel
                </Button>
              </Space>
            </Form>
          )}
        </Space>
      </Card>
    </div>
  );
};

export default ProgramForm;

