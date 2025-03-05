import React, { useState } from "react";
import { Table, Select, DatePicker, Input, Tag, Button } from "antd";
import { SearchOutlined } from "@ant-design/icons";
// import dayjs from "dayjs";

const { Option } = Select;

// Mock Data (Replace with API Data)
const attendanceData = [
  {
    id: 1,
    name: "Ali Khan",
    class: "10A",
    date: "2024-03-05",
    status: "Present",
  },
  {
    id: 2,
    name: "Sara Ahmed",
    class: "9B",
    date: "2024-03-05",
    status: "Absent",
  },
  {
    id: 3,
    name: "Hassan Raza",
    class: "10A",
    date: "2024-03-05",
    status: "Late",
  },
];

const StudentAttendance: React.FC = () => {
  const [filteredData, setFilteredData] = useState(attendanceData);
  const [searchText, setSearchText] = useState("");
  const [selectedClass, setSelectedClass] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  // Filter Function
  const handleFilter = () => {
    let data = attendanceData;
    if (searchText) {
      data = data.filter((item) =>
        item.name.toLowerCase().includes(searchText.toLowerCase())
      );
    }
    if (selectedClass) {
      data = data.filter((item) => item.class === selectedClass);
    }
    if (selectedDate) {
      data = data.filter((item) => item.date === selectedDate);
    }
    setFilteredData(data);
  };

  // Table Columns
  const columns = [
    { title: "Student Name", dataIndex: "name", key: "name" },
    { title: "Class", dataIndex: "class", key: "class" },
    { title: "Date", dataIndex: "date", key: "date" },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => {
        const color =
          status === "Present"
            ? "green"
            : status === "Absent"
            ? "red"
            : "orange";
        return <Tag color={color}>{status}</Tag>;
      },
    },
  ];

  return (
    <div className="p-6 bg-white shadow-lg rounded-xl">
      <h2 className="text-xl font-semibold mb-4">Student Attendance</h2>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-4">
        <Input
          placeholder="Search Student"
          prefix={<SearchOutlined />}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          className="w-60"
        />
        <Select
          placeholder="Select Class"
          allowClear
          className="w-40"
          onChange={(value) => setSelectedClass(value)}
        >
          <Option value="10A">10A</Option>
          <Option value="9B">9B</Option>
        </Select>
        <DatePicker
          className="w-40"
          onChange={(date, dateString: any) => setSelectedDate(dateString)}
        />
        <Button type="primary" onClick={handleFilter}>
          Filter
        </Button>
      </div>

      {/* Attendance Table */}
      <Table
        dataSource={filteredData}
        columns={columns}
        rowKey="id"
        pagination={{ pageSize: 5 }}
        className="shadow-sm border rounded-lg"
      />
    </div>
  );
};

export default StudentAttendance;
