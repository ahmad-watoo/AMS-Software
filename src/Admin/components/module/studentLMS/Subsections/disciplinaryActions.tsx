import React, { useEffect, useMemo, useState } from "react";
import {
  Card,
  Table,
  Tag,
  Space,
  Statistic,
  message,
  Skeleton,
  Empty,
  Select,
  Button,
  Modal,
  Form,
} from "antd";
import { WarningOutlined, ExclamationCircleOutlined } from "@ant-design/icons";
import { studentAPI, Student } from "../../../../../api/student.api";
import attendanceAPI from "../../../../../api/attendance.api";

const { Option } = Select;

interface DisciplinaryRecord {
  key: string;
  studentId: string;
  studentName: string;
  rollNumber: string;
  programName?: string;
  enrollmentStatus: string;
  cgpa?: number;
  attendancePercentage?: number;
  riskLevel: "On Track" | "Warning" | "Critical";
}

const statusOptions = [
  "active",
  "suspended",
  "withdrawn",
  "graduated",
  "transfer",
];

const DisciplinaryActions: React.FC = () => {
  const [records, setRecords] = useState<DisciplinaryRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    status: "",
    risk: "",
  });
  const [selectedRecord, setSelectedRecord] = useState<DisciplinaryRecord | null>(
    null
  );
  const [modalVisible, setModalVisible] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [form] = Form.useForm();

  const calculateRiskLevel = (
    status: string,
    attendance?: number,
    cgpa?: number
  ): DisciplinaryRecord["riskLevel"] => {
    if (status === "suspended" || status === "withdrawn") {
      return "Critical";
    }

    if (
      (attendance !== undefined && attendance < 70) ||
      (cgpa !== undefined && cgpa < 2.5)
    ) {
      return "Warning";
    }

    return "On Track";
  };

  const loadDisciplinaryData = async () => {
    try {
      setLoading(true);
      const studentsResponse = await studentAPI.getStudents(1, 200);
      const students = studentsResponse.students;

      const disciplinaryRecords: DisciplinaryRecord[] = await Promise.all(
        students.map(async (student: Student) => {
          let cgpa: number | undefined;
          let attendancePercentage: number | undefined;

          try {
            cgpa = await studentAPI.getStudentCGPA(student.id);
          } catch {
            // ignore missing CGPA
          }

          try {
            const attendanceSummary = await attendanceAPI.getAttendanceSummary({
              studentId: student.id,
            });
            if (attendanceSummary) {
              attendancePercentage = attendanceSummary.attendancePercentage;
            }
          } catch {
            // ignore attendance fetch errors
          }

          const riskLevel = calculateRiskLevel(
            student.enrollmentStatus,
            attendancePercentage,
            cgpa
          );

          return {
            key: student.id,
            studentId: student.id,
            studentName: student.user
              ? `${student.user.firstName} ${student.user.lastName}`
              : "N/A",
            rollNumber: student.rollNumber,
            programName: student.program?.name,
            enrollmentStatus: student.enrollmentStatus,
            cgpa,
            attendancePercentage,
            riskLevel,
          };
        })
      );

      setRecords(disciplinaryRecords);
    } catch (error: any) {
      message.error(error.message || "Failed to load disciplinary records");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDisciplinaryData();
  }, []);

  const filteredRecords = useMemo(() => {
    return records.filter((record) => {
      const matchesStatus =
        !filters.status || record.enrollmentStatus === filters.status;
      const matchesRisk = !filters.risk || record.riskLevel === filters.risk;
      return matchesStatus && matchesRisk;
    });
  }, [records, filters]);

  const summary = useMemo(() => {
    const suspended = records.filter(
      (record) => record.enrollmentStatus === "suspended"
    ).length;
    const warnings = records.filter(
      (record) => record.riskLevel === "Warning"
    ).length;
    const critical = records.filter(
      (record) => record.riskLevel === "Critical"
    ).length;

    return {
      total: records.length,
      suspended,
      warnings,
      critical,
    };
  }, [records]);

  const handleUpdateStatus = (record: DisciplinaryRecord) => {
    setSelectedRecord(record);
    form.setFieldsValue({ status: record.enrollmentStatus });
    setModalVisible(true);
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      if (!selectedRecord) return;
      setUpdating(true);
      await studentAPI.updateStudent(selectedRecord.studentId, {
        enrollmentStatus: values.status,
      });
      message.success("Student status updated successfully");
      setModalVisible(false);
      setSelectedRecord(null);
      loadDisciplinaryData();
    } catch (error: any) {
      if (error?.errorFields) {
        return;
      }
      message.error(error.message || "Failed to update status");
    } finally {
      setUpdating(false);
    }
  };

  const columns = [
    {
      title: "Student",
      dataIndex: "studentName",
      key: "studentName",
      render: (studentName: string, record: DisciplinaryRecord) => (
        <div>
          <strong>{studentName}</strong>
          <div style={{ fontSize: 12, color: "#888" }}>{record.rollNumber}</div>
        </div>
      ),
    },
    {
      title: "Program",
      dataIndex: "programName",
      key: "programName",
      render: (programName: string | undefined) => programName || "N/A",
    },
    {
      title: "Status",
      dataIndex: "enrollmentStatus",
      key: "enrollmentStatus",
      render: (status: string) => {
        const color =
          status === "suspended"
            ? "red"
            : status === "withdrawn"
            ? "orange"
            : status === "active"
            ? "green"
            : "blue";
        return <Tag color={color}>{status.toUpperCase()}</Tag>;
      },
    },
    {
      title: "CGPA",
      dataIndex: "cgpa",
      key: "cgpa",
      render: (cgpa: number | undefined) =>
        cgpa !== undefined ? cgpa.toFixed(2) : "N/A",
    },
    {
      title: "Attendance",
      dataIndex: "attendancePercentage",
      key: "attendancePercentage",
      render: (attendance: number | undefined) =>
        attendance !== undefined ? `${attendance.toFixed(1)}%` : "N/A",
    },
    {
      title: "Risk Level",
      dataIndex: "riskLevel",
      key: "riskLevel",
      render: (risk: DisciplinaryRecord["riskLevel"]) => {
        const color =
          risk === "Critical" ? "red" : risk === "Warning" ? "orange" : "green";
        return <Tag color={color}>{risk}</Tag>;
      },
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: any, record: DisciplinaryRecord) => (
        <Space>
          <Button type="link" onClick={() => handleUpdateStatus(record)}>
            Update Status
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Space direction="vertical" size="large" style={{ width: "100%" }}>
        <Card bordered={false}>
          <Space size="large" wrap>
            <Statistic
              title="Students Tracked"
              value={summary.total}
              prefix={<WarningOutlined style={{ color: "#1890ff" }} />}
            />
            <Statistic
              title="Suspended"
              value={summary.suspended}
              valueStyle={{ color: "#ff4d4f" }}
              prefix={<ExclamationCircleOutlined />}
            />
            <Statistic
              title="Warnings"
              value={summary.warnings}
              valueStyle={{ color: "#faad14" }}
            />
            <Statistic
              title="Critical Cases"
              value={summary.critical}
              valueStyle={{ color: "#ff4d4f" }}
            />
          </Space>
        </Card>

        <Card bordered={false}>
          <Space wrap style={{ width: "100%", marginBottom: 16 }}>
            <Select
              placeholder="Filter by Status"
              allowClear
              value={filters.status || undefined}
              onChange={(value) =>
                setFilters((prev) => ({ ...prev, status: value || "" }))
              }
              style={{ width: 200 }}
            >
              {statusOptions.map((status) => (
                <Option key={status} value={status}>
                  {status.toUpperCase()}
                </Option>
              ))}
            </Select>
            <Select
              placeholder="Filter by Risk Level"
              allowClear
              value={filters.risk || undefined}
              onChange={(value) =>
                setFilters((prev) => ({ ...prev, risk: value || "" }))
              }
              style={{ width: 200 }}
            >
              <Option value="On Track">On Track</Option>
              <Option value="Warning">Warning</Option>
              <Option value="Critical">Critical</Option>
            </Select>
            <Button onClick={() => setFilters({ status: "", risk: "" })}>
              Reset Filters
            </Button>
          </Space>

          {loading ? (
            <Skeleton active paragraph={{ rows: 6 }} />
          ) : filteredRecords.length === 0 ? (
            <Empty description="No disciplinary records found" />
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

      <Modal
        title="Update Student Status"
        open={modalVisible}
        onOk={handleModalOk}
        confirmLoading={updating}
        onCancel={() => {
          setModalVisible(false);
          setSelectedRecord(null);
        }}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="status"
            label="Enrollment Status"
            rules={[{ required: true, message: "Please select a status" }]}
          >
            <Select placeholder="Select status">
              {statusOptions.map((status) => (
                <Option key={status} value={status}>
                  {status.toUpperCase()}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default DisciplinaryActions;
