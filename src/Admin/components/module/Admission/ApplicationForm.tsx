import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Card, message, Space, Upload, Select } from 'antd';
import { SaveOutlined, ArrowLeftOutlined, UploadOutlined } from '@ant-design/icons';
import { admissionAPI, CreateApplicationDTO } from '../../../../api/admission.api';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuthContext } from '../../../../contexts/AuthContext';
import { route } from '../../../routes/constant';

const { Option } = Select;
const { TextArea } = Input;

interface ApplicationFormProps {
  isEdit?: boolean;
}

const ApplicationForm: React.FC<ApplicationFormProps> = ({ isEdit = false }) => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { user } = useAuthContext();
  const [loading, setLoading] = useState(false);
  const [fileList, setFileList] = useState<any[]>([]);

  useEffect(() => {
    if (isEdit && id) {
      // Load application data if editing
      loadApplication(id);
    } else {
      // Set default user ID if creating new
      if (user?.id) {
        form.setFieldsValue({ userId: user.id });
      }
    }
  }, [id, isEdit, user]);

  const loadApplication = async (applicationId: string) => {
    try {
      setLoading(true);
      const application = await admissionAPI.getApplication(applicationId);
      form.setFieldsValue({
        userId: application.userId,
        programId: application.programId,
      });
    } catch (error: any) {
      message.error(error.message || 'Failed to load application');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values: any) => {
    try {
      setLoading(true);
      
      const applicationData: CreateApplicationDTO = {
        userId: values.userId,
        programId: values.programId,
        documents: fileList.map((file) => ({
          documentType: file.documentType || 'other',
          documentName: file.name,
          documentUrl: file.url || file.response?.url || '',
        })),
      };

      if (isEdit && id) {
        // Update logic would go here if needed
        message.warning('Update functionality not yet implemented');
      } else {
        await admissionAPI.createApplication(applicationData);
        message.success('Application submitted successfully');
        navigate(route.ADMISSION_APPLICATION_LIST);
      }
    } catch (error: any) {
      message.error(error.message || 'Failed to submit application');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (info: any, documentType: string) => {
    const newFileList = [...fileList];
    const fileIndex = newFileList.findIndex((f) => f.uid === info.file.uid);
    
    if (fileIndex >= 0) {
      newFileList[fileIndex] = {
        ...info.file,
        documentType,
      };
    } else {
      newFileList.push({
        ...info.file,
        documentType,
      });
    }
    
    setFileList(newFileList);
  };

  return (
    <Card
      title={isEdit ? 'Edit Application' : 'New Admission Application'}
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
        initialValues={{}}
      >
        <Form.Item
          name="userId"
          label="User"
          rules={[{ required: true, message: 'Please select a user' }]}
        >
          <Input disabled={!!user?.id} placeholder="User ID" />
        </Form.Item>

        <Form.Item
          name="programId"
          label="Program"
          rules={[{ required: true, message: 'Please select a program' }]}
        >
          <Select placeholder="Select Program">
            <Option value="prog1">BS Computer Science</Option>
            <Option value="prog2">BS Software Engineering</Option>
            <Option value="prog3">BS Information Technology</Option>
            {/* Programs would come from API */}
          </Select>
        </Form.Item>

        <Form.Item label="Required Documents">
          <Space direction="vertical" style={{ width: '100%' }}>
            <div>
              <strong>Matric Certificate:</strong>
              <Upload
                beforeUpload={() => false}
                onChange={(info) => handleFileChange(info, 'matric')}
                maxCount={1}
              >
                <Button icon={<UploadOutlined />}>Upload Matric Certificate</Button>
              </Upload>
            </div>
            <div>
              <strong>Intermediate Certificate:</strong>
              <Upload
                beforeUpload={() => false}
                onChange={(info) => handleFileChange(info, 'intermediate')}
                maxCount={1}
              >
                <Button icon={<UploadOutlined />}>Upload Intermediate Certificate</Button>
              </Upload>
            </div>
            <div>
              <strong>CNIC Copy:</strong>
              <Upload
                beforeUpload={() => false}
                onChange={(info) => handleFileChange(info, 'cnic')}
                maxCount={1}
              >
                <Button icon={<UploadOutlined />}>Upload CNIC</Button>
              </Upload>
            </div>
            <div>
              <strong>Photograph:</strong>
              <Upload
                beforeUpload={() => false}
                onChange={(info) => handleFileChange(info, 'photo')}
                maxCount={1}
              >
                <Button icon={<UploadOutlined />}>Upload Photo</Button>
              </Upload>
            </div>
          </Space>
        </Form.Item>

        <Form.Item>
          <Space>
            <Button type="primary" htmlType="submit" loading={loading} icon={<SaveOutlined />}>
              {isEdit ? 'Update' : 'Submit Application'}
            </Button>
            <Button onClick={() => navigate(-1)}>Cancel</Button>
          </Space>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default ApplicationForm;

