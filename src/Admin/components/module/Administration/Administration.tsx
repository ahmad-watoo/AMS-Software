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
  CalendarOutlined,
  BellOutlined,
  ApartmentOutlined,
  PlusOutlined,
  ReloadOutlined,
  EyeOutlined,
  SettingOutlined,
  TeamOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import administrationAPI, { Event, Notice, Department } from "../../../../api/administration.api";
import { route } from "../../../routes/constant";

const { Title, Paragraph, Text } = Typography;

const eventTypeColors: Record<string, string> = {
  academic: "blue",
  cultural: "purple",
  sports: "green",
  workshop: "orange",
  seminar: "cyan",
  conference: "red",
  holiday: "default",
  other: "default",
};

const noticePriorityColors: Record<string, string> = {
  low: "default",
  medium: "blue",
  high: "orange",
  urgent: "red",
};

const formatEventType = (type: string) =>
  type
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

const Administration: React.FC = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState<Event[]>([]);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [eventsResponse, noticesResponse, departmentsResponse] = await Promise.all([
        administrationAPI.getAllEvents({ page: 1, limit: 200, isActive: true }),
        administrationAPI.getAllNotices({ page: 1, limit: 200, isPublished: true }),
        administrationAPI.getAllDepartments({ page: 1, limit: 200 }),
      ]);

      setEvents(eventsResponse.events || []);
      setNotices(noticesResponse.notices || []);
      setDepartments(departmentsResponse.departments || []);
    } catch (error: any) {
      message.error(error.message || "Failed to load administration overview");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const stats = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const upcomingEvents = events.filter(
      (event) => new Date(event.startDate).getTime() >= today.getTime()
    );

    const activeDepartments = departments.filter((dept) => dept.isActive);

    const urgentNotices = notices.filter((notice) => notice.priority === "urgent" || notice.priority === "high");

    return {
      totalEvents: events.length,
      upcomingEvents: upcomingEvents.length,
      totalNotices: notices.length,
      urgentNotices: urgentNotices.length,
      totalDepartments: departments.length,
      activeDepartments: activeDepartments.length,
    };
  }, [events, notices, departments]);

  const upcomingEvents = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return events
      .filter((event) => new Date(event.startDate).getTime() >= today.getTime())
      .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
      .slice(0, 5);
  }, [events]);

  const recentNotices = useMemo(() => {
    return [...notices]
      .sort(
        (a, b) =>
          new Date(b.publishedDate).getTime() - new Date(a.publishedDate).getTime()
      )
      .slice(0, 6);
  }, [notices]);

  const quickActionButtons = [
    {
      title: "Create Event",
      icon: <CalendarOutlined />,
      action: () => navigate(route.ADMIN_EVENT_CREATE),
      description: "Schedule a new institutional event or activity.",
      type: "primary" as const,
    },
    {
      title: "Create Notice",
      icon: <BellOutlined />,
      action: () => navigate(route.ADMIN_NOTICE_CREATE),
      description: "Publish an announcement or important notice.",
    },
    {
      title: "Manage Departments",
      icon: <ApartmentOutlined />,
      action: () => navigate(route.ADMIN_DEPARTMENT_LIST),
      description: "View and manage organizational departments.",
    },
    {
      title: "System Settings",
      icon: <SettingOutlined />,
      action: () => navigate(route.ADMIN_SYSTEM_CONFIG),
      description: "Configure system-wide settings and parameters.",
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
                  "linear-gradient(135deg, rgba(114,46,209,0.1) 0%, rgba(114,46,209,0.05) 100%)",
              }}
            >
              <Row gutter={[16, 16]} align="middle">
                <Col flex="auto">
                  <Title level={3} style={{ marginBottom: 4 }}>
                    Administration Command Center
                  </Title>
                  <Paragraph style={{ marginBottom: 0 }}>
                    Manage institutional events, notices, departments, and system configurations from a central hub.
                  </Paragraph>
                </Col>
                <Col>
                  <Button
                    icon={<ReloadOutlined />}
                    onClick={fetchData}
                    loading={loading}
                  >
                    Refresh Data
                  </Button>
                </Col>
              </Row>
            </Card>
          </Col>

          {/* Statistics Cards */}
          <Col xs={24} sm={12} lg={6}>
            <Card bordered={false}>
              <Statistic
                title="Total Events"
                value={stats.totalEvents}
                prefix={<CalendarOutlined />}
                loading={loading}
              />
              <Text type="secondary">
                All institutional events recorded.
              </Text>
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card bordered={false}>
              <Statistic
                title="Upcoming Events"
                value={stats.upcomingEvents}
                prefix={<CalendarOutlined style={{ color: "#1890ff" }} />}
                loading={loading}
              />
              <Text type="secondary">
                Events scheduled in the future.
              </Text>
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card bordered={false}>
              <Statistic
                title="Total Notices"
                value={stats.totalNotices}
                prefix={<BellOutlined style={{ color: "#52c41a" }} />}
                loading={loading}
              />
              <Text type="secondary">
                Published notices and announcements.
              </Text>
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card bordered={false}>
              <Statistic
                title="Urgent Notices"
                value={stats.urgentNotices}
                prefix={<BellOutlined style={{ color: "#ff4d4f" }} />}
                loading={loading}
              />
              <Text type="secondary">
                High priority notices requiring attention.
              </Text>
            </Card>
          </Col>
        </Row>

        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} lg={6}>
            <Card bordered={false}>
              <Statistic
                title="Total Departments"
                value={stats.totalDepartments}
                prefix={<ApartmentOutlined />}
                loading={loading}
              />
              <Text type="secondary">
                All organizational departments.
              </Text>
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card bordered={false}>
              <Statistic
                title="Active Departments"
                value={stats.activeDepartments}
                prefix={<ApartmentOutlined style={{ color: "#52c41a" }} />}
                loading={loading}
              />
              <Text type="secondary">
                Currently active departments.
              </Text>
            </Card>
          </Col>
        </Row>

        {/* Quick Actions */}
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
          {/* Upcoming Events */}
          <Col xs={24} lg={14}>
            <Card
              title={
                <Space>
                  <CalendarOutlined />
                  Upcoming Events
                </Space>
              }
              extra={
                <Button
                  type="link"
                  onClick={() => navigate(route.ADMIN_EVENT_LIST)}
                >
                  View All Events
                </Button>
              }
              bordered={false}
            >
              {loading ? (
                <Skeleton active paragraph={{ rows: 4 }} />
              ) : upcomingEvents.length === 0 ? (
                <Empty description="No upcoming events scheduled" />
              ) : (
                <Table
                  dataSource={upcomingEvents}
                  rowKey="id"
                  pagination={false}
                  size="small"
                >
                  <Table.Column
                    title="Event"
                    dataIndex="title"
                    key="title"
                    render={(title: string, record: Event) => (
                      <Space direction="vertical" size={0}>
                        <Text strong>{title}</Text>
                        {record.location && (
                          <Text type="secondary" style={{ fontSize: 12 }}>
                            📍 {record.location}
                          </Text>
                        )}
                      </Space>
                    )}
                  />
                  <Table.Column
                    title="Type"
                    dataIndex="eventType"
                    key="eventType"
                    render={(type: string) => (
                      <Tag color={eventTypeColors[type] || "default"}>
                        {formatEventType(type)}
                      </Tag>
                    )}
                  />
                  <Table.Column
                    title="Date & Time"
                    key="datetime"
                    render={(record: Event) => (
                      <Space direction="vertical" size={0}>
                        <Text>
                          {new Date(record.startDate).toLocaleDateString()}
                        </Text>
                        {record.startTime && (
                          <Text type="secondary" style={{ fontSize: 12 }}>
                            {record.startTime}
                            {record.endTime && ` - ${record.endTime}`}
                          </Text>
                        )}
                      </Space>
                    )}
                  />
                  <Table.Column
                    title="Actions"
                    key="actions"
                    render={(_: any, record: Event) => (
                      <Button
                        type="link"
                        icon={<EyeOutlined />}
                        onClick={() =>
                          navigate(
                            route.ADMIN_EVENT_DETAIL.replace(":id", record.id)
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

          {/* Department Overview */}
          <Col xs={24} lg={10}>
            <Card
              title="Department Overview"
              bordered={false}
              bodyStyle={{ maxHeight: 330, overflowY: "auto" }}
            >
              {loading ? (
                <Skeleton active paragraph={{ rows: 6 }} />
              ) : departments.length === 0 ? (
                <Empty description="No departments registered" />
              ) : (
                <List
                  dataSource={departments.slice(0, 10)}
                  renderItem={(dept) => (
                    <List.Item>
                      <Space style={{ width: "100%", justifyContent: "space-between" }}>
                        <Space direction="vertical" size={0}>
                          <Text strong>{dept.name}</Text>
                          <Text type="secondary" style={{ fontSize: 12 }}>
                            {dept.code}
                          </Text>
                        </Space>
                        <Tag color={dept.isActive ? "green" : "red"}>
                          {dept.isActive ? "Active" : "Inactive"}
                        </Tag>
                      </Space>
                    </List.Item>
                  )}
                />
              )}
            </Card>
            <Card
              style={{ marginTop: 16 }}
              bordered={false}
              title="System Status"
            >
              {loading ? (
                <Skeleton active paragraph={{ rows: 1 }} />
              ) : (
                <Statistic
                  value={stats.activeDepartments}
                  suffix={`of ${stats.totalDepartments} departments`}
                  valueStyle={{ color: "#52c41a" }}
                />
              )}
              <Text type="secondary">
                Active organizational units in the system.
              </Text>
            </Card>
          </Col>
        </Row>

        {/* Recent Notices */}
        <Card
          title="Recent Notices"
          bordered={false}
          extra={
            <Button
              type="link"
              onClick={() => navigate(route.ADMIN_NOTICE_LIST)}
            >
              View All Notices
            </Button>
          }
        >
          {loading ? (
            <Skeleton active paragraph={{ rows: 3 }} />
          ) : recentNotices.length === 0 ? (
            <Empty description="No notices published yet" />
          ) : (
            <List
              dataSource={recentNotices}
              renderItem={(notice) => (
                <List.Item
                  actions={[
                    <Button
                      key="view"
                      type="link"
                      icon={<EyeOutlined />}
                      onClick={() =>
                        navigate(
                          route.ADMIN_NOTICE_DETAIL.replace(":id", notice.id)
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
                        <Text strong>{notice.title}</Text>
                        <Tag color={noticePriorityColors[notice.priority] || "default"}>
                          {notice.priority.toUpperCase()}
                        </Tag>
                        <Tag color="blue">{notice.noticeType}</Tag>
                      </Space>
                    }
                    description={
                      <div>
                        <div>
                          <Text
                            ellipsis={{ tooltip: notice.content }}
                            style={{ maxWidth: 600 }}
                          >
                            {notice.content}
                          </Text>
                        </div>
                        <div style={{ marginTop: 4 }}>
                          <Text type="secondary" style={{ fontSize: 12 }}>
                            Published: {new Date(notice.publishedDate).toLocaleString()}
                            {notice.expiryDate &&
                              ` • Expires: ${new Date(notice.expiryDate).toLocaleDateString()}`}
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

export default Administration;
