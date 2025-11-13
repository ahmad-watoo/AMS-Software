import React, { useEffect, useMemo, useState } from 'react';
import {
  Card,
  Table,
  Space,
  Button,
  Input,
  Select,
  Tag,
  message,
  Tooltip,
  Row,
  Col,
  Statistic,
  Badge,
  Empty,
} from 'antd';
import {
  PlusOutlined,
  ReloadOutlined,
  SearchOutlined,
  TeamOutlined,
  ApartmentOutlined,
  CalendarOutlined,
  EyeOutlined,
  EditOutlined,
} from '@ant-design/icons';
import { academicAPI, Course, CourseSection } from '../../../../api/academic.api';
import { userAPI, User } from '../../../../api/user.api';
import { useNavigate } from 'react-router-dom';
import { PermissionGuard } from '../../../common/PermissionGuard';
import { route } from '../../../routes/constant';

const { Option } = Select;
const { Search } = Input;

interface Filters {
  search: string;
  courseId?: string;
  semester?: string;
  facultyId?: string;
  status?: 'all' | 'active' | 'inactive';
}

const SectionList: React.FC = () => {
  const navigate = useNavigate();
  const [sections, setSections] = useState<CourseSection[]>([]);
  const [loading, setLoading] = useState(false);
  const [courses, setCourses] = useState<Course[]>([]);
  const [faculty, setFaculty] = useState<User[]>([]);
  const [filters, setFilters] = useState<Filters>({
    search: '',
    courseId: undefined,
    semester: undefined,
    facultyId: undefined,
    status: 'all',
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });

  useEffect(() => {
    loadReferenceData();
    fetchSections(1, filters);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadReferenceData = async () => {
    try {
      const [coursesResponse, facultyResponse] = await Promise.all([
        academicAPI.getCourses(1, 200, { isActive: true }),
        userAPI.getUsers(1, 200),
      ]);
      setCourses(coursesResponse.courses);
      setFaculty(facultyResponse.users);
    } catch (error) {
      // Reference data is helpful but optional; log silently.
      console.warn('Failed to load reference data for sections.', error);
    }
  };

  const fetchSections = async (page: number = 1, currentFilters: Filters = filters) => {
    try {
      setLoading(true);
      const response = await academicAPI.getSections(page, pagination.limit, {
        courseId: currentFilters.courseId,
        semester: currentFilters.semester,
        facultyId: currentFilters.facultyId,
      });
      setSections(response.sections);
      setPagination(response.pagination);
    } catch (error: any) {
      message.error(error.message || 'Failed to load sections');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value: string) => {
    const updated = { ...filters, search: value };
    setFilters(updated);
  };

  const handleFilterChange = (field: keyof Filters, value: string | undefined) => {
    const updated: Filters = {
      ...filters,
      [field]: value === 'all' ? undefined : value,
    };
    if (field === 'status') {
      updated.status = (value as Filters['status']) || 'all';
    }
    setFilters(updated);
    fetchSections(1, {
      ...updated,
      search: updated.search,
    });
  };

  const handleTableChange = (page: number) => {
    fetchSections(page);
  };

  const courseLookup = useMemo(() => {
    const map = new Map<string, Course>();
    courses.forEach((course) => map.set(course.id, course));
    return map;
  }, [courses]);

  const facultyLookup = useMemo(() => {
    const map = new Map<string, User>();
    faculty.forEach((member) => map.set(member.id, member));
    return map;
  }, [faculty]);

  const filteredSections = useMemo(() => {
    const searchTerm = filters.search.trim().toLowerCase();
    const statusFilter = filters.status;
    return sections.filter((section) => {
      if (statusFilter === 'active' && !section.isActive) return false;
      if (statusFilter === 'inactive' && section.isActive) return false;

      if (!searchTerm) return true;
      const course = courseLookup.get(section.courseId);
      const tokens = [
        section.sectionCode,
        section.semester,
        course?.code,
        course?.title,
      ]
        .filter(Boolean)
        .map((token) => token!.toLowerCase());
      return tokens.some((token) => token.includes(searchTerm));
    });
  }, [courseLookup, filters.search, filters.status, sections]);

  const summary = useMemo(() => {
    if (filteredSections.length === 0) {
      return {
        total: pagination.total,
        active: 0,
        averageFill: 0,
        uniqueSemesters: 0,
      };
    }
    const totals = filteredSections.reduce(
      (acc, section) => {
        acc.capacity += section.maxCapacity;
        acc.enrolled += section.currentEnrollment;
        if (section.isActive) acc.active += 1;
        acc.semesters.add(section.semester);
        return acc;
      },
      { capacity: 0, enrolled: 0, active: 0, semesters: new Set<string>() }
    );
    const averageFill = totals.capacity > 0 ? Math.round((totals.enrolled / totals.capacity) * 100) : 0;
    return {
      total: pagination.total,
      active: totals.active,
      averageFill,
      uniqueSemesters: totals.semesters.size,
    };
  }, [filteredSections, pagination.total]);

  const columns = [
    {
      title: 'Section',
      dataIndex: 'sectionCode',
      key: 'sectionCode',
      render: (code: string) => (
        <Space>
          <Badge color="#1677ff" />
          <strong>{code}</strong>
        </Space>
      ),
    },
    {
      title: 'Course',
      dataIndex: 'courseId',
      key: 'course',
      render: (courseId: string) => {
        const course = courseLookup.get(courseId);
        if (!course) return <span style={{ color: '#999' }}>—</span>;
        return (
          <Space direction="vertical" size={0}>
            <span style={{ fontWeight: 600 }}>{course.code}</span>
            <span style={{ color: '#666' }}>{course.title}</span>
          </Space>
        );
      },
    },
    {
      title: 'Semester',
      dataIndex: 'semester',
      key: 'semester',
      render: (semester: string) => (
        <Tag icon={<CalendarOutlined />} color="geekblue">
          {semester}
        </Tag>
      ),
    },
    {
      title: 'Instructor',
      dataIndex: 'facultyId',
      key: 'faculty',
      render: (facultyId?: string) => {
        if (!facultyId) {
          return <Tag color="default">Unassigned</Tag>;
        }
        const instructor = facultyLookup.get(facultyId);
        return (
          <Space>
            <TeamOutlined />
            <span>
              {instructor ? `${instructor.firstName} ${instructor.lastName}` : 'Faculty'}
            </span>
          </Space>
        );
      },
    },
    {
      title: 'Capacity',
      key: 'capacity',
      render: (_: any, record: CourseSection) => (
        <Space size="small">
          <Tag color={record.currentEnrollment / record.maxCapacity > 0.8 ? 'red' : 'green'}>
            {record.currentEnrollment}/{record.maxCapacity}
          </Tag>
          <span style={{ color: '#999' }}>filled</span>
        </Space>
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
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: CourseSection) => (
        <Space>
          <Tooltip title="View Details">
            <Button
              type="link"
              icon={<EyeOutlined />}
              onClick={() => navigate(route.ACADEMIC_SECTION_DETAIL.replace(':id', record.id))}
            />
          </Tooltip>
          <PermissionGuard permission="academic" action="update">
            <Tooltip title="Edit">
              <Button
                type="link"
                icon={<EditOutlined />}
                onClick={() => navigate(route.ACADEMIC_SECTION_EDIT.replace(':id', record.id))}
              />
            </Tooltip>
          </PermissionGuard>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Card
        style={{ borderRadius: 16 }}
        bodyStyle={{ padding: 24 }}
        title={
          <Space size="large">
            <span style={{ fontSize: 20, fontWeight: 600 }}>Course Sections</span>
            <Button icon={<ReloadOutlined />} onClick={() => fetchSections(pagination.page, filters)}>
              Refresh
            </Button>
          </Space>
        }
        extra={
          <PermissionGuard permission="academic" action="create">
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => navigate(route.ACADEMIC_SECTION_CREATE)}
            >
              New Section
            </Button>
          </PermissionGuard>
        }
      >
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <Row gutter={[16, 16]}>
            <Col xs={24} md={6}>
              <Card bordered={false} style={{ borderRadius: 12, background: '#f0f5ff' }}>
                <Statistic title="Total Sections" value={summary.total} prefix={<ApartmentOutlined />} />
              </Card>
            </Col>
            <Col xs={24} md={6}>
              <Card bordered={false} style={{ borderRadius: 12, background: '#f6ffed' }}>
                <Statistic title="Active Sections" value={summary.active} prefix={<Badge color="green" text="" />} />
              </Card>
            </Col>
            <Col xs={24} md={6}>
              <Card bordered={false} style={{ borderRadius: 12, background: '#fff7e6' }}>
                <Statistic title="Average Fill" value={`${summary.averageFill}%`} />
              </Card>
            </Col>
            <Col xs={24} md={6}>
              <Card bordered={false} style={{ borderRadius: 12, background: '#e6f7ff' }}>
                <Statistic title="Semesters Covered" value={summary.uniqueSemesters} />
              </Card>
            </Col>
          </Row>

          <Card bordered={false} style={{ borderRadius: 12, background: '#fafafa' }}>
            <Space wrap style={{ width: '100%' }}>
              <Search
                placeholder="Search by section, course, or semester"
                onSearch={handleSearch}
                onChange={(e) => handleSearch(e.target.value)}
                value={filters.search}
                allowClear
                enterButton={<SearchOutlined />}
                style={{ maxWidth: 320 }}
              />
              <Select
                placeholder="Filter by course"
                style={{ minWidth: 220 }}
                allowClear
                value={filters.courseId}
                onChange={(value) => handleFilterChange('courseId', value || undefined)}
              >
                {courses.map((course) => (
                  <Option key={course.id} value={course.id}>
                    {course.code} — {course.title}
                  </Option>
                ))}
              </Select>
              <Select
                placeholder="Filter by semester"
                style={{ minWidth: 180 }}
                allowClear
                value={filters.semester}
                onChange={(value) => handleFilterChange('semester', value || undefined)}
              >
                {Array.from(new Set(sections.map((section) => section.semester))).map((semester) => (
                  <Option key={semester} value={semester}>
                    {semester}
                  </Option>
                ))}
              </Select>
              <Select
                placeholder="Filter by instructor"
                style={{ minWidth: 220 }}
                allowClear
                value={filters.facultyId}
                onChange={(value) => handleFilterChange('facultyId', value || undefined)}
                showSearch
                optionFilterProp="children"
              >
                {faculty.map((member) => (
                  <Option key={member.id} value={member.id}>
                    {member.firstName} {member.lastName}
                  </Option>
                ))}
              </Select>
              <Select
                style={{ minWidth: 160 }}
                value={filters.status ?? 'all'}
                onChange={(value) => handleFilterChange('status', value)}
              >
                <Option value="all">All Status</Option>
                <Option value="active">Active</Option>
                <Option value="inactive">Inactive</Option>
              </Select>
            </Space>
          </Card>

          <Table
            rowKey="id"
            loading={loading}
            columns={columns}
            dataSource={filteredSections}
            pagination={{
              current: pagination.page,
              total: pagination.total,
              pageSize: pagination.limit,
              onChange: handleTableChange,
            }}
            locale={{
              emptyText: loading ? <Empty description="Loading sections..." /> : <Empty description="No sections found" />,
            }}
          />
        </Space>
      </Card>
    </div>
  );
};

export default SectionList;
