import React, { useEffect, useMemo, useState } from "react";
import {
  Card,
  Select,
  Descriptions,
  Tag,
  Table,
  Skeleton,
  Empty,
  Row,
  Col,
  Space,
  message,
  Statistic,
} from "antd";
import { studentAPI, Student } from "../../../../../api/student.api";
import attendanceAPI from "../../../../../api/attendance.api";
import financeAPI from "../../../../../api/finance.api";

const { Option } = Select;

interface EnrollmentRow {
  id: string;
  courseCode?: string;
  courseTitle?: string;
  sectionCode?: string;
  semester?: string;
  status?: string;
  creditHours?: number;
}

interface ResultRow {
  id: string;
  course?: string;
  grade?: string;
  obtainedMarks?: number;
  totalMarks?: number;
  gpa?: number;
}

interface FeeRow {
  id: string;
  feeStructureId?: string;
  amount: number;
  dueDate: string;
  status: string;
  balance?: number;
}

const StudentProfile: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<string>("");
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [enrollments, setEnrollments] = useState<EnrollmentRow[]>([]);
  const [results, setResults] = useState<ResultRow[]>([]);
  const [fees, setFees] = useState<FeeRow[]>([]);
  const [attendancePct, setAttendancePct] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const loadStudents = async () => {
    try {
      const response = await studentAPI.getStudents(1, 200);
      setStudents(response.students);
      if (response.students.length > 0) {
        setSelectedStudentId(response.students[0].id);
      }
    } catch (error: any) {
      message.error(error.message || "Failed to load students");
    }
  };

  useEffect(() => {
    loadStudents();
  }, []);

  const loadStudentDetail = async (studentId: string) => {
    if (!studentId) return;
    try {
      setLoading(true);
      const [studentDetail, enrollmentData, resultData, feeData, attendanceSummary] =
        await Promise.all([
          studentAPI.getStudent(studentId),
          studentAPI.getStudentEnrollments(studentId),
          studentAPI.getStudentResults(studentId),
          financeAPI.getAllStudentFees({ studentId, limit: 50 }),
          attendanceAPI.getAttendanceSummary({ studentId }),
        ]);

      setSelectedStudent(studentDetail);

      setEnrollments(
        (enrollmentData || []).map((enrollment: any) => ({
          id: enrollment.id,
          courseCode: enrollment.sections?.courses?.code,
          courseTitle: enrollment.sections?.courses?.title,
          sectionCode: enrollment.sections?.sectionCode,
          semester: enrollment.sections?.semester,
          status: enrollment.status,
          creditHours: enrollment.sections?.courses?.creditHours,
        }))
      );

      setResults(
        (resultData || []).map((result: any) => ({
          id: result.id,
          course: result.enrollments?.sections?.courses?.code,
          grade: result.grade,
          obtainedMarks: result.obtainedMarks,
          totalMarks: result.totalMarks,
          gpa: result.gpa,
        }))
      );

      setFees(
        (feeData?.studentFees || []).map((fee: any) => ({
          id: fee.id,
          feeStructureId: fee.feeStructureId,
          amount: fee.amount,
          dueDate: fee.dueDate,
          status: fee.status,
          balance: fee.balance,
        }))
      );

      setAttendancePct(attendanceSummary?.attendancePercentage ?? null);
    } catch (error: any) {
      message.error(error.message || "Failed to load student profile");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedStudentId) {
      loadStudentDetail(selectedStudentId);
    }
  }, [selectedStudentId]);

  const attendanceTagColor = useMemo(() => {
    if (attendancePct === null) return "default";
    if (attendancePct >= 90) return "green";
    if (attendancePct >= 75) return "blue";
    return "red";
  }, [attendancePct]);

  const enrollmentColumns = [
    {
      title: "Course",
      dataIndex: "courseCode",
      key: "courseCode",
      render: (code: string, record: EnrollmentRow) => (
        <div>
          <strong>{code || "N/A"}</strong>
          <div style={{ fontSize: 12, color: "#888" }}>{record.courseTitle || ""}</div>
        </div>
      ),
    },
    {
      title: "Section",
      dataIndex: "sectionCode",
      key: "sectionCode",
      render: (value: string) => value || "N/A",
    },
    {
      title: "Semester",
      dataIndex: "semester",
      key: "semester",
    },
    {
      title: "Credit Hours",
      dataIndex: "creditHours",
      key: "creditHours",
      render: (value: number | undefined) => value ?? "-",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => <Tag color="blue">{(status || "Registered").toUpperCase()}</Tag>,
    },
  ];

  const resultColumns = [
    {
      title: "Course",
      dataIndex: "course",
      key: "course",
      render: (course: string) => course || "-",
    },
    {
      title: "Grade",
      dataIndex: "grade",
      key: "grade",
      render: (grade: string) => <Tag color={grade ? "green" : "default"}>{grade || "Pending"}</Tag>,
    },
    {
      title: "Marks",
      key: "marks",
      render: (_: any, record: ResultRow) =>
        record.obtainedMarks !== undefined
          ? `${record.obtainedMarks}/${record.totalMarks ?? "-"}`
          : "-",
    },
    {
      title: "GPA",
      dataIndex: "gpa",
      key: "gpa",
      render: (gpa: number | undefined) => (gpa !== undefined ? gpa.toFixed(2) : "-"),
    },
  ];

  const feeColumns = [
    {
      title: "Due Date",
      dataIndex: "dueDate",
      key: "dueDate",
      render: (value: string) => new Date(value).toLocaleDateString(),
    },
    {
      title: "Amount",
      dataIndex: "amount",
      key: "amount",
      render: (amount: number) => `Rs. ${amount.toLocaleString()}`,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => (
        <Tag color={status === "paid" ? "green" : status === "overdue" ? "red" : "blue"}>
          {status?.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: "Balance",
      dataIndex: "balance",
      key: "balance",
      render: (balance: number | undefined) =>
        balance !== undefined ? `Rs. ${balance.toLocaleString()}` : "-",
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Space direction="vertical" size="large" style={{ width: "100%" }}>
        <Card bordered={false}>
          <Space wrap style={{ width: "100%" }}>
            <Select
              showSearch
              optionFilterProp="children"
              placeholder="Select a student"
              value={selectedStudentId || undefined}
              onChange={(value) => setSelectedStudentId(value)}
              style={{ minWidth: 280 }}
            >
              {students.map((student) => (
                <Option key={student.id} value={student.id}>
                  {student.user
                    ? `${student.user.firstName} ${student.user.lastName} (${student.rollNumber})`
                    : student.rollNumber}
                </Option>
              ))}
            </Select>
          </Space>
        </Card>

        <Card bordered={false}>
          {loading ? (
            <Skeleton active paragraph={{ rows: 8 }} />
          ) : !selectedStudent ? (
            <Empty description="Select a student to view details" />
          ) : (
            <Space direction="vertical" size="large" style={{ width: "100%" }}>
              <Row gutter={[16, 16]}>
                <Col xs={24} lg={16}>
                  <Descriptions bordered column={2} size="small" title="Student Information">
                    <Descriptions.Item label="Roll Number">
                      <strong>{selectedStudent.rollNumber}</strong>
                    </Descriptions.Item>
                    <Descriptions.Item label="Program">
                      {selectedStudent.program?.name || "N/A"}
                    </Descriptions.Item>
                    <Descriptions.Item label="Name" span={2}>
                      {selectedStudent.user
                        ? `${selectedStudent.user.firstName} ${selectedStudent.user.lastName}`
                        : "N/A"}
                    </Descriptions.Item>
                    <Descriptions.Item label="Email">
                      {selectedStudent.user?.email || "N/A"}
                    </Descriptions.Item>
                    <Descriptions.Item label="Phone">
                      {selectedStudent.user?.phone || "N/A"}
                    </Descriptions.Item>
                    <Descriptions.Item label="Status">
                      <Tag color={selectedStudent.enrollmentStatus === "active" ? "green" : "orange"}>
                        {selectedStudent.enrollmentStatus.toUpperCase()}
                      </Tag>
                    </Descriptions.Item>
                    <Descriptions.Item label="Batch">
                      {selectedStudent.batch}
                    </Descriptions.Item>
                    <Descriptions.Item label="Current Semester">
                      Semester {selectedStudent.currentSemester}
                    </Descriptions.Item>
                    <Descriptions.Item label="Admission Date">
                      {new Date(selectedStudent.admissionDate).toLocaleDateString()}
                    </Descriptions.Item>
                    {selectedStudent.guardianId && (
                      <Descriptions.Item label="Guardian">
                        ID: {selectedStudent.guardianId}
                      </Descriptions.Item>
                    )}
                  </Descriptions>
                </Col>
                <Col xs={24} lg={8}>
                  <Card title="Key Metrics" size="small">
                    <Space direction="vertical" size="large" style={{ width: "100%" }}>
                      <Statistic
                        title="CGPA"
                        value={selectedStudent.cgpa ?? "N/A"}
                        precision={2}
                        valueStyle={{ color: selectedStudent.cgpa && selectedStudent.cgpa >= 3 ? "#52c41a" : undefined }}
                      />
                      <Statistic
                        title="Attendance"
                        value={attendancePct !== null ? `${attendancePct.toFixed(1)}%` : "N/A"}
                        valueStyle={{ color: attendanceTagColor === "red" ? "#ff4d4f" : attendanceTagColor === "green" ? "#52c41a" : "#1890ff" }}
                      />
                    </Space>
                  </Card>
                </Col>
              </Row>

              <Card title="Course Enrollments" size="small">
                {enrollments.length === 0 ? (
                  <Empty description="No enrollments found" />
                ) : (
                  <Table
                    columns={enrollmentColumns}
                    dataSource={enrollments}
                    rowKey="id"
                    pagination={{ pageSize: 5 }}
                  />
                )}
              </Card>

              <Card title="Academic Results" size="small">
                {results.length === 0 ? (
                  <Empty description="No results recorded" />
                ) : (
                  <Table
                    columns={resultColumns}
                    dataSource={results}
                    rowKey="id"
                    pagination={{ pageSize: 5 }}
                  />
                )}
              </Card>

              <Card title="Fee Overview" size="small">
                {fees.length === 0 ? (
                  <Empty description="No fee records" />
                ) : (
                  <Table
                    columns={feeColumns}
                    dataSource={fees}
                    rowKey="id"
                    pagination={{ pageSize: 5 }}
                  />
                )}
              </Card>
            </Space>
          )}
        </Card>
      </Space>
    </div>
  );
};

export default StudentProfile;
