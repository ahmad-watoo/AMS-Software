import React, { useState } from "react";
import { Table, Input, Button, Modal, Form, Select, Tag, Space } from "antd";
import type { ColumnsType } from "antd/es/table";
import "tailwindcss/tailwind.css"; // Ensure Tailwind CSS is imported

const { Option } = Select;

interface SalaryProcessing {
  key: string;
  employeeName: string;
  department: string;
  grossSalary: number;
  deductions: number;
  netSalary: number;
  status: string;
}

const SalaryProcessingPage: React.FC = () => {
  const [salaryData, setSalaryData] = useState<SalaryProcessing[]>([
    {
      key: "1",
      employeeName: "John Doe",
      department: "Engineering",
      grossSalary: 5000,
      deductions: 500,
      netSalary: 4500,
      status: "Processed",
    },
    {
      key: "2",
      employeeName: "Jane Smith",
      department: "HR",
      grossSalary: 6000,
      deductions: 600,
      netSalary: 5400,
      status: "Pending",
    },
    {
      key: "3",
      employeeName: "Alice Johnson",
      department: "Finance",
      grossSalary: 7000,
      deductions: 700,
      netSalary: 6300,
      status: "Processed",
    },
  ]);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [searchText, setSearchText] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);

  // Columns for the salary processing table
  const columns: ColumnsType<SalaryProcessing> = [
    {
      title: "Employee Name",
      dataIndex: "employeeName",
      key: "employeeName",
    },
    {
      title: "Department",
      dataIndex: "department",
      key: "department",
    },
    {
      title: "Gross Salary",
      dataIndex: "grossSalary",
      key: "grossSalary",
      render: (grossSalary: number) => `$${grossSalary.toLocaleString()}`,
    },
    {
      title: "Deductions",
      dataIndex: "deductions",
      key: "deductions",
      render: (deductions: number) => (
        <Tag color="red">-${deductions.toLocaleString()}</Tag>
      ),
    },
    {
      title: "Net Salary",
      dataIndex: "netSalary",
      key: "netSalary",
      render: (netSalary: number) => (
        <Tag color="green">${netSalary.toLocaleString()}</Tag>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => (
        <Tag color={status === "Processed" ? "green" : "orange"}>{status}</Tag>
      ),
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <Space size="middle">
          <Button type="link" onClick={() => handleProcessSalary(record)}>
            Process
          </Button>
        </Space>
      ),
    },
  ];

  // Handle process salary
  const handleProcessSalary = (record: SalaryProcessing) => {
    form.setFieldsValue(record);
    setIsModalVisible(true);
  };

  // Handle generate payroll report
  const handleGenerateReport = () => {
    // Simulate generating a payroll report (e.g., generate a PDF)
    alert("Payroll report generated and downloaded!");
  };

  // Handle modal OK (process salary)
  const handleModalOk = () => {
    form
      .validateFields()
      .then((values) => {
        const { grossSalary, deductions } = values;
        const netSalary = grossSalary - deductions;

        const updatedSalaryData = salaryData.map((record) =>
          record.key === values.key
            ? { ...record, ...values, netSalary, status: "Processed" }
            : record
        );

        setSalaryData(updatedSalaryData);
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

  // Handle search
  const handleSearch = (value: string) => {
    setSearchText(value);
  };

  // Handle department filter
  const handleDepartmentFilter = (value: string | null) => {
    setDepartmentFilter(value);
  };

  // Handle status filter
  const handleStatusFilter = (value: string | null) => {
    setStatusFilter(value);
  };

  // Apply filters
  const filteredData = salaryData.filter((record) => {
    const matchesSearch = record.employeeName
      .toLowerCase()
      .includes(searchText.toLowerCase());
    const matchesDepartment = departmentFilter
      ? record.department === departmentFilter
      : true;
    const matchesStatus = statusFilter ? record.status === statusFilter : true;

    return matchesSearch && matchesDepartment && matchesStatus;
  });

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6 text-center">Salary Processing</h1>

      {/* Search and Filters */}
      <div className="flex flex-wrap gap-4 mb-6">
        <Input
          placeholder="Search by employee name"
          value={searchText}
          onChange={(e) => handleSearch(e.target.value)}
          className="w-full md:w-64"
        />
        <Select
          placeholder="Filter by Department"
          value={departmentFilter}
          onChange={handleDepartmentFilter}
          className="w-full md:w-48"
          allowClear
        >
          <Option value="Engineering">Engineering</Option>
          <Option value="HR">HR</Option>
          <Option value="Finance">Finance</Option>
        </Select>
        <Select
          placeholder="Filter by Status"
          value={statusFilter}
          onChange={handleStatusFilter}
          className="w-full md:w-48"
          allowClear
        >
          <Option value="Processed">Processed</Option>
          <Option value="Pending">Pending</Option>
        </Select>
        <Button
          type="primary"
          onClick={handleGenerateReport}
          className="w-full md:w-auto"
        >
          Generate Payroll Report
        </Button>
      </div>

      {/* Salary Processing Table */}
      <Table
        columns={columns}
        dataSource={filteredData}
        pagination={{ pageSize: 5 }}
        className="shadow-md"
      />

      {/* Process Salary Modal */}
      <Modal
        title="Process Salary"
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
            <Input placeholder="Enter employee's name" disabled />
          </Form.Item>
          <Form.Item
            name="grossSalary"
            label="Gross Salary"
            rules={[
              { required: true, message: "Please enter the gross salary" },
            ]}
          >
            <Input type="number" placeholder="Enter gross salary" />
          </Form.Item>
          <Form.Item
            name="deductions"
            label="Deductions"
            rules={[{ required: true, message: "Please enter the deductions" }]}
          >
            <Input type="number" placeholder="Enter deductions" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default SalaryProcessingPage;
