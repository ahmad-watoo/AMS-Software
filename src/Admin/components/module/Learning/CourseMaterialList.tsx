import React, { useState, useEffect } from 'react';
import { Table, Button, Select, Space, Tag, Card, message, Upload, Modal } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined, FileOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import learningAPI, { CourseMaterial } from '@/api/learning.api';
import { academicAPI } from '@/api/academic.api';
import PermissionGuard from '@/components/common/PermissionGuard';

const { Option } = Select;

const CourseMaterialList: React.FC = () => {
  const navigate = useNavigate();
  const [materials, setMaterials] = useState<CourseMaterial[]>([]);
  const [loading, setLoading] = useState(false);
  const [sections, setSections] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 20,
    total: 0,
  });
  const [filters, setFilters] = useState({
    sectionId: undefined as string | undefined,
    courseId: undefined as string | undefined,
    materialType: undefined as string | undefined,
    isVisible: undefined as boolean | undefined,
  });

  useEffect(() => {
    fetchMaterials();
    loadSections();
    loadCourses();
  }, [pagination.current, pagination.pageSize, filters]);

  const fetchMaterials = async () => {
    setLoading(true);
    try {
      const response = await learningAPI.getAllCourseMaterials({
        sectionId: filters.sectionId,
        courseId: filters.courseId,
        materialType: filters.materialType,
        isVisible: filters.isVisible,
        page: pagination.current,
        limit: pagination.pageSize,
      });

      setMaterials(response.materials || []);
      setPagination({
        ...pagination,
        total: response.pagination?.total || 0,
      });
    } catch (error: any) {
      message.error(error.message || 'Failed to fetch course materials');
    } finally {
      setLoading(false);
    }
  };

  const loadSections = async () => {
    try {
      const response = await academicAPI.getSections(1, 1000);
      setSections(response.sections || []);
    } catch (error) {
      console.error('Failed to load sections');
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
      title: 'Are you sure you want to delete this course material?',
      content: 'This action cannot be undone.',
      okText: 'Yes, Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          // Delete API call would go here
          message.success('Course material deleted successfully');
          fetchMaterials();
        } catch (error: any) {
          message.error(error.message || 'Failed to delete course material');
        }
      },
    });
  };

  const getMaterialTypeTag = (type: string) => {
    const typeConfig: Record<string, { color: string; text: string }> = {
      document: { color: 'blue', text: 'Document' },
      video: { color: 'red', text: 'Video' },
      link: { color: 'green', text: 'Link' },
      presentation: { color: 'purple', text: 'Presentation' },
      other: { color: 'default', text: 'Other' },
    };

    const config = typeConfig[type] || { color: 'default', text: type };
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '-';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const columns = [
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: 'Type',
      dataIndex: 'materialType',
      key: 'materialType',
      render: (type: string) => getMaterialTypeTag(type),
      filters: [
        { text: 'Document', value: 'document' },
        { text: 'Video', value: 'video' },
        { text: 'Link', value: 'link' },
        { text: 'Presentation', value: 'presentation' },
      ],
    },
    {
      title: 'Course',
      key: 'course',
      render: (_: any, record: CourseMaterial) => {
        const course = courses.find((c) => c.id === record.courseId);
        return course ? `${course.code} - ${course.name}` : record.courseId;
      },
    },
    {
      title: 'File Size',
      dataIndex: 'fileSize',
      key: 'fileSize',
      render: (size: number) => formatFileSize(size),
    },
    {
      title: 'Uploaded At',
      dataIndex: 'uploadedAt',
      key: 'uploadedAt',
      render: (date: string) => (date ? new Date(date).toLocaleDateString() : '-'),
    },
    {
      title: 'Status',
      dataIndex: 'isVisible',
      key: 'isVisible',
      render: (isVisible: boolean) => (
        <Tag color={isVisible ? 'green' : 'red'}>{isVisible ? 'Visible' : 'Hidden'}</Tag>
      ),
      filters: [
        { text: 'Visible', value: true },
        { text: 'Hidden', value: false },
      ],
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: CourseMaterial) => (
        <Space size="middle">
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => navigate(`/learning/materials/${record.id}`)}
          >
            View
          </Button>
          <PermissionGuard permission="learning" action="update">
            <Button
              type="link"
              icon={<EditOutlined />}
              onClick={() => navigate(`/learning/materials/${record.id}/edit`)}
            >
              Edit
            </Button>
          </PermissionGuard>
          {record.fileUrl && (
            <Button
              type="link"
              icon={<FileOutlined />}
              onClick={() => window.open(record.fileUrl, '_blank')}
            >
              Download
            </Button>
          )}
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
              value={filters.materialType}
              onChange={(value) => setFilters({ ...filters, materialType: value })}
            >
              <Option value="document">Document</Option>
              <Option value="video">Video</Option>
              <Option value="link">Link</Option>
              <Option value="presentation">Presentation</Option>
              <Option value="other">Other</Option>
            </Select>
            <Select
              placeholder="Filter by Status"
              style={{ width: 150 }}
              allowClear
              value={filters.isVisible}
              onChange={(value) => setFilters({ ...filters, isVisible: value })}
            >
              <Option value={true}>Visible</Option>
              <Option value={false}>Hidden</Option>
            </Select>
          </Space>
          <PermissionGuard permission="learning" action="create">
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => navigate('/learning/materials/new')}
            >
              New Material
            </Button>
          </PermissionGuard>
        </Space>

        <Table
          columns={columns}
          dataSource={materials}
          rowKey="id"
          loading={loading}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} materials`,
            onChange: (page, pageSize) => {
              setPagination({ ...pagination, current: page, pageSize });
            },
          }}
        />
      </Space>
    </Card>
  );
};

export default CourseMaterialList;

