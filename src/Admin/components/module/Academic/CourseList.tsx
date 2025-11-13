import React, { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Input,
  Space,
  Card,
  message,
  Tag,
  Select,
  Tooltip,
  Row,
  Col,
  Statistic,
} from 'antd';
import { SearchOutlined, PlusOutlined, EditOutlined, EyeOutlined, BookOutlined, ReloadOutlined } from '@ant-design/icons';
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

  const summary = {
    total: pagination.total,
    active: courses.filter((course) => course.isActive).length,
    core: courses.filter((course) => !course.isElective).length,
    labHeavy: courses.filter((course) => course.labHours > 0).length,
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
        <Space size="small">
          <Tag color="blue">{hours} CH</Tag>
          {record.theoryHours > 0 && <Tag>Theory {record.theoryHours}</Tag>}
          {record.labHours > 0 && <Tag color="purple">Lab {record.labHours}</Tag>}
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
      style={{ margin: 24, borderRadius: 16 }}
      bodyStyle={{ padding: 24 }}
      title={
        <Space size="large">
          <span style={{ fontSize: 20, fontWeight: 600 }}>Course Catalog</span>
          <Button icon={<ReloadOutlined />} onClick={() => fetchCourses(pagination.page, filters)}>
            Refresh
          </Button>
        </Space>
      }
      extra={
        <PermissionGuard permission="academic" action="create">
          <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate(route.ACADEMIC_COURSE_CREATE)}>
            New Course
          </Button>
        </PermissionGuard>
      }
    >
      <Space direction="vertical" style={{ width: '100%' }} size="large">
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={6}>
            <Card bordered={false} style={{ background: '#f0f5ff' }}>
              <Statistic title="Total Courses" value={summary.total} />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card bordered={false} style={{ background: '#f6ffed' }}>
              <Statistic title="Active" value={summary.active} />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card bordered={false} style={{ background: '#fffbe6' }}>
              <Statistic title="Core Courses" value={summary.core} />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card bordered={false} style={{ background: '#fff0f6' }}>
              <Statistic title="Lab Components" value={summary.labHeavy} />
            </Card>
          </Col>
        </Row>

        <Card bordered={false} style={{ borderRadius: 12, background: '#fafafa' }}>
          <Space wrap style={{ width: '100%' }}>
            <Search
              placeholder="Search by code or title..."
              allowClear
              enterButton={<SearchOutlined />}
              size="large"
              onSearch={handleSearch}
              style={{ width: 280 }}
            />
            <Select
              placeholder="Filter by Type"
              allowClear
              size="large"
              style={{ width: 200 }}
              onChange={handleElectiveFilter}
            >
              <Option value="false">Core</Option>
              <Option value="true">Elective</Option>
            </Select>
            <Select
              placeholder="Filter by Status"
              allowClear
              size="large"
              style={{ width: 200 }}
              onChange={handleStatusFilter}
            >
              <Option value="true">Active</Option>
              <Option value="false">Inactive</Option>
            </Select>
          </Space>
        </Card>

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

