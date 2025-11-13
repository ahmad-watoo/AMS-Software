import React, { useEffect, useState } from 'react';
import { Drawer, Form, Select, DatePicker, Input, InputNumber, Space, Button, message } from 'antd';
import dayjs from 'dayjs';
import {
  admissionAPI,
  AdmissionApplication,
  UpdateApplicationDTO,
} from '../../../../api/admission.api';

const { Option } = Select;
const { TextArea } = Input;

interface ApplicationReviewDrawerProps {
  open: boolean;
  application?: AdmissionApplication | null;
  onClose: () => void;
  onUpdated?: (application: AdmissionApplication) => void;
}

const ApplicationReviewDrawer: React.FC<ApplicationReviewDrawerProps> = ({
  open,
  application,
  onClose,
  onUpdated,
}) => {
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open && application) {
      form.setFieldsValue({
        status: application.status,
        eligibilityStatus: application.eligibilityStatus ?? 'pending',
        eligibilityScore: application.eligibilityScore,
        meritRank: application.meritRank,
        interviewDate: application.interviewDate ? dayjs(application.interviewDate) : null,
        interviewTime: application.interviewTime,
        interviewLocation: application.interviewLocation,
        remarks: application.remarks,
      });
    } else {
      form.resetFields();
    }
  }, [open, application, form]);

  const handleSubmit = async (values: any) => {
    if (!application) return;
    try {
      setSubmitting(true);
      const payload: UpdateApplicationDTO = {
        status: values.status,
        eligibilityStatus: values.eligibilityStatus,
        eligibilityScore:
          values.eligibilityScore !== undefined ? Number(values.eligibilityScore) : undefined,
        meritRank: values.meritRank !== undefined ? Number(values.meritRank) : undefined,
        interviewDate: values.interviewDate ? values.interviewDate.toISOString() : undefined,
        interviewTime: values.interviewTime,
        interviewLocation: values.interviewLocation,
        remarks: values.remarks,
      };
      const updated = await admissionAPI.updateApplication(application.id, payload);
      message.success('Application updated successfully');
      onUpdated?.(updated);
      onClose();
    } catch (error: any) {
      message.error(error.message || 'Failed to update application');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Drawer
      title={`Review Application ${application?.applicationNumber ?? ''}`}
      width={480}
      open={open}
      onClose={onClose}
      destroyOnClose
      footer={
        <Space>
          <Button onClick={onClose}>Cancel</Button>
          <Button
            type="primary"
            onClick={() => form.submit()}
            loading={submitting}
            disabled={!application}
          >
            Save Changes
          </Button>
        </Space>
      }
    >
      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        <Form.Item name="status" label="Application Status" rules={[{ required: true }]}>
          <Select placeholder="Select status">
            <Option value="submitted">Submitted</Option>
            <Option value="under_review">Under Review</Option>
            <Option value="eligible">Eligible</Option>
            <Option value="interview_scheduled">Interview Scheduled</Option>
            <Option value="selected">Selected</Option>
            <Option value="waitlisted">Waitlisted</Option>
            <Option value="rejected">Rejected</Option>
            <Option value="fee_submitted">Fee Submitted</Option>
            <Option value="enrolled">Enrolled</Option>
          </Select>
        </Form.Item>

        <Form.Item name="eligibilityStatus" label="Eligibility Status">
          <Select placeholder="Eligibility status">
            <Option value="pending">Pending</Option>
            <Option value="eligible">Eligible</Option>
            <Option value="not_eligible">Not Eligible</Option>
          </Select>
        </Form.Item>

        <Form.Item name="eligibilityScore" label="Eligibility Score">
          <InputNumber style={{ width: '100%' }} min={0} max={100} />
        </Form.Item>

        <Form.Item name="meritRank" label="Merit Rank">
          <InputNumber style={{ width: '100%' }} min={1} />
        </Form.Item>

        <Form.Item name="interviewDate" label="Interview Date">
          <DatePicker style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item name="interviewTime" label="Interview Time">
          <Input placeholder="e.g., 10:00 AM" />
        </Form.Item>

        <Form.Item name="interviewLocation" label="Interview Location">
          <Input placeholder="Interview venue" />
        </Form.Item>

        <Form.Item name="remarks" label="Reviewer Remarks">
          <TextArea rows={4} placeholder="Add remarks or evaluation notes" />
        </Form.Item>
      </Form>
    </Drawer>
  );
};

export default ApplicationReviewDrawer;

