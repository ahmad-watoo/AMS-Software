import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Card, message, Space, Select, InputNumber, DatePicker, TimePicker } from 'antd';
import { SaveOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import examinationAPI, { CreateExamDTO, Exam } from '@/api/examination.api';
import dayjs, { Dayjs } from 'dayjs';
import { academicAPI } from '@/api/academic.api';

const { Option } = Select;
const { TextArea } = Input;

interface ExamFormProps {
  isEdit?: boolean;
}

const ExamForm: React.FC<ExamFormProps> = ({ isEdit = false }) => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(false);
  const [courses, setCourses] = useState<any[]>([]);
  const [sections, setSections] = useState<any[]>([]);

  useEffect(() => {
    if (isEdit && id) {
      loadExam(id);
    }
    loadCourses();
  }, [id, isEdit]);

  const loadExam = async (examId: string) => {
    try {
      setLoading(true);
      const exam = await examinationAPI.getExamById(examId);
      form.setFieldsValue({
        title: exam.title,
        examType: exam.examType,
        courseId: exam.courseId,
        sectionId: exam.sectionId,
        examDate: dayjs(exam.examDate),
        startTime: dayjs(exam.startTime, 'HH:mm'),
        endTime: dayjs(exam.endTime, 'HH:mm'),
        totalMarks: exam.totalMarks,
        passingMarks: exam.passingMarks,
        location: exam.location,
        instructions: exam.instructions,
      });
      if (exam.courseId) {
        loadSections(exam.courseId);
      }
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Failed to load exam');
    } finally {
      setLoading(false);
    }
  };

  const loadCourses = async () => {
    try {
      const response = await academicAPI.getCourses(1, 1000);
      setCourses(response.courses);
    } catch (error) {
      console.error('Failed to load courses');
    }
  };

  const loadSections = async (courseId: string) => {
    try {
      const response = await academicAPI.getSections(1, 1000, { courseId });
      setSections(response.sections);
    } catch (error) {
      console.error('Failed to load sections');
    }
  };

  const handleCourseChange = (courseId: string) => {
    form.setFieldsValue({ sectionId: undefined });
    if (courseId) {
      loadSections(courseId);
    } else {
      setSections([]);
    }
  };

  const handleSubmit = async (values: any) => {
    try {
      setLoading(true);

      const examData: CreateExamDTO = {
        title: values.title,
        examType: values.examType,
        courseId: values.courseId,
        sectionId: values.sectionId,
        examDate: values.examDate.format('YYYY-MM-DD'),
        startTime: values.startTime.format('HH:mm'),
        endTime: values.endTime.format('HH:mm'),
        totalMarks: values.totalMarks,
        passingMarks: values.passingMarks,
        location: values.location,
        instructions: values.instructions,
      };

      if (isEdit && id) {
        await examinationAPI.updateExam(id, examData);
        message.success('Exam updated successfully');
      } else {
        await examinationAPI.createExam(examData);
        message.success('Exam created successfully');
      }

      navigate('/examination/exams');
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Failed to save exam');
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
          examType: 'midterm',
          totalMarks: 100,
          passingMarks: 50,
        }}
      >
        <Form.Item
          label="Title"
          name="title"
          rules={[{ required: true, message: 'Please enter exam title' }]}
        >
          <Input placeholder="Enter exam title" />
        </Form.Item>

        <Form.Item
          label="Exam Type"
          name="examType"
          rules={[{ required: true, message: 'Please select exam type' }]}
        >
          <Select placeholder="Select exam type">
            <Option value="midterm">Midterm</Option>
            <Option value="final">Final</Option>
            <Option value="quiz">Quiz</Option>
            <Option value="assignment">Assignment</Option>
            <Option value="practical">Practical</Option>
          </Select>
        </Form.Item>

        <Form.Item
          label="Course"
          name="courseId"
          rules={[{ required: true, message: 'Please select course' }]}
        >
          <Select
            placeholder="Select course"
            showSearch
            filterOption={(input, option) =>
              (option?.children as unknown as string)?.toLowerCase().includes(input.toLowerCase())
            }
            onChange={handleCourseChange}
          >
            {courses.map((course) => (
              <Option key={course.id} value={course.id}>
                {course.code} - {course.title}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          label="Section"
          name="sectionId"
          rules={[{ required: true, message: 'Please select section' }]}
        >
          <Select placeholder="Select section" disabled={sections.length === 0}>
            {sections.map((section) => (
              <Option key={section.id} value={section.id}>
                {section.sectionCode} - {section.semester}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          label="Exam Date"
          name="examDate"
          rules={[{ required: true, message: 'Please select exam date' }]}
        >
          <DatePicker style={{ width: '100%' }} format="YYYY-MM-DD" />
        </Form.Item>

        <Space style={{ width: '100%' }} size="middle">
          <Form.Item
            label="Start Time"
            name="startTime"
            rules={[{ required: true, message: 'Please select start time' }]}
            style={{ width: '48%' }}
          >
            <TimePicker style={{ width: '100%' }} format="HH:mm" />
          </Form.Item>

          <Form.Item
            label="End Time"
            name="endTime"
            rules={[{ required: true, message: 'Please select end time' }]}
            style={{ width: '48%' }}
          >
            <TimePicker style={{ width: '100%' }} format="HH:mm" />
          </Form.Item>
        </Space>

        <Space style={{ width: '100%' }} size="middle">
          <Form.Item
            label="Total Marks"
            name="totalMarks"
            rules={[
              { required: true, message: 'Please enter total marks' },
              { type: 'number', min: 1, message: 'Marks must be greater than 0' },
            ]}
            style={{ width: '48%' }}
          >
            <InputNumber style={{ width: '100%' }} min={1} />
          </Form.Item>

          <Form.Item
            label="Passing Marks"
            name="passingMarks"
            rules={[
              { required: true, message: 'Please enter passing marks' },
              { type: 'number', min: 0, message: 'Passing marks must be 0 or greater' },
            ]}
            style={{ width: '48%' }}
          >
            <InputNumber style={{ width: '100%' }} min={0} />
          </Form.Item>
        </Space>

        <Form.Item label="Location" name="location">
          <Input placeholder="Enter exam location (e.g., Room 101)" />
        </Form.Item>

        <Form.Item label="Instructions" name="instructions">
          <TextArea rows={4} placeholder="Enter exam instructions" />
        </Form.Item>

        <Form.Item>
          <Space>
            <Button type="primary" htmlType="submit" loading={loading} icon={<SaveOutlined />}>
              {isEdit ? 'Update Exam' : 'Create Exam'}
            </Button>
            <Button onClick={() => navigate('/examination/exams')} icon={<ArrowLeftOutlined />}>
              Cancel
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default ExamForm;

