import React, { useEffect, useState } from 'react';
import {
  Card,
  Space,
  Button,
  Statistic,
  Row,
  Col,
  Descriptions,
  Tag,
  message,
  Skeleton,
  Divider,
  Timeline,
} from 'antd';
import {
  ArrowLeftOutlined,
  EditOutlined,
  TeamOutlined,
  CalendarOutlined,
  ClusterOutlined,
  BookOutlined,
} from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import { academicAPI, Course, CourseSection } from '../../../../api/academic.api';
import { userAPI, User } from '../../../../api/user.api';
import { PermissionGuard } from '../../../common/PermissionGuard';
import { route } from '../../../routes/constant';

const SectionDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [section, setSection] = useState<CourseSection | null>(null);
  const [course, setCourse] = useState<Course | null>(null);
  const [instructor, setInstructor] = useState<User | null>(null);

  useEffect(() => {
    if (id) {
      loadSection(id);
    }
  }, [id]);

  const loadSection = async (sectionId: string) => {
    try {
      setLoading(true);
      const sectionData = await academicAPI.getSection(sectionId);
      setSection(sectionData);

      const coursePromise = academicAPI
        .getCourse(sectionData.courseId)
        .catch(() => null);
      const facultyPromise = sectionData.facultyId
        ? userAPI.getUser(sectionData.facultyId).catch(() => null)
        : Promise.resolve(null);
      const [courseData, facultyData] = await Promise.all([coursePromise, facultyPromise]);
      setCourse(courseData);
      setInstructor(facultyData);
    } catch (error: any) {
      message.error(error.message || 'Failed to load section');
    } finally {
      setLoading(false);
    }
  };

  if (!section) {
    return (
      <div style={{ padding: 24 }}>
        <Card style={{ borderRadius: 16 }}>
          <Skeleton active paragraph={{ rows: 6 }} />
        </Card>
      </div>
    );
  }

  const fillRate = section.maxCapacity > 0
    ? Math.round((section.currentEnrollment / section.maxCapacity) * 100)
    : 0;

  return (
    <div style={{ padding: 24 }}>
      <Card
        style={{ maxWidth: 1100, margin: '0 auto', borderRadius: 16 }}
        bodyStyle={{ padding: 32 }}
        title={
          <Space size="large">
            <span style={{ fontSize: 20, fontWeight: 600 }}>Section Overview</span>
            <Tag color={section.isActive ? 'success' : 'error'}>
              {section.isActive ? 'Active' : 'Inactive'}
            </Tag>
          </Space>
        }
        extra={
          <Space>
            <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)}>
              Back
            </Button>
            <PermissionGuard permission="academic" action="update">
              <Button
                type="primary"
                icon={<EditOutlined />}
                onClick={() => navigate(route.ACADEMIC_SECTION_EDIT.replace(':id', section.id))}
              >
                Edit Section
              </Button>
            </PermissionGuard>
          </Space>
        }
      >
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <Row gutter={[16, 16]}>
            <Col xs={24} md={8}>
              <Card bordered={false} style={{ borderRadius: 12, background: '#f0f5ff' }}>
                <Statistic
                  title="Section"
                  value={section.sectionCode}
                  prefix={<ClusterOutlined />}
                />
              </Card>
            </Col>
            <Col xs={24} md={8}>
              <Card bordered={false} style={{ borderRadius: 12, background: '#f6ffed' }}>
                <Statistic
                  title="Enrollment"
                  value={`${section.currentEnrollment}/${section.maxCapacity}`}
                  prefix={<TeamOutlined />}
                />
              </Card>
            </Col>
            <Col xs={24} md={8}>
              <Card bordered={false} style={{ borderRadius: 12, background: '#fff7e6' }}>
                <Statistic title="Fill Rate" value={`${fillRate}%`} prefix={<CalendarOutlined />} />
              </Card>
            </Col>
          </Row>

          <Card bordered={false} style={{ borderRadius: 12, background: '#fafafa' }}>
            <Descriptions bordered column={2} size="small">
              <Descriptions.Item label="Course" span={2}>
                {course ? (
                  <Space direction="vertical" size={0}>
                    <Space>
                      <BookOutlined />
                      <strong>{course.code}</strong>
                    </Space>
                    <span style={{ color: '#666' }}>{course.title}</span>
                  </Space>
                ) : (
                  'Course information unavailable'
                )}
              </Descriptions.Item>
              <Descriptions.Item label="Semester">
                <Tag color="geekblue">{section.semester}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Instructor">
                {instructor ? (
                  <Space>
                    <TeamOutlined />
                    <span>{`${instructor.firstName} ${instructor.lastName}`}</span>
                  </Space>
                ) : (
                  <Tag color="default">Unassigned</Tag>
                )}
              </Descriptions.Item>
              <Descriptions.Item label="Room">
                {section.roomId || <span style={{ color: '#999' }}>Not assigned</span>}
              </Descriptions.Item>
              <Descriptions.Item label="Schedule Slot">
                {section.scheduleId || <span style={{ color: '#999' }}>Pending timetable</span>}
              </Descriptions.Item>
              <Descriptions.Item label="Created On">
                {new Date(section.createdAt).toLocaleString()}
              </Descriptions.Item>
            </Descriptions>
          </Card>

          <Card bordered={false} title="Lifecycle" style={{ borderRadius: 12 }}>
            <Timeline
              items={[
                {
                  color: 'green',
                  children: (
                    <span>
                      Section created{' '}
                      <strong>{new Date(section.createdAt).toLocaleDateString()}</strong>
                    </span>
                  ),
                },
                {
                  color: 'blue',
                  children: section.semester ? `Scheduled for ${section.semester}` : 'Semester not defined',
                },
                {
                  color: section.isActive ? 'green' : 'red',
                  children: section.isActive ? 'Section is open for enrollment' : 'Section is currently inactive',
                },
              ]}
            />
          </Card>

          <Divider />
          <span style={{ color: '#999' }}>Last updated: {new Date(section.createdAt).toLocaleString()}</span>
        </Space>
      </Card>
    </div>
  );
};

export default SectionDetail;
