import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Statistic, Button, Tag, Space, Spin, message } from 'antd';
import {
  UserOutlined,
  BookOutlined,
  DollarOutlined,
  CalendarOutlined,
  FileTextOutlined,
  TeamOutlined,
  SolutionOutlined,
  BankOutlined,
  TrophyOutlined,
  ClockCircleOutlined,
  ProjectOutlined,
  FolderOutlined,
  IdcardOutlined,
  GlobalOutlined,
  AppstoreOutlined,
  ArrowRightOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { route } from '../../routes/constant';
import { useAuthContext } from '../../../contexts/AuthContext';
import PermissionGuard from '../../../components/common/PermissionGuard';
import dashboardAPI, { DashboardStats, RecentActivity, UpcomingEvent } from '../../../api/dashboard.api';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    totalStudents: 0,
    totalFaculty: 0,
    totalPayments: 0,
    pendingApplications: 0,
    upcomingExams: 0,
    activePrograms: 0,
    totalBooks: 0,
    overdueBooks: 0,
    totalEmployees: 0,
    pendingLeaveRequests: 0,
  });
  const [activities, setActivities] = useState<RecentActivity[]>([]);
  const [events, setEvents] = useState<UpcomingEvent[]>([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [statsData, activitiesData, eventsData] = await Promise.all([
        dashboardAPI.getStats().catch(() => ({
          totalStudents: 0,
          totalFaculty: 0,
          totalPayments: 0,
          pendingApplications: 0,
          upcomingExams: 0,
          activePrograms: 0,
          totalBooks: 0,
          overdueBooks: 0,
          totalEmployees: 0,
          pendingLeaveRequests: 0,
        })),
        dashboardAPI.getRecentActivities(10).catch(() => []),
        dashboardAPI.getUpcomingEvents(10).catch(() => []),
      ]);

      setStats(statsData);
      setActivities(activitiesData);
      setEvents(eventsData);
    } catch (error: any) {
      message.error('Failed to load dashboard data');
      console.error('Dashboard error:', error);
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    {
      title: 'User Management',
      icon: <UserOutlined style={{ fontSize: 24, color: '#1890ff' }} />,
      path: route.USERS_LIST,
      permission: 'users',
      action: 'read',
      color: '#1890ff',
    },
    {
      title: 'Student Management',
      icon: <SolutionOutlined style={{ fontSize: 24, color: '#52c41a' }} />,
      path: route.STUDENT_LIST,
      permission: 'students',
      action: 'read',
      color: '#52c41a',
    },
    {
      title: 'Admission',
      icon: <FileTextOutlined style={{ fontSize: 24, color: '#722ed1' }} />,
      path: route.ADMISSION_APPLICATION_LIST,
      permission: 'admission',
      action: 'read',
      color: '#722ed1',
    },
    {
      title: 'Academic Programs',
      icon: <BookOutlined style={{ fontSize: 24, color: '#fa8c16' }} />,
      path: route.ACADEMIC_PROGRAM_LIST,
      permission: 'academic',
      action: 'read',
      color: '#fa8c16',
    },
    {
      title: 'Finance',
      icon: <DollarOutlined style={{ fontSize: 24, color: '#eb2f96' }} />,
      path: route.FINANCE_PAYMENT_LIST,
      permission: 'finance',
      action: 'read',
      color: '#eb2f96',
    },
    {
      title: 'Examinations',
      icon: <TrophyOutlined style={{ fontSize: 24, color: '#13c2c2' }} />,
      path: route.EXAMINATION_EXAM_LIST,
      permission: 'examination',
      action: 'read',
      color: '#13c2c2',
    },
    {
      title: 'Attendance',
      icon: <ClockCircleOutlined style={{ fontSize: 24, color: '#f5222d' }} />,
      path: route.ATTENDANCE_RECORD_LIST,
      permission: 'attendance',
      action: 'read',
      color: '#f5222d',
    },
    {
      title: 'HR Management',
      icon: <TeamOutlined style={{ fontSize: 24, color: '#2f54eb' }} />,
      path: route.HR_EMPLOYEE_LIST,
      permission: 'hr',
      action: 'read',
      color: '#2f54eb',
    },
    {
      title: 'Payroll',
      icon: <BankOutlined style={{ fontSize: 24, color: '#faad14' }} />,
      path: route.PAYROLL_SALARY_STRUCTURE_LIST,
      permission: 'payroll',
      action: 'read',
      color: '#faad14',
    },
    {
      title: 'Learning',
      icon: <ProjectOutlined style={{ fontSize: 24, color: '#a0d911' }} />,
      path: route.LEARNING_ASSIGNMENT_LIST,
      permission: 'learning',
      action: 'read',
      color: '#a0d911',
    },
    {
      title: 'Library',
      icon: <FolderOutlined style={{ fontSize: 24, color: '#ff4d4f' }} />,
      path: route.LIBRARY_BOOK_LIST,
      permission: 'library',
      action: 'read',
      color: '#ff4d4f',
    },
    {
      title: 'Certification',
      icon: <IdcardOutlined style={{ fontSize: 24, color: '#531dab' }} />,
      path: route.CERTIFICATION_REQUEST_LIST,
      permission: 'certification',
      action: 'read',
      color: '#531dab',
    },
    {
      title: 'Multi-Campus',
      icon: <GlobalOutlined style={{ fontSize: 24, color: '#096dd9' }} />,
      path: route.MULTICAMPUS_CAMPUS_LIST,
      permission: 'multicampus',
      action: 'read',
      color: '#096dd9',
    },
    {
      title: 'Administration',
      icon: <AppstoreOutlined style={{ fontSize: 24, color: '#d48806' }} />,
      path: route.ADMIN_EVENT_LIST,
      permission: 'admin',
      action: 'read',
      color: '#d48806',
    },
  ];


  const formatCurrency = (amount: number) => {
    return `PKR ${amount.toLocaleString()}`;
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div style={{ padding: '24px', background: '#f0f2f5', minHeight: '100vh' }}>
      {/* Welcome Section */}
      <Card style={{ marginBottom: 24, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
        <Row justify="space-between" align="middle">
          <Col>
            <h1 style={{ color: 'white', margin: 0, fontSize: '28px' }}>
              Welcome back, {user?.firstName || 'User'}! 👋
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.9)', marginTop: '8px', fontSize: '16px' }}>
              Here's what's happening with your Academic Management System today.
            </p>
          </Col>
          <Col>
            <Tag color="white" style={{ fontSize: '16px', padding: '8px 16px' }}>
              {new Date().toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </Tag>
          </Col>
        </Row>
      </Card>

      {/* Statistics Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total Students"
              value={stats.totalStudents}
              prefix={<SolutionOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
            <Button
              type="link"
              size="small"
              onClick={() => navigate(route.STUDENT_LIST)}
              style={{ padding: 0, marginTop: 8 }}
            >
              View All <ArrowRightOutlined />
            </Button>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total Faculty"
              value={stats.totalFaculty}
              prefix={<TeamOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
            <Button
              type="link"
              size="small"
              onClick={() => navigate(route.HR_EMPLOYEE_LIST)}
              style={{ padding: 0, marginTop: 8 }}
            >
              View All <ArrowRightOutlined />
            </Button>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total Payments"
              value={formatCurrency(stats.totalPayments)}
              prefix={<DollarOutlined />}
              valueStyle={{ color: '#eb2f96' }}
            />
            <Button
              type="link"
              size="small"
              onClick={() => navigate(route.FINANCE_PAYMENT_LIST)}
              style={{ padding: 0, marginTop: 8 }}
            >
              View All <ArrowRightOutlined />
            </Button>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Pending Applications"
              value={stats.pendingApplications}
              prefix={<FileTextOutlined />}
              valueStyle={{ color: '#fa8c16' }}
            />
            <Button
              type="link"
              size="small"
              onClick={() => navigate(route.ADMISSION_APPLICATION_LIST)}
              style={{ padding: 0, marginTop: 8 }}
            >
              View All <ArrowRightOutlined />
            </Button>
          </Card>
        </Col>
      </Row>

      {/* Quick Actions Grid */}
      <Card title="Quick Access" style={{ marginBottom: 24 }}>
        <Row gutter={[16, 16]}>
          {quickActions.map((action) => (
            <PermissionGuard
              key={action.path}
              permission={action.permission}
              action={action.action}
            >
              <Col xs={12} sm={8} md={6} lg={4}>
                <Card
                  hoverable
                  style={{
                    textAlign: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.3s',
                  }}
                  onClick={() => navigate(action.path)}
                  bodyStyle={{ padding: '20px 16px' }}
                >
                  <div style={{ marginBottom: 12 }}>{action.icon}</div>
                  <div style={{ fontSize: '14px', fontWeight: 500, color: action.color }}>
                    {action.title}
                  </div>
                </Card>
              </Col>
            </PermissionGuard>
          ))}
        </Row>
      </Card>

      {/* Recent Activities and Upcoming Events */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card title="Recent Activities" extra={<Button type="link">View All</Button>}>
            <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
              {activities.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '20px', color: '#8c8c8c' }}>
                  No recent activities
                </div>
              ) : (
                activities.map((activity) => (
                <div
                  key={activity.id}
                  style={{
                    padding: '12px 0',
                    borderBottom: '1px solid #f0f0f0',
                  }}
                >
                  <Space>
                    <Tag color={activity.status === 'success' ? 'green' : activity.status === 'warning' ? 'orange' : 'blue'}>
                      {activity.type}
                    </Tag>
                    <span style={{ flex: 1 }}>{activity.action}</span>
                    <span style={{ color: '#8c8c8c', fontSize: '12px' }}>{activity.time}</span>
                  </Space>
                </div>
                ))
              )}
            </div>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="Upcoming Events" extra={<Button type="link" onClick={() => navigate(route.ADMIN_EVENT_LIST)}>View All</Button>}>
            <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
              {events.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '20px', color: '#8c8c8c' }}>
                  No upcoming events
                </div>
              ) : (
                events.map((event) => {
                  const eventDate = new Date(event.date);
                  const daysUntil = Math.ceil((eventDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                  
                  return (
                    <div key={event.id} style={{ padding: '12px 0', borderBottom: '1px solid #f0f0f0' }}>
                      <Space direction="vertical" style={{ width: '100%' }}>
                        <div>
                          <strong>{event.title}</strong>
                          <Tag color={event.type === 'exam' ? 'red' : event.type === 'fee' ? 'orange' : 'blue'} style={{ marginLeft: 8 }}>
                            {event.type}
                          </Tag>
                        </div>
                        <div style={{ color: '#8c8c8c', fontSize: '12px' }}>
                          <CalendarOutlined /> {daysUntil > 0 ? `In ${daysUntil} day${daysUntil > 1 ? 's' : ''}` : 'Today'}
                        </div>
                      </Space>
                    </div>
                  );
                })
              )}
            </div>
          </Card>
        </Col>
      </Row>

      {/* System Status */}
      <Card title="System Status" style={{ marginTop: 24 }}>
        <Row gutter={16}>
          <Col xs={24} sm={8}>
            <Statistic
              title="Active Programs"
              value={stats.activePrograms}
              suffix="Programs"
              prefix={<BookOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Col>
          <Col xs={24} sm={8}>
            <Statistic
              title="Upcoming Exams"
              value={stats.upcomingExams}
              suffix="Exams"
              prefix={<TrophyOutlined />}
              valueStyle={{ color: '#fa8c16' }}
            />
          </Col>
          <Col xs={24} sm={8}>
            <Statistic
              title="System Uptime"
              value={99.9}
              suffix="%"
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default Dashboard;

