import React, { useState, useEffect } from 'react';
import { Table, Button, Select, Space, Tag, Card, message } from 'antd';
import { EyeOutlined, CheckOutlined } from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import learningAPI, { AssignmentSubmission } from '@/api/learning.api';
import PermissionGuard from '@/components/common/PermissionGuard';

const { Option } = Select;

const SubmissionList: React.FC = () => {
  const navigate = useNavigate();
  const { id: assignmentId } = useParams<{ id: string }>();
  const [submissions, setSubmissions] = useState<AssignmentSubmission[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 20,
    total: 0,
  });
  const [filters, setFilters] = useState({
    assignmentId: assignmentId || undefined as string | undefined,
    status: undefined as string | undefined,
  });

  useEffect(() => {
    if (assignmentId) {
      setFilters({ ...filters, assignmentId });
    }
  }, [assignmentId]);

  useEffect(() => {
    fetchSubmissions();
  }, [pagination.current, pagination.pageSize, filters]);

  const fetchSubmissions = async () => {
    setLoading(true);
    try {
      const response = await learningAPI.getAllSubmissions({
        assignmentId: filters.assignmentId,
        status: filters.status,
        page: pagination.current,
        limit: pagination.pageSize,
      });

      setSubmissions(response.submissions || []);
      setPagination({
        ...pagination,
        total: response.pagination?.total || 0,
      });
    } catch (error: any) {
      message.error(error.message || 'Failed to fetch submissions');
    } finally {
      setLoading(false);
    }
  };

  const getStatusTag = (status: string) => {
    const statusConfig: Record<string, { color: string; text: string }> = {
      submitted: { color: 'blue', text: 'Submitted' },
      late: { color: 'orange', text: 'Late' },
      graded: { color: 'green', text: 'Graded' },
      returned: { color: 'purple', text: 'Returned' },
    };

    const config = statusConfig[status] || { color: 'default', text: status };
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  const columns = [
    {
      title: 'Student ID',
      dataIndex: 'studentId',
      key: 'studentId',
    },
    {
      title: 'Submitted At',
      dataIndex: 'submittedAt',
      key: 'submittedAt',
      render: (date: string) => new Date(date).toLocaleString(),
      sorter: true,
    },
    {
      title: 'Files',
      key: 'files',
      render: (_: any, record: AssignmentSubmission) => {
        return record.submissionFiles?.length || 0;
      },
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => getStatusTag(status),
      filters: [
        { text: 'Submitted', value: 'submitted' },
        { text: 'Late', value: 'late' },
        { text: 'Graded', value: 'graded' },
        { text: 'Returned', value: 'returned' },
      ],
    },
    {
      title: 'Marks',
      key: 'marks',
      render: (_: any, record: AssignmentSubmission) => {
        if (record.obtainedMarks !== undefined) {
          return (
            <span>
              {record.obtainedMarks} / <span style={{ color: '#999' }}>?</span>
            </span>
          );
        }
        return '-';
      },
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: AssignmentSubmission) => (
        <Space size="middle">
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => navigate(`/learning/submissions/${record.id}`)}
          >
            View
          </Button>
          {record.status !== 'graded' && (
            <PermissionGuard permission="learning" action="update">
              <Button
                type="link"
                icon={<CheckOutlined />}
                onClick={() => navigate(`/learning/submissions/${record.id}/grade`)}
              >
                Grade
              </Button>
            </PermissionGuard>
          )}
        </Space>
      ),
    },
  ];

  return (
    <Card>
      <Space direction="vertical" style={{ width: '100%' }} size="large">
        <Space style={{ width: '100%', justifyContent: 'space-between', flexWrap: 'wrap' }}>
          <Select
            placeholder="Filter by Status"
            style={{ width: 150 }}
            allowClear
            value={filters.status}
            onChange={(value) => setFilters({ ...filters, status: value })}
          >
            <Option value="submitted">Submitted</Option>
            <Option value="late">Late</Option>
            <Option value="graded">Graded</Option>
            <Option value="returned">Returned</Option>
          </Select>
        </Space>

        <Table
          columns={columns}
          dataSource={submissions}
          rowKey="id"
          loading={loading}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} submissions`,
            onChange: (page, pageSize) => {
              setPagination({ ...pagination, current: page, pageSize });
            },
          }}
        />
      </Space>
    </Card>
  );
};

export default SubmissionList;

