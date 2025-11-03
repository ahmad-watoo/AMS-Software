import React, { useState, useEffect } from 'react';
import { Table, Button, Input, Space, Card, message, Tag, Popconfirm } from 'antd';
import { SearchOutlined, EditOutlined, DeleteOutlined, UserOutlined } from '@ant-design/icons';
import { userAPI, User } from '../../../../api/user.api';
import { useNavigate } from 'react-router-dom';
import { PermissionGuard } from '../../../common/PermissionGuard';

const { Search } = Input;

interface UsersResponse {
  users: User[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

const UserList: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });
  const [searchText, setSearchText] = useState('');
  const navigate = useNavigate();

  const fetchUsers = async (page: number = 1, search?: string) => {
    try {
      setLoading(true);
      const response = await userAPI.getUsers(page, pagination.limit, search);
      setUsers(response.users);
      setPagination(response.pagination);
    } catch (error) {
      message.error('Failed to load users');
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(1);
  }, []);

  const handleSearch = (value: string) => {
    setSearchText(value);
    fetchUsers(1, value);
  };

  const handleDelete = async (id: string) => {
    try {
      await userAPI.deleteUser(id);
      message.success('User deleted successfully');
      fetchUsers(pagination.page, searchText);
    } catch (error) {
      message.error('Failed to delete user');
      console.error('Error deleting user:', error);
    }
  };

  const handleTableChange = (page: number) => {
    fetchUsers(page, searchText);
  };

  const columns = [
    {
      title: 'Name',
      key: 'name',
      render: (record: User) => (
        <Space>
          <UserOutlined />
          <span>{`${record.firstName} ${record.lastName}`}</span>
        </Space>
      ),
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Phone',
      dataIndex: 'phone',
      key: 'phone',
      render: (phone: string) => phone || '-',
    },
    {
      title: 'Status',
      key: 'status',
      render: (record: User) => (
        <Space>
          <Tag color={record.isActive ? 'green' : 'red'}>
            {record.isActive ? 'Active' : 'Inactive'}
          </Tag>
          {record.isVerified && <Tag color="blue">Verified</Tag>}
        </Space>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (record: User) => (
        <Space>
          <PermissionGuard module="user" action="update">
            <Button
              type="link"
              icon={<EditOutlined />}
              onClick={() => navigate(`/users/${record.id}/edit`)}
            >
              Edit
            </Button>
          </PermissionGuard>
          <PermissionGuard module="user" action="delete">
            <Popconfirm
              title="Are you sure you want to delete this user?"
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
      title="User Management"
      extra={
        <PermissionGuard module="user" action="create">
          <Button type="primary" onClick={() => navigate('/users/new')}>
            Add New User
          </Button>
        </PermissionGuard>
      }
      style={{ margin: '20px' }}
    >
      <Space direction="vertical" style={{ width: '100%', marginBottom: 16 }}>
        <Search
          placeholder="Search users by name, email, or phone"
          allowClear
          enterButton={<SearchOutlined />}
          size="large"
          onSearch={handleSearch}
          style={{ maxWidth: 400 }}
        />
      </Space>

      <Table
        columns={columns}
        dataSource={users}
        rowKey="id"
        loading={loading}
        pagination={{
          current: pagination.page,
          pageSize: pagination.limit,
          total: pagination.total,
          showSizeChanger: false,
          showTotal: (total) => `Total ${total} users`,
          onChange: handleTableChange,
        }}
      />
    </Card>
  );
};

export default UserList;

