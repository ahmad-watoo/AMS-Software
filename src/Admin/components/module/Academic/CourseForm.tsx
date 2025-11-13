import React, { useState, useEffect } from 'react';
import {
  Form,
  Input,
  Button,
  Card,
  message,
  Space,
  Select,
  InputNumber,
  Typography,
  Row,
  Col,
  Switch,
  Skeleton,
  Divider,
} from 'antd';
import { SaveOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { academicAPI, CreateCourseDTO, Course } from '../../../../api/academic.api';
import { useNavigate, useParams } from 'react-router-dom';
import { route } from '../../../routes/constant';

const { Option } = Select;
const { TextArea } = Input;
const { Title, Paragraph } = Typography;

interface CourseFormProps {
  isEdit?: boolean;
}

const CourseForm: React.FC<CourseFormProps> = ({ isEdit = false }) => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(false);
  const [allCourses, setAllCourses] = useState<Course[]>([]);

  useEffect(() => {
    if (isEdit && id) {
      loadCourse(id);
    }
    loadAllCourses();
  }, [id, isEdit]);

  const loadCourse = async (courseId: string) => {
    try {
      setLoading(true);
      const course = await academicAPI.getCourse(courseId);
      form.setFieldsValue({
        code: course.code,
        title: course.title,
        departmentId: course.departmentId,
        creditHours: course.creditHours,
        theoryHours: course.theoryHours,
        labHours: course.labHours,
        description: course.description,
        prerequisiteCourseIds: course.prerequisiteCourseIds,
        isElective: course.isElective,
        isActive: course.isActive,
      });
    } catch (error: any) {
      message.error(error.message || 'Failed to load course');
    } finally {
      setLoading(false);
    }
  };

  const loadAllCourses = async () => {
    try {
      const response = await academicAPI.getCourses(1, 1000);
      setAllCourses(response.courses);
    } catch (error) {
      console.warn('Failed to load courses for prerequisites');
    }
  };

  const handleSubmit = async (values: any) => {
    try {
      setLoading(true);

      if (isEdit && id) {
        await academicAPI.updateCourse(id, values);
        message.success('Course updated successfully');
      } else {
        const courseData: CreateCourseDTO = {
          code: values.code,
          title: values.title,
          departmentId: values.departmentId,
          creditHours: values.creditHours,
          theoryHours: values.theoryHours || 0,
          labHours: values.labHours || 0,
          description: values.description,
          prerequisiteCourseIds: values.prerequisiteCourseIds || [],
          isElective: values.isElective || false,
        };
        await academicAPI.createCourse(courseData);
        message.success('Course created successfully');
      }

      navigate(route.ACADEMIC_COURSE_LIST);
    } catch (error: any) {
      message.error(error.message || 'Failed to save course');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 24 }}>
      <Card
        style={{ maxWidth: 960, margin: '0 auto', borderRadius: 16 }}
        bodyStyle={{ padding: 32 }}
      >
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <Space align="baseline" style={{ justifyContent: 'space-between', width: '100%' }}>
            <div>
              <Title level={3} style={{ marginBottom: 4 }}>
                {isEdit ? 'Edit Course' : 'Create New Course'}
              </Title>
              <Paragraph type="secondary" style={{ marginBottom: 0 }}>
                Define course properties, workload distribution, and prerequisite catalog.
              </Paragraph>
            </div>
            <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)}>
              Back
            </Button>
          </Space>

          <Divider style={{ margin: '12px 0' }} />

          {loading && isEdit ? (
            <Skeleton active paragraph={{ rows: 6 }} />
          ) : (
            <Form
              form={form}
              layout="vertical"
              onFinish={handleSubmit}
              initialValues={{
                creditHours: 3,
                theoryHours: 3,
                labHours: 0,
                isElective: false,
              }}
            >
              <Row gutter={24}>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="code"
                    label="Course Code"
                    rules={[
                      { required: true, message: 'Please enter course code' },
                      {
                        pattern: /^[A-Z0-9-]+$/,
                        message: 'Use uppercase letters, numbers, and hyphens only',
                      },
                    ]}
                  >
                    <Input placeholder="e.g., CS101, IT201" disabled={isEdit} size="large" />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="title"
                    label="Course Title"
                    rules={[{ required: true, message: 'Please enter course title' }]}
                  >
                    <Input placeholder="Introduction to Computer Science" size="large" />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={24}>
                <Col xs={24} md={12}>
                  <Form.Item name="departmentId" label="Department">
                    <Select
                      placeholder="Select Department"
                      allowClear
                      showSearch
                      optionFilterProp="children"
                      size="large"
                    >
                      {allCourses.map((course) => (
                        course.departmentId ? (
                          <Option key={course.id} value={course.departmentId}>
                            {course.departmentId}
                          </Option>
                        ) : null
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item label="Course Type" name="isElective" valuePropName="checked">
                    <Switch checkedChildren="Elective" unCheckedChildren="Core" />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={24}>
                <Col xs={24} md={8}>
                  <Form.Item
                    name="creditHours"
                    label="Credit Hours"
                    rules={[
                      { required: true, message: 'Please enter credit hours' },
                      { type: 'number', min: 1, max: 6, message: 'Must be between 1 and 6' },
                    ]}
                  >
                    <InputNumber min={1} max={6} style={{ width: '100%' }} size="large" />
                  </Form.Item>
                </Col>
                <Col xs={24} md={8}>
                  <Form.Item
                    name="theoryHours"
                    label="Theory Hours"
                    rules={[{ type: 'number', min: 0, message: 'Cannot be negative' }]}
                  >
                    <InputNumber min={0} style={{ width: '100%' }} size="large" />
                  </Form.Item>
                </Col>
                <Col xs={24} md={8}>
                  <Form.Item
                    name="labHours"
                    label="Lab Hours"
                    rules={[{ type: 'number', min: 0, message: 'Cannot be negative' }]}
                  >
                    <InputNumber min={0} style={{ width: '100%' }} size="large" />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item
                name="prerequisiteCourseIds"
                label="Prerequisites"
              >
                <Select
                  mode="multiple"
                  placeholder="Select prerequisite courses"
                  allowClear
                  showSearch
                  optionFilterProp="children"
                  size="large"
                >
                  {allCourses
                    .filter((course) => !isEdit || course.id !== id)
                    .map((course) => (
                      <Option key={course.id} value={course.id}>
                        {course.code} - {course.title}
                      </Option>
                    ))}
                </Select>
              </Form.Item>

              <Form.Item name="description" label="Course Description">
                <TextArea rows={4} placeholder="Course description, learning outcomes, prerequisites..." />
              </Form.Item>

              {isEdit && (
                <Form.Item name="isActive" label="Status" valuePropName="checked">
                  <Switch checkedChildren="Active" unCheckedChildren="Inactive" />
                </Form.Item>
              )}

              <Divider />
              <Space>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  icon={<SaveOutlined />}
                  size="large"
                >
                  {isEdit ? 'Update Course' : 'Create Course'}
                </Button>
                <Button size="large" onClick={() => navigate(-1)}>
                  Cancel
                </Button>
              </Space>
            </Form>
          )}
        </Space>
      </Card>
    </div>
  );
};

export default CourseForm;

