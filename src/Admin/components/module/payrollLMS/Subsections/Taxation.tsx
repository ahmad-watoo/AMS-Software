import React, { useState } from "react";
import { Table, Input, Button, Modal, Form, Select, Tag } from "antd";
import type { ColumnsType } from "antd/es/table";
import "tailwindcss/tailwind.css"; // Ensure Tailwind CSS is imported

const { Option } = Select;

interface TaxationRecord {
  key: string;
  employeeName: string;
  taxableIncome: number;
  taxRate: number;
  taxAmount: number;
  financialYear: string;
}

const TaxationPage: React.FC = () => {
  const [taxRecords, setTaxRecords] = useState<TaxationRecord[]>([
    {
      key: "1",
      employeeName: "John Doe",
      taxableIncome: 50000,
      taxRate: 20,
      taxAmount: 10000,
      financialYear: "2023-2024",
    },
    {
      key: "2",
      employeeName: "Jane Smith",
      taxableIncome: 60000,
      taxRate: 25,
      taxAmount: 15000,
      financialYear: "2023-2024",
    },
    {
      key: "3",
      employeeName: "Alice Johnson",
      taxableIncome: 70000,
      taxRate: 30,
      taxAmount: 21000,
      financialYear: "2022-2023",
    },
  ]);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [searchText, setSearchText] = useState("");
  const [financialYearFilter, setFinancialYearFilter] = useState<string | null>(
    null
  );

  // Columns for the taxation table
  const columns: ColumnsType<TaxationRecord> = [
    {
      title: "Employee Name",
      dataIndex: "employeeName",
      key: "employeeName",
    },
    {
      title: "Taxable Income",
      dataIndex: "taxableIncome",
      key: "taxableIncome",
      render: (taxableIncome: number) => `$${taxableIncome.toLocaleString()}`,
    },
    {
      title: "Tax Rate",
      dataIndex: "taxRate",
      key: "taxRate",
      render: (taxRate: number) => `${taxRate}%`,
    },
    {
      title: "Tax Amount",
      dataIndex: "taxAmount",
      key: "taxAmount",
      render: (taxAmount: number) => (
        <Tag color="red">-${taxAmount.toLocaleString()}</Tag>
      ),
    },
    {
      title: "Financial Year",
      dataIndex: "financialYear",
      key: "financialYear",
    },
  ];

  // Handle search
  const handleSearch = (value: string) => {
    setSearchText(value);
  };

  // Handle financial year filter
  const handleFinancialYearFilter = (value: string | null) => {
    setFinancialYearFilter(value);
  };

  // Handle calculate tax
  const handleCalculateTax = () => {
    form.resetFields();
    setIsModalVisible(true);
  };

  // Handle modal OK (submit tax calculation)
  const handleModalOk = () => {
    form
      .validateFields()
      .then((values) => {
        const { employeeName, taxableIncome, financialYear } = values;
        const taxRate = calculateTaxRate(taxableIncome);
        const taxAmount = (taxableIncome * taxRate) / 100;

        const newTaxRecord = {
          key: (taxRecords.length + 1).toString(),
          employeeName,
          taxableIncome,
          taxRate,
          taxAmount,
          financialYear,
        };

        setTaxRecords([...taxRecords, newTaxRecord]);
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

  // Calculate tax rate based on income
  const calculateTaxRate = (income: number): number => {
    if (income <= 50000) return 20;
    if (income <= 100000) return 25;
    return 30;
  };

  // Apply filters
  const filteredData = taxRecords.filter((record) => {
    const matchesSearch = record.employeeName
      .toLowerCase()
      .includes(searchText.toLowerCase());
    const matchesFinancialYear = financialYearFilter
      ? record.financialYear === financialYearFilter
      : true;

    return matchesSearch && matchesFinancialYear;
  });

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6 text-center">Taxation</h1>

      {/* Search and Filters */}
      <div className="flex flex-wrap gap-4 mb-6">
        <Input
          placeholder="Search by employee name"
          value={searchText}
          onChange={(e) => handleSearch(e.target.value)}
          className="w-full md:w-64"
        />
        <Select
          placeholder="Filter by Financial Year"
          value={financialYearFilter}
          onChange={handleFinancialYearFilter}
          className="w-full md:w-48"
          allowClear
        >
          <Option value="2023-2024">2023-2024</Option>
          <Option value="2022-2023">2022-2023</Option>
          <Option value="2021-2022">2021-2022</Option>
        </Select>
        <Button
          type="primary"
          onClick={handleCalculateTax}
          className="w-full md:w-auto"
        >
          Calculate Tax
        </Button>
      </div>

      {/* Taxation Table */}
      <Table
        columns={columns}
        dataSource={filteredData}
        pagination={{ pageSize: 5 }}
        className="shadow-md"
      />

      {/* Calculate Tax Modal */}
      <Modal
        title="Calculate Tax"
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
            name="taxableIncome"
            label="Taxable Income"
            rules={[
              { required: true, message: "Please enter the taxable income" },
            ]}
          >
            <Input type="number" placeholder="Enter taxable income" />
          </Form.Item>
          <Form.Item
            name="financialYear"
            label="Financial Year"
            rules={[
              { required: true, message: "Please select the financial year" },
            ]}
          >
            <Select placeholder="Select financial year">
              <Option value="2023-2024">2023-2024</Option>
              <Option value="2022-2023">2022-2023</Option>
              <Option value="2021-2022">2021-2022</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default TaxationPage;
