import React, { useState, useEffect } from 'react';
import { Table, Button, Input, Space, Card, message, Tag, Popconfirm, Select } from 'antd';
import { SearchOutlined, EditOutlined, DeleteOutlined, UserOutlined, EyeOutlined } from '@ant-design/icons';
import { studentAPI, Student } from '../../../../api/student.api';
import { useNavigate } from 'react-router-dom';
import { PermissionGuard } from '../../../common/PermissionGuard';
import { route } from '@/routes/constant';
import { academicAPI, Program } from '../../../../api/academic.api';

const { Search } = Input;
const { Option } = Select;

const StudentList: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });
  const [filters, setFilters] = useState({
    search: '',
    enrollmentStatus: '',
    programId: '',
  });
  const [programs, setPrograms] = useState<Program[]>([]);
  const [programLoading, setProgramLoading] = useState(false);
  const navigate = useNavigate();

  const fetchStudents = async (page: number = 1, currentFilters?: any) => {
    try {
      setLoading(true);
      const response = await studentAPI.getStudents(page, pagination.limit, currentFilters || filters);
      setStudents(response.students);
      setPagination(response.pagination);
    } catch (error) {
      message.error('Failed to load students');
      console.error('Error fetching students:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents(1);
    loadPrograms();
  }, []);

  const loadPrograms = async () => {
    try {
      setProgramLoading(true);
      const response = await academicAPI.getPrograms(1, 200, { isActive: true });
      setPrograms(response.programs);
    } catch (error) {
      message.error('Failed to load programs');
      console.error('Error fetching programs:', error);
    } finally {
      setProgramLoading(false);
    }
  };

  const handleSearch = (value: string) => {
    const newFilters = { ...filters, search: value };
    setFilters(newFilters);
    fetchStudents(1, newFilters);
  };

  const handleStatusFilter = (value: string) => {
    const newFilters = { ...filters, enrollmentStatus: value };
    setFilters(newFilters);
    fetchStudents(1, newFilters);
  };

  const handleProgramFilter = (value?: string) => {
    const newFilters = { ...filters, programId: value || '' };
    setFilters(newFilters);
    fetchStudents(1, newFilters);
  };

  const handleResetFilters = () => {
    const resetFilters = { search: '', enrollmentStatus: '', programId: '' };
    setFilters(resetFilters);
    fetchStudents(1, resetFilters);
  };

  const handleDelete = async (id: string) => {
    try {
      await studentAPI.deleteStudent(id);
      message.success('Student deleted successfully');
      fetchStudents(pagination.page, filters);
    } catch (error) {
      message.error('Failed to delete student');
      console.error('Error deleting student:', error);
    }
  };

  const handleTableChange = (page: number) => {
    fetchStudents(page, filters);
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      active: 'green',
      graduated: 'blue',
      suspended: 'orange',
      withdrawn: 'red',
      transfer: 'purple',
    };
    return colors[status] || 'default';
  };

  const columns = [
    {
      title: 'Roll Number',
      dataIndex: 'rollNumber',
      key: 'rollNumber',
      render: (text: string, record: Student) => (
        <Space>
          <UserOutlined />
          <strong>{text}</strong>
        </Space>
      ),
    },
    {
      title: 'Name',
      key: 'name',
      render: (record: Student) =>
        record.user
          ? `${record.user.firstName} ${record.user.lastName}`
          : 'N/A',
    },
    {
      title: 'Email',
      key: 'email',
      render: (record: Student) => record.user?.email || 'N/A',
    },
    {
      title: 'Program',
      key: 'program',
      render: (record: Student) => record.program?.name || 'N/A',
    },
    {
      title: 'Batch',
      dataIndex: 'batch',
      key: 'batch',
    },
    {
      title: 'Semester',
      dataIndex: 'currentSemester',
      key: 'currentSemester',
      render: (semester: number) => `Semester ${semester}`,
    },
    {
      title: 'Status',
      dataIndex: 'enrollmentStatus',
      key: 'enrollmentStatus',
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </Tag>
      ),
    },
    {
      title: 'CGPA',
      key: 'cgpa',
      render: (record: Student) => (
        <Tag color={record.cgpa && record.cgpa >= 3.5 ? 'green' : 'default'}>
          {record.cgpa ? record.cgpa.toFixed(2) : 'N/A'}
        </Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (record: Student) => (
        <Space>
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => navigate(`/student-management/profiles/${record.id}`)}
          >
            View
          </Button>
          <PermissionGuard module="student" action="update">
            <Button
              type="link"
              icon={<EditOutlined />}
              onClick={() => navigate(`/student-management/profiles/${record.id}/edit`)}
            >
              Edit
            </Button>
          </PermissionGuard>
          <PermissionGuard module="student" action="delete">
            <Popconfirm
              title="Are you sure you want to delete this student?"
              onConfirm={() => handleDelete(record.id)}
              okText="Yes"
              cancelText="No"
            >
              <Button type="link" danger icon={<DeleteOutlined />}>
                Delete
              </Button>
            </Popconfirm>
          </PermissionGuard>
        </Space>
      ),
    },
  ];

  return (
    <Card
      title="Student Management"
      extra={
        <PermissionGuard module="student" action="create">
          <Button type="primary" onClick={() => navigate('/student-management/profiles/new')}>
            Add New Student
          </Button>
        </PermissionGuard>
      }
      style={{ margin: '20px' }}
    >
      <Space direction="vertical" style={{ width: '100%', marginBottom: 16 }} size="large">
        <Space>
          <Search
            placeholder="Search by roll number, name, or email"
            allowClear
            enterButton={<SearchOutlined />}
            size="large"
            onSearch={handleSearch}
            style={{ width: 300 }}
          />
          <Select
            placeholder="Filter by Status"
            allowClear
            style={{ width: 150 }}
            onChange={handleStatusFilter}
            value={filters.enrollmentStatus || undefined}
          >
            <Option value="active">Active</Option>
            <Option value="graduated">Graduated</Option>
            <Option value="suspended">Suspended</Option>
            <Option value="withdrawn">Withdrawn</Option>
            <Option value="transfer">Transfer</Option>
          </Select>
          <Select
            placeholder="Filter by Program"
            allowClear
            loading={programLoading}
            style={{ width: 220 }}
            value={filters.programId || undefined}
            onChange={handleProgramFilter}
            showSearch
            optionFilterProp="children"
          >
            {programs.map((program) => (
              <Option key={program.id} value={program.id}>
                {program.name}
              </Option>
            ))}
          </Select>
          <Button onClick={handleResetFilters}>Reset</Button>
        </Space>
      </Space>

      <Table
        columns={columns}
        dataSource={students}
        rowKey="id"
        loading={loading}
        pagination={{
          current: pagination.page,
          pageSize: pagination.limit,
          total: pagination.total,
          showSizeChanger: false,
          showTotal: (total) => `Total ${total} students`,
          onChange: handleTableChange,
        }}
      />
    </Card>
  );
};

export default StudentList;

