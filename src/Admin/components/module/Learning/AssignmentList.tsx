import React, { useState, useEffect } from 'react';
import { Table, Button, Select, Space, Tag, Card, message, Modal } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined, FileTextOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import learningAPI, { Assignment } from '@/api/learning.api';
import { academicAPI } from '@/api/academic.api';
import PermissionGuard from '@/components/common/PermissionGuard';

const { Option } = Select;

const AssignmentList: React.FC = () => {
  const navigate = useNavigate();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(false);
  const [courses, setCourses] = useState<any[]>([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 20,
    total: 0,
  });
  const [filters, setFilters] = useState({
    courseId: undefined as string | undefined,
    assignmentType: undefined as string | undefined,
    isPublished: undefined as boolean | undefined,
  });

  useEffect(() => {
    fetchAssignments();
    loadCourses();
  }, [pagination.current, pagination.pageSize, filters]);

  const fetchAssignments = async () => {
    setLoading(true);
    try {
      const response = await learningAPI.getAllAssignments({
        courseId: filters.courseId,
        assignmentType: filters.assignmentType,
        isPublished: filters.isPublished,
        page: pagination.current,
        limit: pagination.pageSize,
      });

      setAssignments(response.assignments || []);
      setPagination({
        ...pagination,
        total: response.pagination?.total || 0,
      });
    } catch (error: any) {
      message.error(error.message || 'Failed to fetch assignments');
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

  const handleDelete = (id: string) => {
    Modal.confirm({
      title: 'Are you sure you want to delete this assignment?',
      content: 'This action cannot be undone.',
      okText: 'Yes, Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          // Delete API call would go here
          message.success('Assignment deleted successfully');
          fetchAssignments();
        } catch (error: any) {
          message.error(error.message || 'Failed to delete assignment');
        }
      },
    });
  };

  const getAssignmentTypeTag = (type: string) => {
    const typeConfig: Record<string, { color: string; text: string }> = {
      individual: { color: 'blue', text: 'Individual' },
      group: { color: 'green', text: 'Group' },
      project: { color: 'purple', text: 'Project' },
    };

    const config = typeConfig[type] || { color: 'default', text: type };
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  const isOverdue = (dueDate: string) => {
    return new Date(dueDate) < new Date();
  };

  const columns = [
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: 'Type',
      dataIndex: 'assignmentType',
      key: 'assignmentType',
      render: (type: string) => getAssignmentTypeTag(type),
      filters: [
        { text: 'Individual', value: 'individual' },
        { text: 'Group', value: 'group' },
        { text: 'Project', value: 'project' },
      ],
    },
    {
      title: 'Course',
      key: 'course',
      render: (_: any, record: Assignment) => {
        const course = courses.find((c) => c.id === record.courseId);
        return course ? `${course.code} - ${course.name}` : record.courseId;
      },
    },
    {
      title: 'Due Date',
      dataIndex: 'dueDate',
      key: 'dueDate',
      render: (date: string) => {
        const isLate = isOverdue(date);
        return (
          <span style={{ color: isLate ? 'red' : 'inherit' }}>
            {new Date(date).toLocaleDateString()}
            {isLate && <Tag color="red" style={{ marginLeft: 8 }}>Overdue</Tag>}
          </span>
        );
      },
      sorter: true,
    },
    {
      title: 'Max Marks',
      dataIndex: 'maxMarks',
      key: 'maxMarks',
    },
    {
      title: 'Status',
      dataIndex: 'isPublished',
      key: 'isPublished',
      render: (isPublished: boolean) => (
        <Tag color={isPublished ? 'green' : 'orange'}>
          {isPublished ? 'Published' : 'Draft'}
        </Tag>
      ),
      filters: [
        { text: 'Published', value: true },
        { text: 'Draft', value: false },
      ],
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: Assignment) => (
        <Space size="middle">
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => navigate(`/learning/assignments/${record.id}`)}
          >
            View
          </Button>
          <PermissionGuard permission="learning" action="update">
            <Button
              type="link"
              icon={<EditOutlined />}
              onClick={() => navigate(`/learning/assignments/${record.id}/edit`)}
            >
              Edit
            </Button>
          </PermissionGuard>
          <Button
            type="link"
            icon={<FileTextOutlined />}
            onClick={() => navigate(`/learning/assignments/${record.id}/submissions`)}
          >
            Submissions
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <Card>
      <Space direction="vertical" style={{ width: '100%' }} size="large">
        <Space style={{ width: '100%', justifyContent: 'space-between', flexWrap: 'wrap' }}>
          <Space wrap>
            <Select
              placeholder="Filter by Course"
              style={{ width: 200 }}
              allowClear
              value={filters.courseId}
              onChange={(value) => setFilters({ ...filters, courseId: value })}
              showSearch
              filterOption={(input, option) =>
                (option?.children as unknown as string)?.toLowerCase().includes(input.toLowerCase())
              }
            >
              {courses.map((course) => (
                <Option key={course.id} value={course.id}>
                  {course.code} - {course.name}
                </Option>
              ))}
            </Select>
            <Select
              placeholder="Filter by Type"
              style={{ width: 150 }}
              allowClear
              value={filters.assignmentType}
              onChange={(value) => setFilters({ ...filters, assignmentType: value })}
            >
              <Option value="individual">Individual</Option>
              <Option value="group">Group</Option>
              <Option value="project">Project</Option>
            </Select>
            <Select
              placeholder="Filter by Status"
              style={{ width: 150 }}
              allowClear
              value={filters.isPublished}
              onChange={(value) => setFilters({ ...filters, isPublished: value })}
            >
              <Option value={true}>Published</Option>
              <Option value={false}>Draft</Option>
            </Select>
          </Space>
          <PermissionGuard permission="learning" action="create">
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => navigate('/learning/assignments/new')}
            >
              New Assignment
            </Button>
          </PermissionGuard>
        </Space>

        <Table
          columns={columns}
          dataSource={assignments}
          rowKey="id"
          loading={loading}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} assignments`,
            onChange: (page, pageSize) => {
              setPagination({ ...pagination, current: page, pageSize });
            },
          }}
        />
      </Space>
    </Card>
  );
};

export default AssignmentList;

