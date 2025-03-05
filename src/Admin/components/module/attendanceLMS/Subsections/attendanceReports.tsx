import React, { useState } from "react";
import { Table, Input, Select, DatePicker, Tag } from "antd";
import type { ColumnsType } from "antd/es/table";
import "tailwindcss/tailwind.css"; // Ensure Tailwind CSS is imported

const { RangePicker } = DatePicker;
const { Option } = Select;

interface AttendanceRecord {
  key: string;
  studentName: string;
  className: string;
  date: string;
  status: string;
}

const AttendanceReportPage: React.FC = () => {
  const [attendanceData, setAttendanceData] = useState<AttendanceRecord[]>([
    {
      key: "1",
      studentName: "John Doe",
      className: "Class 10A",
      date: "2023-10-15",
      status: "Present",
    },
    {
      key: "2",
      studentName: "Jane Smith",
      className: "Class 11B",
      date: "2023-10-15",
      status: "Absent",
    },
    {
      key: "3",
      studentName: "Alice Johnson",
      className: "Class 9C",
      date: "2023-10-16",
      status: "Present",
    },
    {
      key: "4",
      studentName: "Bob Brown",
      className: "Class 10A",
      date: "2023-10-16",
      status: "Present",
    },
  ]);
  setAttendanceData(attendanceData);
  const [searchText, setSearchText] = useState("");
  const [dateRange, setDateRange] = useState<string[]>([]);
  const [classFilter, setClassFilter] = useState<string | null>(null);

  // Columns for the attendance table
  const columns: ColumnsType<AttendanceRecord> = [
    {
      title: "Student Name",
      dataIndex: "studentName",
      key: "studentName",
    },
    {
      title: "Class",
      dataIndex: "className",
      key: "className",
    },
    {
      title: "Date",
      dataIndex: "date",
      key: "date",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => (
        <Tag color={status === "Present" ? "green" : "red"}>{status}</Tag>
      ),
    },
  ];

  // Handle search
  const handleSearch = (value: string) => {
    setSearchText(value);
  };

  // Handle date range filter
  const handleDateRangeChange = (dates: any, dateStrings: string[]) => {
    setDateRange(dateStrings);
  };

  // Handle class filter
  const handleClassFilter = (value: string | null) => {
    setClassFilter(value);
  };

  // Apply filters
  const filteredData = attendanceData.filter((record) => {
    const matchesSearch = record.studentName
      .toLowerCase()
      .includes(searchText.toLowerCase());
    const matchesDateRange =
      dateRange.length === 0 ||
      (record.date >= dateRange[0] && record.date <= dateRange[1]);
    const matchesClass = classFilter ? record.className === classFilter : true;

    return matchesSearch && matchesDateRange && matchesClass;
  });

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6 text-center">Attendance Report</h1>

      {/* Search and Filters */}
      <div className="flex flex-wrap gap-4 mb-6">
        <Input
          placeholder="Search by student name"
          value={searchText}
          onChange={(e) => handleSearch(e.target.value)}
          className="w-full md:w-64"
        />
        <RangePicker
          onChange={handleDateRangeChange}
          className="w-full md:w-48"
        />
        <Select
          placeholder="Filter by Class"
          value={classFilter}
          onChange={handleClassFilter}
          className="w-full md:w-48"
          allowClear
        >
          <Option value="Class 10A">Class 10A</Option>
          <Option value="Class 11B">Class 11B</Option>
          <Option value="Class 9C">Class 9C</Option>
        </Select>
      </div>

      {/* Attendance Table */}
      <Table
        columns={columns}
        dataSource={filteredData}
        pagination={{ pageSize: 5 }}
        className="shadow-md"
      />
    </div>
  );
};

export default AttendanceReportPage;
