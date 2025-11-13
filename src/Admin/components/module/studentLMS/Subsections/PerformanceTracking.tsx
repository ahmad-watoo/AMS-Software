import React, { useEffect, useMemo, useState } from "react";
import {
  Card,
  Row,
  Col,
  Select,
  Input,
  Table,
  Tag,
  Space,
  Statistic,
  message,
  Empty,
  Skeleton,
} from "antd";
import { studentAPI, Student } from "../../../../../api/student.api";
import attendanceAPI from "../../../../../api/attendance.api";

const { Option } = Select;

interface PerformanceRecord {
  key: string;
  studentId: string;
  name: string;
  rollNumber: string;
  cgpa?: number;
  lastSemesterGPA?: number;
  attendancePercentage?: number;
  totalAbsences?: number;
  warnings?: number;
  status: string;
}

const PerformanceTracking: React.FC = () => {
  const [records, setRecords] = useState<PerformanceRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    search: "",
    status: "",
    semester: "latest",
  });

  const loadPerformanceData = async (semester: string) => {
    try {
      setLoading(true);
      const [studentsResponse] = await Promise.all([
        studentAPI.getStudents(1, 200),
      ]);
      const studentsData = studentsResponse.students;

      const performanceRecords: PerformanceRecord[] = await Promise.all(
        studentsData.map(async (student: Student) => {
          let cgpa: number | undefined;
          let lastSemesterGPA: number | undefined;
          let attendancePercentage: number | undefined;
          let totalAbsences: number | undefined;

          try {
            cgpa = await studentAPI.getStudentCGPA(student.id);
          } catch (error) {
            // ignore missing CGPA
          }

          try {
            const results = await studentAPI.getStudentResults(
              student.id,
              semester === "latest" ? undefined : semester
            );
            if (results.length > 0) {
              const gpaValues = results
                .map((result: any) => result.gpa)
                .filter((gpa: number) => typeof gpa === "number");
              if (gpaValues.length > 0) {
                const sum = gpaValues.reduce((acc: number, gpa: number) => acc + gpa, 0);
                lastSemesterGPA = sum / gpaValues.length;
              }
            }
          } catch (error) {
            // ignore results errors
          }

          try {
            const attendance = await attendanceAPI.getAttendanceSummary({
              studentId: student.id,
            });
            if (attendance) {
              attendancePercentage = attendance.attendancePercentage;
              totalAbsences = attendance.absentCount;
            }
          } catch (error) {
            // ignore attendance errors
          }

          const riskLevel = getRiskLevel({
            cgpa,
            lastSemesterGPA,
            attendancePercentage,
          });

          return {
            key: student.id,
            studentId: student.id,
            name: student.user
              ? `${student.user.firstName} ${student.user.lastName}`
              : "N/A",
            rollNumber: student.rollNumber,
            cgpa,
            lastSemesterGPA,
            attendancePercentage,
            totalAbsences,
            warnings: riskLevel === "Critical" ? 2 : riskLevel === "At Risk" ? 1 : 0,
            status: riskLevel,
          };
        })
      );

      setRecords(performanceRecords);
    } catch (error: any) {
      message.error(error.message || "Failed to load performance data");
    } finally {
      setLoading(false);
    }
  };

  const getRiskLevel = ({
    cgpa,
    lastSemesterGPA,
    attendancePercentage,
  }: {
    cgpa?: number;
    lastSemesterGPA?: number;
    attendancePercentage?: number;
  }) => {
    const thresholds = {
      cgpa: {
        excellent: 3.5,
        good: 3.0,
        risk: 2.5,
      },
      gpaDrop: 0.5,
      attendance: {
        critical: 70,
        warning: 80,
      },
    };

    if (
      (cgpa !== undefined && cgpa < 2.5) ||
      (attendancePercentage !== undefined &&
        attendancePercentage < thresholds.attendance.critical)
    ) {
      return "Critical";
    }

    if (
      (cgpa !== undefined && cgpa < 3.0) ||
      (attendancePercentage !== undefined &&
        attendancePercentage < thresholds.attendance.warning) ||
      (cgpa !== undefined &&
        lastSemesterGPA !== undefined &&
        cgpa - lastSemesterGPA > thresholds.gpaDrop)
    ) {
      return "At Risk";
    }

    return "On Track";
  };

  useEffect(() => {
    loadPerformanceData(filters.semester);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.semester]);

  const filteredRecords = useMemo(() => {
    return records.filter((record) => {
      const matchesSearch =
        filters.search.trim().length === 0 ||
        record.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        record.rollNumber.toLowerCase().includes(filters.search.toLowerCase());

      const matchesStatus =
        !filters.status || record.status === filters.status;

      return matchesSearch && matchesStatus;
    });
  }, [records, filters]);

  const summary = useMemo(() => {
    if (records.length === 0) {
      return {
        averageCGPA: null,
        atRiskCount: 0,
        criticalCount: 0,
        averageAttendance: null,
      };
    }

    const cgpaValues = records
      .map((record) => record.cgpa)
      .filter((value): value is number => typeof value === "number");
    const averageCGPA =
      cgpaValues.length > 0
        ? cgpaValues.reduce((acc, value) => acc + value, 0) / cgpaValues.length
        : null;

    const attendanceValues = records
      .map((record) => record.attendancePercentage)
      .filter((value): value is number => typeof value === "number");
    const averageAttendance =
      attendanceValues.length > 0
        ? attendanceValues.reduce((acc, value) => acc + value, 0) /
          attendanceValues.length
        : null;

    const atRiskCount = records.filter(
      (record) => record.status === "At Risk"
    ).length;
    const criticalCount = records.filter(
      (record) => record.status === "Critical"
    ).length;

    return {
      averageCGPA,
      atRiskCount,
      criticalCount,
      averageAttendance,
    };
  }, [records]);

  const columns = [
    {
      title: "Student",
      dataIndex: "name",
      key: "name",
      render: (_: any, record: PerformanceRecord) => (
        <div>
          <strong>{record.name}</strong>
          <div style={{ fontSize: 12, color: "#888" }}>{record.rollNumber}</div>
        </div>
      ),
    },
    {
      title: "CGPA",
      dataIndex: "cgpa",
      key: "cgpa",
      render: (cgpa: number | undefined) =>
        cgpa !== undefined ? cgpa.toFixed(2) : "N/A",
    },
    {
      title: "Last Semester GPA",
      dataIndex: "lastSemesterGPA",
      key: "lastSemesterGPA",
      render: (gpa: number | undefined) =>
        gpa !== undefined ? gpa.toFixed(2) : "N/A",
    },
    {
      title: "Attendance",
      dataIndex: "attendancePercentage",
      key: "attendancePercentage",
      render: (attendance: number | undefined) =>
        attendance !== undefined ? `${attendance.toFixed(1)}%` : "N/A",
    },
    {
      title: "Absences",
      dataIndex: "totalAbsences",
      key: "totalAbsences",
      render: (absences: number | undefined) =>
        absences !== undefined ? absences : "N/A",
    },
    {
      title: "Risk Level",
      dataIndex: "status",
      key: "status",
      render: (status: string) => {
        const color =
          status === "Critical" ? "red" : status === "At Risk" ? "orange" : "green";
        return <Tag color={color}>{status}</Tag>;
      },
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Space direction="vertical" size="large" style={{ width: "100%" }}>
        <Card bordered={false}>
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} lg={6}>
              <Statistic
                title="Average CGPA"
                value={
                  summary.averageCGPA !== null
                    ? summary.averageCGPA.toFixed(2)
                    : "N/A"
                }
              />
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Statistic
                title="Average Attendance"
                value={
                  summary.averageAttendance !== null
                    ? `${summary.averageAttendance.toFixed(1)}%`
                    : "N/A"
                }
              />
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Statistic
                title="At Risk Students"
                value={summary.atRiskCount}
                valueStyle={{ color: "#faad14" }}
              />
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Statistic
                title="Critical Alerts"
                value={summary.criticalCount}
                valueStyle={{ color: "#ff4d4f" }}
              />
            </Col>
          </Row>
        </Card>

        <Card bordered={false}>
          <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
            <Col xs={24} md={12} lg={8}>
              <Input
                placeholder="Search by student or roll number"
                allowClear
                value={filters.search}
                onChange={(event) =>
                  setFilters((prev) => ({
                    ...prev,
                    search: event.target.value,
                  }))
                }
              />
            </Col>
            <Col xs={24} md={12} lg={8}>
              <Select
                allowClear
                placeholder="Filter by risk level"
                value={filters.status || undefined}
                onChange={(value) =>
                  setFilters((prev) => ({
                    ...prev,
                    status: value || "",
                  }))
                }
                style={{ width: "100%" }}
              >
                <Option value="On Track">On Track</Option>
                <Option value="At Risk">At Risk</Option>
                <Option value="Critical">Critical</Option>
              </Select>
            </Col>
            <Col xs={24} md={12} lg={8}>
              <Select
                value={filters.semester}
                onChange={(value) =>
                  setFilters((prev) => ({
                    ...prev,
                    semester: value,
                  }))
                }
                style={{ width: "100%" }}
              >
                <Option value="latest">Latest Semester</Option>
                <Option value="2024-Fall">2024-Fall</Option>
                <Option value="2024-Spring">2024-Spring</Option>
                <Option value="2023-Fall">2023-Fall</Option>
              </Select>
            </Col>
          </Row>
          {loading ? (
            <Skeleton active paragraph={{ rows: 6 }} />
          ) : filteredRecords.length === 0 ? (
            <Empty description="No performance data available" />
          ) : (
            <Table
              columns={columns}
              dataSource={filteredRecords}
              rowKey="key"
              pagination={{ pageSize: 10 }}
            />
          )}
        </Card>
      </Space>
    </div>
  );
};

export default PerformanceTracking;
