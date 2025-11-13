import React, { useState, useEffect } from 'react';
import { Card, Descriptions, Tag, Button, Space, message, Timeline } from 'antd';
import { ArrowLeftOutlined, CheckCircleOutlined, CloseCircleOutlined, EditOutlined } from '@ant-design/icons';
import { admissionAPI, AdmissionApplication, AdmissionDocument } from '../../../../api/admission.api';
import { useNavigate, useParams } from 'react-router-dom';
import { PermissionGuard } from '../../../common/PermissionGuard';
import ApplicationReviewDrawer from './ApplicationReviewDrawer';

const ApplicationDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [application, setApplication] = useState<AdmissionApplication | null>(null);
  const [documents, setDocuments] = useState<AdmissionDocument[]>([]);
  const [reviewOpen, setReviewOpen] = useState(false);

  useEffect(() => {
    if (id) {
      loadApplication();
    }
  }, [id]);

  const loadApplication = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const [appData, docsData] = await Promise.all([
        admissionAPI.getApplication(id),
        admissionAPI.getApplicationDocuments(id),
      ]);
      setApplication(appData);
      setDocuments(docsData);
    } catch (error: any) {
      message.error(error.message || 'Failed to load application');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      submitted: 'default',
      under_review: 'processing',
      eligible: 'success',
      interview_scheduled: 'warning',
      selected: 'success',
      waitlisted: 'warning',
      rejected: 'error',
      fee_submitted: 'processing',
      enrolled: 'success',
    };
    return colors[status] || 'default';
  };

  const formatStatus = (status: string) => {
    return status.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  const statusSteps = [
    { status: 'submitted', title: 'Application Submitted' },
    { status: 'under_review', title: 'Under Review' },
    { status: 'eligible', title: 'Eligibility Checked' },
    { status: 'interview_scheduled', title: 'Interview Scheduled' },
    { status: 'selected', title: 'Selected' },
    { status: 'fee_submitted', title: 'Fee Submitted' },
    { status: 'enrolled', title: 'Enrolled' },
  ];

  const getCurrentStep = () => {
    if (!application) return -1;
    return statusSteps.findIndex((step) => step.status === application.status);
  };

  if (!application) {
    return (
      <Card loading={loading} style={{ margin: 20 }}>
        Loading application details...
      </Card>
    );
  }

  return (
    <div style={{ margin: 20 }}>
      <Card
        title="Application Details"
        extra={
          <Space>
            <PermissionGuard permission="admission" action="approve">
              <Button
                icon={<EditOutlined />}
                onClick={() => setReviewOpen(true)}
              >
                Review
              </Button>
            </PermissionGuard>
            <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)}>
              Back
            </Button>
          </Space>
        }
        style={{ marginBottom: 20, boxShadow: 'rgba(0, 0, 0, 0.16) 0px 1px 4px' }}
      >
        <Descriptions bordered column={2}>
          <Descriptions.Item label="Application Number" span={2}>
            <strong>{application.applicationNumber}</strong>
          </Descriptions.Item>
          <Descriptions.Item label="Applicant Name">
            {application.user
              ? `${application.user.firstName} ${application.user.lastName}`
              : 'N/A'}
          </Descriptions.Item>
          <Descriptions.Item label="Email">
            {application.user?.email || 'N/A'}
          </Descriptions.Item>
          <Descriptions.Item label="Program">
            {application.program?.name || 'N/A'}
          </Descriptions.Item>
          <Descriptions.Item label="Application Date">
            {new Date(application.applicationDate).toLocaleDateString()}
          </Descriptions.Item>
          <Descriptions.Item label="Status" span={2}>
            <Tag color={getStatusColor(application.status)}>{formatStatus(application.status)}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Eligibility Status">
            {application.eligibilityStatus ? (
              <Tag color={application.eligibilityStatus === 'eligible' ? 'success' : 'error'}>
                {application.eligibilityStatus.toUpperCase()}
              </Tag>
            ) : (
              'Pending'
            )}
          </Descriptions.Item>
          <Descriptions.Item label="Eligibility Score">
            {application.eligibilityScore ? `${application.eligibilityScore}%` : 'N/A'}
          </Descriptions.Item>
          <Descriptions.Item label="Merit Rank">
            {application.meritRank ? `#${application.meritRank}` : 'N/A'}
          </Descriptions.Item>
          {application.interviewDate && (
            <>
              <Descriptions.Item label="Interview Date">
                {new Date(application.interviewDate).toLocaleDateString()}
              </Descriptions.Item>
              <Descriptions.Item label="Interview Time">
                {application.interviewTime}
              </Descriptions.Item>
              <Descriptions.Item label="Interview Location" span={2}>
                {application.interviewLocation}
              </Descriptions.Item>
            </>
          )}
          {application.remarks && (
            <Descriptions.Item label="Remarks" span={2}>
              {application.remarks}
            </Descriptions.Item>
          )}
        </Descriptions>
      </Card>

      <Card
        title="Application Status Timeline"
        style={{ marginBottom: 20, boxShadow: 'rgba(0, 0, 0, 0.16) 0px 1px 4px' }}
      >
        <Timeline>
          {statusSteps.map((step, index) => {
            const currentStep = getCurrentStep();
            const isCompleted = index <= currentStep;
            const isCurrent = index === currentStep;

            return (
              <Timeline.Item
                key={step.status}
                color={isCompleted ? 'green' : isCurrent ? 'blue' : 'gray'}
                dot={isCompleted ? <CheckCircleOutlined /> : <CloseCircleOutlined />}
              >
                <strong>{step.title}</strong>
                {isCurrent && <Tag color="blue" style={{ marginLeft: 10 }}>Current</Tag>}
              </Timeline.Item>
            );
          })}
        </Timeline>
      </Card>

      <Card
        title="Uploaded Documents"
        style={{ boxShadow: 'rgba(0, 0, 0, 0.16) 0px 1px 4px' }}
      >
        {documents.length === 0 ? (
          <p>No documents uploaded</p>
        ) : (
          <Descriptions bordered column={2}>
            {documents.map((doc) => (
              <React.Fragment key={doc.id}>
                <Descriptions.Item label="Document Type">
                  {doc.documentType.toUpperCase()}
                </Descriptions.Item>
                <Descriptions.Item label="Status">
                  <Tag color={doc.verified ? 'success' : 'warning'}>
                    {doc.verified ? 'Verified' : 'Pending Verification'}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Document Name" span={2}>
                  <a href={doc.documentUrl} target="_blank" rel="noopener noreferrer">
                    {doc.documentName}
                  </a>
                </Descriptions.Item>
              </React.Fragment>
            ))}
          </Descriptions>
        )}
      </Card>
      <ApplicationReviewDrawer
        open={reviewOpen}
        application={application}
        onClose={() => setReviewOpen(false)}
        onUpdated={(updated) => {
          setApplication(updated);
          setReviewOpen(false);
        }}
      />
    </div>
  );
};

export default ApplicationDetail;

