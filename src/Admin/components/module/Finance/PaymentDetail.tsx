import React, { useState, useEffect } from 'react';
import { Card, Descriptions, Tag, Button, Space, message, Spin } from 'antd';
import { ArrowLeftOutlined, FileTextOutlined } from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import financeAPI, { Payment } from '@/api/finance.api';

const PaymentDetail: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [payment, setPayment] = useState<Payment | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadPayment(id);
    }
  }, [id]);

  const loadPayment = async (paymentId: string) => {
    try {
      setLoading(true);
      const pay = await financeAPI.getPaymentById(paymentId);
      setPayment(pay);
    } catch (error: any) {
      message.error(error.message || 'Failed to load payment details');
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

  if (!payment) {
    return <Card>Payment not found</Card>;
  }

  const formatCurrency = (amount: number) => {
    return `PKR ${amount.toLocaleString()}`;
  };

  const getPaymentMethodTag = (method: string) => {
    const methodConfig: Record<string, { color: string; text: string }> = {
      cash: { color: 'green', text: 'Cash' },
      bank_transfer: { color: 'blue', text: 'Bank Transfer' },
      online: { color: 'cyan', text: 'Online' },
      cheque: { color: 'purple', text: 'Cheque' },
      easypaisa: { color: 'orange', text: 'EasyPaisa' },
      jazzcash: { color: 'red', text: 'JazzCash' },
      other: { color: 'default', text: 'Other' },
    };
    const config = methodConfig[method] || { color: 'default', text: method };
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  return (
    <Card
      title="Payment Details"
      extra={
        <Space>
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/finance/payments')}>
            Back
          </Button>
          <Button
            type="primary"
            icon={<FileTextOutlined />}
            onClick={() => message.info('Receipt generation coming soon')}
          >
            Generate Receipt
          </Button>
        </Space>
      }
    >
      <Descriptions bordered column={2}>
        <Descriptions.Item label="Receipt Number">{payment.receiptNumber}</Descriptions.Item>
        <Descriptions.Item label="Payment Date">
          {new Date(payment.paymentDate).toLocaleDateString()}
        </Descriptions.Item>
        <Descriptions.Item label="Amount">{formatCurrency(payment.amount)}</Descriptions.Item>
        <Descriptions.Item label="Payment Method">
          {getPaymentMethodTag(payment.paymentMethod)}
        </Descriptions.Item>
        <Descriptions.Item label="Transaction ID">{payment.transactionId || '-'}</Descriptions.Item>
        <Descriptions.Item label="Student Fee ID">{payment.studentFeeId}</Descriptions.Item>
        {payment.processedBy && (
          <Descriptions.Item label="Processed By">{payment.processedBy}</Descriptions.Item>
        )}
        {payment.remarks && (
          <Descriptions.Item label="Remarks" span={2}>{payment.remarks}</Descriptions.Item>
        )}
        <Descriptions.Item label="Created At">
          {new Date(payment.createdAt).toLocaleString()}
        </Descriptions.Item>
      </Descriptions>
    </Card>
  );
};

export default PaymentDetail;

