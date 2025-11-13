import React, { useEffect, useMemo, useState } from "react";
import {
  Card,
  Row,
  Col,
  Statistic,
  Space,
  Button,
  Table,
  Tag,
  List,
  Typography,
  Empty,
  Skeleton,
  message,
} from "antd";
import {
  FileAddOutlined,
  SolutionOutlined,
  CheckCircleOutlined,
  DollarCircleOutlined,
  ReloadOutlined,
  EyeOutlined,
  ProfileOutlined,
  CalendarOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import {
  admissionAPI,
  AdmissionApplication,
} from "../../../../api/admission.api";
import { route } from "../../../routes/constant";

const { Title, Paragraph, Text } = Typography;

const statusColors: Record<string, string> = {
  submitted: "default",
  under_review: "processing",
  eligible: "success",
  interview_scheduled: "warning",
  selected: "success",
  waitlisted: "warning",
  rejected: "error",
  fee_submitted: "processing",
  enrolled: "success",
};

const formatStatus = (status: string) =>
  status
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

const Admission: React.FC = () => {
  const navigate = useNavigate();
  const [applications, setApplications] = useState<AdmissionApplication[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const response = await admissionAPI.getApplications(1, 200);
      setApplications(response.applications);
    } catch (error: any) {
      message.error(error.message || "Failed to load admission overview");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const statusCounts = useMemo(() => {
    return applications.reduce<Record<string, number>>((acc, app) => {
      acc[app.status] = (acc[app.status] || 0) + 1;
      return acc;
    }, {});
  }, [applications]);

  const totalApplications = applications.length;
  const eligibleCount = statusCounts["eligible"] || 0;
  const underReviewCount = statusCounts["under_review"] || 0;
  const awaitingFeeCount = statusCounts["selected"] || 0;
  const enrolledCount = statusCounts["enrolled"] || 0;

  const recentApplications = useMemo(() => {
    return [...applications]
      .sort(
        (a, b) =>
          new Date(b.applicationDate).getTime() -
          new Date(a.applicationDate).getTime()
      )
      .slice(0, 6);
  }, [applications]);

  const upcomingInterviews = useMemo(() => {
    const now = new Date();
    return applications
      .filter(
        (app) =>
          app.interviewDate &&
          new Date(app.interviewDate).getTime() >= now.setHours(0, 0, 0, 0)
      )
      .sort(
        (a, b) =>
          new Date(a.interviewDate || "").getTime() -
          new Date(b.interviewDate || "").getTime()
      )
      .slice(0, 5);
  }, [applications]);

  const quickActionButtons = [
    {
      title: "Create Application",
      icon: <FileAddOutlined />,
      action: () => navigate(route.ADMISSION_APPLICATION_CREATE),
      description: "Submit a new admission application on behalf of a student.",
      type: "primary" as const,
    },
    {
      title: "View Applications",
      icon: <ProfileOutlined />,
      action: () => navigate(route.ADMISSION_APPLICATION_LIST),
      description: "Manage applications, apply filters, and export records.",
    },
    {
      title: "Eligibility Check",
      icon: <CheckCircleOutlined />,
      action: () => navigate(route.ADMISSION_ELIGIBILITY_CHECK),
      description: "Validate academic history and generate merit scores.",
    },
    {
      title: "Fee Submission",
      icon: <DollarCircleOutlined />,
      action: () => navigate(route.ADMISSION_FEE_SUBMISSION),
      description: "Record admission fee payments and issue receipts.",
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Space direction="vertical" size="large" style={{ width: "100%" }}>
        <Row gutter={[16, 16]}>
          <Col xs={24}>
            <Card
              bordered={false}
              style={{
                background:
                  "linear-gradient(135deg, rgba(24,144,255,0.1) 0%, rgba(24,144,255,0.05) 100%)",
              }}
            >
              <Row gutter={[16, 16]} align="middle">
                <Col flex="auto">
                  <Title level={3} style={{ marginBottom: 4 }}>
                    Admission Command Center
                  </Title>
                  <Paragraph style={{ marginBottom: 0 }}>
                    Monitor the entire admission lifecycle—from application
                    intake to enrollment—at a glance.
                  </Paragraph>
                </Col>
                <Col>
                  <Button
                    icon={<ReloadOutlined />}
                    onClick={fetchApplications}
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
                title="Total Applications"
                value={totalApplications}
                prefix={<SolutionOutlined />}
                loading={loading}
              />
              <Text type="secondary">
                Includes all applications received in the current cycle.
              </Text>
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card bordered={false}>
              <Statistic
                title="Eligible Applicants"
                value={eligibleCount}
                prefix={<CheckCircleOutlined style={{ color: "#52c41a" }} />}
                loading={loading}
              />
              <Text type="secondary">
                Ready for merit list consideration.
              </Text>
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card bordered={false}>
              <Statistic
                title="Under Review"
                value={underReviewCount}
                prefix={<SolutionOutlined style={{ color: "#1890ff" }} />}
                loading={loading}
              />
              <Text type="secondary">
                Applications awaiting evaluator feedback.
              </Text>
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card bordered={false}>
              <Statistic
                title="Awaiting Fee Submission"
                value={awaitingFeeCount}
                prefix={<DollarCircleOutlined style={{ color: "#faad14" }} />}
                loading={loading}
              />
              <Text type="secondary">
                Selected applicants pending confirmation.
              </Text>
            </Card>
          </Col>
        </Row>

        <Card title="Quick Actions" bordered={false}>
          <Row gutter={[16, 16]}>
            {quickActionButtons.map((action) => (
              <Col xs={24} md={12} lg={6} key={action.title}>
                <Card
                  size="small"
                  actions={[
                    <Button
                      key="launch"
                      type={action.type}
                      icon={action.icon}
                      onClick={action.action}
                    >
                      {action.title}
                    </Button>,
                  ]}
                >
                  <Paragraph>{action.description}</Paragraph>
                </Card>
              </Col>
            ))}
          </Row>
        </Card>

        <Row gutter={[16, 16]}>
          <Col xs={24} lg={14}>
            <Card
              title={
                <Space>
                  <CalendarOutlined />
                  Upcoming Interviews
                </Space>
              }
              extra={
                <Button
                  type="link"
                  onClick={() => navigate(route.ADMISSION_APPLICATION_LIST)}
                >
                  Manage Applications
                </Button>
              }
              bordered={false}
            >
              {loading ? (
                <Skeleton active paragraph={{ rows: 4 }} />
              ) : upcomingInterviews.length === 0 ? (
                <Empty description="No interviews scheduled yet" />
              ) : (
                <Table
                  dataSource={upcomingInterviews}
                  rowKey="id"
                  pagination={false}
                  size="small"
                >
                  <Table.Column
                    title="Application #"
                    dataIndex="applicationNumber"
                    key="applicationNumber"
                    render={(value: string) => <strong>{value}</strong>}
                  />
                  <Table.Column
                    title="Applicant"
                    key="applicant"
                    render={(record: AdmissionApplication) =>
                      record.user
                        ? `${record.user.firstName} ${record.user.lastName}`
                        : "N/A"
                    }
                  />
                  <Table.Column
                    title="Program"
                    key="program"
                    render={(record: AdmissionApplication) =>
                      record.program?.name || "N/A"
                    }
                  />
                  <Table.Column
                    title="Interview"
                    key="interviewDate"
                    render={(record: AdmissionApplication) =>
                      record.interviewDate
                        ? `${new Date(
                            record.interviewDate
                          ).toLocaleDateString()} ${
                            record.interviewTime || ""
                          }`
                        : "-"
                    }
                  />
                  <Table.Column
                    title="Actions"
                    key="actions"
                    render={(_: any, record: AdmissionApplication) => (
                      <Button
                        type="link"
                        icon={<EyeOutlined />}
                        onClick={() =>
                          navigate(
                            route.ADMISSION_APPLICATION_DETAIL.replace(
                              ":id",
                              record.id
                            )
                          )
                        }
                      >
                        View
                      </Button>
                    )}
                  />
                </Table>
              )}
            </Card>
          </Col>

          <Col xs={24} lg={10}>
            <Card
              title="Status Distribution"
              bordered={false}
              bodyStyle={{ maxHeight: 330, overflowY: "auto" }}
            >
              {loading ? (
                <Skeleton active paragraph={{ rows: 6 }} />
              ) : totalApplications === 0 ? (
                <Empty description="No applications recorded yet" />
              ) : (
                <List
                  dataSource={Object.entries(statusCounts).sort(
                    (a, b) => b[1] - a[1]
                  )}
                  renderItem={([status, count]) => (
                    <List.Item>
                      <Space style={{ width: "100%", justifyContent: "space-between" }}>
                        <Tag color={statusColors[status] || "default"}>
                          {formatStatus(status)}
                        </Tag>
                        <Text strong>{count}</Text>
                      </Space>
                    </List.Item>
                  )}
                />
              )}
            </Card>
            <Card
              style={{ marginTop: 16 }}
              bordered={false}
              title="Enrolled Students"
            >
              {loading ? (
                <Skeleton active paragraph={{ rows: 1 }} />
              ) : (
                <Statistic
                  value={enrolledCount}
                  suffix="students"
                  valueStyle={{ color: "#52c41a" }}
                />
              )}
              <Text type="secondary">
                Applicants who have completed admission formalities.
              </Text>
            </Card>
          </Col>
        </Row>

        <Card
          title="Recent Applications"
          bordered={false}
          extra={
            <Button
              type="link"
              onClick={() => navigate(route.ADMISSION_APPLICATION_LIST)}
            >
              View All
            </Button>
          }
        >
          {loading ? (
            <Skeleton active paragraph={{ rows: 3 }} />
          ) : recentApplications.length === 0 ? (
            <Empty description="No recent applications" />
          ) : (
            <List
              dataSource={recentApplications}
              renderItem={(app) => (
                <List.Item
                  actions={[
                    <Button
                      key="view"
                      type="link"
                      icon={<EyeOutlined />}
                      onClick={() =>
                        navigate(
                          route.ADMISSION_APPLICATION_DETAIL.replace(
                            ":id",
                            app.id
                          )
                        )
                      }
                    >
                      View
                    </Button>,
                  ]}
                >
                  <List.Item.Meta
                    title={
                      <Space size={8}>
                        <Text strong>{app.applicationNumber}</Text>
                        <Tag color={statusColors[app.status] || "default"}>
                          {formatStatus(app.status)}
                        </Tag>
                      </Space>
                    }
                    description={
                      <div>
                        <div>
                          Applicant:{" "}
                          <Text>
                            {app.user
                              ? `${app.user.firstName} ${app.user.lastName}`
                              : "N/A"}
                          </Text>
                        </div>
                        <div>
                          Program:{" "}
                          <Text>{app.program?.name || "Not Assigned"}</Text>
                        </div>
                        <div>
                          Submitted:{" "}
                          <Text>
                            {new Date(app.applicationDate).toLocaleString()}
                          </Text>
                        </div>
                      </div>
                    }
                  />
                </List.Item>
              )}
            />
          )}
        </Card>
      </Space>
    </div>
  );
};

export default Admission;
