import React, { useState, useEffect } from 'react';
import { Table, Button, Input, Select, Space, Tag, Modal, message, Card } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import examinationAPI, { Exam } from '@/api/examination.api';
import PermissionGuard from '@/components/common/PermissionGuard';

const { Search } = Input;
const { Option } = Select;

const ExamList: React.FC = () => {
  const navigate = useNavigate();
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 20,
    total: 0,
  });
  const [filters, setFilters] = useState({
    examType: undefined as string | undefined,
    status: undefined as string | undefined,
    courseId: undefined as string | undefined,
  });

  useEffect(() => {
    fetchExams();
  }, [pagination.current, pagination.pageSize, filters]);

  const fetchExams = async () => {
    setLoading(true);
    try {
      const response = await examinationAPI.getAllExams({
        examType: filters.examType,
        status: filters.status,
        courseId: filters.courseId,
        page: pagination.current,
        limit: pagination.pageSize,
      });

      setExams(response.exams || []);
      setPagination({
        ...pagination,
        total: response.pagination?.total || 0,
      });
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Failed to fetch exams');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (id: string) => {
    Modal.confirm({
      title: 'Are you sure you want to delete this exam?',
      content: 'This action cannot be undone.',
      okText: 'Yes, Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          await examinationAPI.deleteExam(id);
          message.success('Exam deleted successfully');
          fetchExams();
        } catch (error: any) {
          message.error(error.response?.data?.message || 'Failed to delete exam');
        }
      },
    });
  };

  const getStatusTag = (status: string) => {
    const statusConfig: Record<string, { color: string; text: string }> = {
      scheduled: { color: 'blue', text: 'Scheduled' },
      ongoing: { color: 'orange', text: 'Ongoing' },
      completed: { color: 'green', text: 'Completed' },
      cancelled: { color: 'red', text: 'Cancelled' },
    };

    const config = statusConfig[status] || { color: 'default', text: status };
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  const getExamTypeTag = (type: string) => {
    const typeConfig: Record<string, { color: string; text: string }> = {
      midterm: { color: 'purple', text: 'Midterm' },
      final: { color: 'red', text: 'Final' },
      quiz: { color: 'cyan', text: 'Quiz' },
      assignment: { color: 'blue', text: 'Assignment' },
      practical: { color: 'green', text: 'Practical' },
    };

    const config = typeConfig[type] || { color: 'default', text: type };
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  const columns = [
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
      sorter: true,
    },
    {
      title: 'Type',
      dataIndex: 'examType',
      key: 'examType',
      render: (type: string) => getExamTypeTag(type),
      filters: [
        { text: 'Midterm', value: 'midterm' },
        { text: 'Final', value: 'final' },
        { text: 'Quiz', value: 'quiz' },
        { text: 'Assignment', value: 'assignment' },
        { text: 'Practical', value: 'practical' },
      ],
    },
    {
      title: 'Date',
      dataIndex: 'examDate',
      key: 'examDate',
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
    {
      title: 'Time',
      key: 'time',
      render: (record: Exam) => `${record.startTime} - ${record.endTime}`,
    },
    {
      title: 'Marks',
      key: 'marks',
      render: (record: Exam) => `${record.totalMarks} (Pass: ${record.passingMarks})`,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => getStatusTag(status),
      filters: [
        { text: 'Scheduled', value: 'scheduled' },
        { text: 'Ongoing', value: 'ongoing' },
        { text: 'Completed', value: 'completed' },
        { text: 'Cancelled', value: 'cancelled' },
      ],
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: Exam) => (
        <Space size="middle">
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => navigate(`/examination/exams/${record.id}`)}
          >
            View
          </Button>
          <PermissionGuard permission="examination" action="update">
            <Button
              type="link"
              icon={<EditOutlined />}
              onClick={() => navigate(`/examination/exams/${record.id}/edit`)}
            >
              Edit
            </Button>
          </PermissionGuard>
          <PermissionGuard permission="examination" action="delete">
            <Button
              type="link"
              danger
              icon={<DeleteOutlined />}
              onClick={() => handleDelete(record.id)}
            >
              Delete
            </Button>
          </PermissionGuard>
        </Space>
      ),
    },
  ];

  return (
    <Card>
      <Space direction="vertical" style={{ width: '100%' }} size="large">
        <Space style={{ width: '100%', justifyContent: 'space-between' }}>
          <Space>
            <Select
              placeholder="Filter by Type"
              style={{ width: 150 }}
              allowClear
              value={filters.examType}
              onChange={(value) => setFilters({ ...filters, examType: value })}
            >
              <Option value="midterm">Midterm</Option>
              <Option value="final">Final</Option>
              <Option value="quiz">Quiz</Option>
              <Option value="assignment">Assignment</Option>
              <Option value="practical">Practical</Option>
            </Select>
            <Select
              placeholder="Filter by Status"
              style={{ width: 150 }}
              allowClear
              value={filters.status}
              onChange={(value) => setFilters({ ...filters, status: value })}
            >
              <Option value="scheduled">Scheduled</Option>
              <Option value="ongoing">Ongoing</Option>
              <Option value="completed">Completed</Option>
              <Option value="cancelled">Cancelled</Option>
            </Select>
          </Space>
          <PermissionGuard permission="examination" action="create">
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => navigate('/examination/exams/new')}
            >
              New Exam
            </Button>
          </PermissionGuard>
        </Space>

        <Table
          columns={columns}
          dataSource={exams}
          rowKey="id"
          loading={loading}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} exams`,
            onChange: (page, pageSize) => {
              setPagination({ ...pagination, current: page, pageSize });
            },
          }}
        />
      </Space>
    </Card>
  );
};

export default ExamList;

