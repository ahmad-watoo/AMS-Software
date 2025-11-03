import React, { useState, useEffect } from 'react';
import { Table, Button, Input, Select, Space, Tag, Card, message, Modal, Form, InputNumber } from 'antd';
import { CheckOutlined, EditOutlined, FileTextOutlined } from '@ant-design/icons';
import examinationAPI, { ExamResult } from '@/api/examination.api';
import { useParams } from 'react-router-dom';
import PermissionGuard from '@/components/common/PermissionGuard';

const { Search } = Input;
const { Option } = Select;

const ResultEntry: React.FC = () => {
  const { examId } = useParams<{ examId: string }>();
  const [results, setResults] = useState<ExamResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedResult, setSelectedResult] = useState<ExamResult | null>(null);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 20,
    total: 0,
  });

  useEffect(() => {
    if (examId) {
      fetchResults();
    }
  }, [examId, pagination.current, pagination.pageSize]);

  const fetchResults = async () => {
    setLoading(true);
    try {
      const response = await examinationAPI.getAllResults({
        examId,
        page: pagination.current,
        limit: pagination.pageSize,
      });

      setResults(response.results || []);
      setPagination({
        ...pagination,
        total: response.pagination?.total || 0,
      });
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Failed to fetch results');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (result: ExamResult) => {
    setSelectedResult(result);
    form.setFieldsValue({
      obtainedMarks: result.obtainedMarks,
      remarks: result.remarks,
    });
    setEditModalVisible(true);
  };

  const handleUpdateResult = async (values: any) => {
    if (!selectedResult) return;

    try {
      await examinationAPI.updateResult(selectedResult.id, {
        obtainedMarks: values.obtainedMarks,
        remarks: values.remarks,
      });
      message.success('Result updated successfully');
      setEditModalVisible(false);
      form.resetFields();
      fetchResults();
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Failed to update result');
    }
  };

  const handleApprove = async (resultId: string) => {
    Modal.confirm({
      title: 'Approve Result',
      content: 'Are you sure you want to approve this result?',
      onOk: async () => {
        try {
          await examinationAPI.approveResult(resultId);
          message.success('Result approved successfully');
          fetchResults();
        } catch (error: any) {
          message.error(error.response?.data?.message || 'Failed to approve result');
        }
      },
    });
  };

  const getStatusTag = (status: string) => {
    const statusConfig: Record<string, { color: string; text: string }> = {
      pending: { color: 'orange', text: 'Pending' },
      graded: { color: 'blue', text: 'Graded' },
      approved: { color: 'green', text: 'Approved' },
      re_evaluation: { color: 'purple', text: 'Re-evaluation' },
    };

    const config = statusConfig[status] || { color: 'default', text: status };
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  const getGradeTag = (grade?: string) => {
    if (!grade) return <Tag>-</Tag>;

    const gradeColors: Record<string, string> = {
      'A+': 'green',
      A: 'green',
      'A-': 'cyan',
      'B+': 'blue',
      B: 'blue',
      'B-': 'blue',
      'C+': 'orange',
      C: 'orange',
      'C-': 'orange',
      D: 'red',
      F: 'red',
    };

    return <Tag color={gradeColors[grade] || 'default'}>{grade}</Tag>;
  };

  const columns = [
    {
      title: 'Student ID',
      dataIndex: 'studentId',
      key: 'studentId',
    },
    {
      title: 'Obtained Marks',
      dataIndex: 'obtainedMarks',
      key: 'obtainedMarks',
      render: (marks: number, record: ExamResult) => `${marks} / ${record.totalMarks}`,
    },
    {
      title: 'Percentage',
      dataIndex: 'percentage',
      key: 'percentage',
      render: (percentage: number) => `${percentage.toFixed(2)}%`,
    },
    {
      title: 'Grade',
      dataIndex: 'grade',
      key: 'grade',
      render: (grade: string) => getGradeTag(grade),
    },
    {
      title: 'GPA',
      dataIndex: 'gpa',
      key: 'gpa',
      render: (gpa?: number) => (gpa ? gpa.toFixed(2) : '-'),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => getStatusTag(status),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: ExamResult) => (
        <Space size="middle">
          <Button type="link" icon={<EditOutlined />} onClick={() => handleEdit(record)}>
            Edit
          </Button>
          <PermissionGuard permission="examination" action="approve">
            {record.status === 'graded' && (
              <Button
                type="link"
                icon={<CheckOutlined />}
                onClick={() => handleApprove(record.id)}
              >
                Approve
              </Button>
            )}
          </PermissionGuard>
        </Space>
      ),
    },
  ];

  return (
    <>
      <Card>
        <Space direction="vertical" style={{ width: '100%' }} size="large">
          <Table
            columns={columns}
            dataSource={results}
            rowKey="id"
            loading={loading}
            pagination={{
              current: pagination.current,
              pageSize: pagination.pageSize,
              total: pagination.total,
              showSizeChanger: true,
              showTotal: (total) => `Total ${total} results`,
              onChange: (page, pageSize) => {
                setPagination({ ...pagination, current: page, pageSize });
              },
            }}
          />
        </Space>
      </Card>

      <Modal
        title="Edit Result"
        open={editModalVisible}
        onCancel={() => {
          setEditModalVisible(false);
          form.resetFields();
        }}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={handleUpdateResult}>
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

          <Form.Item label="Remarks" name="remarks">
            <Input.TextArea rows={3} />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                Update
              </Button>
              <Button onClick={() => setEditModalVisible(false)}>Cancel</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default ResultEntry;

