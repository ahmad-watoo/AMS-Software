import React, { useState } from "react";
import { Table, Input, DatePicker, Tag } from "antd";
import type { ColumnsType } from "antd/es/table";
import "tailwindcss/tailwind.css"; // Ensure Tailwind CSS is imported

const { RangePicker } = DatePicker;

interface StaffAttendance {
  key: string;
  staffName: string;
  date: string;
  status: string;
}

const StaffAttendancePage: React.FC = () => {
  const [attendanceData, setAttendanceData] = useState<StaffAttendance[]>([
    {
      key: "1",
      staffName: "John Doe",
      date: "2023-10-15",
      status: "Present",
    },
    {
      key: "2",
      staffName: "Jane Smith",
      date: "2023-10-15",
      status: "Absent",
    },
    {
      key: "3",
      staffName: "Alice Johnson",
      date: "2023-10-16",
      status: "Present",
    },
    {
      key: "4",
      staffName: "Bob Brown",
      date: "2023-10-16",
      status: "Present",
    },
  ]);

  const [searchText, setSearchText] = useState("");
  const [dateRange, setDateRange] = useState<string[]>([]);

  // Columns for the staff attendance table
  const columns: ColumnsType<StaffAttendance> = [
    {
      title: "Staff Name",
      dataIndex: "staffName",
      key: "staffName",
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
      render: (status: string, record: StaffAttendance) => (
        <Tag
          color={status === "Present" ? "green" : "red"}
          onClick={() => handleToggleStatus(record.key)}
          className="cursor-pointer"
        >
          {status}
        </Tag>
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

  // Handle toggle attendance status
  const handleToggleStatus = (key: string) => {
    setAttendanceData(
      attendanceData.map((record) =>
        record.key === key
          ? {
              ...record,
              status: record.status === "Present" ? "Absent" : "Present",
            }
          : record
      )
    );
  };

  // Apply filters
  const filteredData = attendanceData.filter((record) => {
    const matchesSearch = record.staffName
      .toLowerCase()
      .includes(searchText.toLowerCase());
    const matchesDateRange =
      dateRange.length === 0 ||
      (record.date >= dateRange[0] && record.date <= dateRange[1]);

    return matchesSearch && matchesDateRange;
  });

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6 text-center">Staff Attendance</h1>

      {/* Search and Filters */}
      <div className="flex flex-wrap gap-4 mb-6">
        <Input
          placeholder="Search by staff name"
          value={searchText}
          onChange={(e) => handleSearch(e.target.value)}
          className="w-full md:w-64"
        />
        <RangePicker
          onChange={handleDateRangeChange}
          className="w-full md:w-48"
        />
      </div>

      {/* Staff Attendance Table */}
      <Table
        columns={columns}
        dataSource={filteredData}
        pagination={{ pageSize: 5 }}
        className="shadow-md"
      />
    </div>
  );
};

export default StaffAttendancePage;
