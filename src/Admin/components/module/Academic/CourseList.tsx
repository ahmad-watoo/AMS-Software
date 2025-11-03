import React, { useState, useEffect } from 'react';
import { Table, Button, Input, Space, Card, message, Tag, Select, Tooltip } from 'antd';
import { SearchOutlined, PlusOutlined, EditOutlined, EyeOutlined, BookOutlined } from '@ant-design/icons';
import { academicAPI, Course } from '../../../../api/academic.api';
import { useNavigate } from 'react-router-dom';
import { PermissionGuard } from '../../../common/PermissionGuard';
import { route } from '../../../routes/constant';

const { Search } = Input;
const { Option } = Select;

const CourseList: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });
  const [filters, setFilters] = useState({
    search: '',
    isElective: undefined as boolean | undefined,
    isActive: undefined as boolean | undefined,
  });
  const navigate = useNavigate();

  const fetchCourses = async (page: number = 1, currentFilters?: any) => {
    try {
      setLoading(true);
      const response = await academicAPI.getCourses(page, pagination.limit, currentFilters || filters);
      setCourses(response.courses);
      setPagination(response.pagination);
    } catch (error: any) {
      message.error(error.message || 'Failed to load courses');
      console.error('Error fetching courses:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses(1);
  }, []);

  const handleSearch = (value: string) => {
    const newFilters = { ...filters, search: value };
    setFilters(newFilters);
    fetchCourses(1, newFilters);
  };

  const handleElectiveFilter = (value: string) => {
    const newFilters = {
      ...filters,
      isElective: value === 'all' ? undefined : value === 'true',
    };
    setFilters(newFilters);
    fetchCourses(1, newFilters);
  };

  const handleStatusFilter = (value: string) => {
    const newFilters = {
      ...filters,
      isActive: value === 'all' ? undefined : value === 'true',
    };
    setFilters(newFilters);
    fetchCourses(1, newFilters);
  };

  const handleTableChange = (page: number) => {
    fetchCourses(page, filters);
  };

  const columns = [
    {
      title: 'Course Code',
      dataIndex: 'code',
      key: 'code',
      render: (text: string) => (
        <Space>
          <BookOutlined />
          <strong>{text}</strong>
        </Space>
      ),
    },
    {
      title: 'Course Title',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: 'Credit Hours',
      dataIndex: 'creditHours',
      key: 'creditHours',
      render: (hours: number, record: Course) => (
        <Space>
          <Tag>{hours} CH</Tag>
          {record.theoryHours > 0 && <span>T: {record.theoryHours}</span>}
          {record.labHours > 0 && <span>L: {record.labHours}</span>}
        </Space>
      ),
    },
    {
      title: 'Type',
      dataIndex: 'isElective',
      key: 'isElective',
      render: (isElective: boolean) => (
        <Tag color={isElective ? 'orange' : 'blue'}>
          {isElective ? 'Elective' : 'Core'}
        </Tag>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (isActive: boolean) => (
        <Tag color={isActive ? 'success' : 'error'}>
          {isActive ? 'Active' : 'Inactive'}
        </Tag>
      ),
    },
    {
      title: 'Prerequisites',
      dataIndex: 'prerequisiteCourseIds',
      key: 'prerequisites',
      render: (ids: string[]) => (
        ids && ids.length > 0 ? (
          <Tag>{ids.length} prerequisite{ids.length > 1 ? 's' : ''}</Tag>
        ) : (
          <span style={{ color: '#999' }}>None</span>
        )
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: Course) => (
        <Space>
          <Tooltip title="View Details">
            <Button
              type="link"
              icon={<EyeOutlined />}
              onClick={() => navigate(route.ACADEMIC_COURSE_DETAIL.replace(':id', record.id))}
            />
          </Tooltip>
          <PermissionGuard permission="academic" action="update">
            <Tooltip title="Edit">
              <Button
                type="link"
                icon={<EditOutlined />}
                onClick={() => navigate(route.ACADEMIC_COURSE_EDIT.replace(':id', record.id))}
              />
            </Tooltip>
          </PermissionGuard>
        </Space>
      ),
    },
  ];

  return (
    <Card
      title="Course Catalog"
      style={{ margin: 20, boxShadow: 'rgba(0, 0, 0, 0.16) 0px 1px 4px' }}
      extra={
        <PermissionGuard permission="academic" action="create">
          <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate(route.ACADEMIC_COURSE_CREATE)}>
            New Course
          </Button>
        </PermissionGuard>
      }
    >
      <Space direction="vertical" style={{ width: '100%' }} size="large">
        <Space>
          <Search
            placeholder="Search by code or title..."
            allowClear
            enterButton={<SearchOutlined />}
            size="large"
            onSearch={handleSearch}
            style={{ width: 300 }}
          />
          <Select
            placeholder="Filter by Type"
            allowClear
            style={{ width: 150 }}
            onChange={handleElectiveFilter}
          >
            <Option value="false">Core</Option>
            <Option value="true">Elective</Option>
          </Select>
          <Select
            placeholder="Filter by Status"
            allowClear
            style={{ width: 150 }}
            onChange={handleStatusFilter}
          >
            <Option value="true">Active</Option>
            <Option value="false">Inactive</Option>
          </Select>
        </Space>

        <Table
          columns={columns}
          dataSource={courses}
          rowKey="id"
          loading={loading}
          pagination={{
            current: pagination.page,
            pageSize: pagination.limit,
            total: pagination.total,
            showSizeChanger: false,
            showTotal: (total) => `Total ${total} courses`,
            onChange: handleTableChange,
          }}
        />
      </Space>
    </Card>
  );
};

export default CourseList;

