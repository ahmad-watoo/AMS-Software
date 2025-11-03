import React, { useState } from 'react';
import { Form, Input, Button, Card, message, Space, Select, InputNumber } from 'antd';
import { SaveOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import certificationAPI, { CreateCertificateRequestDTO } from '../../../../api/certification.api';

const { Option } = Select;
const { TextArea } = Input;

const CertificateRequestForm: React.FC = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values: any) => {
    try {
      setLoading(true);

      const requestData: CreateCertificateRequestDTO = {
        studentId: values.studentId,
        certificateType: values.certificateType,
        purpose: values.purpose,
        feeAmount: values.feeAmount,
        deliveryMethod: values.deliveryMethod,
        deliveryAddress: values.deliveryAddress,
        remarks: values.remarks,
      };

      await certificationAPI.createCertificateRequest(requestData);
      message.success('Certificate request submitted successfully');
      navigate('/certification/requests');
    } catch (error: any) {
      message.error(error.message || 'Failed to submit certificate request');
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
          certificateType: 'transcript',
          deliveryMethod: 'pickup',
        }}
      >
        <Form.Item
          label="Student ID"
          name="studentId"
          rules={[{ required: true, message: 'Please enter student ID' }]}
        >
          <Input placeholder="Enter student ID" />
        </Form.Item>

        <Form.Item
          label="Certificate Type"
          name="certificateType"
          rules={[{ required: true, message: 'Please select certificate type' }]}
        >
          <Select placeholder="Select Certificate Type">
            <Option value="degree">Degree</Option>
            <Option value="transcript">Transcript</Option>
            <Option value="character">Character Certificate</Option>
            <Option value="bonafide">Bonafide Certificate</Option>
            <Option value="course_completion">Course Completion</Option>
            <Option value="attendance">Attendance Certificate</Option>
            <Option value="other">Other</Option>
          </Select>
        </Form.Item>

        <Form.Item
          label="Purpose"
          name="purpose"
          rules={[{ required: true, message: 'Please enter purpose' }]}
        >
          <TextArea rows={3} placeholder="Enter purpose for certificate request" />
        </Form.Item>

        <Space style={{ width: '100%' }} size="middle">
          <Form.Item
            label="Fee Amount (PKR)"
            name="feeAmount"
            style={{ width: '48%' }}
          >
            <InputNumber
              style={{ width: '100%' }}
              min={0}
              formatter={(value) => `PKR ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={(value) => Number((value || '').replace(/PKR\s?|(,*)/g, '')) as any}
              placeholder="Enter fee amount"
            />
          </Form.Item>

          <Form.Item
            label="Delivery Method"
            name="deliveryMethod"
            rules={[{ required: true, message: 'Please select delivery method' }]}
            style={{ width: '48%' }}
          >
            <Select placeholder="Select Delivery Method">
              <Option value="pickup">Pickup</Option>
              <Option value="email">Email</Option>
              <Option value="postal">Postal</Option>
            </Select>
          </Form.Item>
        </Space>

        <Form.Item
          label="Delivery Address"
          name="deliveryAddress"
          dependencies={['deliveryMethod']}
          rules={[
            {
              required: true,
              validator: (_, value) => {
                const deliveryMethod = form.getFieldValue('deliveryMethod');
                if ((deliveryMethod === 'postal' || deliveryMethod === 'email') && !value) {
                  return Promise.reject('Delivery address is required');
                }
                return Promise.resolve();
              },
            },
          ]}
        >
          <TextArea rows={3} placeholder="Enter delivery address (required for postal/email)" />
        </Form.Item>

        <Form.Item label="Remarks" name="remarks">
          <TextArea rows={3} placeholder="Enter any additional remarks (optional)" />
        </Form.Item>

        <Form.Item>
          <Space>
            <Button type="primary" htmlType="submit" loading={loading} icon={<SaveOutlined />}>
              Submit Request
            </Button>
            <Button onClick={() => navigate('/certification/requests')} icon={<ArrowLeftOutlined />}>
              Cancel
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default CertificateRequestForm;

