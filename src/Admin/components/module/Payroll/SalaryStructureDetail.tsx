import React, { useState, useEffect } from 'react';
import { Card, Descriptions, Tag, Button, Space, message, Spin } from 'antd';
import { ArrowLeftOutlined, EditOutlined } from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import payrollAPI, { SalaryStructure } from '@/api/payroll.api';
import PermissionGuard from '@/components/common/PermissionGuard';

const SalaryStructureDetail: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [structure, setStructure] = useState<SalaryStructure | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadStructure(id);
    }
  }, [id]);

  const loadStructure = async (structureId: string) => {
    try {
      setLoading(true);
      const str = await payrollAPI.getSalaryStructureById(structureId);
      setStructure(str);
    } catch (error: any) {
      message.error(error.message || 'Failed to load salary structure details');
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

  if (!structure) {
    return <Card>Salary structure not found</Card>;
  }

  const formatCurrency = (amount: number) => {
    return `PKR ${amount.toLocaleString()}`;
  };

  return (
    <Card
      title="Salary Structure Details"
      extra={
        <Space>
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/payroll/salary-structures')}>
            Back
          </Button>
          <PermissionGuard permission="payroll" action="update">
            <Button
              type="primary"
              icon={<EditOutlined />}
              onClick={() => navigate(`/payroll/salary-structures/${id}/edit`)}
            >
              Edit
            </Button>
          </PermissionGuard>
        </Space>
      }
    >
      <Descriptions bordered column={2}>
        <Descriptions.Item label="Employee ID">{structure.employeeId}</Descriptions.Item>
        <Descriptions.Item label="Status">
          <Tag color={structure.isActive ? 'green' : 'red'}>
            {structure.isActive ? 'Active' : 'Inactive'}
          </Tag>
        </Descriptions.Item>
        <Descriptions.Item label="Effective Date">
          {new Date(structure.effectiveDate).toLocaleDateString()}
        </Descriptions.Item>
        <Descriptions.Item label="Created At">
          {new Date(structure.createdAt).toLocaleString()}
        </Descriptions.Item>
      </Descriptions>

      <Card title="Salary Breakdown" style={{ marginTop: 16 }}>
        <Descriptions bordered column={2}>
          <Descriptions.Item label="Basic Salary">{formatCurrency(structure.basicSalary)}</Descriptions.Item>
          <Descriptions.Item label="Gross Salary">{formatCurrency(structure.grossSalary)}</Descriptions.Item>
          <Descriptions.Item label="House Rent Allowance">
            {formatCurrency(structure.houseRentAllowance || 0)}
          </Descriptions.Item>
          <Descriptions.Item label="Medical Allowance">
            {formatCurrency(structure.medicalAllowance || 0)}
          </Descriptions.Item>
          <Descriptions.Item label="Transport Allowance">
            {formatCurrency(structure.transportAllowance || 0)}
          </Descriptions.Item>
          <Descriptions.Item label="Other Allowances">
            {formatCurrency(structure.otherAllowances || 0)}
          </Descriptions.Item>
          <Descriptions.Item label="Provident Fund">
            {formatCurrency(structure.providentFund || 0)}
          </Descriptions.Item>
          <Descriptions.Item label="Tax Deduction">
            {formatCurrency(structure.taxDeduction || 0)}
          </Descriptions.Item>
          <Descriptions.Item label="Other Deductions">
            {formatCurrency(structure.otherDeductions || 0)}
          </Descriptions.Item>
          <Descriptions.Item label="Net Salary" span={2}>
            <strong style={{ fontSize: '18px', color: '#1890ff' }}>
              {formatCurrency(structure.netSalary)}
            </strong>
          </Descriptions.Item>
        </Descriptions>
      </Card>
    </Card>
  );
};

export default SalaryStructureDetail;

