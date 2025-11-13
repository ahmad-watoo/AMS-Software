import React, { useState, useEffect } from 'react';
import { Card, Descriptions, Tag, Button, Space, message, List, Row, Col, Statistic, Divider, Skeleton } from 'antd';
import { ArrowLeftOutlined, EditOutlined, CodeOutlined, ClockCircleOutlined, ExperimentOutlined } from '@ant-design/icons';
import { academicAPI, Course } from '../../../../api/academic.api';
import { useNavigate, useParams } from 'react-router-dom';
import { PermissionGuard } from '../../../common/PermissionGuard';
import { route } from '../../../routes/constant';

const CourseDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [course, setCourse] = useState<Course | null>(null);
  const [prerequisiteCourses, setPrerequisiteCourses] = useState<Course[]>([]);

  useEffect(() => {
    if (id) {
      loadCourse();
    }
  }, [id]);

  const loadCourse = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const courseData = await academicAPI.getCourse(id);
      setCourse(courseData);

      if (courseData.prerequisiteCourseIds && courseData.prerequisiteCourseIds.length > 0) {
        const prereqs = await Promise.all(
          courseData.prerequisiteCourseIds.map((prereqId) =>
            academicAPI.getCourse(prereqId).catch(() => null)
          )
        );
        setPrerequisiteCourses(prereqs.filter((c) => c !== null) as Course[]);
      } else {
        setPrerequisiteCourses([]);
      }
    } catch (error: any) {
      message.error(error.message || 'Failed to load course');
    } finally {
      setLoading(false);
    }
  };

  if (!course) {
    return (
      <div style={{ padding: 24 }}>
        <Card style={{ borderRadius: 16 }}>
          <Skeleton active paragraph={{ rows: 6 }} />
        </Card>
      </div>
    );
  }

  return (
    <div style={{ padding: 24 }}>
      <Card
        style={{ maxWidth: 1100, margin: '0 auto', borderRadius: 16 }}
        bodyStyle={{ padding: 32 }}
        title={
          <Space size="large">
            <span style={{ fontSize: 20, fontWeight: 600 }}>Course Details</span>
            <Tag color={course.isActive ? 'success' : 'error'}>
              {course.isActive ? 'Active' : 'Inactive'}
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
                onClick={() => navigate(route.ACADEMIC_COURSE_EDIT.replace(':id', course.id))}
              >
                Edit Course
              </Button>
            </PermissionGuard>
          </Space>
        }
      >
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <Row gutter={[16, 16]}>
            <Col xs={24} md={8}>
              <Card bordered={false} style={{ background: '#f0f5ff', borderRadius: 12 }}>
                <Statistic
                  title="Total Credit Hours"
                  value={course.creditHours}
                  prefix={<ClockCircleOutlined />}
                  suffix="CH"
                />
              </Card>
            </Col>
            <Col xs={24} md={8}>
              <Card bordered={false} style={{ background: '#f6ffed', borderRadius: 12 }}>
                <Statistic
                  title="Theory Hours"
                  value={course.theoryHours}
                  prefix={<CodeOutlined />}
                  suffix="hrs"
                />
              </Card>
            </Col>
            <Col xs={24} md={8}>
              <Card bordered={false} style={{ background: '#fff0f6', borderRadius: 12 }}>
                <Statistic
                  title="Lab Hours"
                  value={course.labHours}
                  prefix={<ExperimentOutlined />}
                  suffix="hrs"
                />
              </Card>
            </Col>
          </Row>

          <Card bordered={false} style={{ borderRadius: 12, background: '#fafafa' }}>
            <Descriptions bordered column={2} size="small">
              <Descriptions.Item label="Course Code" span={2}>
                <strong>{course.code}</strong>
              </Descriptions.Item>
              <Descriptions.Item label="Course Title" span={2}>
                {course.title}
              </Descriptions.Item>
              <Descriptions.Item label="Course Type">
                <Tag color={course.isElective ? 'orange' : 'blue'}>
                  {course.isElective ? 'Elective' : 'Core'}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Status">
                <Tag color={course.isActive ? 'success' : 'error'}>
                  {course.isActive ? 'Active' : 'Inactive'}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Created At">
                {new Date(course.createdAt).toLocaleDateString()}
              </Descriptions.Item>
              <Descriptions.Item label="Last Updated">
                {new Date(course.updatedAt).toLocaleDateString()}
              </Descriptions.Item>
              {course.description && (
                <Descriptions.Item label="Description" span={2}>
                  {course.description}
                </Descriptions.Item>
              )}
            </Descriptions>
          </Card>

          {prerequisiteCourses.length > 0 && (
            <Card bordered={false} title="Prerequisite Courses" style={{ borderRadius: 12 }}>
              <List
                dataSource={prerequisiteCourses}
                renderItem={(prereq) => (
                  <List.Item>
                    <Space size="large">
                      <Tag color="blue">{prereq.code}</Tag>
                      <span>{prereq.title}</span>
                      <Tag>{prereq.creditHours} CH</Tag>
                    </Space>
                  </List.Item>
                )}
              />
            </Card>
          )}

          <Divider />
          <Space direction="vertical" size="small">
            <span style={{ color: '#999' }}>
              Last synchronized: {new Date(course.updatedAt).toLocaleString()}
            </span>
          </Space>
        </Space>
      </Card>
    </div>
  );
};

export default CourseDetail;

