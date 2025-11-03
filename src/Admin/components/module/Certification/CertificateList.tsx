import React, { useState, useEffect } from 'react';
import { Table, Button, Select, Space, Tag, Card, message, Modal } from 'antd';
import { CheckOutlined, EyeOutlined, FilePdfOutlined, QrcodeOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import certificationAPI, { Certificate } from '@/api/certification.api';
import PermissionGuard from '@/components/common/PermissionGuard';

const { Option } = Select;

const CertificateList: React.FC = () => {
  const navigate = useNavigate();
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 20,
    total: 0,
  });
  const [filters, setFilters] = useState({
    certificateType: undefined as string | undefined,
    studentId: undefined as string | undefined,
  });

  useEffect(() => {
    fetchCertificates();
  }, [pagination.current, pagination.pageSize, filters]);

  const fetchCertificates = async () => {
    setLoading(true);
    try {
      const response = await certificationAPI.getAllCertificates({
        certificateType: filters.certificateType,
        studentId: filters.studentId,
        page: pagination.current,
        limit: pagination.pageSize,
      });

      setCertificates(response.certificates || []);
      setPagination({
        ...pagination,
        total: response.pagination?.total || 0,
      });
    } catch (error: any) {
      message.error(error.message || 'Failed to fetch certificates');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkReady = (id: string) => {
    Modal.confirm({
      title: 'Mark Certificate as Ready',
      content: 'Are you sure you want to mark this certificate as ready for delivery?',
      okText: 'Yes, Mark Ready',
      okType: 'primary',
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          await certificationAPI.markCertificateAsReady(id);
          message.success('Certificate marked as ready successfully');
          fetchCertificates();
        } catch (error: any) {
          message.error(error.message || 'Failed to mark certificate as ready');
        }
      },
    });
  };

  const columns = [
    {
      title: 'Certificate Number',
      dataIndex: 'certificateNumber',
      key: 'certificateNumber',
    },
    {
      title: 'Student ID',
      dataIndex: 'studentId',
      key: 'studentId',
    },
    {
      title: 'Certificate Type',
      dataIndex: 'certificateType',
      key: 'certificateType',
      render: (type: string) => (
        <Tag color="blue">{type.charAt(0).toUpperCase() + type.slice(1)}</Tag>
      ),
    },
    {
      title: 'Issue Date',
      dataIndex: 'issueDate',
      key: 'issueDate',
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
    {
      title: 'Verification Code',
      dataIndex: 'verificationCode',
      key: 'verificationCode',
      render: (code: string) => (
        <code style={{ fontSize: '12px', background: '#f0f0f0', padding: '2px 6px', borderRadius: '3px' }}>
          {code}
        </code>
      ),
    },
    {
      title: 'Verified',
      dataIndex: 'isVerified',
      key: 'isVerified',
      render: (isVerified: boolean) => (
        <Tag color={isVerified ? 'green' : 'default'}>
          {isVerified ? 'Yes' : 'No'}
        </Tag>
      ),
    },
    {
      title: 'Files',
      key: 'files',
      render: (_: any, record: Certificate) => (
        <Space>
          {record.pdfUrl && (
            <Button
              type="link"
              size="small"
              icon={<FilePdfOutlined />}
              onClick={() => window.open(record.pdfUrl, '_blank')}
            >
              PDF
            </Button>
          )}
          {record.qrCodeUrl && (
            <Button
              type="link"
              size="small"
              icon={<QrcodeOutlined />}
              onClick={() => window.open(record.qrCodeUrl, '_blank')}
            >
              QR
            </Button>
          )}
          {!record.pdfUrl && !record.qrCodeUrl && '-'}
        </Space>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: Certificate) => (
        <Space size="middle">
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => navigate(`/certification/certificates/${record.id}`)}
          >
            View
          </Button>
          {!record.pdfUrl && (
            <PermissionGuard permission="certification" action="update">
              <Button
                type="link"
                icon={<CheckOutlined />}
                onClick={() => handleMarkReady(record.id)}
                style={{ color: 'green' }}
              >
                Mark Ready
              </Button>
            </PermissionGuard>
          )}
        </Space>
      ),
    },
  ];

  return (
    <Card>
      <Space direction="vertical" style={{ width: '100%' }} size="large">
        <Space style={{ width: '100%', justifyContent: 'space-between', flexWrap: 'wrap' }}>
          <Space wrap>
            <Select
              placeholder="Filter by Type"
              style={{ width: 150 }}
              allowClear
              value={filters.certificateType}
              onChange={(value) => setFilters({ ...filters, certificateType: value })}
            >
              <Option value="degree">Degree</Option>
              <Option value="transcript">Transcript</Option>
              <Option value="character">Character</Option>
              <Option value="bonafide">Bonafide</Option>
              <Option value="course_completion">Course Completion</Option>
            </Select>
          </Space>
        </Space>

        <Table
          columns={columns}
          dataSource={certificates}
          rowKey="id"
          loading={loading}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} certificates`,
            onChange: (page, pageSize) => {
              setPagination({ ...pagination, current: page, pageSize });
            },
          }}
        />
      </Space>
    </Card>
  );
};

export default CertificateList;

