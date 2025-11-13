import React, { useState, useEffect, useMemo } from 'react';
import { Form, Input, Button, Card, message, Space, Upload, Select } from 'antd';
import { SaveOutlined, ArrowLeftOutlined, UploadOutlined } from '@ant-design/icons';
import { admissionAPI, CreateApplicationDTO, AdmissionDocument } from '../../../../api/admission.api';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuthContext } from '../../../../contexts/AuthContext';
import { route } from '../../../routes/constant';
import { academicAPI, Program } from '../../../../api/academic.api';
import type { RcFile, UploadFile } from 'antd/es/upload/interface';

const { Option } = Select;

type DocumentType = 'matric' | 'intermediate' | 'cnic' | 'photo';

const REQUIRED_DOCUMENTS: Array<{
  type: DocumentType;
  label: string;
}> = [
  { type: 'matric', label: 'Matric Certificate' },
  { type: 'intermediate', label: 'Intermediate Certificate' },
  { type: 'cnic', label: 'CNIC Copy' },
  { type: 'photo', label: 'Photograph' },
];

interface ApplicationFormProps {
  isEdit?: boolean;
}

const ApplicationForm: React.FC<ApplicationFormProps> = ({ isEdit = false }) => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { user } = useAuthContext();
  const [loading, setLoading] = useState(false);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [programLoading, setProgramLoading] = useState(false);
  const [uploadMap, setUploadMap] = useState<Record<DocumentType, UploadFile[]>>({
    matric: [],
    intermediate: [],
    cnic: [],
    photo: [],
  });
  const [documentUrls, setDocumentUrls] = useState<Record<DocumentType, string>>({
    matric: '',
    intermediate: '',
    cnic: '',
    photo: '',
  });

  useEffect(() => {
    loadPrograms();
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

  const loadPrograms = async () => {
    try {
      setProgramLoading(true);
      const response = await academicAPI.getPrograms(1, 100, { isActive: true });
      setPrograms(response.programs);
    } catch (error: any) {
      message.error(error.message || 'Failed to load programs');
    } finally {
      setProgramLoading(false);
    }
  };

  const loadApplication = async (applicationId: string) => {
    try {
      setLoading(true);
      const [application, documents] = await Promise.all([
        admissionAPI.getApplication(applicationId),
        admissionAPI.getApplicationDocuments(applicationId),
      ]);
      form.setFieldsValue({
        userId: application.userId,
        programId: application.programId,
      });
      if (documents && documents.length > 0) {
        const updatedUploads: Record<DocumentType, UploadFile[]> = {
          matric: [],
          intermediate: [],
          cnic: [],
          photo: [],
        };
        const updatedUrls: Record<DocumentType, string> = {
          matric: '',
          intermediate: '',
          cnic: '',
          photo: '',
        };
        documents.forEach((doc: AdmissionDocument) => {
          if (doc.documentType in updatedUploads) {
            updatedUploads[doc.documentType as DocumentType] = [
              {
                uid: doc.id,
                name: doc.documentName,
                status: 'done',
                url: doc.documentUrl,
              },
            ];
            updatedUrls[doc.documentType as DocumentType] = doc.documentUrl;
          }
        });
        setUploadMap(updatedUploads);
        setDocumentUrls(updatedUrls);
      }
    } catch (error: any) {
      message.error(error.message || 'Failed to load application');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values: any) => {
    try {
      setLoading(true);
      
      const documentsPayload = REQUIRED_DOCUMENTS.reduce<
        NonNullable<CreateApplicationDTO['documents']>
      >((acc, doc) => {
        const url = documentUrls[doc.type];
        const file = uploadMap[doc.type]?.[0];
        if (url && file) {
          acc.push({
            documentType: doc.type,
            documentName: file.name,
            documentUrl: url,
          });
        }
        return acc;
      }, []);

      const applicationData: CreateApplicationDTO = {
        userId: values.userId,
        programId: values.programId,
        documents: documentsPayload,
      };

      if (isEdit && id) {
        message.warning('Application update is not available yet');
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

  const convertToBase64 = (file: RcFile): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
    });

  const uploadProps = useMemo(() => {
    const createUploadProps = (type: DocumentType) => ({
      fileList: uploadMap[type],
      maxCount: 1,
      customRequest: async (options: any) => {
        const { file, onSuccess, onError } = options;
        try {
          const base64 = await convertToBase64(file as RcFile);
          setDocumentUrls((prev) => ({
            ...prev,
            [type]: base64,
          }));
          setUploadMap((prev) => ({
            ...prev,
            [type]: [
              {
                uid: (file as RcFile).uid,
                name: (file as RcFile).name,
                status: 'done',
                url: base64,
              },
            ],
          }));
          onSuccess && onSuccess('ok');
        } catch (error) {
          onError && onError(error);
        }
      },
      onRemove: () => {
        setUploadMap((prev) => ({
          ...prev,
          [type]: [],
        }));
        setDocumentUrls((prev) => ({
          ...prev,
          [type]: '',
        }));
      },
      accept: '.pdf,.jpg,.jpeg,.png',
      listType: 'text' as const,
    });

    return REQUIRED_DOCUMENTS.reduce<Record<DocumentType, any>>((acc, doc) => {
      acc[doc.type] = createUploadProps(doc.type);
      return acc;
    }, {} as Record<DocumentType, any>);
  }, [uploadMap]);

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
          <Select
            placeholder="Select Program"
            loading={programLoading}
            showSearch
            optionFilterProp="children"
          >
            {programs.map((program) => (
              <Option key={program.id} value={program.id}>
                {program.name}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item label="Required Documents">
          <Space direction="vertical" style={{ width: '100%' }}>
            {REQUIRED_DOCUMENTS.map((doc) => (
              <div key={doc.type}>
                <strong>{doc.label}:</strong>
                <Upload {...uploadProps[doc.type]}>
                  <Button icon={<UploadOutlined />}>Upload {doc.label}</Button>
                </Upload>
              </div>
            ))}
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

