import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Card, message, Space, Select, InputNumber, Switch } from 'antd';
import { SaveOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { academicAPI, CreateCourseDTO, Course } from '../../../../api/academic.api';
import { useNavigate, useParams } from 'react-router-dom';
import { route } from '../../../routes/constant';

const { Option } = Select;
const { TextArea } = Input;

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
    // Load all courses for prerequisites selection
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
      console.error('Failed to load courses for prerequisites');
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
    <Card
      title={isEdit ? 'Edit Course' : 'New Course'}
      style={{ margin: 20, boxShadow: 'rgba(0, 0, 0, 0.16) 0px 1px 4px' }}
      extra={
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)}>
          Back
        </Button>
      }
    >
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
        <Form.Item
          name="code"
          label="Course Code"
          rules={[
            { required: true, message: 'Please enter course code' },
            { pattern: /^[A-Z0-9-]+$/, message: 'Code should contain only uppercase letters, numbers, and hyphens' },
          ]}
        >
          <Input placeholder="e.g., CS101, IT201" disabled={isEdit} />
        </Form.Item>

        <Form.Item
          name="title"
          label="Course Title"
          rules={[{ required: true, message: 'Please enter course title' }]}
        >
          <Input placeholder="Introduction to Computer Science" />
        </Form.Item>

        <Form.Item
          name="departmentId"
          label="Department (Optional)"
        >
          <Select placeholder="Select Department" allowClear>
            <Option value="dept1">Computer Science</Option>
            <Option value="dept2">Information Technology</Option>
            <Option value="dept3">Software Engineering</Option>
          </Select>
        </Form.Item>

        <Space style={{ width: '100%' }} direction="horizontal">
          <Form.Item
            name="creditHours"
            label="Credit Hours"
            rules={[
              { required: true, message: 'Please enter credit hours' },
              { type: 'number', min: 1, max: 6, message: 'Credit hours must be between 1 and 6' },
            ]}
            style={{ flex: 1 }}
          >
            <InputNumber min={1} max={6} style={{ width: '100%' }} placeholder="3" />
          </Form.Item>

          <Form.Item
            name="theoryHours"
            label="Theory Hours"
            rules={[{ type: 'number', min: 0, message: 'Theory hours cannot be negative' }]}
            style={{ flex: 1 }}
          >
            <InputNumber min={0} style={{ width: '100%' }} placeholder="3" />
          </Form.Item>

          <Form.Item
            name="labHours"
            label="Lab Hours"
            rules={[{ type: 'number', min: 0, message: 'Lab hours cannot be negative' }]}
            style={{ flex: 1 }}
          >
            <InputNumber min={0} style={{ width: '100%' }} placeholder="0" />
          </Form.Item>
        </Space>

        <Form.Item
          name="prerequisiteCourseIds"
          label="Prerequisites (Optional)"
        >
          <Select
            mode="multiple"
            placeholder="Select prerequisite courses"
            allowClear
            showSearch
            optionFilterProp="children"
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

        <Form.Item
          name="isElective"
          label="Course Type"
          valuePropName="checked"
        >
          <Switch checkedChildren="Elective" unCheckedChildren="Core" />
        </Form.Item>

        <Form.Item
          name="description"
          label="Description (Optional)"
        >
          <TextArea rows={4} placeholder="Course description, learning objectives..." />
        </Form.Item>

        {isEdit && (
          <Form.Item
            name="isActive"
            label="Status"
            valuePropName="checked"
          >
            <Switch checkedChildren="Active" unCheckedChildren="Inactive" />
          </Form.Item>
        )}

        <Form.Item>
          <Space>
            <Button type="primary" htmlType="submit" loading={loading} icon={<SaveOutlined />}>
              {isEdit ? 'Update Course' : 'Create Course'}
            </Button>
            <Button onClick={() => navigate(-1)}>Cancel</Button>
          </Space>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default CourseForm;

