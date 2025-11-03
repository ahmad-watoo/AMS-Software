import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Card, message, Space, Select, InputNumber, DatePicker, Switch } from 'antd';
import { SaveOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import learningAPI, { CreateAssignmentDTO, Assignment } from '@/api/learning.api';
import { academicAPI } from '@/api/academic.api';
import dayjs from 'dayjs';

const { Option } = Select;
const { TextArea } = Input;

interface AssignmentFormProps {
  isEdit?: boolean;
}

const AssignmentForm: React.FC<AssignmentFormProps> = ({ isEdit = false }) => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(false);
  const [courses, setCourses] = useState<any[]>([]);
  const [sections, setSections] = useState<any[]>([]);

  useEffect(() => {
    if (isEdit && id) {
      loadAssignment(id);
    }
    loadCourses();
  }, [id, isEdit]);

  useEffect(() => {
    const courseId = form.getFieldValue('courseId');
    if (courseId) {
      loadSectionsForCourse(courseId);
    }
  }, [form.getFieldValue('courseId')]);

  const loadAssignment = async (assignmentId: string) => {
    try {
      setLoading(true);
      const assignment = await learningAPI.getAssignmentById(assignmentId);
      form.setFieldsValue({
        sectionId: assignment.sectionId,
        courseId: assignment.courseId,
        title: assignment.title,
        description: assignment.description,
        instructions: assignment.instructions,
        dueDate: dayjs(assignment.dueDate),
        maxMarks: assignment.maxMarks,
        assignmentType: assignment.assignmentType,
        allowedFileTypes: assignment.allowedFileTypes,
        maxFileSize: assignment.maxFileSize,
        isPublished: assignment.isPublished,
      });
      loadSectionsForCourse(assignment.courseId);
    } catch (error: any) {
      message.error(error.message || 'Failed to load assignment');
    } finally {
      setLoading(false);
    }
  };

  const loadCourses = async () => {
    try {
      const response = await academicAPI.getCourses(1, 1000);
      setCourses(response.courses || []);
    } catch (error) {
      console.error('Failed to load courses');
    }
  };

  const loadSectionsForCourse = async (courseId: string) => {
    try {
      const response = await academicAPI.getSections(1, 1000);
      const courseSections = response.sections?.filter((s: any) => s.courseId === courseId) || [];
      setSections(courseSections);
    } catch (error) {
      console.error('Failed to load sections');
    }
  };

  const handleSubmit = async (values: any) => {
    try {
      setLoading(true);

      const assignmentData: CreateAssignmentDTO = {
        sectionId: values.sectionId,
        courseId: values.courseId,
        title: values.title,
        description: values.description,
        instructions: values.instructions,
        dueDate: values.dueDate.format('YYYY-MM-DD'),
        maxMarks: values.maxMarks,
        assignmentType: values.assignmentType,
        allowedFileTypes: values.allowedFileTypes,
        maxFileSize: values.maxFileSize,
        isPublished: values.isPublished,
      };

      if (isEdit && id) {
        await learningAPI.updateAssignment(id, assignmentData);
        message.success('Assignment updated successfully');
      } else {
        await learningAPI.createAssignment(assignmentData);
        message.success('Assignment created successfully');
      }

      navigate('/learning/assignments');
    } catch (error: any) {
      message.error(error.message || 'Failed to save assignment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          assignmentType: 'individual',
          isPublished: false,
          maxFileSize: 10,
        }}
      >
        <Form.Item
          label="Course"
          name="courseId"
          rules={[{ required: true, message: 'Please select a course' }]}
        >
          <Select
            placeholder="Select Course"
            showSearch
            filterOption={(input, option) =>
              (option?.children as unknown as string)?.toLowerCase().includes(input.toLowerCase())
            }
            onChange={(value) => {
              form.setFieldsValue({ sectionId: undefined });
              loadSectionsForCourse(value);
            }}
          >
            {courses.map((course) => (
              <Option key={course.id} value={course.id}>
                {course.code} - {course.name}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          label="Section"
          name="sectionId"
          rules={[{ required: true, message: 'Please select a section' }]}
        >
          <Select
            placeholder="Select Section"
            disabled={!form.getFieldValue('courseId')}
            showSearch
            filterOption={(input, option) =>
              (option?.children as unknown as string)?.toLowerCase().includes(input.toLowerCase())
            }
          >
            {sections.map((section) => (
              <Option key={section.id} value={section.id}>
                {section.name}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          label="Assignment Title"
          name="title"
          rules={[{ required: true, message: 'Please enter assignment title' }]}
        >
          <Input placeholder="Enter assignment title" />
        </Form.Item>

        <Form.Item label="Description" name="description">
          <TextArea rows={3} placeholder="Enter assignment description (optional)" />
        </Form.Item>

        <Form.Item label="Instructions" name="instructions">
          <TextArea rows={4} placeholder="Enter assignment instructions (optional)" />
        </Form.Item>

        <Space style={{ width: '100%' }} size="middle">
          <Form.Item
            label="Due Date"
            name="dueDate"
            rules={[{ required: true, message: 'Please select due date' }]}
            style={{ width: '48%' }}
          >
            <DatePicker style={{ width: '100%' }} format="YYYY-MM-DD" showTime />
          </Form.Item>

          <Form.Item
            label="Max Marks"
            name="maxMarks"
            rules={[
              { required: true, message: 'Please enter max marks' },
              { type: 'number', min: 1, message: 'Marks must be greater than 0' },
            ]}
            style={{ width: '48%' }}
          >
            <InputNumber style={{ width: '100%' }} min={1} />
          </Form.Item>
        </Space>

        <Space style={{ width: '100%' }} size="middle">
          <Form.Item
            label="Assignment Type"
            name="assignmentType"
            rules={[{ required: true, message: 'Please select assignment type' }]}
            style={{ width: '48%' }}
          >
            <Select placeholder="Select Assignment Type">
              <Option value="individual">Individual</Option>
              <Option value="group">Group</Option>
              <Option value="project">Project</Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="Max File Size (MB)"
            name="maxFileSize"
            style={{ width: '48%' }}
          >
            <InputNumber style={{ width: '100%' }} min={1} max={100} />
          </Form.Item>
        </Space>

        <Form.Item label="Publish Assignment" name="isPublished" valuePropName="checked">
          <Switch />
        </Form.Item>

        <Form.Item>
          <Space>
            <Button type="primary" htmlType="submit" loading={loading} icon={<SaveOutlined />}>
              {isEdit ? 'Update Assignment' : 'Create Assignment'}
            </Button>
            <Button onClick={() => navigate('/learning/assignments')} icon={<ArrowLeftOutlined />}>
              Cancel
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default AssignmentForm;

