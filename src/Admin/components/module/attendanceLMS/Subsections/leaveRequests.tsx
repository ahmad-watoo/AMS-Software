import React, { useState } from "react";
import {
  Table,
  Input,
  Select,
  Button,
  Modal,
  Form,
  DatePicker,
  Tag,
  Space,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import "tailwindcss/tailwind.css"; // Ensure Tailwind CSS is imported

const { RangePicker } = DatePicker;
const { Option } = Select;

interface LeaveRequest {
  key: string;
  requesterName: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  status: string;
}

const LeaveRequestPage: React.FC = () => {
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([
    {
      key: "1",
      requesterName: "John Doe",
      leaveType: "Sick Leave",
      startDate: "2023-10-15",
      endDate: "2023-10-16",
      status: "Pending",
    },
    {
      key: "2",
      requesterName: "Jane Smith",
      leaveType: "Vacation",
      startDate: "2023-11-01",
      endDate: "2023-11-05",
      status: "Approved",
    },
    {
      key: "3",
      requesterName: "Alice Johnson",
      leaveType: "Personal Leave",
      startDate: "2023-12-10",
      endDate: "2023-12-12",
      status: "Rejected",
    },
  ]);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [statusFilter, setStatusFilter] = useState<string | null>(null);

  // Columns for the leave request table
  const columns: ColumnsType<LeaveRequest> = [
    {
      title: "Requester Name",
      dataIndex: "requesterName",
      key: "requesterName",
    },
    {
      title: "Leave Type",
      dataIndex: "leaveType",
      key: "leaveType",
    },
    {
      title: "Start Date",
      dataIndex: "startDate",
      key: "startDate",
    },
    {
      title: "End Date",
      dataIndex: "endDate",
      key: "endDate",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => (
        <Tag
          color={
            status === "Approved"
              ? "green"
              : status === "Rejected"
              ? "red"
              : "orange"
          }
        >
          {status}
        </Tag>
      ),
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <Space size="middle">
          {record.status === "Pending" && (
            <>
              <Button type="link" onClick={() => handleApprove(record.key)}>
                Approve
              </Button>
              <Button
                type="link"
                danger
                onClick={() => handleReject(record.key)}
              >
                Reject
              </Button>
            </>
          )}
        </Space>
      ),
    },
  ];

  // Handle submit leave request
  const handleSubmitLeaveRequest = () => {
    form.resetFields();
    setIsModalVisible(true);
  };

  // Handle approve leave request
  const handleApprove = (key: string) => {
    setLeaveRequests(
      leaveRequests.map((request) =>
        request.key === key ? { ...request, status: "Approved" } : request
      )
    );
  };

  // Handle reject leave request
  const handleReject = (key: string) => {
    setLeaveRequests(
      leaveRequests.map((request) =>
        request.key === key ? { ...request, status: "Rejected" } : request
      )
    );
  };

  // Handle modal OK (submit new leave request)
  const handleModalOk = () => {
    form
      .validateFields()
      .then((values) => {
        const newLeaveRequest = {
          ...values,
          key: (leaveRequests.length + 1).toString(),
          status: "Pending",
        };
        setLeaveRequests([...leaveRequests, newLeaveRequest]);
        setIsModalVisible(false);
        form.resetFields();
      })
      .catch((error) => {
        console.error("Validation Failed:", error);
      });
  };

  // Handle modal cancel
  const handleModalCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
  };

  // Handle status filter
  const handleStatusFilter = (value: string | null) => {
    setStatusFilter(value);
  };

  // Filtered data based on status
  const filteredData = statusFilter
    ? leaveRequests.filter((request) => request.status === statusFilter)
    : leaveRequests;

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6 text-center">Leave Requests</h1>

      {/* Filters and Actions */}
      <div className="flex flex-wrap gap-4 mb-6">
        <Select
          placeholder="Filter by Status"
          value={statusFilter}
          onChange={handleStatusFilter}
          className="w-full md:w-48"
          allowClear
        >
          <Option value="Pending">Pending</Option>
          <Option value="Approved">Approved</Option>
          <Option value="Rejected">Rejected</Option>
        </Select>
        <Button
          type="primary"
          onClick={handleSubmitLeaveRequest}
          className="w-full md:w-auto"
        >
          Submit Leave Request
        </Button>
      </div>

      {/* Leave Request Table */}
      <Table
        columns={columns}
        dataSource={filteredData}
        pagination={{ pageSize: 5 }}
        className="shadow-md"
      />

      {/* Submit Leave Request Modal */}
      <Modal
        title="Submit Leave Request"
        visible={isModalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="requesterName"
            label="Requester Name"
            rules={[
              { required: true, message: "Please enter the requester's name" },
            ]}
          >
            <Input placeholder="Enter requester's name" />
          </Form.Item>
          <Form.Item
            name="leaveType"
            label="Leave Type"
            rules={[
              { required: true, message: "Please select the leave type" },
            ]}
          >
            <Select placeholder="Select leave type">
              <Option value="Sick Leave">Sick Leave</Option>
              <Option value="Vacation">Vacation</Option>
              <Option value="Personal Leave">Personal Leave</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="dateRange"
            label="Date Range"
            rules={[
              { required: true, message: "Please select the date range" },
            ]}
          >
            <RangePicker className="w-full" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default LeaveRequestPage;
