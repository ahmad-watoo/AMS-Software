import React, { useEffect, useMemo, useState } from 'react';
import {
  Card,
  Table,
  Space,
  Typography,
  Statistic,
  Row,
  Col,
  Button,
  Tag,
  Empty,
  message,
  Skeleton,
  List,
} from 'antd';
import {
  ApartmentOutlined,
  SettingOutlined,
  TeamOutlined,
  ArrowRightOutlined,
  ReloadOutlined,
  PlusOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import administrationAPI, { Department, SystemConfig } from '@/api/administration.api';
import { route } from '../../../../routes/constant';
import PermissionGuard from '@/components/common/PermissionGuard';

const { Title, Text } = Typography;

const normalizeDepartments = (response: any): Department[] => {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.departments)) return response.departments;
  if (Array.isArray(response?.data?.departments)) return response.data.departments;
  if (Array.isArray(response?.data)) return response.data;
  return [];
};

const normalizeConfigs = (response: any): SystemConfig[] => {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.configs)) return response.configs;
  if (Array.isArray(response?.data?.configs)) return response.data.configs;
  if (Array.isArray(response?.data)) return response.data;
  return [];
};

const Infrastructure: React.FC = () => {
  const navigate = useNavigate();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [configs, setConfigs] = useState<SystemConfig[]>([]);
  const [loadingDeps, setLoadingDeps] = useState(false);
  const [loadingConfigs, setLoadingConfigs] = useState(false);

  const loadDepartments = async () => {
    try {
      setLoadingDeps(true);
      const response = await administrationAPI.getAllDepartments({ page: 1, limit: 200 });
      setDepartments(normalizeDepartments(response));
    } catch (error: any) {
      message.error(error.message || 'Failed to load departments');
    } finally {
      setLoadingDeps(false);
    }
  };

  const loadConfigs = async () => {
    try {
      setLoadingConfigs(true);
      const response = await administrationAPI.getAllSystemConfigs({ page: 1, limit: 50 });
      setConfigs(normalizeConfigs(response));
    } catch (error: any) {
      message.warning(error.message || 'System configuration preview unavailable');
    } finally {
      setLoadingConfigs(false);
    }
  };

  useEffect(() => {
    loadDepartments();
    loadConfigs();
  }, []);

  const departmentStats = useMemo(() => {
    const total = departments.length;
    const active = departments.filter((department) => department.isActive).length;
    const withHeads = departments.filter((department) => department.headId).length;
    return { total, active, withHeads };
  }, [departments]);

  const departmentColumns = [
    {
      title: 'Department',
      dataIndex: 'name',
      key: 'name',
      render: (name: string, record: Department) => (
        <Space direction="vertical" size={0}>
          <span style={{ fontWeight: 600 }}>{name}</span>
          <Text type="secondary">{record.code}</Text>
        </Space>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (isActive: boolean) => <Tag color={isActive ? 'green' : 'red'}>{isActive ? 'Active' : 'Inactive'}</Tag>,
    },
    {
      title: 'Head',
      dataIndex: 'headId',
      key: 'headId',
      render: (headId?: string) => headId ? headId : '—',
    },
  ];

  const configPreview = useMemo(() => configs.slice(0, 6), [configs]);

  return (
    <div style={{ padding: 24 }}>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <Card bordered={false} style={{ borderRadius: 16 }}>
          <Row gutter={[16, 16]} align="middle">
            <Col xs={24} md={16}>
              <Space size="large" align="center">
                <ApartmentOutlined style={{ fontSize: 40, color: '#1677ff' }} />
                <div>
                  <Title level={3} style={{ marginBottom: 0 }}>Campus Infrastructure</Title>
                  <Text type="secondary">Overview of departments and key system configurations.</Text>
                </div>
              </Space>
            </Col>
            <Col xs={24} md={8}>
              <Space style={{ justifyContent: 'flex-end', width: '100%' }}>
                <Button icon={<ReloadOutlined />} onClick={() => { loadDepartments(); loadConfigs(); }}>
                  Refresh
                </Button>
                <PermissionGuard permission="administration" action="create">
                  <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate(route.ADMIN_DEPARTMENT_CREATE)}>
                    New Department
                  </Button>
                </PermissionGuard>
              </Space>
            </Col>
          </Row>
        </Card>

        <Row gutter={[16, 16]}>
          <Col xs={24} md={8}>
            <Card bordered={false} style={{ borderRadius: 12, background: '#f0f5ff' }}>
              <Statistic title="Departments" value={departmentStats.total} prefix={<TeamOutlined />} />
            </Card>
          </Col>
          <Col xs={24} md={8}>
            <Card bordered={false} style={{ borderRadius: 12, background: '#f6ffed' }}>
              <Statistic title="Active" value={departmentStats.active} prefix={<CheckCircleOutlined />} valueStyle={{ color: '#52c41a' }} />
            </Card>
          </Col>
          <Col xs={24} md={8}>
            <Card bordered={false} style={{ borderRadius: 12, background: '#fff7e6' }}>
              <Statistic title="With Department Head" value={departmentStats.withHeads} prefix={<TeamOutlined />} />
            </Card>
          </Col>
        </Row>

        <Card
          bordered={false}
          style={{ borderRadius: 12 }}
          title="Department Directory"
          extra={
            <Space>
              <Button type="link" icon={<ArrowRightOutlined />} onClick={() => navigate(route.ADMIN_DEPARTMENT_LIST)}>
                Manage Departments
              </Button>
            </Space>
          }
        >
          {loadingDeps ? (
            <Skeleton active paragraph={{ rows: 6 }} />
          ) : departments.length === 0 ? (
            <Empty description="No departments registered" />
          ) : (
            <Table
              rowKey={(record) => record.id}
              columns={departmentColumns}
              dataSource={departments.slice(0, 10)}
              pagination={false}
            />
          )}
        </Card>

        <Card
          bordered={false}
          style={{ borderRadius: 12 }}
          title="System Configuration Snapshot"
          extra={
            <Space>
              <Button type="link" icon={<ArrowRightOutlined />} onClick={() => navigate(route.ADMIN_SYSTEM_CONFIG)}>
                View All Settings
              </Button>
            </Space>
          }
        >
          {loadingConfigs ? (
            <Skeleton active paragraph={{ rows: 4 }} />
          ) : configPreview.length === 0 ? (
            <Empty description="No configurations found" />
          ) : (
            <List
              dataSource={configPreview}
              renderItem={(config) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={<SettingOutlined style={{ fontSize: 20 }} />}
                    title={config.key}
                    description={
                      <Space direction="vertical" size={0}>
                        <Text>{config.value}</Text>
                        <Text type="secondary">{config.category} • {config.dataType}</Text>
                      </Space>
                    }
                  />
                </List.Item>
              )}
            />
          )}
        </Card>
      </Space>
    </div>
  );
};

export default Infrastructure;
