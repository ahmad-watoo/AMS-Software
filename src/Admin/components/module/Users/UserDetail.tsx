import React, { useEffect, useState } from 'react';
import { Card, Descriptions, Tag, Button, Space, Spin, message } from 'antd';
import { useParams, useNavigate } from 'react-router-dom';
import { userAPI, User } from '../../../../api/user.api';
import { EditOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { PermissionGuard } from '../../../common/PermissionGuard';

const UserDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadUser();
    }
  }, [id]);

  const loadUser = async () => {
    try {
      setLoading(true);
      const userData = await userAPI.getUser(id!);
      setUser(userData);
    } catch (error) {
      message.error('Failed to load user');
      console.error('Error loading user:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!user) {
    return <Card>User not found</Card>;
  }

  return (
    <Card
      title="User Details"
      extra={
        <Space>
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/users')}>
            Back
          </Button>
          <PermissionGuard module="user" action="update">
            <Button
              type="primary"
              icon={<EditOutlined />}
              onClick={() => navigate(`/users/${id}/edit`)}
            >
              Edit
            </Button>
          </PermissionGuard>
        </Space>
      }
      style={{ margin: '20px' }}
    >
      <Descriptions bordered column={2}>
        <Descriptions.Item label="Name">
          {`${user.firstName} ${user.lastName}`}
        </Descriptions.Item>
        <Descriptions.Item label="Email">{user.email}</Descriptions.Item>
        <Descriptions.Item label="Phone">{user.phone || '-'}</Descriptions.Item>
        <Descriptions.Item label="CNIC">{user.cnic || '-'}</Descriptions.Item>
        
        <Descriptions.Item label="Status" span={2}>
          <Space>
            <Tag color={user.isActive ? 'green' : 'red'}>
              {user.isActive ? 'Active' : 'Inactive'}
            </Tag>
            {user.isVerified && <Tag color="blue">Verified</Tag>}
          </Space>
        </Descriptions.Item>
        
      </Descriptions>
    </Card>
  );
};

export default UserDetail;

