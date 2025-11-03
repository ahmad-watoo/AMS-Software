import React, { useState, useEffect } from 'react';
import { Card, Descriptions, Tag, Button, Space, message, Spin } from 'antd';
import { ArrowLeftOutlined, EditOutlined } from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import hrAPI, { Employee } from '@/api/hr.api';
import PermissionGuard from '@/components/common/PermissionGuard';

const EmployeeDetail: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadEmployee(id);
    }
  }, [id]);

  const loadEmployee = async (employeeId: string) => {
    try {
      setLoading(true);
      const emp = await hrAPI.getEmployeeById(employeeId);
      setEmployee(emp);
    } catch (error: any) {
      message.error(error.message || 'Failed to load employee details');
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

  if (!employee) {
    return <Card>Employee not found</Card>;
  }

  const formatCurrency = (amount?: number) => {
    if (!amount) return '-';
    return `PKR ${amount.toLocaleString()}`;
  };

  const getEmploymentTypeTag = (type: string) => {
    const typeConfig: Record<string, { color: string; text: string }> = {
      permanent: { color: 'green', text: 'Permanent' },
      contract: { color: 'blue', text: 'Contract' },
      temporary: { color: 'orange', text: 'Temporary' },
      visiting: { color: 'purple', text: 'Visiting' },
    };
    const config = typeConfig[type] || { color: 'default', text: type };
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  return (
    <Card
      title="Employee Details"
      extra={
        <Space>
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/hr/employees')}>
            Back
          </Button>
          <PermissionGuard permission="hr" action="update">
            <Button
              type="primary"
              icon={<EditOutlined />}
              onClick={() => navigate(`/hr/employees/${id}/edit`)}
            >
              Edit
            </Button>
          </PermissionGuard>
        </Space>
      }
    >
      <Descriptions bordered column={2}>
        <Descriptions.Item label="Employee ID">{employee.employeeId}</Descriptions.Item>
        <Descriptions.Item label="User ID">{employee.userId}</Descriptions.Item>
        <Descriptions.Item label="Designation">{employee.designation}</Descriptions.Item>
        <Descriptions.Item label="Employment Type">
          {getEmploymentTypeTag(employee.employmentType)}
        </Descriptions.Item>
        <Descriptions.Item label="Qualification">{employee.qualification || '-'}</Descriptions.Item>
        <Descriptions.Item label="Specialization">{employee.specialization || '-'}</Descriptions.Item>
        <Descriptions.Item label="Joining Date">
          {new Date(employee.joiningDate).toLocaleDateString()}
        </Descriptions.Item>
        <Descriptions.Item label="Salary">{formatCurrency(employee.salary)}</Descriptions.Item>
        <Descriptions.Item label="Status">
          <Tag color={employee.isActive ? 'green' : 'red'}>
            {employee.isActive ? 'Active' : 'Inactive'}
          </Tag>
        </Descriptions.Item>
        <Descriptions.Item label="Created At">
          {new Date(employee.createdAt).toLocaleString()}
        </Descriptions.Item>
        <Descriptions.Item label="Updated At">
          {new Date(employee.updatedAt).toLocaleString()}
        </Descriptions.Item>
      </Descriptions>
    </Card>
  );
};

export default EmployeeDetail;

