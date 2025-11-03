import React, { useState, useEffect } from 'react';
import { Table, Button, Input, Space, Card, message, Tag, Select, Tooltip } from 'antd';
import { SearchOutlined, PlusOutlined, EditOutlined, EyeOutlined, BookOutlined } from '@ant-design/icons';
import { academicAPI, Program } from '../../../../api/academic.api';
import { useNavigate } from 'react-router-dom';
import { PermissionGuard } from '../../../common/PermissionGuard';
import { route } from '../../../routes/constant';

const { Search } = Input;
const { Option } = Select;

const ProgramList: React.FC = () => {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });
  const [filters, setFilters] = useState({
    search: '',
    degreeLevel: '',
    isActive: undefined as boolean | undefined,
  });
  const navigate = useNavigate();

  const fetchPrograms = async (page: number = 1, currentFilters?: any) => {
    try {
      setLoading(true);
      const response = await academicAPI.getPrograms(page, pagination.limit, currentFilters || filters);
      setPrograms(response.programs);
      setPagination(response.pagination);
    } catch (error: any) {
      message.error(error.message || 'Failed to load programs');
      console.error('Error fetching programs:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrograms(1);
  }, []);

  const handleSearch = (value: string) => {
    const newFilters = { ...filters, search: value };
    setFilters(newFilters);
    fetchPrograms(1, newFilters);
  };

  const handleDegreeLevelFilter = (value: string) => {
    const newFilters = { ...filters, degreeLevel: value };
    setFilters(newFilters);
    fetchPrograms(1, newFilters);
  };

  const handleStatusFilter = (value: string) => {
    const newFilters = {
      ...filters,
      isActive: value === 'all' ? undefined : value === 'true',
    };
    setFilters(newFilters);
    fetchPrograms(1, newFilters);
  };

  const handleTableChange = (page: number) => {
    fetchPrograms(page, filters);
  };

  const getDegreeLevelColor = (level: string) => {
    const colors: Record<string, string> = {
      undergraduate: 'blue',
      graduate: 'green',
      doctoral: 'purple',
    };
    return colors[level] || 'default';
  };

  const formatDegreeLevel = (level: string) => {
    return level.charAt(0).toUpperCase() + level.slice(1);
  };

  const columns = [
    {
      title: 'Code',
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
      title: 'Program Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Degree Level',
      dataIndex: 'degreeLevel',
      key: 'degreeLevel',
      render: (level: string) => (
        <Tag color={getDegreeLevelColor(level)}>{formatDegreeLevel(level)}</Tag>
      ),
    },
    {
      title: 'Duration',
      dataIndex: 'duration',
      key: 'duration',
      render: (duration: number) => `${duration} years`,
    },
    {
      title: 'Credit Hours',
      dataIndex: 'totalCreditHours',
      key: 'totalCreditHours',
      render: (hours: number) => `${hours} CH`,
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
      render: (_: any, record: Program) => (
        <Space>
          <Tooltip title="View Details">
            <Button
              type="link"
              icon={<EyeOutlined />}
              onClick={() => navigate(route.ACADEMIC_PROGRAM_DETAIL.replace(':id', record.id))}
            />
          </Tooltip>
          <PermissionGuard permission="academic" action="update">
            <Tooltip title="Edit">
              <Button
                type="link"
                icon={<EditOutlined />}
                onClick={() => navigate(route.ACADEMIC_PROGRAM_EDIT.replace(':id', record.id))}
              />
            </Tooltip>
          </PermissionGuard>
        </Space>
      ),
    },
  ];

  return (
    <Card
      title="Academic Programs"
      style={{ margin: 20, boxShadow: 'rgba(0, 0, 0, 0.16) 0px 1px 4px' }}
      extra={
        <PermissionGuard permission="academic" action="create">
          <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate(route.ACADEMIC_PROGRAM_CREATE)}>
            New Program
          </Button>
        </PermissionGuard>
      }
    >
      <Space direction="vertical" style={{ width: '100%' }} size="large">
        <Space>
          <Search
            placeholder="Search by code or name..."
            allowClear
            enterButton={<SearchOutlined />}
            size="large"
            onSearch={handleSearch}
            style={{ width: 300 }}
          />
          <Select
            placeholder="Filter by Degree Level"
            allowClear
            style={{ width: 180 }}
            onChange={handleDegreeLevelFilter}
          >
            <Option value="undergraduate">Undergraduate</Option>
            <Option value="graduate">Graduate</Option>
            <Option value="doctoral">Doctoral</Option>
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
          dataSource={programs}
          rowKey="id"
          loading={loading}
          pagination={{
            current: pagination.page,
            pageSize: pagination.limit,
            total: pagination.total,
            showSizeChanger: false,
            showTotal: (total) => `Total ${total} programs`,
            onChange: handleTableChange,
          }}
        />
      </Space>
    </Card>
  );
};

export default ProgramList;

