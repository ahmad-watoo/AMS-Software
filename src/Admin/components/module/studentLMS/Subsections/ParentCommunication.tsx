import React, { useEffect, useMemo, useState } from "react";
import {
  Card,
  Table,
  Tag,
  Space,
  Button,
  Modal,
  Form,
  Select,
  Input,
  message,
  Empty,
  Skeleton,
} from "antd";
import { MailOutlined, PhoneOutlined, MessageOutlined } from "@ant-design/icons";
import { studentAPI, Student } from "../../../../../api/student.api";
import attendanceAPI from "../../../../../api/attendance.api";

const { Option } = Select;

interface ContactAlert {
  key: string;
  studentId: string;
  studentName: string;
  guardianPhone?: string;
  email?: string;
  issue: string;
  priority: "High" | "Medium" | "Low";
}

interface CommunicationLog {
  id: string;
  studentId: string;
  studentName: string;
  channel: string;
  notes: string;
  timestamp: string;
}

const ParentCommunication: React.FC = () => {
  const [alerts, setAlerts] = useState<ContactAlert[]>([]);
  const [logs, setLogs] = useState<CommunicationLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({ priority: "" });
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState<ContactAlert | null>(null);
  const [form] = Form.useForm();

  const loadAlerts = async () => {
    try {
      setLoading(true);
      const studentsResponse = await studentAPI.getStudents(1, 200);
      const students = studentsResponse.students;

      const alertRows = await Promise.all(
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
            // ignore missing attendance
          }

          const issues: string[] = [];
          let priority: ContactAlert["priority"] = "Low";

          if (attendancePercentage !== undefined && attendancePercentage < 70) {
            issues.push(`Attendance at ${attendancePercentage.toFixed(1)}%`);
            priority = "High";
          } else if (
            attendancePercentage !== undefined &&
            attendancePercentage < 80
          ) {
            issues.push(`Attendance trending low (${attendancePercentage.toFixed(1)}%)`);
            priority = priority === "Low" ? "Medium" : priority;
          }

          if (cgpa !== undefined && cgpa < 2.5) {
            issues.push(`CGPA at ${cgpa.toFixed(2)}`);
            priority = "High";
          } else if (cgpa !== undefined && cgpa < 3.0) {
            issues.push(`CGPA requires attention (${cgpa.toFixed(2)})`);
            priority = priority === "Low" ? "Medium" : priority;
          }

          if (issues.length === 0) {
            return null;
          }

          return {
            key: student.id,
            studentId: student.id,
            studentName: student.user
              ? `${student.user.firstName} ${student.user.lastName}`
              : student.rollNumber,
            guardianPhone: student.user?.phone,
            email: student.user?.email,
            issue: issues.join("; "),
            priority,
          } as ContactAlert;
        })
      );

      setAlerts(alertRows.filter((alert): alert is ContactAlert => Boolean(alert)));
    } catch (error: any) {
      message.error(error.message || "Failed to load parent alerts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAlerts();
  }, []);

  const filteredAlerts = useMemo(() => {
    return alerts.filter((alert) =>
      filters.priority ? alert.priority === filters.priority : true
    );
  }, [alerts, filters]);

  const handleLogCommunication = (alert: ContactAlert) => {
    setSelectedAlert(alert);
    form.setFieldsValue({ channel: "Phone", notes: "" });
    setModalVisible(true);
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      if (!selectedAlert) return;

      const newLog: CommunicationLog = {
        id: `${selectedAlert.studentId}-${Date.now()}`,
        studentId: selectedAlert.studentId,
        studentName: selectedAlert.studentName,
        channel: values.channel,
        notes: values.notes,
        timestamp: new Date().toISOString(),
      };

      setLogs((prev) => [newLog, ...prev]);
      setModalVisible(false);
      setSelectedAlert(null);
      message.success("Communication logged locally. Sync to Supabase when ready.");
    } catch (error: any) {
      if (!error?.errorFields) {
        message.error(error.message || "Failed to log communication");
      }
    }
  };

  const alertColumns = [
    {
      title: "Student",
      dataIndex: "studentName",
      key: "studentName",
    },
    {
      title: "Issue",
      dataIndex: "issue",
      key: "issue",
    },
    {
      title: "Priority",
      dataIndex: "priority",
      key: "priority",
      render: (priority: ContactAlert["priority"]) => (
        <Tag color={priority === "High" ? "red" : priority === "Medium" ? "orange" : "blue"}>
          {priority}
        </Tag>
      ),
    },
    {
      title: "Contact",
      key: "contact",
      render: (_: any, record: ContactAlert) => (
        <Space direction="vertical" size={0}>
          {record.guardianPhone && (
            <span>
              <PhoneOutlined /> {record.guardianPhone}
            </span>
          )}
          {record.email && (
            <span>
              <MailOutlined /> {record.email}
            </span>
          )}
        </Space>
      ),
    },
    {
      title: "Action",
      key: "action",
      render: (_: any, record: ContactAlert) => (
        <Button type="link" onClick={() => handleLogCommunication(record)}>
          Log Communication
        </Button>
      ),
    },
  ];

  const logColumns = [
    {
      title: "Student",
      dataIndex: "studentName",
      key: "studentName",
    },
    {
      title: "Channel",
      dataIndex: "channel",
      key: "channel",
      render: (channel: string) => {
        const icon =
          channel === "Phone" ? (
            <PhoneOutlined />
          ) : channel === "Email" ? (
            <MailOutlined />
          ) : (
            <MessageOutlined />
          );
        return (
          <Space>
            {icon}
            {channel}
          </Space>
        );
      },
    },
    {
      title: "Notes",
      dataIndex: "notes",
      key: "notes",
    },
    {
      title: "Timestamp",
      dataIndex: "timestamp",
      key: "timestamp",
      render: (timestamp: string) => new Date(timestamp).toLocaleString(),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Space direction="vertical" size="large" style={{ width: "100%" }}>
        <Card bordered={false}>
          <Space wrap>
            <Select
              placeholder="Filter by Priority"
              allowClear
              value={filters.priority || undefined}
              onChange={(value) =>
                setFilters((prev) => ({ ...prev, priority: value || "" }))
              }
              style={{ width: 220 }}
            >
              <Option value="High">High</Option>
              <Option value="Medium">Medium</Option>
              <Option value="Low">Low</Option>
            </Select>
            <Button onClick={() => setFilters({ priority: "" })}>Reset Filters</Button>
          </Space>
        </Card>

        <Card title="Parent Alerts" bordered={false}>
          {loading ? (
            <Skeleton active paragraph={{ rows: 6 }} />
          ) : filteredAlerts.length === 0 ? (
            <Empty description="No parent communications required" />
          ) : (
            <Table
              columns={alertColumns}
              dataSource={filteredAlerts}
              rowKey="key"
              pagination={{ pageSize: 10 }}
            />
          )}
        </Card>

        <Card title="Communication Log (local cache)" bordered={false}>
          {logs.length === 0 ? (
            <Empty description="No communications logged yet" />
          ) : (
            <Table
              columns={logColumns}
              dataSource={logs}
              rowKey="id"
              pagination={{ pageSize: 5 }}
            />
          )}
        </Card>
      </Space>

      <Modal
        title="Log Communication"
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          setSelectedAlert(null);
        }}
        onOk={handleModalOk}
        okText="Save"
      >
        {selectedAlert && (
          <Space direction="vertical" size="middle" style={{ width: "100%" }}>
            <div>
              <strong>Student:</strong> {selectedAlert.studentName}
            </div>
            <Form layout="vertical" form={form} requiredMark={false}>
              <Form.Item
                name="channel"
                label="Communication Channel"
                rules={[{ required: true, message: "Select a channel" }]}
              >
                <Select placeholder="Select channel">
                  <Option value="Phone">Phone Call</Option>
                  <Option value="SMS">SMS</Option>
                  <Option value="Email">Email</Option>
                  <Option value="In Person">In Person</Option>
                </Select>
              </Form.Item>
              <Form.Item
                name="notes"
                label="Notes"
                rules={[{ required: true, message: "Please add a note" }]}
              >
                <Input.TextArea rows={3} placeholder="Summary of the conversation" />
              </Form.Item>
            </Form>
          </Space>
        )}
      </Modal>
    </div>
  );
};

export default ParentCommunication;
