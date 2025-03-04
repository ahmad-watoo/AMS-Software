import React, { useState } from "react";
import { Form, Input, Select, Button, DatePicker, message } from "antd";
import type { DatePickerProps } from "antd";
import "tailwindcss/tailwind.css"; // Ensure Tailwind CSS is imported

const { Option } = Select;

interface FeeSubmissionFormValues {
  studentName: string;
  studentId: string;
  feeAmount: number;
  paymentMethod: string;
  paymentDate: DatePickerProps["value"];
}

const FeeSubmission = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const onFinish = async (values: FeeSubmissionFormValues) => {
    setLoading(true);
    try {
      // Simulate API call or fee submission logic
      console.log("Submitted Values:", values);
      message.success("Fee submitted successfully!");
      form.resetFields();
    } catch (error) {
      console.error("Error submitting fee:", error);
      message.error("Failed to submit fee. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="max-w-lg mx-auto mt-6 p-6 bg-white shadow-lg rounded-lg">
      <h1 className="text-2xl font-bold mb-6 text-center">
        Fee Submission Form
      </h1>
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        autoComplete="off"
      >
        {/* Student Name */}
        <Form.Item
          label="Student Name"
          name="studentName"
          rules={[
            { required: true, message: "Please enter the student's name" },
          ]}
        >
          <Input placeholder="Enter student name" className="w-full" />
        </Form.Item>

        {/* Student ID */}
        <Form.Item
          label="Student ID"
          name="studentId"
          rules={[{ required: true, message: "Please enter the student's ID" }]}
        >
          <Input placeholder="Enter student ID" className="w-full" />
        </Form.Item>

        {/* Fee Amount */}
        <Form.Item
          label="Fee Amount"
          name="feeAmount"
          rules={[{ required: true, message: "Please enter the fee amount" }]}
        >
          <Input
            type="number"
            placeholder="Enter fee amount"
            className="w-full"
          />
        </Form.Item>

        {/* Payment Method */}
        <Form.Item
          label="Payment Method"
          name="paymentMethod"
          rules={[
            { required: true, message: "Please select a payment method" },
          ]}
        >
          <Select placeholder="Select payment method" className="w-full">
            <Option value="credit_card">Credit Card</Option>
            <Option value="debit_card">Debit Card</Option>
            <Option value="bank_transfer">Bank Transfer</Option>
            <Option value="cash">Cash</Option>
          </Select>
        </Form.Item>

        {/* Payment Date */}
        <Form.Item
          label="Payment Date"
          name="paymentDate"
          rules={[
            { required: true, message: "Please select the payment date" },
          ]}
        >
          <DatePicker className="w-full" />
        </Form.Item>

        {/* Submit Button */}
        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
          >
            Submit Fee
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default FeeSubmission;
