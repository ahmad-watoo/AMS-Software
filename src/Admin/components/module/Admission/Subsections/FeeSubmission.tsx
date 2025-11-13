import React, { useMemo, useState } from "react";
import {
  Form,
  Input,
  Select,
  Button,
  DatePicker,
  message,
  Card,
  Typography,
  Space,
  Table,
  Tag,
  Divider,
  Empty,
  Descriptions,
} from "antd";
import { DollarCircleOutlined, SearchOutlined, ReloadOutlined } from "@ant-design/icons";
import financeAPI, { StudentFee, CreatePaymentDTO } from "../../../../../api/finance.api";

const { Option } = Select;
const { Title, Text } = Typography;

const paymentMethods: Array<{
  value: CreatePaymentDTO["paymentMethod"];
  label: string;
}> = [
  { value: "cash", label: "Cash" },
  { value: "bank_transfer", label: "Bank Transfer" },
  { value: "online", label: "Online Payment" },
  { value: "cheque", label: "Cheque" },
  { value: "easypaisa", label: "Easypaisa" },
  { value: "jazzcash", label: "JazzCash" },
  { value: "other", label: "Other" },
];

const FeeSubmission: React.FC = () => {
  const [form] = Form.useForm();
  const [studentFees, setStudentFees] = useState<StudentFee[]>([]);
  const [fetchingFees, setFetchingFees] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const selectedFeeId = Form.useWatch("studentFeeId", form);
  const selectedFee = useMemo(
    () => studentFees.find((fee) => fee.id === selectedFeeId),
    [studentFees, selectedFeeId]
  );

  const loadStudentFees = async () => {
    const studentId = form.getFieldValue("studentId");
    if (!studentId) {
      message.warning("Please enter a student ID before fetching fees.");
      return;
    }
    try {
      setFetchingFees(true);
      const response = await financeAPI.getAllStudentFees({
        studentId,
        status: "pending",
        limit: 100,
      });
      const fees = response.studentFees || response.fees || response.data || [];
      setStudentFees(fees);
      if (fees.length === 0) {
        message.info("No pending admission fees found for this student.");
      } else {
        message.success(`Loaded ${fees.length} pending fee(s).`);
      }
    } catch (error: any) {
      message.error(error.message || "Failed to fetch student fees.");
    } finally {
      setFetchingFees(false);
    }
  };

  const handleFeeChange = (feeId: string) => {
    const fee = studentFees.find((item) => item.id === feeId);
    if (fee) {
      form.setFieldsValue({
        amount: fee.balance || fee.amount,
      });
    }
  };

  const handleSubmit = async (values: any) => {
    if (!values.studentFeeId) {
      message.error("Select a pending fee before submitting payment.");
      return;
    }
    try {
      setSubmitting(true);
      const payload: CreatePaymentDTO = {
        studentFeeId: values.studentFeeId,
        amount: Number(values.amount),
        paymentMethod: values.paymentMethod,
        paymentDate: values.paymentDate
          ? values.paymentDate.toISOString()
          : new Date().toISOString(),
        transactionId: values.transactionId || undefined,
        remarks: values.remarks || undefined,
      };
      await financeAPI.createPayment(payload);
      message.success("Payment recorded successfully.");
      form.resetFields(["studentFeeId", "amount", "paymentMethod", "paymentDate", "transactionId", "remarks"]);
      await loadStudentFees();
    } catch (error: any) {
      message.error(error.message || "Failed to submit payment.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ padding: 24 }}>
      <Space direction="vertical" size="large" style={{ width: "100%" }}>
        <Card bordered={false}>
          <Space direction="vertical" size="middle" style={{ width: "100%" }}>
            <Title level={4}>
              <Space>
                <DollarCircleOutlined />
                Admission Fee Submission
              </Space>
            </Title>
            <Text type="secondary">
              Search for a student to view their pending admission fees and record payments with automated receipting.
            </Text>
            <Form form={form} layout="vertical" onFinish={handleSubmit}>
              <Space align="start" size="large" style={{ width: "100%", flexWrap: "wrap" }}>
                <Form.Item
                  name="studentId"
                  label="Student ID"
                  rules={[{ required: true, message: "Student ID is required" }]}
                  style={{ minWidth: 240 }}
                >
                  <Input placeholder="Enter student ID" allowClear />
                </Form.Item>
                <Space size="small" style={{ marginTop: 30 }}>
                  <Button
                    icon={<SearchOutlined />}
                    type="primary"
                    loading={fetchingFees}
                    onClick={loadStudentFees}
                  >
                    Fetch Pending Fees
                  </Button>
                  <Button
                    icon={<ReloadOutlined />}
                    onClick={() => {
                      form.resetFields();
                      setStudentFees([]);
                    }}
                  >
                    Reset
                  </Button>
                </Space>
              </Space>

              <Divider />

              <Space direction="vertical" style={{ width: "100%" }} size="large">
                <Card
                  size="small"
                  title="Pending Fees"
                  bordered={false}
                  bodyStyle={{ padding: 0 }}
                >
                  {studentFees.length === 0 ? (
                    <Empty style={{ margin: "16px 0" }} description="No pending fees to display" />
                  ) : (
                    <Table<StudentFee>
                      dataSource={studentFees}
                      rowKey="id"
                      pagination={false}
                      size="middle"
                    >
                      <Table.Column
                        title="Fee Type"
                        dataIndex="feeStructureId"
                        key="feeStructureId"
                        render={() => <Tag color="blue">Admission</Tag>}
                      />
                      <Table.Column
                        title="Amount"
                        dataIndex="amount"
                        key="amount"
                        render={(amount: number) => `Rs. ${amount.toLocaleString()}`}
                      />
                      <Table.Column
                        title="Due Date"
                        dataIndex="dueDate"
                        key="dueDate"
                        render={(date: string) =>
                          date ? new Date(date).toLocaleDateString() : "-"
                        }
                      />
                      <Table.Column
                        title="Status"
                        dataIndex="status"
                        key="status"
                        render={(status: StudentFee["status"]) => (
                          <Tag color={status === "pending" ? "warning" : "default"}>
                            {status.toUpperCase()}
                          </Tag>
                        )}
                      />
                    </Table>
                  )}
                </Card>

                {selectedFee && (
                  <Card size="small" title="Selected Fee Details" bordered={false}>
                    <Descriptions column={1} bordered size="small">
                      <Descriptions.Item label="Fee Amount">
                        Rs. {selectedFee.amount.toLocaleString()}
                      </Descriptions.Item>
                      <Descriptions.Item label="Balance Due">
                        Rs. {selectedFee.balance.toLocaleString()}
                      </Descriptions.Item>
                      <Descriptions.Item label="Due Date">
                        {selectedFee.dueDate
                          ? new Date(selectedFee.dueDate).toLocaleDateString()
                          : "Not specified"}
                      </Descriptions.Item>
                    </Descriptions>
                  </Card>
                )}

                <Card
                  size="small"
                  title="Record Payment"
                  bordered={false}
                >
                  <Space direction="vertical" size="middle" style={{ width: "100%" }}>
                    <Form.Item
                      name="studentFeeId"
                      label="Pending Fee"
                      rules={[{ required: true, message: "Please select a fee to settle" }]}
                    >
                      <Select
                        placeholder="Select pending fee"
                        onChange={handleFeeChange}
                        disabled={studentFees.length === 0}
                      >
                        {studentFees.map((fee) => (
                          <Option key={fee.id} value={fee.id}>
                            {`Admission Fee - Rs. ${fee.balance.toLocaleString()}`}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>

                    <Form.Item
                      name="amount"
                      label="Amount Received (PKR)"
                      rules={[{ required: true, message: "Please enter the amount received" }]}
                    >
                      <Input type="number" placeholder="Enter amount" min={0} />
                    </Form.Item>

                    <Form.Item
                      name="paymentMethod"
                      label="Payment Method"
                      rules={[{ required: true, message: "Select a payment method" }]}
                    >
                      <Select placeholder="Select payment method">
                        {paymentMethods.map((method) => (
                          <Option key={method.value} value={method.value}>
                            {method.label}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>

                    <Form.Item
                      name="paymentDate"
                      label="Payment Date"
                      rules={[{ required: true, message: "Select payment date" }]}
                      initialValue={undefined}
                    >
                      <DatePicker style={{ width: "100%" }} />
                    </Form.Item>

                    <Form.Item name="transactionId" label="Transaction / Receipt No.">
                      <Input placeholder="Optional reference number" />
                    </Form.Item>

                    <Form.Item name="remarks" label="Remarks">
                      <Input.TextArea rows={3} placeholder="Any notes about this payment" />
                    </Form.Item>

                    <Form.Item>
                      <Button
                        type="primary"
                        htmlType="submit"
                        loading={submitting}
                        disabled={studentFees.length === 0}
                      >
                        Record Payment
                      </Button>
                    </Form.Item>
                  </Space>
                </Card>
              </Space>
            </Form>
          </Space>
        </Card>
      </Space>
    </div>
  );
};

export default FeeSubmission;
