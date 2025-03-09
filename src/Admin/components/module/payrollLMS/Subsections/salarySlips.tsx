import React, { useState } from "react";
import { Table, Input, Button, Select, Tag, Space } from "antd";
import type { ColumnsType } from "antd/es/table";
import "tailwindcss/tailwind.css"; // Ensure Tailwind CSS is imported

const { Option } = Select;

interface SalarySlip {
  key: string;
  employeeName: string;
  month: string;
  year: string;
  grossSalary: number;
  deductions: number;
  netSalary: number;
}

const SalarySlipsPage: React.FC = () => {
  const [salarySlips, setSalarySlips] = useState<SalarySlip[]>([
    {
      key: "1",
      employeeName: "John Doe",
      month: "October",
      year: "2023",
      grossSalary: 5000,
      deductions: 500,
      netSalary: 4500,
    },
    {
      key: "2",
      employeeName: "Jane Smith",
      month: "October",
      year: "2023",
      grossSalary: 6000,
      deductions: 600,
      netSalary: 5400,
    },
    {
      key: "3",
      employeeName: "Alice Johnson",
      month: "September",
      year: "2023",
      grossSalary: 5500,
      deductions: 550,
      netSalary: 4950,
    },
  ]);
  console.log(setSalarySlips); // will be change this line
  const [searchText, setSearchText] = useState("");
  const [monthFilter, setMonthFilter] = useState<string | null>(null);
  const [yearFilter, setYearFilter] = useState<string | null>(null);

  // Columns for the salary slips table
  const columns: ColumnsType<SalarySlip> = [
    {
      title: "Employee Name",
      dataIndex: "employeeName",
      key: "employeeName",
    },
    {
      title: "Month",
      dataIndex: "month",
      key: "month",
    },
    {
      title: "Year",
      dataIndex: "year",
      key: "year",
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
      title: "Action",
      key: "action",
      render: (_, record) => (
        <Space size="middle">
          <Button type="link" onClick={() => handleDownload(record)}>
            Download
          </Button>
        </Space>
      ),
    },
  ];

  // Handle search
  const handleSearch = (value: string) => {
    setSearchText(value);
  };

  // Handle month filter
  const handleMonthFilter = (value: string | null) => {
    setMonthFilter(value);
  };

  // Handle year filter
  const handleYearFilter = (value: string | null) => {
    setYearFilter(value);
  };

  // Handle download salary slip
  const handleDownload = (record: SalarySlip) => {
    // Simulate downloading a salary slip (e.g., generate a PDF)
    alert(`Downloading salary slip for ${record.employeeName}`);
  };

  // Apply filters
  const filteredData = salarySlips.filter((record) => {
    const matchesSearch = record.employeeName
      .toLowerCase()
      .includes(searchText.toLowerCase());
    const matchesMonth = monthFilter ? record.month === monthFilter : true;
    const matchesYear = yearFilter ? record.year === yearFilter : true;

    return matchesSearch && matchesMonth && matchesYear;
  });

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6 text-center">Salary Slips</h1>

      {/* Search and Filters */}
      <div className="flex flex-wrap gap-4 mb-6">
        <Input
          placeholder="Search by employee name"
          value={searchText}
          onChange={(e) => handleSearch(e.target.value)}
          className="w-full md:w-64"
        />
        <Select
          placeholder="Filter by Month"
          value={monthFilter}
          onChange={handleMonthFilter}
          className="w-full md:w-48"
          allowClear
        >
          <Option value="January">January</Option>
          <Option value="February">February</Option>
          <Option value="March">March</Option>
          <Option value="April">April</Option>
          <Option value="May">May</Option>
          <Option value="June">June</Option>
          <Option value="July">July</Option>
          <Option value="August">August</Option>
          <Option value="September">September</Option>
          <Option value="October">October</Option>
          <Option value="November">November</Option>
          <Option value="December">December</Option>
        </Select>
        <Select
          placeholder="Filter by Year"
          value={yearFilter}
          onChange={handleYearFilter}
          className="w-full md:w-48"
          allowClear
        >
          <Option value="2023">2023</Option>
          <Option value="2022">2022</Option>
          <Option value="2021">2021</Option>
        </Select>
      </div>

      {/* Salary Slips Table */}
      <Table
        columns={columns}
        dataSource={filteredData}
        pagination={{ pageSize: 5 }}
        className="shadow-md"
      />
    </div>
  );
};

export default SalarySlipsPage;
