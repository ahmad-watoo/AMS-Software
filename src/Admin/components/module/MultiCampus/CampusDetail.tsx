import React, { useState, useEffect } from 'react';
import { Card, Descriptions, Tag, Button, Space, message, Spin } from 'antd';
import { ArrowLeftOutlined, EditOutlined, BarChartOutlined } from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import multicampusAPI, { Campus } from '@/api/multicampus.api';
import PermissionGuard from '@/components/common/PermissionGuard';

const CampusDetail: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [campus, setCampus] = useState<Campus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadCampus(id);
    }
  }, [id]);

  const loadCampus = async (campusId: string) => {
    try {
      setLoading(true);
      const camp = await multicampusAPI.getCampusById(campusId);
      setCampus(camp);
    } catch (error: any) {
      message.error(error.message || 'Failed to load campus details');
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

  if (!campus) {
    return <Card>Campus not found</Card>;
  }

  return (
    <Card
      title={`${campus.name} - ${campus.code}`}
      extra={
        <Space>
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/multicampus/campuses')}>
            Back
          </Button>
          <Button
            icon={<BarChartOutlined />}
            onClick={() => navigate(`/multicampus/campuses/${id}/report`)}
          >
            View Report
          </Button>
          <PermissionGuard permission="admin" action="update">
            <Button
              type="primary"
              icon={<EditOutlined />}
              onClick={() => navigate(`/multicampus/campuses/${id}/edit`)}
            >
              Edit
            </Button>
          </PermissionGuard>
        </Space>
      }
    >
      <Descriptions bordered column={2}>
        <Descriptions.Item label="Campus Code">{campus.code}</Descriptions.Item>
        <Descriptions.Item label="Campus Name">{campus.name}</Descriptions.Item>
        <Descriptions.Item label="Address" span={2}>{campus.address}</Descriptions.Item>
        <Descriptions.Item label="City">{campus.city}</Descriptions.Item>
        <Descriptions.Item label="Province">{campus.province}</Descriptions.Item>
        <Descriptions.Item label="Postal Code">{campus.postalCode || '-'}</Descriptions.Item>
        <Descriptions.Item label="Phone">{campus.phone || '-'}</Descriptions.Item>
        <Descriptions.Item label="Email">{campus.email || '-'}</Descriptions.Item>
        <Descriptions.Item label="Website">
          {campus.website ? (
            <a href={campus.website} target="_blank" rel="noopener noreferrer">
              {campus.website}
            </a>
          ) : (
            '-'
          )}
        </Descriptions.Item>
        <Descriptions.Item label="Capacity">{campus.capacity || '-'}</Descriptions.Item>
        <Descriptions.Item label="Established Date">
          {campus.establishedDate ? new Date(campus.establishedDate).toLocaleDateString() : '-'}
        </Descriptions.Item>
        <Descriptions.Item label="Status">
          <Tag color={campus.isActive ? 'green' : 'red'}>
            {campus.isActive ? 'Active' : 'Inactive'}
          </Tag>
        </Descriptions.Item>
        <Descriptions.Item label="Description" span={2}>
          {campus.description || '-'}
        </Descriptions.Item>
        <Descriptions.Item label="Created At">
          {new Date(campus.createdAt).toLocaleString()}
        </Descriptions.Item>
        <Descriptions.Item label="Updated At">
          {new Date(campus.updatedAt).toLocaleString()}
        </Descriptions.Item>
      </Descriptions>
    </Card>
  );
};

export default CampusDetail;

