import React, { useEffect, useMemo, useState } from 'react';
import {
  Card,
  Table,
  Space,
  Button,
  Tag,
  Statistic,
  Row,
  Col,
  Drawer,
  List,
  Empty,
  message,
  Skeleton,
  Typography,
} from 'antd';
import {
  SafetyCertificateOutlined,
  UnlockOutlined,
  UserSwitchOutlined,
  PlusOutlined,
  ReloadOutlined,
  ArrowRightOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { rbacAPI, Role, Permission } from '@/api/rbac.api';
import { route } from '../../../../routes/constant';
import PermissionGuard from '@/components/common/PermissionGuard';

const RolePermissions: React.FC = () => {
  const navigate = useNavigate();
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [rolePermissions, setRolePermissions] = useState<Permission[]>([]);
  const [roleLoading, setRoleLoading] = useState(false);

  const loadRoles = async () => {
    try {
      setLoading(true);
      const [rolesResponse, permResponse] = await Promise.all([rbacAPI.getRoles(), rbacAPI.getPermissions()]);
      setRoles(rolesResponse);
      setPermissions(permResponse);
    } catch (error: any) {
      message.error(error.message || 'Failed to load role directory');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRoles();
  }, []);

  const summary = useMemo(() => {
    const total = roles.length;
    const criticalRoles = roles.filter((role) => role.level <= 2).length;
    const totalPermissions = permissions.length;
    return { total, criticalRoles, totalPermissions };
  }, [roles, permissions]);

  const columns = [
    {
      title: 'Role',
      dataIndex: 'name',
      key: 'name',
      render: (name: string) => <span style={{ fontWeight: 600 }}>{name}</span>,
    },
    {
      title: 'Level',
      dataIndex: 'level',
      key: 'level',
      render: (level: number) => <Tag color={level <= 2 ? 'red' : level <= 4 ? 'orange' : 'blue'}>Level {level}</Tag>,
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: Role) => (
        <Space>
          <Button type="link" onClick={() => handleOpenDrawer(record)}>
            View Permissions
          </Button>
        </Space>
      ),
    },
  ];

  const handleOpenDrawer = async (role: Role) => {
    setSelectedRole(role);
    setDrawerVisible(true);
    try {
      setRoleLoading(true);
      const permissionsResponse = await rbacAPI.getRolePermissions(role.id);
      setRolePermissions(permissionsResponse);
    } catch (error: any) {
      message.error(error.message || 'Failed to load role permissions');
    } finally {
      setRoleLoading(false);
    }
  };

  return (
    <div style={{ padding: 24 }}>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <Card bordered={false} style={{ borderRadius: 16 }}>
          <Row gutter={[16, 16]} align="middle">
            <Col xs={24} md={16}>
              <Space size="large" align="center">
                <SafetyCertificateOutlined style={{ fontSize: 40, color: '#1677ff' }} />
                <div>
                  <Typography.Title level={3} style={{ marginBottom: 0 }}>
                    Role & Permission Overview
                  </Typography.Title>
                  <Typography.Text type="secondary">
                    Monitor access control and manage capabilities across the platform.
                  </Typography.Text>
                </div>
              </Space>
            </Col>
            <Col xs={24} md={8}>
              <Space style={{ justifyContent: 'flex-end', width: '100%' }}>
                <Button icon={<ReloadOutlined />} onClick={loadRoles}>
                  Refresh
                </Button>
                <PermissionGuard permission="rbac" action="create">
                  <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/rbac/roles/new')}>
                    Create Role
                  </Button>
                </PermissionGuard>
              </Space>
            </Col>
          </Row>
        </Card>

        <Row gutter={[16, 16]}>
          <Col xs={24} md={8}>
            <Card bordered={false} style={{ borderRadius: 12, background: '#f0f5ff' }}>
              <Statistic title="Roles" value={summary.total} prefix={<UserSwitchOutlined />} />
            </Card>
          </Col>
          <Col xs={24} md={8}>
            <Card bordered={false} style={{ borderRadius: 12, background: '#fff7e6' }}>
              <Statistic title="Critical Roles" value={summary.criticalRoles} prefix={<UnlockOutlined />} />
            </Card>
          </Col>
          <Col xs={24} md={8}>
            <Card bordered={false} style={{ borderRadius: 12, background: '#f6ffed' }}>
              <Statistic title="Permissions" value={summary.totalPermissions} prefix={<SafetyCertificateOutlined />} />
            </Card>
          </Col>
        </Row>

        <Card
          bordered={false}
          style={{ borderRadius: 12 }}
          title="Role Directory"
          extra={
            <Space>
              <Button type="link" icon={<ArrowRightOutlined />} onClick={() => navigate(route.ADMINISTRATION_ROLES_PERMISSIONS)}>
                Manage Roles
              </Button>
            </Space>
          }
        >
          {loading ? (
            <Skeleton active paragraph={{ rows: 6 }} />
          ) : roles.length === 0 ? (
            <Empty description="No roles defined" />
          ) : (
            <Table rowKey={(record) => record.id} columns={columns} dataSource={roles} pagination={{ pageSize: 10 }} />
          )}
        </Card>
      </Space>

      <Drawer
        width={480}
        title={selectedRole ? `${selectedRole.name} Permissions` : 'Role Permissions'}
        open={drawerVisible}
        onClose={() => {
          setDrawerVisible(false);
          setSelectedRole(null);
          setRolePermissions([]);
        }}
      >
        {roleLoading ? (
          <Skeleton active paragraph={{ rows: 6 }} />
        ) : rolePermissions.length === 0 ? (
          <Empty description="No permissions assigned" />
        ) : (
          <List
            dataSource={rolePermissions}
            renderItem={(permission) => (
              <List.Item>
                <Space direction="vertical" size={0}>
                  <span style={{ fontWeight: 600 }}>{permission.name}</span>
                  <Typography.Text type="secondary">{permission.module} • {permission.action}</Typography.Text>
                  {permission.description && <Typography.Text>{permission.description}</Typography.Text>}
                </Space>
              </List.Item>
            )}
          />
        )}
      </Drawer>
    </div>
  );
};

export default RolePermissions;
