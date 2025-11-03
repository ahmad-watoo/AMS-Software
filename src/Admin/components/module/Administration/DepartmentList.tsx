import React, { useState, useEffect } from 'react';
import { Table, Button, Select, Space, Tag, Card, message, Modal } from 'antd';
import { PlusOutlined, EditOutlined, EyeOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import administrationAPI, { Department } from '@/api/administration.api';
import PermissionGuard from '@/components/common/PermissionGuard';

const { Option } = Select;

const DepartmentList: React.FC = () => {
  const navigate = useNavigate();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 20,
    total: 0,
  });
  const [filters, setFilters] = useState({
    isActive: undefined as boolean | undefined,
  });

  useEffect(() => {
    fetchDepartments();
  }, [pagination.current, pagination.pageSize, filters]);

  const fetchDepartments = async () => {
    setLoading(true);
    try {
      const response = await administrationAPI.getAllDepartments({
        isActive: filters.isActive,
        page: pagination.current,
        limit: pagination.pageSize,
      });

      setDepartments(response.departments || []);
      setPagination({
        ...pagination,
        total: response.pagination?.total || 0,
      });
    } catch (error: any) {
      message.error(error.message || 'Failed to fetch departments');
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: 'Code',
      dataIndex: 'code',
      key: 'code',
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      sorter: true,
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      render: (desc: string) => desc || '-',
    },
    {
      title: 'Head ID',
      dataIndex: 'headId',
      key: 'headId',
      render: (headId: string) => headId || '-',
    },
    {
      title: 'Parent Department',
      dataIndex: 'parentDepartmentId',
      key: 'parentDepartmentId',
      render: (parentId: string) => parentId || '-',
    },
    {
      title: 'Status',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (isActive: boolean) => (
        <Tag color={isActive ? 'green' : 'red'}>{isActive ? 'Active' : 'Inactive'}</Tag>
      ),
      filters: [
        { text: 'Active', value: true },
        { text: 'Inactive', value: false },
      ],
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: Department) => (
        <Space size="middle">
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => navigate(`/administration/departments/${record.id}`)}
          >
            View
          </Button>
          <PermissionGuard permission="admin" action="update">
            <Button
              type="link"
              icon={<EditOutlined />}
              onClick={() => navigate(`/administration/departments/${record.id}/edit`)}
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
          <Select
            placeholder="Filter by Status"
            style={{ width: 150 }}
            allowClear
            value={filters.isActive}
            onChange={(value) => setFilters({ ...filters, isActive: value })}
          >
            <Option value={true}>Active</Option>
            <Option value={false}>Inactive</Option>
          </Select>
          <PermissionGuard permission="admin" action="create">
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => navigate('/administration/departments/new')}
            >
              New Department
            </Button>
          </PermissionGuard>
        </Space>

        <Table
          columns={columns}
          dataSource={departments}
          rowKey="id"
          loading={loading}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} departments`,
            onChange: (page, pageSize) => {
              setPagination({ ...pagination, current: page, pageSize });
            },
          }}
        />
      </Space>
    </Card>
  );
};

export default DepartmentList;

