import React, { useEffect, useMemo, useState } from "react";
import {
  Card,
  Row,
  Col,
  Statistic,
  Space,
  Button,
  List,
  Typography,
  Progress,
  Tag,
  Empty,
  Skeleton,
  message,
  Table,
} from "antd";
import {
  UserAddOutlined,
  TeamOutlined,
  TrophyOutlined,
  ReadOutlined,
  ReloadOutlined,
  EyeOutlined,
  SolutionOutlined,
  AlertOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import { studentAPI, Student } from "../../../../api/student.api";
import { route } from "../../../routes/constant";
import { PermissionGuard } from "../../../common/PermissionGuard";

const { Title, Paragraph, Text } = Typography;

const statusColors: Record<string, string> = {
  active: "green",
  graduated: "blue",
  suspended: "orange",
  withdrawn: "red",
  transfer: "purple",
};

const formatStatus = (status: string) =>
  status.charAt(0).toUpperCase() + status.slice(1);

const StudentManagement: React.FC = () => {
  const navigate = useNavigate();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const response = await studentAPI.getStudents(1, 200);
      setStudents(response.students);
    } catch (error: any) {
      message.error(error.message || "Failed to load student analytics");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const totalStudents = students.length;
  const statusCounts = useMemo(() => {
    return students.reduce<Record<string, number>>((acc, student) => {
      acc[student.enrollmentStatus] =
        (acc[student.enrollmentStatus] || 0) + 1;
      return acc;
    }, {});
  }, [students]);

  const suspendedStudents = statusCounts["suspended"] || 0;
  const graduatedStudents = statusCounts["graduated"] || 0;
  const activeStudents = statusCounts["active"] || 0;

  const averageCGPA = useMemo(() => {
    const cgpaValues = students
      .map((student) => student.cgpa)
      .filter((cgpa): cgpa is number => !!cgpa);

    if (cgpaValues.length === 0) return null;

    const sum = cgpaValues.reduce((acc, cgpa) => acc + cgpa, 0);
    return sum / cgpaValues.length;
  }, [students]);

  const topPerformers = useMemo(() => {
    return [...students]
      .filter((student) => !!student.cgpa)
      .sort((a, b) => (b.cgpa || 0) - (a.cgpa || 0))
      .slice(0, 5);
  }, [students]);

  const statusDistribution = useMemo(() => {
    return Object.entries(statusCounts).map(([status, count]) => ({
      status,
      count,
      percentage: totalStudents ? Math.round((count / totalStudents) * 100) : 0,
    }));
  }, [statusCounts, totalStudents]);

  const recentAdmissions = useMemo(() => {
    return [...students]
      .sort(
        (a, b) =>
          dayjs(b.admissionDate).valueOf() - dayjs(a.admissionDate).valueOf()
      )
      .slice(0, 5);
  }, [students]);

  return (
    <div style={{ padding: 24 }}>
      <Space direction="vertical" size="large" style={{ width: "100%" }}>
        <Row gutter={[16, 16]}>
          <Col span={24}>
            <Card
              bordered={false}
              style={{
                background:
                  "linear-gradient(135deg, rgba(82,196,26,0.1) 0%, rgba(82,196,26,0.05) 100%)",
              }}
            >
              <Row gutter={[16, 16]} align="middle">
                <Col flex="auto">
                  <Title level={3} style={{ marginBottom: 4 }}>
                    Student Success Command Center
                  </Title>
                  <Paragraph style={{ marginBottom: 0 }}>
                    Track active cohorts, identify at-risk students, and celebrate
                    top performers across the academic journey.
                  </Paragraph>
                </Col>
                <Col>
                  <Button
                    icon={<ReloadOutlined />}
                    onClick={fetchStudents}
                    loading={loading}
                  >
                    Refresh Data
                  </Button>
                </Col>
              </Row>
            </Card>
          </Col>

          <Col xs={24} sm={12} lg={6}>
            <Card bordered={false}>
              <Statistic
                title="Total Students"
                value={totalStudents}
                prefix={<TeamOutlined style={{ color: "#1890ff" }} />}
                loading={loading}
              />
              <Text type="secondary">Active + graduated + transfer students.</Text>
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card bordered={false}>
              <Statistic
                title="Active Students"
                value={activeStudents}
                prefix={<SolutionOutlined style={{ color: "#52c41a" }} />}
                loading={loading}
              />
              <Text type="secondary">Currently enrolled and progressing.</Text>
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card bordered={false}>
              <Statistic
                title="Graduated"
                value={graduatedStudents}
                prefix={<TrophyOutlined style={{ color: "#faad14" }} />}
                loading={loading}
              />
              <Text type="secondary">Successfully completed their programs.</Text>
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card bordered={false}>
              <Statistic
                title="Suspended / At Risk"
                value={suspendedStudents}
                prefix={<AlertOutlined style={{ color: "#ff4d4f" }} />}
                loading={loading}
              />
              <Text type="secondary">Requires disciplinary or academic review.</Text>
            </Card>
          </Col>
        </Row>

        <Card title="Quick Actions" bordered={false}>
          <Row gutter={[16, 16]}>
            <Col xs={24} md={12} lg={6}>
              <PermissionGuard permission="student" action="create">
                <Card
                  size="small"
                  actions={[
                    <Button
                      key="create"
                      type="primary"
                      icon={<UserAddOutlined />}
                      onClick={() => navigate(route.STUDENT_CREATE)}
                    >
                      Add Student
                    </Button>,
                  ]}
                >
                  <Paragraph>
                    Register a new student, assign program, and generate roll number.
                  </Paragraph>
                </Card>
              </PermissionGuard>
            </Col>
            <Col xs={24} md={12} lg={6}>
              <Card
                size="small"
                actions={[
                  <Button
                    key="profiles"
                    icon={<EyeOutlined />}
                    onClick={() => navigate(route.STUDENT_LIST)}
                  >
                    View Profiles
                  </Button>,
                ]}
              >
                <Paragraph>
                  Manage student records, update status, and access guardian details.
                </Paragraph>
              </Card>
            </Col>
            <Col xs={24} md={12} lg={6}>
              <Card
                size="small"
                actions={[
                  <Button
                    key="performance"
                    icon={<ReadOutlined />}
                    onClick={() => navigate(route.STUDENT_MANAGEMENT_PERFORMANCE_TRACKING)}
                  >
                    Performance Tracking
                  </Button>,
                ]}
              >
                <Paragraph>
                  Monitor GPA trends, academic standings, and intervention history.
                </Paragraph>
              </Card>
            </Col>
            <Col xs={24} md={12} lg={6}>
              <Card
                size="small"
                actions={[
                  <Button
                    key="discipline"
                    icon={<AlertOutlined />}
                    onClick={() => navigate(route.STUDENT_MANAGEMENT_DISCIPLINARY_ACTIONS)}
                  >
                    Disciplinary Log
                  </Button>,
                ]}
              >
                <Paragraph>
                  Review suspensions, warnings, and appeal outcomes.
                </Paragraph>
              </Card>
            </Col>
          </Row>
        </Card>

        <Row gutter={[16, 16]}>
          <Col xs={24} lg={14}>
            <Card
              title="Status Overview"
              bordered={false}
              bodyStyle={{ maxHeight: 320, overflowY: "auto" }}
            >
              {loading ? (
                <Skeleton active paragraph={{ rows: 6 }} />
              ) : statusDistribution.length === 0 ? (
                <Empty description="No student data available" />
              ) : (
                <List
                  dataSource={statusDistribution}
                  renderItem={({ status, count, percentage }) => (
                    <List.Item>
                      <Space style={{ width: "100%", justifyContent: "space-between" }}>
                        <Tag color={statusColors[status] || "default"}>
                          {formatStatus(status)}
                        </Tag>
                        <Space>
                          <Text strong>{count}</Text>
                          <Progress
                            percent={percentage}
                            size="small"
                            style={{ width: 140 }}
                          />
                        </Space>
                      </Space>
                    </List.Item>
                  )}
                />
              )}
            </Card>

            <Card
              style={{ marginTop: 16 }}
              title="Recent Admissions"
              bordered={false}
            >
              {loading ? (
                <Skeleton active paragraph={{ rows: 4 }} />
              ) : recentAdmissions.length === 0 ? (
                <Empty description="No recent admissions" />
              ) : (
                <List
                  dataSource={recentAdmissions}
                  renderItem={(student) => (
                    <List.Item
                      actions={[
                        <Button
                          key="profile"
                          type="link"
                          onClick={() =>
                            navigate(route.STUDENT_DETAIL.replace(":id", student.id))
                          }
                        >
                          View Profile
                        </Button>,
                      ]}
                    >
                      <List.Item.Meta
                        title={
                          <Space>
                            <Text strong>{student.rollNumber}</Text>
                            <Tag color={statusColors[student.enrollmentStatus] || "default"}>
                              {formatStatus(student.enrollmentStatus)}
                            </Tag>
                          </Space>
                        }
                        description={
                          <div>
                            <div>
                              Name:{" "}
                              <Text>
                                {student.user
                                  ? `${student.user.firstName} ${student.user.lastName}`
                                  : "N/A"}
                              </Text>
                            </div>
                            <div>
                              Program: <Text>{student.program?.name || "N/A"}</Text>
                            </div>
                            <div>
                              Admission Date:{" "}
                              <Text>{dayjs(student.admissionDate).format("MMM DD, YYYY")}</Text>
                            </div>
                          </div>
                        }
                      />
                    </List.Item>
                  )}
                />
              )}
            </Card>
          </Col>

          <Col xs={24} lg={10}>
            <Card title="CGPA Snapshot" bordered={false}>
              {loading ? (
                <Skeleton active paragraph={{ rows: 3 }} />
              ) : averageCGPA === null ? (
                <Empty description="CGPA data not available" />
              ) : (
                <Space direction="vertical" style={{ width: "100%" }}>
                  <Statistic
                    title="Average CGPA"
                    value={averageCGPA}
                    precision={2}
                    valueStyle={{
                      color: averageCGPA >= 3 ? "#52c41a" : "#faad14",
                    }}
                  />
                  <Progress
                    percent={Math.min(Math.round((averageCGPA / 4) * 100), 100)}
                    status="active"
                  />
                  <Text type="secondary">
                    Based on recorded CGPA values across active cohorts.
                  </Text>
                </Space>
              )}
            </Card>

            <Card
              style={{ marginTop: 16 }}
              title="Top Performers"
              bordered={false}
              bodyStyle={{ padding: 0 }}
            >
              {loading ? (
                <Skeleton active paragraph={{ rows: 4 }} />
              ) : topPerformers.length === 0 ? (
                <Empty description="No CGPA records yet" />
              ) : (
                <Table<Student>
                  dataSource={topPerformers}
                  rowKey="id"
                  pagination={false}
                  size="small"
                >
                  <Table.Column
                    title="Student"
                    key="name"
                    render={(record: Student) =>
                      record.user
                        ? `${record.user.firstName} ${record.user.lastName}`
                        : "N/A"
                    }
                  />
                  <Table.Column
                    title="Roll No."
                    dataIndex="rollNumber"
                    key="rollNumber"
                  />
                  <Table.Column
                    title="CGPA"
                    dataIndex="cgpa"
                    key="cgpa"
                    render={(cgpa: number) => (
                      <Tag color={cgpa >= 3.5 ? "green" : "blue"}>
                        {cgpa.toFixed(2)}
                      </Tag>
                    )}
                  />
                </Table>
              )}
            </Card>
          </Col>
        </Row>
      </Space>
    </div>
  );
};

export default StudentManagement;
