import React, { useState, useEffect } from 'react';
import { Card, Form, Input, Button, Space, message, Descriptions, Tag, Alert, Table, Modal } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined, SaveOutlined } from '@ant-design/icons';
import { admissionAPI, EligibilityCheckDTO, EligibilityResult } from '@/api/admission.api';
import { useNavigate, useSearchParams } from 'react-router-dom';

const { TextArea } = Input;

const EligibilityCheck: React.FC = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const applicationId = searchParams.get('applicationId');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<EligibilityResult | null>(null);
  const [programId, setProgramId] = useState('');

  useEffect(() => {
    if (applicationId) {
      loadApplication();
    }
  }, [applicationId]);

  const loadApplication = async () => {
    if (!applicationId) return;
    try {
      const application = await admissionAPI.getApplication(applicationId);
      setProgramId(application.programId);
      form.setFieldsValue({
        applicationId: application.id,
        programId: application.programId,
      });
    } catch (error: any) {
      message.error(error.message || 'Failed to load application');
    }
  };

  const handleSubmit = async (values: any) => {
    try {
      setLoading(true);
      
      const checkData: EligibilityCheckDTO = {
        applicationId: values.applicationId || applicationId || '',
        programId: values.programId || programId,
        academicHistory: values.academicHistory || [],
        testScores: {
          entryTest: values.entryTestScore,
          interview: values.interviewScore,
        },
      };

      const eligibilityResult = await admissionAPI.checkEligibility(checkData);
      setResult(eligibilityResult);
      
      if (eligibilityResult.eligible) {
        message.success('Eligibility check completed. Applicant is eligible!');
      } else {
        message.warning('Eligibility check completed. Applicant is not eligible.');
      }
    } catch (error: any) {
      message.error(error.message || 'Failed to check eligibility');
    } finally {
      setLoading(false);
    }
  };

  const academicHistoryColumns = [
    {
      title: 'Degree',
      dataIndex: 'degree',
      key: 'degree',
    },
    {
      title: 'Marks (%)',
      dataIndex: 'marks',
      key: 'marks',
    },
    {
      title: 'CGPA',
      dataIndex: 'cgpa',
      key: 'cgpa',
    },
    {
      title: 'Year',
      dataIndex: 'year',
      key: 'year',
    },
  ];

  return (
    <Card
      title="Eligibility Check"
      style={{ margin: 20, boxShadow: 'rgba(0, 0, 0, 0.16) 0px 1px 4px' }}
    >
      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        <Form.Item
          name="applicationId"
          label="Application ID"
          rules={[{ required: true, message: 'Application ID is required' }]}
        >
          <Input disabled={!!applicationId} placeholder="Application ID" />
        </Form.Item>

        <Form.Item
          name="programId"
          label="Program ID"
          rules={[{ required: true, message: 'Program ID is required' }]}
        >
          <Input disabled={!!programId} placeholder="Program ID" />
        </Form.Item>

        <Form.Item
          label="Academic History"
          required
        >
          <Form.List name="academicHistory">
            {(fields, { add, remove }) => (
              <>
                {fields.map((field, index) => (
                  <Space key={field.key} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                    <Form.Item
                      {...field}
                      name={[field.name, 'degree']}
                      rules={[{ required: true, message: 'Degree is required' }]}
                    >
                      <Input placeholder="Degree (e.g., Intermediate)" />
                    </Form.Item>
                    <Form.Item
                      {...field}
                      name={[field.name, 'marks']}
                      rules={[{ required: true, message: 'Marks are required' }]}
                    >
                      <Input type="number" placeholder="Marks %" />
                    </Form.Item>
                    <Form.Item
                      {...field}
                      name={[field.name, 'cgpa']}
                    >
                      <Input type="number" step="0.01" placeholder="CGPA" />
                    </Form.Item>
                    <Form.Item
                      {...field}
                      name={[field.name, 'year']}
                      rules={[{ required: true, message: 'Year is required' }]}
                    >
                      <Input type="number" placeholder="Year" />
                    </Form.Item>
                    <Button type="link" onClick={() => remove(field.name)}>
                      Remove
                    </Button>
                  </Space>
                ))}
                <Form.Item>
                  <Button type="dashed" onClick={() => add()} block>
                    Add Academic Record
                  </Button>
                </Form.Item>
              </>
            )}
          </Form.List>
        </Form.Item>

        <Form.Item label="Test Scores (Optional)">
          <Space direction="vertical" style={{ width: '100%' }}>
            <Form.Item name="entryTestScore" label="Entry Test Score">
              <Input type="number" placeholder="Entry Test Score (0-100)" />
            </Form.Item>
            <Form.Item name="interviewScore" label="Interview Score">
              <Input type="number" placeholder="Interview Score (0-100)" />
            </Form.Item>
          </Space>
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading} icon={<CheckCircleOutlined />}>
            Check Eligibility
          </Button>
        </Form.Item>
      </Form>

      {result && (
        <Card
          title="Eligibility Result"
          style={{ marginTop: 20 }}
          extra={
            <Tag color={result.eligible ? 'success' : 'error'} style={{ fontSize: 16, padding: '4px 12px' }}>
              {result.eligible ? 'ELIGIBLE' : 'NOT ELIGIBLE'}
            </Tag>
          }
        >
          <Descriptions bordered column={2}>
            <Descriptions.Item label="Eligibility Status">
              <Tag color={result.eligible ? 'success' : 'error'}>
                {result.eligible ? 'Eligible' : 'Not Eligible'}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Eligibility Score">
              <strong>{result.score.toFixed(2)}%</strong>
            </Descriptions.Item>
          </Descriptions>

          {result.reasons && result.reasons.length > 0 && (
            <div style={{ marginTop: 20 }}>
              <Alert
                message="Eligibility Check Notes"
                description={
                  <ul>
                    {result.reasons.map((reason: string, index: number) => (
                      <li key={index}>{reason}</li>
                    ))}
                  </ul>
                }
                type={result.eligible ? 'success' : 'error'}
                showIcon
              />
            </div>
          )}

          {result.criteria && (
            <Card title="Eligibility Criteria" style={{ marginTop: 20 }} size="small">
              <Descriptions bordered column={1}>
                {result.criteria.minimumMarks && (
                  <Descriptions.Item label="Minimum Marks Required">
                    {result.criteria.minimumMarks}%
                  </Descriptions.Item>
                )}
                {result.criteria.minimumCGPA && (
                  <Descriptions.Item label="Minimum CGPA Required">
                    {result.criteria.minimumCGPA}
                  </Descriptions.Item>
                )}
                {result.criteria.ageLimit && (
                  <Descriptions.Item label="Age Limit">
                    {result.criteria.ageLimit} years
                  </Descriptions.Item>
                )}
              </Descriptions>
            </Card>
          )}
        </Card>
      )}
    </Card>
  );
};

export default EligibilityCheck;
