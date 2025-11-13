import React, { useEffect, useMemo, useState } from "react";
import {
  Card,
  Table,
  Tag,
  Space,
  Select,
  Input,
  Button,
  message,
  Empty,
  Skeleton,
} from "antd";
import { studentAPI, Student } from "../../../../../api/student.api";
import attendanceAPI from "../../../../../api/attendance.api";
import { academicAPI, Program } from "../../../../../api/academic.api";

const { Option } = Select;

interface EnrollmentRecord {
  key: string;
  studentId: string;
  studentName: string;
  rollNumber: string;
  programName?: string;
  currentSemester?: number;
  courseCode?: string;
  courseTitle?: string;
  sectionCode?: string;
  semester: string;
  creditHours?: number;
  attendancePercentage?: number;
  enrollmentStatus: string;
  enrollmentDate?: string;
}

const semesters = [
  "2024-Fall",
  "2024-Summer",
  "2024-Spring",
  "2023-Fall",
  "2023-Summer",
  "2023-Spring",
];

const StudentEnrollment: React.FC = () => {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [records, setRecords] = useState<EnrollmentRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    search: "",
    semester: "2024-Fall",
    programId: "",
    status: "",
  });

  useEffect(() => {
    loadPrograms();
  }, []);

  const loadPrograms = async () => {
    try {
      const response = await academicAPI.getPrograms(1, 200, { isActive: true });
      setPrograms(response.programs);
    } catch (error) {
      message.error("Failed to load programs");
    }
  };

  const loadEnrollmentData = async (
    semester: string,
    programId?: string,
    status?: string
  ) => {
    try {
      setLoading(true);
      const studentsResponse = await studentAPI.getStudents(1, 200, {
        programId: programId || undefined,
        enrollmentStatus: status || undefined,
      });
      const studentsData = studentsResponse.students;

      const enrollmentRecords: EnrollmentRecord[] = [];

      for (const student of studentsData) {
        try {
          const enrollments = await studentAPI.getStudentEnrollments(
            student.id,
            semester === "all" ? undefined : semester
          );

          for (const enrollment of enrollments) {
            const course = enrollment.sections?.courses;
            const section = enrollment.sections;

            let attendancePercentage: number | undefined;
            try {
              const attendance = await attendanceAPI.getAttendanceSummary({
                enrollmentId: enrollment.id,
              });
              if (attendance) {
                attendancePercentage = attendance.attendancePercentage;
              }
            } catch {
              // ignore attendance fetch errors
            }

            enrollmentRecords.push({
              key: enrollment.id,
              studentId: student.id,
              studentName: student.user
                ? `${student.user.firstName} ${student.user.lastName}`
                : "N/A",
              rollNumber: student.rollNumber,
              programName: student.program?.name,
              currentSemester: student.currentSemester,
              courseCode: course?.code,
              courseTitle: course?.title,
              sectionCode: section?.sectionCode,
              semester: section?.semester || filters.semester,
              creditHours: course?.creditHours,
              attendancePercentage,
              enrollmentStatus: enrollment.status || "registered",
              enrollmentDate: enrollment.createdAt,
            });
          }
        } catch (error) {
          // Skip students without enrollment data
        }
      }

      setRecords(enrollmentRecords);
    } catch (error: any) {
      message.error(error.message || "Failed to load enrollment data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEnrollmentData(filters.semester, filters.programId, filters.status);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.semester, filters.programId, filters.status]);

  const filteredRecords = useMemo(() => {
    return records.filter((record) => {
      const matchesSearch =
        filters.search.trim().length === 0 ||
        record.studentName.toLowerCase().includes(filters.search.toLowerCase()) ||
        record.rollNumber.toLowerCase().includes(filters.search.toLowerCase()) ||
        (record.courseCode &&
          record.courseCode.toLowerCase().includes(filters.search.toLowerCase()));

      const matchesProgram =
        !filters.programId ||
        record.programName ===
          programs.find((program) => program.id === filters.programId)?.name;

      const matchesStatus =
        !filters.status || record.enrollmentStatus === filters.status;

      return matchesSearch && matchesProgram && matchesStatus;
    });
  }, [records, filters, programs]);

  const columns = [
    {
      title: "Student",
      dataIndex: "studentName",
      key: "studentName",
      render: (studentName: string, record: EnrollmentRecord) => (
        <div>
          <strong>{studentName}</strong>
          <div style={{ fontSize: 12, color: "#888" }}>{record.rollNumber}</div>
        </div>
      ),
    },
    {
      title: "Program / Semester",
      dataIndex: "programName",
      key: "programName",
      render: (programName: string, record: EnrollmentRecord) => (
        <div>
          <div>{programName || "N/A"}</div>
          <div style={{ fontSize: 12, color: "#888" }}>
            Semester {record.currentSemester || "N/A"}
          </div>
        </div>
      ),
    },
    {
      title: "Course",
      dataIndex: "courseCode",
      key: "courseCode",
      render: (courseCode: string, record: EnrollmentRecord) => (
        <div>
          <strong>{courseCode || "N/A"}</strong>
          <div style={{ fontSize: 12, color: "#888" }}>
            {record.courseTitle || "-"}
          </div>
        </div>
      ),
    },
    {
      title: "Section",
      dataIndex: "sectionCode",
      key: "sectionCode",
      render: (sectionCode: string) => sectionCode || "N/A",
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
      render: (creditHours: number | undefined) => creditHours ?? "N/A",
    },
    {
      title: "Attendance",
      dataIndex: "attendancePercentage",
      key: "attendancePercentage",
      render: (attendance: number | undefined) =>
        attendance !== undefined ? `${attendance.toFixed(1)}%` : "N/A",
    },
    {
      title: "Status",
      dataIndex: "enrollmentStatus",
      key: "enrollmentStatus",
      render: (status: string) => {
        const color =
          status === "registered"
            ? "green"
            : status === "dropped"
            ? "red"
            : "blue";
        return <Tag color={color}>{status.toUpperCase()}</Tag>;
      },
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Space direction="vertical" size="large" style={{ width: "100%" }}>
        <Card bordered={false}>
          <Space wrap style={{ width: "100%" }}>
            <Input
              placeholder="Search by student, roll number, or course"
              allowClear
              value={filters.search}
              onChange={(event) =>
                setFilters((prev) => ({ ...prev, search: event.target.value }))
              }
              style={{ width: 240 }}
            />
            <Select
              placeholder="Filter by semester"
              value={filters.semester}
              onChange={(value) =>
                setFilters((prev) => ({ ...prev, semester: value }))
              }
              style={{ width: 200 }}
            >
              <Option value="all">All Semesters</Option>
              {semesters.map((semester) => (
                <Option key={semester} value={semester}>
                  {semester}
                </Option>
              ))}
            </Select>
            <Select
              placeholder="Filter by program"
              allowClear
              value={filters.programId || undefined}
              onChange={(value) =>
                setFilters((prev) => ({ ...prev, programId: value || "" }))
              }
              style={{ width: 220 }}
              showSearch
              optionFilterProp="children"
            >
              {programs.map((program) => (
                <Option key={program.id} value={program.id}>
                  {program.name}
                </Option>
              ))}
            </Select>
            <Select
              placeholder="Filter by status"
              allowClear
              value={filters.status || undefined}
              onChange={(value) =>
                setFilters((prev) => ({ ...prev, status: value || "" }))
              }
              style={{ width: 200 }}
            >
              <Option value="registered">Registered</Option>
              <Option value="completed">Completed</Option>
              <Option value="dropped">Dropped</Option>
              <Option value="waitlisted">Waitlisted</Option>
            </Select>
            <Button
              onClick={() =>
                setFilters({
                  search: "",
                  semester: "2024-Fall",
                  programId: "",
                  status: "",
                })
              }
            >
              Reset
            </Button>
          </Space>
        </Card>
        <Card bordered={false}>
          {loading ? (
            <Skeleton active paragraph={{ rows: 6 }} />
          ) : filteredRecords.length === 0 ? (
            <Empty description="No enrollments found" />
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

export default StudentEnrollment;
