import React, { useState, useEffect } from 'react';
import { Card, Descriptions, Tag, Button, Space, message, Spin, QRCode } from 'antd';
import { ArrowLeftOutlined, FilePdfOutlined, QrcodeOutlined, CheckOutlined } from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import certificationAPI, { Certificate } from '@/api/certification.api';
import PermissionGuard from '@/components/common/PermissionGuard';

const CertificateDetail: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [certificate, setCertificate] = useState<Certificate | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadCertificate(id);
    }
  }, [id]);

  const loadCertificate = async (certificateId: string) => {
    try {
      setLoading(true);
      const cert = await certificationAPI.getCertificateById(certificateId);
      setCertificate(cert);
    } catch (error: any) {
      message.error(error.message || 'Failed to load certificate details');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!certificate) {
    return <Card>Certificate not found</Card>;
  }

  return (
    <Card
      title="Certificate Details"
      extra={
        <Space>
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/certification/certificates')}>
            Back
          </Button>
          {certificate.pdfUrl && (
            <Button
              type="primary"
              icon={<FilePdfOutlined />}
              onClick={() => window.open(certificate.pdfUrl, '_blank')}
            >
              Download PDF
            </Button>
          )}
        </Space>
      }
    >
      <Descriptions bordered column={2}>
        <Descriptions.Item label="Certificate Number">{certificate.certificateNumber}</Descriptions.Item>
        <Descriptions.Item label="Student ID">{certificate.studentId}</Descriptions.Item>
        <Descriptions.Item label="Certificate Type">
          <Tag color="blue">{certificate.certificateType}</Tag>
        </Descriptions.Item>
        <Descriptions.Item label="Issue Date">
          {new Date(certificate.issueDate).toLocaleDateString()}
        </Descriptions.Item>
        <Descriptions.Item label="Expiry Date">
          {certificate.expiryDate ? new Date(certificate.expiryDate).toLocaleDateString() : 'No Expiry'}
        </Descriptions.Item>
        <Descriptions.Item label="Verification Status">
          <Tag color={certificate.isVerified ? 'green' : 'default'}>
            {certificate.isVerified ? 'Verified' : 'Not Verified'}
          </Tag>
        </Descriptions.Item>
        <Descriptions.Item label="Verification Code" span={2}>
          <code style={{ fontSize: '14px', background: '#f0f0f0', padding: '8px 12px', borderRadius: '4px' }}>
            {certificate.verificationCode}
          </code>
        </Descriptions.Item>
        {certificate.verifiedAt && (
          <>
            <Descriptions.Item label="Verified At">
              {new Date(certificate.verifiedAt).toLocaleString()}
            </Descriptions.Item>
            <Descriptions.Item label="Verified By">{certificate.verifiedBy || '-'}</Descriptions.Item>
          </>
        )}
        <Descriptions.Item label="Created At">
          {new Date(certificate.createdAt).toLocaleString()}
        </Descriptions.Item>
      </Descriptions>

      {certificate.qrCodeUrl && (
        <Card title="QR Code" style={{ marginTop: 16, textAlign: 'center' }}>
          <QRCode value={certificate.verificationCode} size={200} />
          <p style={{ marginTop: 16, color: '#666' }}>
            Scan this QR code to verify the certificate
          </p>
        </Card>
      )}
    </Card>
  );
};

export default CertificateDetail;

