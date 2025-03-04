import React, { useState } from "react";
import { Table, Input, Select, Button, Modal, Form, Tag, Space } from "antd";
import type { ColumnsType } from "antd/es/table";
import "tailwindcss/tailwind.css"; // Ensure Tailwind CSS is imported

const { Option } = Select;

interface StaffMember {
  key: string;
  name: string;
  role: string;
  email: string;
  status: string;
}

const StaffManagement: React.FC = () => {
  const [staffData, setStaffData] = useState<StaffMember[]>([
    {
      key: "1",
      name: "John Doe",
      role: "Teacher",
      email: "john.doe@example.com",
      status: "Active",
    },
    {
      key: "2",
      name: "Jane Smith",
      role: "Administrator",
      email: "jane.smith@example.com",
      status: "Inactive",
    },
    {
      key: "3",
      name: "Alice Johnson",
      role: "Librarian",
      email: "alice.johnson@example.com",
      status: "Active",
    },
  ]);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null);
  const [form] = Form.useForm();

  // Columns for the staff table
  const columns: ColumnsType<StaffMember> = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Role",
      dataIndex: "role",
      key: "role",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => (
        <Tag color={status === "Active" ? "green" : "red"}>{status}</Tag>
      ),
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <Space size="middle">
          <Button type="link" onClick={() => handleEdit(record)}>
            Edit
          </Button>
          <Button type="link" danger onClick={() => handleDelete(record.key)}>
            Delete
          </Button>
        </Space>
      ),
    },
  ];

  // Handle add/edit staff
  const handleAddStaff = () => {
    form.resetFields();
    setEditingStaff(null);
    setIsModalVisible(true);
  };

  const handleEdit = (record: StaffMember) => {
    form.setFieldsValue(record);
    setEditingStaff(record);
    setIsModalVisible(true);
  };

  const handleDelete = (key: string) => {
    setStaffData(staffData.filter((staff) => staff.key !== key));
  };

  const handleModalOk = () => {
    form
      .validateFields()
      .then((values) => {
        if (editingStaff) {
          // Update existing staff
          setStaffData(
            staffData.map((staff) =>
              staff.key === editingStaff.key ? { ...staff, ...values } : staff
            )
          );
        } else {
          // Add new staff
          const newStaff = {
            ...values,
            key: (staffData.length + 1).toString(),
          };
          setStaffData([...staffData, newStaff]);
        }
        setIsModalVisible(false);
        form.resetFields();
      })
      .catch((error) => {
        console.error("Validation Failed:", error);
      });
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6 text-center">Staff Management</h1>

      {/* Search and Filters */}
      <div className="flex flex-wrap gap-4 mb-6">
        <Input
          placeholder="Search by name or email"
          className="w-full md:w-64"
        />
        <Select
          placeholder="Filter by Role"
          className="w-full md:w-48"
          allowClear
        >
          <Option value="Teacher">Teacher</Option>
          <Option value="Administrator">Administrator</Option>
          <Option value="Librarian">Librarian</Option>
        </Select>
        <Select
          placeholder="Filter by Status"
          className="w-full md:w-48"
          allowClear
        >
          <Option value="Active">Active</Option>
          <Option value="Inactive">Inactive</Option>
        </Select>
        <Button
          type="primary"
          onClick={handleAddStaff}
          className="w-full md:w-auto"
        >
          Add Staff
        </Button>
      </div>

      {/* Staff Table */}
      <Table
        columns={columns}
        dataSource={staffData}
        pagination={{ pageSize: 5 }}
        className="shadow-md"
      />

      {/* Add/Edit Staff Modal */}
      <Modal
        title={editingStaff ? "Edit Staff" : "Add Staff"}
        visible={isModalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="Name"
            rules={[{ required: true, message: "Please enter the staff name" }]}
          >
            <Input placeholder="Enter staff name" />
          </Form.Item>
          <Form.Item
            name="role"
            label="Role"
            rules={[
              { required: true, message: "Please select the staff role" },
            ]}
          >
            <Select placeholder="Select role">
              <Option value="Teacher">Teacher</Option>
              <Option value="Administrator">Administrator</Option>
              <Option value="Librarian">Librarian</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: "Please enter the staff email" },
              { type: "email", message: "Please enter a valid email" },
            ]}
          >
            <Input placeholder="Enter staff email" />
          </Form.Item>
          <Form.Item
            name="status"
            label="Status"
            rules={[
              { required: true, message: "Please select the staff status" },
            ]}
          >
            <Select placeholder="Select status">
              <Option value="Active">Active</Option>
              <Option value="Inactive">Inactive</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default StaffManagement;
