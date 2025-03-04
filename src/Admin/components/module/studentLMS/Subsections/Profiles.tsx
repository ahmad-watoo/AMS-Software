import React from "react";
import { Card, Tag, Progress, Table } from "antd";
import "tailwindcss/tailwind.css"; // Ensure Tailwind CSS is imported

interface StudentProfileT {
  key: string;
  name: string;
  studentId: string;
  email: string;
  phone: string;
  address: string;
  grade: string;
  assignmentsCompleted: number;
  overallPerformance: string;
  attendance: string;
  feeStatus: string;
}

const StudentProfile: React.FC = () => {
  // Sample data for the student profile
  const student: StudentProfileT = {
    key: "1",
    name: "M Ahmad",
    studentId: "S001",
    email: "john.doe@example.com",
    phone: "+1234567890",
    address: "123 Main St, City, Country",
    grade: "A",
    assignmentsCompleted: 10,
    overallPerformance: "Excellent",
    attendance: "95%",
    feeStatus: "Paid",
  };

  // Columns for the fee history table
  const feeHistoryColumns = [
    {
      title: "Date",
      dataIndex: "date",
      key: "date",
    },
    {
      title: "Amount",
      dataIndex: "amount",
      key: "amount",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => (
        <Tag color={status === "Paid" ? "green" : "red"}>{status}</Tag>
      ),
    },
  ];

  // Sample fee history data
  const feeHistoryData = [
    {
      key: "1",
      date: "2023-10-01",
      amount: "$500",
      status: "Paid",
    },
    {
      key: "2",
      date: "2023-09-01",
      amount: "$500",
      status: "Paid",
    },
    {
      key: "3",
      date: "2023-08-01",
      amount: "$500",
      status: "Pending",
    },
  ];

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6 text-center">Student Profile</h1>

      {/* Student Information Section */}
      <Card title="Student Information" className="mb-6 shadow-md">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p>
              <strong>Name:</strong> {student.name}
            </p>
            <p>
              <strong>Student ID:</strong> {student.studentId}
            </p>
            <p>
              <strong>Email:</strong> {student.email}
            </p>
          </div>
          <div>
            <p>
              <strong>Phone:</strong> {student.phone}
            </p>
            <p>
              <strong>Address:</strong> {student.address}
            </p>
          </div>
        </div>
      </Card>

      {/* Academic Performance Section */}
      <Card title="Academic Performance" className="mb-6 shadow-md">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p>
              <strong>Grade:</strong> {student.grade}
            </p>
          </div>
          <div>
            <p>
              <strong>Assignments Completed:</strong>{" "}
              {student.assignmentsCompleted}
            </p>
          </div>
          <div>
            <p>
              <strong>Overall Performance:</strong>{" "}
              <Tag
                color={
                  student.overallPerformance === "Excellent"
                    ? "green"
                    : student.overallPerformance === "Good"
                    ? "blue"
                    : "red"
                }
              >
                {student.overallPerformance}
              </Tag>
            </p>
          </div>
        </div>
      </Card>

      {/* Attendance Section */}
      <Card title="Attendance" className="mb-6 shadow-md">
        <div className="flex items-center gap-4">
          <Progress
            type="circle"
            percent={parseInt(student.attendance)}
            strokeColor={
              parseInt(student.attendance) > 90
                ? "#52c41a"
                : parseInt(student.attendance) > 75
                ? "#1890ff"
                : "#ff4d4f"
            }
          />
          <p>
            <strong>Attendance Percentage:</strong> {student.attendance}
          </p>
        </div>
      </Card>

      {/* Fee Status Section */}
      <Card title="Fee Status" className="mb-6 shadow-md">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p>
              <strong>Current Fee Status:</strong>{" "}
              <Tag color={student.feeStatus === "Paid" ? "green" : "red"}>
                {student.feeStatus}
              </Tag>
            </p>
          </div>
          <div>
            <Table
              columns={feeHistoryColumns}
              dataSource={feeHistoryData}
              pagination={false}
              className="shadow-md"
            />
          </div>
        </div>
      </Card>
    </div>
  );
};

export default StudentProfile;
