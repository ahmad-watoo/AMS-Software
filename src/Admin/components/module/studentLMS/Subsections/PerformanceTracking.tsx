import React, { useState } from "react";
import { Table, Input, Select, Button, Tag } from "antd";
import type { ColumnsType } from "antd/es/table";
import "tailwindcss/tailwind.css"; // Ensure Tailwind CSS is imported

const { Option } = Select;

interface StudentPerformance {
  key: string;
  studentName: string;
  studentId: string;
  grade: string;
  assignmentsCompleted: number;
  attendance: string;
  overallPerformance: string;
}

const PerformanceTracking: React.FC = () => {
  const [searchText, setSearchText] = useState("");
  const [filteredData, setFilteredData] = useState<StudentPerformance[]>([]);
  const [gradeFilter, setGradeFilter] = useState<string | null>(null);
  const [performanceFilter, setPerformanceFilter] = useState<string | null>(
    null
  );

  // Sample data for student performance tracking
  const dataSource: StudentPerformance[] = [
    {
      key: "1",
      studentName: "John Doe",
      studentId: "S001",
      grade: "A",
      assignmentsCompleted: 10,
      attendance: "95%",
      overallPerformance: "Excellent",
    },
    {
      key: "2",
      studentName: "Jane Smith",
      studentId: "S002",
      grade: "B",
      assignmentsCompleted: 8,
      attendance: "85%",
      overallPerformance: "Good",
    },
    {
      key: "3",
      studentName: "Alice Johnson",
      studentId: "S003",
      grade: "A",
      assignmentsCompleted: 9,
      attendance: "90%",
      overallPerformance: "Excellent",
    },
    {
      key: "4",
      studentName: "Bob Brown",
      studentId: "S004",
      grade: "C",
      assignmentsCompleted: 6,
      attendance: "75%",
      overallPerformance: "Needs Improvement",
    },
  ];

  // Columns for the table
  const columns: ColumnsType<StudentPerformance> = [
    {
      title: "Student Name",
      dataIndex: "studentName",
      key: "studentName",
    },
    {
      title: "Student ID",
      dataIndex: "studentId",
      key: "studentId",
    },
    {
      title: "Grade",
      dataIndex: "grade",
      key: "grade",
    },
    {
      title: "Assignments Completed",
      dataIndex: "assignmentsCompleted",
      key: "assignmentsCompleted",
    },
    {
      title: "Attendance",
      dataIndex: "attendance",
      key: "attendance",
    },
    {
      title: "Overall Performance",
      dataIndex: "overallPerformance",
      key: "overallPerformance",
      render: (performance: string) => (
        <Tag
          color={
            performance === "Excellent"
              ? "green"
              : performance === "Good"
              ? "blue"
              : "red"
          }
        >
          {performance}
        </Tag>
      ),
    },
  ];

  // Handle search
  const handleSearch = (value: string) => {
    setSearchText(value);
    const filtered = dataSource.filter(
      (item) =>
        item.studentName.toLowerCase().includes(value.toLowerCase()) ||
        item.studentId.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredData(filtered);
  };

  // Handle grade filter
  const handleGradeFilter = (value: string | null) => {
    setGradeFilter(value);
    applyFilters(value, performanceFilter);
  };

  // Handle performance filter
  const handlePerformanceFilter = (value: string | null) => {
    setPerformanceFilter(value);
    applyFilters(gradeFilter, value);
  };

  // Apply filters
  const applyFilters = (grade: string | null, performance: string | null) => {
    let filtered = dataSource;

    if (grade) {
      filtered = filtered.filter((item) => item.grade === grade);
    }

    if (performance) {
      filtered = filtered.filter(
        (item) => item.overallPerformance === performance
      );
    }

    setFilteredData(filtered);
  };

  // Reset filters
  const resetFilters = () => {
    setSearchText("");
    setGradeFilter(null);
    setPerformanceFilter(null);
    setFilteredData(dataSource);
  };

  return (
    <div className="max-w-7xl mx-auto p-6 bg-white shadow-lg rounded-lg">
      <h1 className="text-2xl font-bold mb-6 text-center">
        Student Performance Tracking
      </h1>

      {/* Search and Filters */}
      <div className="flex flex-wrap gap-4 mb-6">
        <Input
          placeholder="Search by name or ID"
          value={searchText}
          onChange={(e) => handleSearch(e.target.value)}
          className="w-full md:w-64"
        />
        <Select
          placeholder="Filter by Grade"
          value={gradeFilter}
          onChange={handleGradeFilter}
          className="w-full md:w-48"
          allowClear
        >
          <Option value="A">A</Option>
          <Option value="B">B</Option>
          <Option value="C">C</Option>
        </Select>
        <Select
          placeholder="Filter by Performance"
          value={performanceFilter}
          onChange={handlePerformanceFilter}
          className="w-full md:w-48"
          allowClear
        >
          <Option value="Excellent">Excellent</Option>
          <Option value="Good">Good</Option>
          <Option value="Needs Improvement">Needs Improvement</Option>
        </Select>
        <Button onClick={resetFilters} className="w-full md:w-auto">
          Reset Filters
        </Button>
      </div>

      {/* Table */}
      <Table
        columns={columns}
        dataSource={filteredData.length > 0 ? filteredData : dataSource}
        pagination={{ pageSize: 5 }}
        className="shadow-md"
      />
    </div>
  );
};

export default PerformanceTracking;
