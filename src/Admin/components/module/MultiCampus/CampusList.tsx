import React, { useState, useEffect } from 'react';
import { Table, Button, Select, Space, Tag, Card, message, Input } from 'antd';
import { PlusOutlined, EditOutlined, EyeOutlined, BarChartOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import multicampusAPI, { Campus } from '@/api/multicampus.api';
import PermissionGuard from '@/components/common/PermissionGuard';

const { Option } = Select;

const CampusList: React.FC = () => {
  const navigate = useNavigate();
  const [campuses, setCampuses] = useState<Campus[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 20,
    total: 0,
  });
  const [filters, setFilters] = useState({
    province: undefined as string | undefined,
    isActive: undefined as boolean | undefined,
  });

  useEffect(() => {
    fetchCampuses();
  }, [pagination.current, pagination.pageSize, filters]);

  const fetchCampuses = async () => {
    setLoading(true);
    try {
      const response = await multicampusAPI.getAllCampuses({
        province: filters.province,
        isActive: filters.isActive,
        page: pagination.current,
        limit: pagination.pageSize,
      });

      setCampuses(response.campuses || []);
      setPagination({
        ...pagination,
        total: response.pagination?.total || 0,
      });
    } catch (error: any) {
      message.error(error.message || 'Failed to fetch campuses');
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
      title: 'City',
      dataIndex: 'city',
      key: 'city',
    },
    {
      title: 'Province',
      dataIndex: 'province',
      key: 'province',
      filters: [
        { text: 'Punjab', value: 'Punjab' },
        { text: 'Sindh', value: 'Sindh' },
        { text: 'Khyber Pakhtunkhwa', value: 'Khyber Pakhtunkhwa' },
        { text: 'Balochistan', value: 'Balochistan' },
        { text: 'Islamabad', value: 'Islamabad' },
      ],
    },
    {
      title: 'Address',
      dataIndex: 'address',
      key: 'address',
      ellipsis: true,
    },
    {
      title: 'Phone',
      dataIndex: 'phone',
      key: 'phone',
      render: (phone: string) => phone || '-',
    },
    {
      title: 'Capacity',
      dataIndex: 'capacity',
      key: 'capacity',
      render: (capacity: number) => capacity || '-',
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
      render: (_: any, record: Campus) => (
        <Space size="middle">
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => navigate(`/multicampus/campuses/${record.id}`)}
          >
            View
          </Button>
          <Button
            type="link"
            icon={<BarChartOutlined />}
            onClick={() => navigate(`/multicampus/campuses/${record.id}/report`)}
          >
            Report
          </Button>
          <PermissionGuard permission="admin" action="update">
            <Button
              type="link"
              icon={<EditOutlined />}
              onClick={() => navigate(`/multicampus/campuses/${record.id}/edit`)}
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
              placeholder="Filter by Province"
              style={{ width: 200 }}
              allowClear
              value={filters.province}
              onChange={(value) => setFilters({ ...filters, province: value })}
            >
              <Option value="Punjab">Punjab</Option>
              <Option value="Sindh">Sindh</Option>
              <Option value="Khyber Pakhtunkhwa">Khyber Pakhtunkhwa</Option>
              <Option value="Balochistan">Balochistan</Option>
              <Option value="Islamabad">Islamabad</Option>
            </Select>
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
          </Space>
          <PermissionGuard permission="admin" action="create">
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => navigate('/multicampus/campuses/new')}
            >
              New Campus
            </Button>
          </PermissionGuard>
        </Space>

        <Table
          columns={columns}
          dataSource={campuses}
          rowKey="id"
          loading={loading}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} campuses`,
            onChange: (page, pageSize) => {
              setPagination({ ...pagination, current: page, pageSize });
            },
          }}
        />
      </Space>
    </Card>
  );
};

export default CampusList;

