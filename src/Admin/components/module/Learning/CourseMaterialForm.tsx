import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Card, message, Space, Select, InputNumber, Switch, Upload } from 'antd';
import { SaveOutlined, ArrowLeftOutlined, UploadOutlined } from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import learningAPI, { CreateCourseMaterialDTO, CourseMaterial } from '@/api/learning.api';
import { academicAPI } from '@/api/academic.api';

const { Option } = Select;
const { TextArea } = Input;

interface CourseMaterialFormProps {
  isEdit?: boolean;
}

const CourseMaterialForm: React.FC<CourseMaterialFormProps> = ({ isEdit = false }) => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(false);
  const [courses, setCourses] = useState<any[]>([]);
  const [sections, setSections] = useState<any[]>([]);

  useEffect(() => {
    if (isEdit && id) {
      loadMaterial(id);
    }
    loadCourses();
  }, [id, isEdit]);

  useEffect(() => {
    const courseId = form.getFieldValue('courseId');
    if (courseId) {
      loadSectionsForCourse(courseId);
    }
  }, [form.getFieldValue('courseId')]);

  const loadMaterial = async (materialId: string) => {
    try {
      setLoading(true);
      const material = await learningAPI.getCourseMaterialById(materialId);
      form.setFieldsValue({
        sectionId: material.sectionId,
        courseId: material.courseId,
        title: material.title,
        description: material.description,
        materialType: material.materialType,
        externalUrl: material.externalUrl,
        isVisible: material.isVisible,
        displayOrder: material.displayOrder,
      });
      loadSectionsForCourse(material.courseId);
    } catch (error: any) {
      message.error(error.message || 'Failed to load course material');
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

      const materialData: CreateCourseMaterialDTO = {
        sectionId: values.sectionId,
        courseId: values.courseId,
        title: values.title,
        description: values.description,
        materialType: values.materialType,
        externalUrl: values.externalUrl,
        isVisible: values.isVisible,
        displayOrder: values.displayOrder,
      };

      if (isEdit && id) {
        await learningAPI.updateCourseMaterial(id, materialData);
        message.success('Course material updated successfully');
      } else {
        await learningAPI.createCourseMaterial(materialData);
        message.success('Course material created successfully');
      }

      navigate('/learning/materials');
    } catch (error: any) {
      message.error(error.message || 'Failed to save course material');
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
          materialType: 'document',
          isVisible: true,
          displayOrder: 1,
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
          label="Material Title"
          name="title"
          rules={[{ required: true, message: 'Please enter material title' }]}
        >
          <Input placeholder="Enter material title" />
        </Form.Item>

        <Form.Item
          label="Material Type"
          name="materialType"
          rules={[{ required: true, message: 'Please select material type' }]}
        >
          <Select placeholder="Select Material Type">
            <Option value="document">Document</Option>
            <Option value="video">Video</Option>
            <Option value="link">Link</Option>
            <Option value="presentation">Presentation</Option>
            <Option value="other">Other</Option>
          </Select>
        </Form.Item>

        <Form.Item label="Description" name="description">
          <TextArea rows={4} placeholder="Enter material description (optional)" />
        </Form.Item>

        <Form.Item
          label="External URL"
          name="externalUrl"
          rules={[
            {
              validator: (_, value) => {
                const materialType = form.getFieldValue('materialType');
                if (materialType === 'link' && !value) {
                  return Promise.reject('External URL is required for link type materials');
                }
                if (value && !/^https?:\/\//.test(value)) {
                  return Promise.reject('Please enter a valid URL starting with http:// or https://');
                }
                return Promise.resolve();
              },
            },
          ]}
        >
          <Input placeholder="Enter external URL (required for link type)" />
        </Form.Item>

        <Space style={{ width: '100%' }} size="middle">
          <Form.Item
            label="Display Order"
            name="displayOrder"
            style={{ width: '48%' }}
          >
            <InputNumber style={{ width: '100%' }} min={1} />
          </Form.Item>

          <Form.Item label="Visible to Students" name="isVisible" valuePropName="checked" style={{ width: '48%' }}>
            <Switch />
          </Form.Item>
        </Space>

        <Form.Item
          label="Upload File"
          name="file"
          extra="File upload will be handled through file upload service"
        >
          <Upload>
            <Button icon={<UploadOutlined />}>Upload File</Button>
          </Upload>
        </Form.Item>

        <Form.Item>
          <Space>
            <Button type="primary" htmlType="submit" loading={loading} icon={<SaveOutlined />}>
              {isEdit ? 'Update Material' : 'Create Material'}
            </Button>
            <Button onClick={() => navigate('/learning/materials')} icon={<ArrowLeftOutlined />}>
              Cancel
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default CourseMaterialForm;

