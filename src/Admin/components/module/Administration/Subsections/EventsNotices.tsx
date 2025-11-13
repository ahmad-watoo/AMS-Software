import React, { useEffect, useMemo, useState } from 'react';
import {
  Card,
  List,
  Space,
  Tag,
  Button,
  Typography,
  Statistic,
  Row,
  Col,
  Empty,
  Skeleton,
  message,
} from 'antd';
import {
  CalendarOutlined,
  NotificationOutlined,
  PlusOutlined,
  ArrowRightOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import administrationAPI, { Event, Notice } from '@/api/administration.api';
import dayjs from 'dayjs';
import { route } from '../../../../routes/constant';
import PermissionGuard from '@/components/common/PermissionGuard';

const { Title, Text, Paragraph } = Typography;

const normalizeEvents = (response: any): Event[] => {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.events)) return response.events;
  if (Array.isArray(response?.data?.events)) return response.data.events;
  if (Array.isArray(response?.data)) return response.data;
  return [];
};

const normalizeNotices = (response: any): Notice[] => {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.notices)) return response.notices;
  if (Array.isArray(response?.data?.notices)) return response.data.notices;
  if (Array.isArray(response?.data)) return response.data;
  return [];
};

const EventsNotices: React.FC = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState<Event[]>([]);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const [eventsResponse, noticesResponse] = await Promise.all([
        administrationAPI.getAllEvents({ page: 1, limit: 50, isActive: true }),
        administrationAPI.getAllNotices({ page: 1, limit: 50, isPublished: true }),
      ]);
      setEvents(normalizeEvents(eventsResponse));
      setNotices(normalizeNotices(noticesResponse));
    } catch (error: any) {
      message.error(error.message || 'Failed to load events and notices');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const upcomingEvents = useMemo(
    () =>
      events
        .slice()
        .sort((a, b) => dayjs(a.startDate).valueOf() - dayjs(b.startDate).valueOf())
        .filter((event) => dayjs(event.endDate || event.startDate).isSame(dayjs(), 'day') || dayjs(event.endDate || event.startDate).isAfter(dayjs()))
        .slice(0, 5),
    [events]
  );

  const recentNotices = useMemo(
    () =>
      notices
        .slice()
        .sort((a, b) => dayjs(b.publishedDate).valueOf() - dayjs(a.publishedDate).valueOf())
        .slice(0, 6),
    [notices]
  );

  const stats = useMemo(() => {
    const upcomingCount = upcomingEvents.length;
    const totalEvents = events.length;
    const urgentNotices = notices.filter((notice) => notice.priority === 'urgent' || notice.priority === 'high').length;
    return { upcomingCount, totalEvents, urgentNotices };
  }, [events, notices, upcomingEvents]);

  const renderEventMeta = (event: Event) => (
    <Space direction="vertical" size={0} style={{ width: '100%' }}>
      <Text type="secondary">
        {dayjs(event.startDate).format('DD MMM YYYY')} {event.endDate && dayjs(event.endDate).isAfter(event.startDate) ? `– ${dayjs(event.endDate).format('DD MMM YYYY')}` : ''}
      </Text>
      <Space size="middle">
        <Tag color="blue">{event.eventType.toUpperCase()}</Tag>
        {event.location && <Tag>{event.location}</Tag>}
      </Space>
    </Space>
  );

  const renderNoticeMeta = (notice: Notice) => (
    <Space direction="vertical" size={0} style={{ width: '100%' }}>
      <Text type="secondary">{dayjs(notice.publishedDate).format('DD MMM YYYY')}</Text>
      <Space size="small">
        <Tag color={notice.priority === 'urgent' ? 'red' : notice.priority === 'high' ? 'orange' : 'blue'}>{notice.priority.toUpperCase()}</Tag>
        {notice.targetAudience.map((audience: Notice['targetAudience'][number]) => (
          <Tag key={audience}>{audience.toUpperCase()}</Tag>
        ))}
      </Space>
    </Space>
  );

  return (
    <div style={{ padding: 24 }}>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <Card bordered={false} style={{ borderRadius: 16 }}>
          <Row gutter={[16, 16]} align="middle">
            <Col xs={24} md={16}>
              <Space size="large" align="center">
                <CalendarOutlined style={{ fontSize: 40, color: '#1677ff' }} />
                <div>
                  <Title level={3} style={{ marginBottom: 0 }}>
                    Administration Command Center
                  </Title>
                  <Paragraph type="secondary" style={{ marginBottom: 0 }}>
                    Track institutional events, notices, and campus communications in one view.
                  </Paragraph>
                </div>
              </Space>
            </Col>
            <Col xs={24} md={8}>
              <Space style={{ justifyContent: 'flex-end', width: '100%' }}>
                <Button icon={<ReloadOutlined />} onClick={loadData}>
                  Refresh
                </Button>
                <PermissionGuard permission="administration" action="create">
                  <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate(route.ADMIN_EVENT_CREATE)}>
                    New Event
                  </Button>
                </PermissionGuard>
              </Space>
            </Col>
          </Row>
        </Card>

        <Row gutter={[16, 16]}>
          <Col xs={24} md={8}>
            <Card bordered={false} style={{ borderRadius: 12, background: '#f0f5ff' }}>
              <Statistic title="Upcoming Events" value={stats.upcomingCount} prefix={<CalendarOutlined />} />
            </Card>
          </Col>
          <Col xs={24} md={8}>
            <Card bordered={false} style={{ borderRadius: 12, background: '#fff7e6' }}>
              <Statistic title="Active Events" value={stats.totalEvents} prefix={<CalendarOutlined />} />
            </Card>
          </Col>
          <Col xs={24} md={8}>
            <Card bordered={false} style={{ borderRadius: 12, background: '#fff0f6' }}>
              <Statistic title="Urgent Notices" value={stats.urgentNotices} prefix={<NotificationOutlined />} />
            </Card>
          </Col>
        </Row>

        <Row gutter={[16, 16]}>
          <Col xs={24} md={12}>
            <Card
              title="Upcoming Events"
              extra={
                <Space>
                  <Button type="link" icon={<ArrowRightOutlined />} onClick={() => navigate(route.ADMIN_EVENT_LIST)}>
                    View All
                  </Button>
                </Space>
              }
              bordered={false}
              style={{ borderRadius: 12, minHeight: 320 }}
            >
              {loading ? (
                <Skeleton active paragraph={{ rows: 6 }} />
              ) : upcomingEvents.length === 0 ? (
                <Empty description="No upcoming events" />
              ) : (
                <List
                  itemLayout="vertical"
                  dataSource={upcomingEvents}
                  renderItem={(event) => (
                    <List.Item key={event.id} actions={[<Button type="link" onClick={() => navigate(`${route.ADMIN_EVENT_EDIT.replace(':id', event.id)}`)}>Manage</Button>]}> 
                      <List.Item.Meta title={event.title} description={renderEventMeta(event)} />
                      {event.description && <Text>{event.description}</Text>}
                    </List.Item>
                  )}
                />
              )}
            </Card>
          </Col>
          <Col xs={24} md={12}>
            <Card
              title="Recent Notices"
              extra={
                <Space>
                  <Button type="link" icon={<ArrowRightOutlined />} onClick={() => navigate(route.ADMIN_NOTICE_LIST)}>
                    View All
                  </Button>
                  <PermissionGuard permission="administration" action="create">
                    <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate(route.ADMIN_NOTICE_CREATE)}>
                      Publish Notice
                    </Button>
                  </PermissionGuard>
                </Space>
              }
              bordered={false}
              style={{ borderRadius: 12, minHeight: 320 }}
            >
              {loading ? (
                <Skeleton active paragraph={{ rows: 6 }} />
              ) : recentNotices.length === 0 ? (
                <Empty description="No notices published" />
              ) : (
                <List
                  itemLayout="vertical"
                  dataSource={recentNotices}
                  renderItem={(notice) => (
                    <List.Item key={notice.id} actions={[<Button type="link" onClick={() => navigate(route.ADMIN_NOTICE_EDIT.replace(':id', notice.id))}>Manage</Button>]}> 
                      <List.Item.Meta title={notice.title} description={renderNoticeMeta(notice)} />
                      <Text>{notice.content.length > 160 ? `${notice.content.slice(0, 160)}…` : notice.content}</Text>
                    </List.Item>
                  )}
                />
              )}
            </Card>
          </Col>
        </Row>
      </Space>
    </div>
  );
};

export default EventsNotices;
