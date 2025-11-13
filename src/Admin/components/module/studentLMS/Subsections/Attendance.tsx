import React, { useEffect, useMemo, useState } from "react";
import {
  Card,
  Table,
  Tag,
  Space,
  Statistic,
  message,
  Select,
  Button,
  Empty,
  Skeleton,
} from "antd";
import attendanceAPI, { AttendanceReport } from "../../../../../api/attendance.api";

const { Option } = Select;

const Attendance: React.FC = () => {
  const [reports, setReports] = useState<AttendanceReport[]>([]);
  const [loading, setLoading] = useState(false);
  const [minPercentage, setMinPercentage] = useState<number>(75);

  const loadReports = async (percentage: number) => {
    try {
      setLoading(true);
      const response = await attendanceAPI.getAttendanceReport({
        minPercentage: percentage,
      });
      setReports(response || []);
    } catch (error: any) {
      message.error(error.message || "Failed to load attendance reports");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports(minPercentage);
  }, [minPercentage]);

  const summary = useMemo(() => {
    const totalStudents = reports.length;
    const critical = reports.filter((report) => report.status === "critical").length;
    const warnings = reports.filter((report) => report.status === "warning").length;
    return {
      totalStudents,
      critical,
      warnings,
    };
  }, [reports]);

  const columns = [
    {
      title: "Student",
      dataIndex: "studentName",
      key: "studentName",
      render: (studentName: string, record: AttendanceReport) => (
        <div>
          <strong>{studentName}</strong>
          <div style={{ fontSize: 12, color: "#888" }}>{record.studentId}</div>
        </div>
      ),
    },
    {
      title: "Course",
      dataIndex: "courseName",
      key: "courseName",
      render: (courseName: string, record: AttendanceReport) => (
        <div>
          <strong>{courseName}</strong>
          <div style={{ fontSize: 12, color: "#888" }}>Section {record.sectionCode}</div>
        </div>
      ),
    },
    {
      title: "Attendance %",
      dataIndex: "attendancePercentage",
      key: "attendancePercentage",
      render: (value: number) => (
        <Tag color={value >= minPercentage ? "green" : "red"}>{value.toFixed(1)}%</Tag>
      ),
    },
    {
      title: "Classes",
      key: "classes",
      render: (_: any, record: AttendanceReport) => (
        <span>
          {record.presentCount}/{record.totalClasses} present
        </span>
      ),
    },
    {
      title: "Absences",
      dataIndex: "absentCount",
      key: "absentCount",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: AttendanceReport["status"]) => (
        <Tag color={status === "critical" ? "red" : status === "warning" ? "orange" : "green"}>
          {status.toUpperCase()}
        </Tag>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Space direction="vertical" size="large" style={{ width: "100%" }}>
        <Card bordered={false}>
          <Space size="large" wrap>
            <Statistic title="Tracked Students" value={summary.totalStudents} />
            <Statistic
              title="Warnings"
              value={summary.warnings}
              valueStyle={{ color: "#faad14" }}
            />
            <Statistic
              title="Critical"
              value={summary.critical}
              valueStyle={{ color: "#ff4d4f" }}
            />
          </Space>
        </Card>

        <Card bordered={false}>
          <Space style={{ marginBottom: 16 }}>
            <Select
              value={minPercentage}
              onChange={(value) => setMinPercentage(value)}
              style={{ width: 220 }}
            >
              <Option value={90}>Show below 90%</Option>
              <Option value={85}>Show below 85%</Option>
              <Option value={80}>Show below 80%</Option>
              <Option value={75}>Show below 75%</Option>
              <Option value={70}>Show below 70%</Option>
            </Select>
            <Button onClick={() => setMinPercentage(75)}>Reset Filter</Button>
          </Space>

          {loading ? (
            <Skeleton active paragraph={{ rows: 6 }} />
          ) : reports.length === 0 ? (
            <Empty description="No attendance alerts" />
          ) : (
            <Table
              columns={columns}
              dataSource={reports}
              rowKey={(record) => `${record.studentId}-${record.courseId}`}
              pagination={{ pageSize: 12 }}
            />
          )}
        </Card>
      </Space>
    </div>
  );
};

export default Attendance;
