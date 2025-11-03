import React, { useState, useEffect } from 'react';
import { Table, Button, Select, Space, Tag, Card, message } from 'antd';
import { PlusOutlined, EditOutlined, EyeOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import administrationAPI, { Notice } from '@/api/administration.api';
import PermissionGuard from '@/components/common/PermissionGuard';

const { Option } = Select;

const NoticeList: React.FC = () => {
  const navigate = useNavigate();
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 20,
    total: 0,
  });
  const [filters, setFilters] = useState({
    noticeType: undefined as string | undefined,
    priority: undefined as string | undefined,
    isPublished: undefined as boolean | undefined,
  });

  useEffect(() => {
    fetchNotices();
  }, [pagination.current, pagination.pageSize, filters]);

  const fetchNotices = async () => {
    setLoading(true);
    try {
      const response = await administrationAPI.getAllNotices({
        noticeType: filters.noticeType,
        priority: filters.priority,
        isPublished: filters.isPublished,
        page: pagination.current,
        limit: pagination.pageSize,
      });

      setNotices(response.notices || []);
      setPagination({
        ...pagination,
        total: response.pagination?.total || 0,
      });
    } catch (error: any) {
      message.error(error.message || 'Failed to fetch notices');
    } finally {
      setLoading(false);
    }
  };

  const getPriorityTag = (priority: string) => {
    const priorityConfig: Record<string, { color: string; text: string }> = {
      low: { color: 'default', text: 'Low' },
      medium: { color: 'blue', text: 'Medium' },
      high: { color: 'orange', text: 'High' },
      urgent: { color: 'red', text: 'Urgent' },
    };

    const config = priorityConfig[priority] || { color: 'default', text: priority };
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  const getNoticeTypeTag = (type: string) => {
    const typeConfig: Record<string, { color: string; text: string }> = {
      announcement: { color: 'blue', text: 'Announcement' },
      important: { color: 'red', text: 'Important' },
      general: { color: 'default', text: 'General' },
      exam: { color: 'orange', text: 'Exam' },
      fee: { color: 'green', text: 'Fee' },
      holiday: { color: 'purple', text: 'Holiday' },
    };

    const config = typeConfig[type] || { color: 'default', text: type };
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  const columns = [
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: 'Type',
      dataIndex: 'noticeType',
      key: 'noticeType',
      render: (type: string) => getNoticeTypeTag(type),
      filters: [
        { text: 'Announcement', value: 'announcement' },
        { text: 'Important', value: 'important' },
        { text: 'General', value: 'general' },
        { text: 'Exam', value: 'exam' },
        { text: 'Fee', value: 'fee' },
        { text: 'Holiday', value: 'holiday' },
      ],
    },
    {
      title: 'Priority',
      dataIndex: 'priority',
      key: 'priority',
      render: (priority: string) => getPriorityTag(priority),
      filters: [
        { text: 'Low', value: 'low' },
        { text: 'Medium', value: 'medium' },
        { text: 'High', value: 'high' },
        { text: 'Urgent', value: 'urgent' },
      ],
    },
    {
      title: 'Published Date',
      dataIndex: 'publishedDate',
      key: 'publishedDate',
      render: (date: string) => new Date(date).toLocaleDateString(),
      sorter: true,
    },
    {
      title: 'Expiry Date',
      dataIndex: 'expiryDate',
      key: 'expiryDate',
      render: (date: string) => (date ? new Date(date).toLocaleDateString() : '-'),
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
      render: (_: any, record: Notice) => (
        <Space size="middle">
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => navigate(`/administration/notices/${record.id}`)}
          >
            View
          </Button>
          <PermissionGuard permission="admin" action="update">
            <Button
              type="link"
              icon={<EditOutlined />}
              onClick={() => navigate(`/administration/notices/${record.id}/edit`)}
            >
              Edit
            </Button>
          </PermissionGuard>
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
              placeholder="Filter by Type"
              style={{ width: 150 }}
              allowClear
              value={filters.noticeType}
              onChange={(value) => setFilters({ ...filters, noticeType: value })}
            >
              <Option value="announcement">Announcement</Option>
              <Option value="important">Important</Option>
              <Option value="general">General</Option>
              <Option value="exam">Exam</Option>
              <Option value="fee">Fee</Option>
              <Option value="holiday">Holiday</Option>
            </Select>
            <Select
              placeholder="Filter by Priority"
              style={{ width: 150 }}
              allowClear
              value={filters.priority}
              onChange={(value) => setFilters({ ...filters, priority: value })}
            >
              <Option value="low">Low</Option>
              <Option value="medium">Medium</Option>
              <Option value="high">High</Option>
              <Option value="urgent">Urgent</Option>
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
          <PermissionGuard permission="admin" action="create">
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => navigate('/administration/notices/new')}
            >
              New Notice
            </Button>
          </PermissionGuard>
        </Space>

        <Table
          columns={columns}
          dataSource={notices}
          rowKey="id"
          loading={loading}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} notices`,
            onChange: (page, pageSize) => {
              setPagination({ ...pagination, current: page, pageSize });
            },
          }}
        />
      </Space>
    </Card>
  );
};

export default NoticeList;

