import React, { useState } from 'react';
import {
  Card,
  Form,
  Input,
  Button,
  Space,
  Typography,
  Alert,
  Descriptions,
  Tag,
  Divider,
  Row,
  Col,
  message,
  Spin,
  Empty,
} from 'antd';
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  QrcodeOutlined,
  FileTextOutlined,
  SearchOutlined,
  ReloadOutlined,
  SafetyCertificateOutlined,
} from '@ant-design/icons';
import certificationAPI, {
  CertificateVerificationResult,
  VerifyCertificateDTO,
} from '@/api/certification.api';

const { Title, Text, Paragraph } = Typography;

const Verification: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [verificationResult, setVerificationResult] = useState<CertificateVerificationResult | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const handleVerify = async (values: VerifyCertificateDTO) => {
    try {
      setLoading(true);
      setHasSearched(true);
      const result = await certificationAPI.verifyCertificate(values);
      setVerificationResult(result);
      
      if (result.isValid) {
        message.success('Certificate verified successfully!');
      } else {
        message.warning('Certificate verification failed');
      }
    } catch (error: any) {
      message.error(error.message || 'Failed to verify certificate');
      setVerificationResult({
        isValid: false,
        message: error.message || 'Certificate not found or invalid',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    form.resetFields();
    setVerificationResult(null);
    setHasSearched(false);
  };

  const formatCertificateType = (type: string) => {
    return type
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <div style={{ padding: 24, maxWidth: 1200, margin: '0 auto' }}>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        {/* Header */}
        <Card
          bordered={false}
          style={{
            background: 'linear-gradient(135deg, rgba(114,46,209,0.1) 0%, rgba(114,46,209,0.05) 100%)',
            textAlign: 'center',
          }}
        >
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            <SafetyCertificateOutlined style={{ fontSize: 64, color: '#722ed1' }} />
            <Title level={2} style={{ marginBottom: 8 }}>
              Certificate Verification Portal
            </Title>
            <Paragraph style={{ fontSize: 16, marginBottom: 0 }}>
              Verify the authenticity of certificates issued by our institution.
              Enter the verification code or certificate number to check validity.
            </Paragraph>
          </Space>
        </Card>

        {/* Verification Form */}
        <Card
          title={
            <Space>
              <QrcodeOutlined />
              <span>Verify Certificate</span>
            </Space>
          }
          bordered={false}
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={handleVerify}
            initialValues={{
              verificationCode: '',
              certificateNumber: '',
            }}
          >
            <Row gutter={[16, 16]}>
              <Col xs={24} md={12}>
                <Form.Item
                  label="Verification Code"
                  name="verificationCode"
                  tooltip="Enter the unique verification code found on the certificate"
                  rules={[
                    {
                      validator: (_, value) => {
                        if (!value && !form.getFieldValue('certificateNumber')) {
                          return Promise.reject(
                            new Error('Please enter either verification code or certificate number')
                          );
                        }
                        return Promise.resolve();
                      },
                    },
                  ]}
                >
                  <Input
                    placeholder="e.g., VER-ABC123DEF456"
                    size="large"
                    prefix={<QrcodeOutlined />}
                    allowClear
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item
                  label="Certificate Number"
                  name="certificateNumber"
                  tooltip="Enter the certificate number (alternative to verification code)"
                >
                  <Input
                    placeholder="e.g., CERT-2024-0115-12345"
                    size="large"
                    prefix={<FileTextOutlined />}
                    allowClear
                  />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item>
              <Space>
                <Button
                  type="primary"
                  htmlType="submit"
                  icon={<SearchOutlined />}
                  loading={loading}
                  size="large"
                >
                  Verify Certificate
                </Button>
                {hasSearched && (
                  <Button icon={<ReloadOutlined />} onClick={handleReset} size="large">
                    Reset
                  </Button>
                )}
              </Space>
            </Form.Item>
          </Form>
        </Card>

        {/* Verification Result */}
        {hasSearched && (
          <Card bordered={false}>
            {loading ? (
              <div style={{ textAlign: 'center', padding: '40px' }}>
                <Spin size="large" />
                <div style={{ marginTop: 16 }}>
                  <Text>Verifying certificate...</Text>
                </div>
              </div>
            ) : verificationResult?.isValid ? (
              <Space direction="vertical" size="large" style={{ width: '100%' }}>
                <Alert
                  message="Certificate Verified Successfully"
                  description="This certificate is authentic and has been verified by our system."
                  type="success"
                  icon={<CheckCircleOutlined />}
                  showIcon
                  style={{ fontSize: 16 }}
                />

                {verificationResult.certificate && (
                  <>
                    <Divider />
                    <Title level={4}>
                      <FileTextOutlined /> Certificate Details
                    </Title>
                    <Descriptions
                      bordered
                      column={{ xs: 1, sm: 2, md: 2 }}
                      size="middle"
                    >
                      <Descriptions.Item label="Certificate Number" span={2}>
                        <Text strong style={{ fontSize: 16 }}>
                          {verificationResult.certificate.certificateNumber}
                        </Text>
                      </Descriptions.Item>
                      <Descriptions.Item label="Verification Code" span={2}>
                        <code
                          style={{
                            fontSize: 14,
                            background: '#f0f0f0',
                            padding: '4px 8px',
                            borderRadius: 4,
                            fontFamily: 'monospace',
                          }}
                        >
                          {verificationResult.certificate.verificationCode}
                        </code>
                      </Descriptions.Item>
                      <Descriptions.Item label="Certificate Type">
                        <Tag color="blue" style={{ fontSize: 14 }}>
                          {formatCertificateType(verificationResult.certificate.certificateType)}
                        </Tag>
                      </Descriptions.Item>
                      <Descriptions.Item label="Issue Date">
                        {new Date(verificationResult.certificate.issueDate).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </Descriptions.Item>
                      {verificationResult.certificate.expiryDate && (
                        <Descriptions.Item label="Expiry Date">
                          {new Date(verificationResult.certificate.expiryDate).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </Descriptions.Item>
                      )}
                      {verificationResult.studentName && (
                        <Descriptions.Item label="Student Name" span={2}>
                          <Text strong>{verificationResult.studentName}</Text>
                        </Descriptions.Item>
                      )}
                      <Descriptions.Item label="Verification Status">
                        <Tag color={verificationResult.certificate.isVerified ? 'green' : 'default'}>
                          {verificationResult.certificate.isVerified
                            ? 'Previously Verified'
                            : 'First Time Verification'}
                        </Tag>
                      </Descriptions.Item>
                      {verificationResult.certificate.verifiedAt && (
                        <Descriptions.Item label="Last Verified">
                          {new Date(verificationResult.certificate.verifiedAt).toLocaleString()}
                        </Descriptions.Item>
                      )}
                    </Descriptions>

                    {verificationResult.certificate.metadata && (
                      <>
                        <Divider />
                        <Title level={5}>Additional Information</Title>
                        <Descriptions bordered column={{ xs: 1, sm: 2 }} size="small">
                          {Object.entries(verificationResult.certificate.metadata).map(([key, value]) => (
                            <Descriptions.Item key={key} label={key.charAt(0).toUpperCase() + key.slice(1)}>
                              {String(value)}
                            </Descriptions.Item>
                          ))}
                        </Descriptions>
                      </>
                    )}

                    {verificationResult.certificate.pdfUrl && (
                      <>
                        <Divider />
                        <Space>
                          <Button
                            type="primary"
                            icon={<FileTextOutlined />}
                            href={verificationResult.certificate.pdfUrl}
                            target="_blank"
                          >
                            Download Certificate PDF
                          </Button>
                          {verificationResult.certificate.qrCodeUrl && (
                            <Button
                              icon={<QrcodeOutlined />}
                              href={verificationResult.certificate.qrCodeUrl}
                              target="_blank"
                            >
                              View QR Code
                            </Button>
                          )}
                        </Space>
                      </>
                    )}
                  </>
                )}
              </Space>
            ) : (
              <Space direction="vertical" size="large" style={{ width: '100%' }}>
                <Alert
                  message="Certificate Verification Failed"
                  description={
                    verificationResult?.message ||
                    'The certificate could not be verified. Please check the verification code or certificate number and try again.'
                  }
                  type="error"
                  icon={<CloseCircleOutlined />}
                  showIcon
                  style={{ fontSize: 16 }}
                />

                <Card size="small" style={{ background: '#fff7e6' }}>
                  <Space direction="vertical" size="small">
                    <Text strong>Possible reasons:</Text>
                    <ul style={{ marginBottom: 0, paddingLeft: 20 }}>
                      <li>The verification code or certificate number is incorrect</li>
                      <li>The certificate has been revoked or cancelled</li>
                      <li>The certificate does not exist in our system</li>
                      <li>There was an error processing your request</li>
                    </ul>
                  </Space>
                </Card>

                <div style={{ textAlign: 'center' }}>
                  <Button type="primary" icon={<ReloadOutlined />} onClick={handleReset}>
                    Try Again
                  </Button>
                </div>
              </Space>
            )}
          </Card>
        )}

        {/* Information Card */}
        {!hasSearched && (
          <Card
            title={
              <Space>
                <SafetyCertificateOutlined />
                <span>How to Verify</span>
              </Space>
            }
            bordered={false}
            style={{ background: '#f0f5ff' }}
          >
            <Row gutter={[16, 16]}>
              <Col xs={24} md={12}>
                <Card size="small" bordered={false}>
                  <Space direction="vertical" size="small">
                    <Text strong>
                      <QrcodeOutlined /> Using Verification Code
                    </Text>
                    <Text type="secondary">
                      Enter the unique verification code printed on your certificate. This code is
                      typically found at the bottom of the certificate or in a QR code.
                    </Text>
                  </Space>
                </Card>
              </Col>
              <Col xs={24} md={12}>
                <Card size="small" bordered={false}>
                  <Space direction="vertical" size="small">
                    <Text strong>
                      <FileTextOutlined /> Using Certificate Number
                    </Text>
                    <Text type="secondary">
                      Alternatively, you can enter the certificate number. This is usually printed
                      prominently on the certificate document.
                    </Text>
                  </Space>
                </Card>
              </Col>
            </Row>
          </Card>
        )}
      </Space>
    </div>
  );
};

export default Verification;
