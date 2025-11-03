import React, { useState, useEffect } from 'react';
import { Card, Descriptions, Tag, Button, Space, message, List } from 'antd';
import { ArrowLeftOutlined, EditOutlined } from '@ant-design/icons';
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

      // Load prerequisite courses
      if (courseData.prerequisiteCourseIds && courseData.prerequisiteCourseIds.length > 0) {
        const prereqs = await Promise.all(
          courseData.prerequisiteCourseIds.map((prereqId) =>
            academicAPI.getCourse(prereqId).catch(() => null)
          )
        );
        setPrerequisiteCourses(prereqs.filter((c) => c !== null) as Course[]);
      }
    } catch (error: any) {
      message.error(error.message || 'Failed to load course');
    } finally {
      setLoading(false);
    }
  };

  if (!course) {
    return (
      <Card loading={loading} style={{ margin: 20 }}>
        Loading course details...
      </Card>
    );
  }

  return (
    <div style={{ margin: 20 }}>
      <Card
        title="Course Details"
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
                Edit
              </Button>
            </PermissionGuard>
          </Space>
        }
        style={{ marginBottom: 20, boxShadow: 'rgba(0, 0, 0, 0.16) 0px 1px 4px' }}
      >
        <Descriptions bordered column={2}>
          <Descriptions.Item label="Course Code" span={2}>
            <strong>{course.code}</strong>
          </Descriptions.Item>
          <Descriptions.Item label="Course Title" span={2}>
            {course.title}
          </Descriptions.Item>
          <Descriptions.Item label="Credit Hours">
            <strong>{course.creditHours} CH</strong>
          </Descriptions.Item>
          <Descriptions.Item label="Type">
            <Tag color={course.isElective ? 'orange' : 'blue'}>
              {course.isElective ? 'Elective' : 'Core'}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Theory Hours">
            {course.theoryHours} hours
          </Descriptions.Item>
          <Descriptions.Item label="Lab Hours">
            {course.labHours} hours
          </Descriptions.Item>
          <Descriptions.Item label="Status">
            <Tag color={course.isActive ? 'success' : 'error'}>
              {course.isActive ? 'Active' : 'Inactive'}
            </Tag>
          </Descriptions.Item>
          {course.description && (
            <Descriptions.Item label="Description" span={2}>
              {course.description}
            </Descriptions.Item>
          )}
          <Descriptions.Item label="Created At">
            {new Date(course.createdAt).toLocaleDateString()}
          </Descriptions.Item>
          <Descriptions.Item label="Last Updated">
            {new Date(course.updatedAt).toLocaleDateString()}
          </Descriptions.Item>
        </Descriptions>
      </Card>

      {prerequisiteCourses.length > 0 && (
        <Card
          title="Prerequisites"
          style={{ boxShadow: 'rgba(0, 0, 0, 0.16) 0px 1px 4px' }}
        >
          <List
            dataSource={prerequisiteCourses}
            renderItem={(prereq) => (
              <List.Item>
                <Space>
                  <strong>{prereq.code}</strong>
                  <span>{prereq.title}</span>
                  <Tag>{prereq.creditHours} CH</Tag>
                </Space>
              </List.Item>
            )}
          />
        </Card>
      )}
    </div>
  );
};

export default CourseDetail;

