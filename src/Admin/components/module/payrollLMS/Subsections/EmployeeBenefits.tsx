import React, { useState } from "react";
import { Table, Input, Button, Modal, Form, Select, Tag, Space } from "antd";
import type { ColumnsType } from "antd/es/table";
import "tailwindcss/tailwind.css"; // Ensure Tailwind CSS is imported

const { Option } = Select;

interface EmployeeBenefit {
  key: string;
  employeeName: string;
  benefitType: string;
  amount: number;
  status: string;
}

const EmployeeBenefitsPage: React.FC = () => {
  const [benefitsData, setBenefitsData] = useState<EmployeeBenefit[]>([
    {
      key: "1",
      employeeName: "John Doe",
      benefitType: "Health Insurance",
      amount: 500,
      status: "Active",
    },
    {
      key: "2",
      employeeName: "Jane Smith",
      benefitType: "Retirement Plan",
      amount: 1000,
      status: "Active",
    },
    {
      key: "3",
      employeeName: "Alice Johnson",
      benefitType: "Bonus",
      amount: 2000,
      status: "Inactive",
    },
  ]);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingBenefit, setEditingBenefit] = useState<EmployeeBenefit | null>(
    null
  );
  const [form] = Form.useForm();
  const [searchText, setSearchText] = useState("");
  const [benefitTypeFilter, setBenefitTypeFilter] = useState<string | null>(
    null
  );
  const [statusFilter, setStatusFilter] = useState<string | null>(null);

  // Columns for the employee benefits table
  const columns: ColumnsType<EmployeeBenefit> = [
    {
      title: "Employee Name",
      dataIndex: "employeeName",
      key: "employeeName",
    },
    {
      title: "Benefit Type",
      dataIndex: "benefitType",
      key: "benefitType",
    },
    {
      title: "Amount",
      dataIndex: "amount",
      key: "amount",
      render: (amount: number) => `$${amount.toLocaleString()}`,
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

  // Handle add/edit benefit
  const handleAddBenefit = () => {
    form.resetFields();
    setEditingBenefit(null);
    setIsModalVisible(true);
  };

  const handleEdit = (record: EmployeeBenefit) => {
    form.setFieldsValue(record);
    setEditingBenefit(record);
    setIsModalVisible(true);
  };

  const handleDelete = (key: string) => {
    setBenefitsData(benefitsData.filter((benefit) => benefit.key !== key));
  };

  const handleModalOk = () => {
    form
      .validateFields()
      .then((values) => {
        if (editingBenefit) {
          // Update existing benefit
          setBenefitsData(
            benefitsData.map((benefit) =>
              benefit.key === editingBenefit.key
                ? { ...benefit, ...values }
                : benefit
            )
          );
        } else {
          // Add new benefit
          const newBenefit = {
            ...values,
            key: (benefitsData.length + 1).toString(),
          };
          setBenefitsData([...benefitsData, newBenefit]);
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

  // Handle search
  const handleSearch = (value: string) => {
    setSearchText(value);
  };

  // Handle benefit type filter
  const handleBenefitTypeFilter = (value: string | null) => {
    setBenefitTypeFilter(value);
  };

  // Handle status filter
  const handleStatusFilter = (value: string | null) => {
    setStatusFilter(value);
  };

  // Apply filters
  const filteredData = benefitsData.filter((record) => {
    const matchesSearch = record.employeeName
      .toLowerCase()
      .includes(searchText.toLowerCase());
    const matchesBenefitType = benefitTypeFilter
      ? record.benefitType === benefitTypeFilter
      : true;
    const matchesStatus = statusFilter ? record.status === statusFilter : true;

    return matchesSearch && matchesBenefitType && matchesStatus;
  });

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6 text-center">Employee Benefits</h1>

      {/* Search and Filters */}
      <div className="flex flex-wrap gap-4 mb-6">
        <Input
          placeholder="Search by employee name"
          value={searchText}
          onChange={(e) => handleSearch(e.target.value)}
          className="w-full md:w-64"
        />
        <Select
          placeholder="Filter by Benefit Type"
          value={benefitTypeFilter}
          onChange={handleBenefitTypeFilter}
          className="w-full md:w-48"
          allowClear
        >
          <Option value="Health Insurance">Health Insurance</Option>
          <Option value="Retirement Plan">Retirement Plan</Option>
          <Option value="Bonus">Bonus</Option>
        </Select>
        <Select
          placeholder="Filter by Status"
          value={statusFilter}
          onChange={handleStatusFilter}
          className="w-full md:w-48"
          allowClear
        >
          <Option value="Active">Active</Option>
          <Option value="Inactive">Inactive</Option>
        </Select>
        <Button
          type="primary"
          onClick={handleAddBenefit}
          className="w-full md:w-auto"
        >
          Add Benefit
        </Button>
      </div>

      {/* Employee Benefits Table */}
      <Table
        columns={columns}
        dataSource={filteredData}
        pagination={{ pageSize: 5 }}
        className="shadow-md"
      />

      {/* Add/Edit Benefit Modal */}
      <Modal
        title={editingBenefit ? "Edit Benefit" : "Add Benefit"}
        visible={isModalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="employeeName"
            label="Employee Name"
            rules={[
              { required: true, message: "Please enter the employee's name" },
            ]}
          >
            <Input placeholder="Enter employee's name" />
          </Form.Item>
          <Form.Item
            name="benefitType"
            label="Benefit Type"
            rules={[
              { required: true, message: "Please select the benefit type" },
            ]}
          >
            <Select placeholder="Select benefit type">
              <Option value="Health Insurance">Health Insurance</Option>
              <Option value="Retirement Plan">Retirement Plan</Option>
              <Option value="Bonus">Bonus</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="amount"
            label="Amount"
            rules={[{ required: true, message: "Please enter the amount" }]}
          >
            <Input type="number" placeholder="Enter amount" />
          </Form.Item>
          <Form.Item
            name="status"
            label="Status"
            rules={[{ required: true, message: "Please select the status" }]}
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

export default EmployeeBenefitsPage;
