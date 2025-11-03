import React, { useState, useEffect } from 'react';
import { Form, Button, Card, message, Space, Select, InputNumber, DatePicker, Input } from 'antd';
import { SaveOutlined, ArrowLeftOutlined, DollarOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import financeAPI, { CreatePaymentDTO, StudentFee } from '@/api/finance.api';
import PermissionGuard from '@/components/common/PermissionGuard';
import dayjs from 'dayjs';

const { Option } = Select;
const { TextArea } = Input;

const PaymentProcessing: React.FC = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [studentFees, setStudentFees] = useState<StudentFee[]>([]);
  const [selectedFee, setSelectedFee] = useState<StudentFee | null>(null);

  useEffect(() => {
    loadStudentFees();
  }, []);

  const loadStudentFees = async () => {
    try {
      const response = await financeAPI.getAllStudentFees({ status: 'pending' });
      setStudentFees(response.studentFees || []);
    } catch (error: any) {
      message.error(error.message || 'Failed to load student fees');
    }
  };

  const handleFeeSelect = (feeId: string) => {
    const fee = studentFees.find((f) => f.id === feeId);
    if (fee) {
      setSelectedFee(fee);
      form.setFieldsValue({
        studentFeeId: fee.id,
        amount: fee.balance,
        paymentDate: dayjs(),
      });
    }
  };

  const handleSubmit = async (values: any) => {
    if (!selectedFee) {
      message.error('Please select a student fee');
      return;
    }

    if (values.amount > selectedFee.balance) {
      message.error('Payment amount cannot exceed the balance');
      return;
    }

    try {
      setLoading(true);

      const paymentData: CreatePaymentDTO = {
        studentFeeId: selectedFee.id,
        amount: values.amount,
        paymentDate: values.paymentDate.format('YYYY-MM-DD'),
        paymentMethod: values.paymentMethod,
        transactionId: values.transactionId,
        remarks: values.remarks,
      };

      await financeAPI.createPayment(paymentData);
      message.success('Payment processed successfully');
      form.resetFields();
      setSelectedFee(null);
      loadStudentFees();
    } catch (error: any) {
      message.error(error.message || 'Failed to process payment');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return `PKR ${amount.toLocaleString()}`;
  };

  return (
    <Card>
      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        <Space direction="vertical" style={{ width: '100%' }} size="large">
          <Form.Item
            label="Select Student Fee"
            name="studentFeeId"
            rules={[{ required: true, message: 'Please select a student fee' }]}
          >
            <Select
              placeholder="Select student fee to process payment"
              showSearch
              filterOption={(input, option) =>
                (option?.children as unknown as string)?.toLowerCase().includes(input.toLowerCase())
              }
              onChange={handleFeeSelect}
            >
              {studentFees.map((fee) => (
                <Option key={fee.id} value={fee.id}>
                  Student: {fee.studentId} - Balance: {formatCurrency(fee.balance)}
                </Option>
              ))}
            </Select>
          </Form.Item>

          {selectedFee && (
            <Card size="small" style={{ background: '#f0f0f0' }}>
              <Space direction="vertical" style={{ width: '100%' }}>
                <div>
                  <strong>Total Amount:</strong> {formatCurrency(selectedFee.amount)}
                </div>
                <div>
                  <strong>Paid Amount:</strong> {formatCurrency(selectedFee.paidAmount)}
                </div>
                <div>
                  <strong>Balance:</strong> <span style={{ color: 'red' }}>{formatCurrency(selectedFee.balance)}</span>
                </div>
                <div>
                  <strong>Due Date:</strong> {new Date(selectedFee.dueDate).toLocaleDateString()}
                </div>
              </Space>
            </Card>
          )}

          <Form.Item
            label="Payment Amount"
            name="amount"
            rules={[
              { required: true, message: 'Please enter payment amount' },
              { type: 'number', min: 1, message: 'Amount must be greater than 0' },
            ]}
          >
            <InputNumber
              style={{ width: '100%' }}
              min={1}
              max={selectedFee?.balance}
              formatter={(value) => `PKR ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={(value) => Number((value || '').replace(/PKR\s?|(,*)/g, '')) as any}
            />
          </Form.Item>

          <Form.Item
            label="Payment Date"
            name="paymentDate"
            rules={[{ required: true, message: 'Please select payment date' }]}
          >
            <DatePicker style={{ width: '100%' }} format="YYYY-MM-DD" />
          </Form.Item>

          <Form.Item
            label="Payment Method"
            name="paymentMethod"
            rules={[{ required: true, message: 'Please select payment method' }]}
          >
            <Select placeholder="Select payment method">
              <Option value="cash">Cash</Option>
              <Option value="bank_transfer">Bank Transfer</Option>
              <Option value="online">Online Payment</Option>
              <Option value="cheque">Cheque</Option>
              <Option value="easypaisa">EasyPaisa</Option>
              <Option value="jazzcash">JazzCash</Option>
              <Option value="other">Other</Option>
            </Select>
          </Form.Item>

          <Form.Item label="Transaction ID" name="transactionId">
            <Input placeholder="Enter transaction ID (for online payments)" />
          </Form.Item>

          <Form.Item label="Remarks" name="remarks">
            <TextArea rows={3} placeholder="Enter any remarks (optional)" />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                icon={<DollarOutlined />}
                disabled={!selectedFee}
              >
                Process Payment
              </Button>
              <Button onClick={() => navigate('/finance/payments')} icon={<ArrowLeftOutlined />}>
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Space>
      </Form>
    </Card>
  );
};

export default PaymentProcessing;

