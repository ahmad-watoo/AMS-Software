import React, { useState, useEffect } from 'react';
import { Card, Descriptions, Tag, Button, Space, message, Spin, Modal } from 'antd';
import { ArrowLeftOutlined, CheckOutlined, CloseOutlined, DollarOutlined } from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import certificationAPI, { CertificateRequest, ApproveCertificateRequestDTO } from '@/api/certification.api';
import PermissionGuard from '@/components/common/PermissionGuard';

const CertificateRequestDetail: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [request, setRequest] = useState<CertificateRequest | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadRequest(id);
    }
  }, [id]);

  const loadRequest = async (requestId: string) => {
    try {
      setLoading(true);
      const req = await certificationAPI.getCertificateRequestById(requestId);
      setRequest(req);
    } catch (error: any) {
      message.error(error.message || 'Failed to load certificate request details');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = () => {
    if (!request) return;
    Modal.confirm({
      title: 'Approve Certificate Request',
      content: 'Are you sure you want to approve this certificate request?',
      okText: 'Yes, Approve',
      okType: 'primary',
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          const approveData: ApproveCertificateRequestDTO = {
            status: 'approved',
            remarks: 'Certificate request approved',
          };
          await certificationAPI.approveCertificateRequest(request.id, approveData);
          message.success('Certificate request approved successfully');
          loadRequest(id!);
        } catch (error: any) {
          message.error(error.message || 'Failed to approve certificate request');
        }
      },
    });
  };

  const handleReject = () => {
    if (!request) return;
    Modal.confirm({
      title: 'Reject Certificate Request',
      content: 'Are you sure you want to reject this certificate request?',
      okText: 'Yes, Reject',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          const rejectData: ApproveCertificateRequestDTO = {
            status: 'rejected',
            rejectionReason: 'Certificate request rejected',
          };
          await certificationAPI.approveCertificateRequest(request.id, rejectData);
          message.success('Certificate request rejected');
          loadRequest(id!);
        } catch (error: any) {
          message.error(error.message || 'Failed to reject certificate request');
        }
      },
    });
  };

  const handleMarkFeePaid = () => {
    if (!request) return;
    Modal.confirm({
      title: 'Mark Fee as Paid',
      content: 'Are you sure you want to mark the fee as paid?',
      okText: 'Yes, Mark as Paid',
      okType: 'primary',
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          await certificationAPI.markFeeAsPaid(request.id);
          message.success('Fee marked as paid successfully');
          loadRequest(id!);
        } catch (error: any) {
          message.error(error.message || 'Failed to mark fee as paid');
        }
      },
    });
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!request) {
    return <Card>Certificate request not found</Card>;
  }

  const formatCurrency = (amount?: number) => {
    if (!amount) return '-';
    return `PKR ${amount.toLocaleString()}`;
  };

  const getStatusTag = (status: string) => {
    const statusConfig: Record<string, { color: string; text: string }> = {
      pending: { color: 'orange', text: 'Pending' },
      approved: { color: 'blue', text: 'Approved' },
      rejected: { color: 'red', text: 'Rejected' },
      processing: { color: 'cyan', text: 'Processing' },
      ready: { color: 'green', text: 'Ready' },
      delivered: { color: 'purple', text: 'Delivered' },
      cancelled: { color: 'default', text: 'Cancelled' },
    };
    const config = statusConfig[status] || { color: 'default', text: status };
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  const getCertificateTypeTag = (type: string) => {
    const typeConfig: Record<string, { color: string; text: string }> = {
      degree: { color: 'blue', text: 'Degree' },
      transcript: { color: 'green', text: 'Transcript' },
      character: { color: 'purple', text: 'Character' },
      bonafide: { color: 'orange', text: 'Bonafide' },
      course_completion: { color: 'cyan', text: 'Course Completion' },
      attendance: { color: 'default', text: 'Attendance' },
      other: { color: 'default', text: 'Other' },
    };
    const config = typeConfig[type] || { color: 'default', text: type };
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  return (
    <Card
      title="Certificate Request Details"
      extra={
        <Space>
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/certification/requests')}>
            Back
          </Button>
          {request.status === 'pending' && (
            <PermissionGuard permission="certification" action="approve">
              <>
                <Button
                  type="primary"
                  icon={<CheckOutlined />}
                  onClick={handleApprove}
                  style={{ color: 'white' }}
                >
                  Approve
                </Button>
                <Button danger icon={<CloseOutlined />} onClick={handleReject}>
                  Reject
                </Button>
              </>
            </PermissionGuard>
          )}
          {request.status === 'approved' && !request.feePaid && request.feeAmount && (
            <PermissionGuard permission="certification" action="update">
              <Button icon={<DollarOutlined />} onClick={handleMarkFeePaid}>
                Mark Fee Paid
              </Button>
            </PermissionGuard>
          )}
        </Space>
      }
    >
      <Descriptions bordered column={2}>
        <Descriptions.Item label="Student ID">{request.studentId}</Descriptions.Item>
        <Descriptions.Item label="Certificate Type">
          {getCertificateTypeTag(request.certificateType)}
        </Descriptions.Item>
        <Descriptions.Item label="Purpose" span={2}>{request.purpose}</Descriptions.Item>
        <Descriptions.Item label="Requested Date">
          {new Date(request.requestedDate).toLocaleDateString()}
        </Descriptions.Item>
        <Descriptions.Item label="Status">{getStatusTag(request.status)}</Descriptions.Item>
        <Descriptions.Item label="Fee Amount">{formatCurrency(request.feeAmount)}</Descriptions.Item>
        <Descriptions.Item label="Fee Status">
          {request.feeAmount ? (
            <Tag color={request.feePaid ? 'green' : 'red'}>
              {request.feePaid ? 'Paid' : 'Pending'}
            </Tag>
          ) : (
            '-'
          )}
        </Descriptions.Item>
        <Descriptions.Item label="Payment Date">
          {request.paymentDate ? new Date(request.paymentDate).toLocaleDateString() : '-'}
        </Descriptions.Item>
        <Descriptions.Item label="Delivery Method">
          <Tag>{request.deliveryMethod.charAt(0).toUpperCase() + request.deliveryMethod.slice(1)}</Tag>
        </Descriptions.Item>
        <Descriptions.Item label="Delivery Address" span={2}>
          {request.deliveryAddress || '-'}
        </Descriptions.Item>
        {request.approvedBy && (
          <>
            <Descriptions.Item label="Approved By">{request.approvedBy}</Descriptions.Item>
            <Descriptions.Item label="Approved At">
              {request.approvedAt ? new Date(request.approvedAt).toLocaleString() : '-'}
            </Descriptions.Item>
          </>
        )}
        {request.rejectionReason && (
          <Descriptions.Item label="Rejection Reason" span={2}>
            {request.rejectionReason}
          </Descriptions.Item>
        )}
        {request.remarks && (
          <Descriptions.Item label="Remarks" span={2}>{request.remarks}</Descriptions.Item>
        )}
        <Descriptions.Item label="Created At">
          {new Date(request.createdAt).toLocaleString()}
        </Descriptions.Item>
        <Descriptions.Item label="Updated At">
          {new Date(request.updatedAt).toLocaleString()}
        </Descriptions.Item>
      </Descriptions>
    </Card>
  );
};

export default CertificateRequestDetail;

