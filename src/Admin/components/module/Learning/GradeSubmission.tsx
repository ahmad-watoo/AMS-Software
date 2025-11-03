import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Card, message, Space, InputNumber } from 'antd';
import { SaveOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import learningAPI, { AssignmentSubmission, GradeSubmissionDTO } from '@/api/learning.api';

const { TextArea } = Input;

const GradeSubmission: React.FC = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(false);
  const [submission, setSubmission] = useState<AssignmentSubmission | null>(null);

  useEffect(() => {
    if (id) {
      loadSubmission(id);
    }
  }, [id]);

  const loadSubmission = async (submissionId: string) => {
    try {
      setLoading(true);
      const sub = await learningAPI.getSubmissionById(submissionId);
      setSubmission(sub);
      form.setFieldsValue({
        obtainedMarks: sub.obtainedMarks,
        feedback: sub.feedback,
      });
    } catch (error: any) {
      message.error(error.message || 'Failed to load submission');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values: any) => {
    if (!submission) return;

    try {
      setLoading(true);

      const gradeData: GradeSubmissionDTO = {
        submissionId: submission.id,
        obtainedMarks: values.obtainedMarks,
        feedback: values.feedback,
      };

      await learningAPI.gradeSubmission(submission.id, gradeData);
      message.success('Submission graded successfully');
      navigate(`/learning/submissions/${submission.id}`);
    } catch (error: any) {
      message.error(error.message || 'Failed to grade submission');
    } finally {
      setLoading(false);
    }
  };

  if (!submission) {
    return <Card>Loading...</Card>;
  }

  return (
    <Card>
      <Space direction="vertical" style={{ width: '100%' }} size="large">
        <Card size="small" style={{ background: '#f0f0f0' }}>
          <Space direction="vertical" style={{ width: '100%' }}>
            <div>
              <strong>Student ID:</strong> {submission.studentId}
            </div>
            <div>
              <strong>Submitted At:</strong> {new Date(submission.submittedAt).toLocaleString()}
            </div>
            <div>
              <strong>Status:</strong> {submission.status}
            </div>
            {submission.submissionFiles && submission.submissionFiles.length > 0 && (
              <div>
                <strong>Files:</strong>
                <ul style={{ marginTop: 8, marginBottom: 0 }}>
                  {submission.submissionFiles.map((file: { fileName: string; fileUrl: string; fileSize: number }, index: number) => (
                    <li key={index}>
                      <a href={file.fileUrl} target="_blank" rel="noopener noreferrer">
                        {file.fileName} ({(file.fileSize / 1024).toFixed(2)} KB)
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {submission.submittedText && (
              <div>
                <strong>Submitted Text:</strong>
                <p style={{ marginTop: 8, marginBottom: 0, whiteSpace: 'pre-wrap' }}>
                  {submission.submittedText}
                </p>
              </div>
            )}
          </Space>
        </Card>

        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            label="Obtained Marks"
            name="obtainedMarks"
            rules={[
              { required: true, message: 'Please enter obtained marks' },
              { type: 'number', min: 0, message: 'Marks cannot be negative' },
            ]}
          >
            <InputNumber style={{ width: '100%' }} min={0} />
          </Form.Item>

          <Form.Item label="Feedback" name="feedback">
            <TextArea rows={6} placeholder="Enter feedback for the student (optional)" />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={loading} icon={<SaveOutlined />}>
                Submit Grade
              </Button>
              <Button onClick={() => navigate(`/learning/submissions/${id}`)} icon={<ArrowLeftOutlined />}>
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Space>
    </Card>
  );
};

export default GradeSubmission;

