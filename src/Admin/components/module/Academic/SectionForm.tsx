import React, { useEffect, useMemo, useState } from 'react';
import {
  Card,
  Form,
  Select,
  Input,
  InputNumber,
  Button,
  Space,
  Typography,
  message,
  Divider,
  Row,
  Col,
  Skeleton,
  Tag,
  Statistic,
} from 'antd';
import {
  SaveOutlined,
  ArrowLeftOutlined,
  CalendarOutlined,
  TeamOutlined,
  ClusterOutlined,
} from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import { academicAPI, Course, CourseSection, CreateSectionDTO } from '../../../../api/academic.api';
import { userAPI, User } from '../../../../api/user.api';
import { route } from '../../../routes/constant';

const { Option } = Select;
const { Title, Paragraph } = Typography;

interface SectionFormProps {
  isEdit?: boolean;
}

const SectionForm: React.FC<SectionFormProps> = ({ isEdit = false }) => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(false);
  const [courses, setCourses] = useState<Course[]>([]);
  const [faculty, setFaculty] = useState<User[]>([]);
  const [section, setSection] = useState<CourseSection | null>(null);

  useEffect(() => {
    loadReferenceData();
  }, []);

  useEffect(() => {
    if (isEdit && id) {
      loadSection(id);
    }
  }, [id, isEdit]);

  const loadReferenceData = async () => {
    try {
      const [courseResponse, facultyResponse] = await Promise.all([
        academicAPI.getCourses(1, 200, { isActive: true }),
        userAPI.getUsers(1, 200),
      ]);
      setCourses(courseResponse.courses);
      setFaculty(facultyResponse.users);
    } catch (error) {
      message.warning('Some reference data could not be loaded.');
    }
  };

  const loadSection = async (sectionId: string) => {
    try {
      setLoading(true);
      const sectionData = await academicAPI.getSection(sectionId);
      setSection(sectionData);
      form.setFieldsValue({
        courseId: sectionData.courseId,
        sectionCode: sectionData.sectionCode,
        semester: sectionData.semester,
        facultyId: sectionData.facultyId,
        maxCapacity: sectionData.maxCapacity,
        roomId: sectionData.roomId,
        scheduleId: sectionData.scheduleId,
      });
    } catch (error: any) {
      message.error(error.message || 'Failed to load section');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values: any) => {
    try {
      setLoading(true);
      const payload: CreateSectionDTO = {
        courseId: values.courseId,
        sectionCode: values.sectionCode,
        semester: values.semester,
        facultyId: values.facultyId,
        maxCapacity: values.maxCapacity,
        roomId: values.roomId,
        scheduleId: values.scheduleId,
      };

      if (isEdit && id) {
        await academicAPI.updateSection(id, payload);
        message.success('Section updated successfully');
      } else {
        await academicAPI.createSection(payload);
        message.success('Section created successfully');
      }

      navigate(route.ACADEMIC_SECTION_LIST);
    } catch (error: any) {
      message.error(error.message || 'Failed to save section');
    } finally {
      setLoading(false);
    }
  };

  const courseOptions = useMemo(
    () =>
      courses.map((course) => (
        <Option key={course.id} value={course.id}>
          {course.code} — {course.title}
        </Option>
      )),
    [courses]
  );

  const facultyOptions = useMemo(
    () =>
      faculty.map((member) => (
        <Option key={member.id} value={member.id}>
          {member.firstName} {member.lastName}
        </Option>
      )),
    [faculty]
  );

  return (
    <div style={{ padding: 24 }}>
      <Card style={{ maxWidth: 920, margin: '0 auto', borderRadius: 16 }} bodyStyle={{ padding: 32 }}>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <Space align="baseline" style={{ justifyContent: 'space-between', width: '100%' }}>
            <div>
              <Title level={3} style={{ marginBottom: 4 }}>
                {isEdit ? 'Edit Course Section' : 'Create Course Section'}
              </Title>
              <Paragraph type="secondary" style={{ marginBottom: 0 }}>
                Manage semester offerings, instructor assignments, and classroom capacity.
              </Paragraph>
            </div>
            <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)}>
              Back
            </Button>
          </Space>

          {isEdit && section && (
            <Card bordered={false} style={{ borderRadius: 12, background: '#f7faff' }}>
              <Row gutter={16}>
                <Col xs={24} md={8}>
                  <Statistic
                    title="Current Enrollment"
                    value={section.currentEnrollment}
                    prefix={<ClusterOutlined />}
                  />
                </Col>
                <Col xs={24} md={8}>
                  <Statistic
                    title="Capacity"
                    value={section.maxCapacity}
                    prefix={<TeamOutlined />}
                  />
                </Col>
                <Col xs={24} md={8}>
                  <Space direction="vertical" size={4}>
                    <span style={{ color: '#999' }}>Status</span>
                    <Tag color={section.isActive ? 'success' : 'error'}>
                      {section.isActive ? 'Active' : 'Inactive'}
                    </Tag>
                  </Space>
                </Col>
              </Row>
            </Card>
          )}

          <Divider style={{ margin: '16px 0' }} />

          {loading && isEdit ? (
            <Skeleton active paragraph={{ rows: 6 }} />
          ) : (
            <Form
              form={form}
              layout="vertical"
              onFinish={handleSubmit}
              initialValues={{
                maxCapacity: 30,
              }}
            >
              <Row gutter={24}>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="courseId"
                    label="Course"
                    rules={[{ required: true, message: 'Please select a course' }]}
                  >
                    <Select
                      placeholder="Select course"
                      size="large"
                      showSearch
                      optionFilterProp="children"
                      allowClear
                    >
                      {courseOptions}
                    </Select>
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="sectionCode"
                    label="Section Code"
                    rules={[
                      { required: true, message: 'Please enter section code (e.g., A, B1)' },
                      {
                        pattern: /^[A-Za-z0-9-]+$/,
                        message: 'Only letters, numbers, and hyphen allowed',
                      },
                    ]}
                  >
                    <Input placeholder="A" size="large" />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={24}>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="semester"
                    label="Semester"
                    rules={[{ required: true, message: 'Please provide semester label' }]}
                  >
                    <Input placeholder="2024-Fall" size="large" prefix={<CalendarOutlined />} />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item name="facultyId" label="Instructor">
                    <Select
                      placeholder="Assign instructor"
                      size="large"
                      allowClear
                      showSearch
                      optionFilterProp="children"
                    >
                      {facultyOptions}
                    </Select>
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={24}>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="maxCapacity"
                    label="Maximum Capacity"
                    rules={[{ required: true, message: 'Please set section capacity' }]}
                  >
                    <InputNumber min={5} max={200} style={{ width: '100%' }} size="large" />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item name="roomId" label="Room ID">
                    <Input placeholder="Optional room reference" size="large" />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item name="scheduleId" label="Schedule Slot">
                <Input placeholder="Optional timetable slot reference" size="large" />
              </Form.Item>

              <Divider />

              <Space>
                <Button
                  type="primary"
                  htmlType="submit"
                  icon={<SaveOutlined />}
                  loading={loading}
                  size="large"
                >
                  {isEdit ? 'Update Section' : 'Create Section'}
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

export default SectionForm;
