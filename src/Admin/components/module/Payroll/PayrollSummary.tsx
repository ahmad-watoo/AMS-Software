import React, { useState, useEffect } from 'react';
import { Card, DatePicker, Space, Row, Col, Statistic, message } from 'antd';
import { DollarOutlined, UserOutlined, CheckCircleOutlined, ClockCircleOutlined } from '@ant-design/icons';
import payrollAPI, { PayrollSummary as Summary } from '@/api/payroll.api';
import dayjs from 'dayjs';

const { MonthPicker } = DatePicker;

const PayrollSummary: React.FC = () => {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(false);
  const [period, setPeriod] = useState<string>(dayjs().format('YYYY-MM'));

  useEffect(() => {
    fetchSummary();
  }, [period]);

  const fetchSummary = async () => {
    setLoading(true);
    try {
      const response = await payrollAPI.getPayrollSummary({
        payrollPeriod: period,
      });
      setSummary(response);
    } catch (error: any) {
      message.error(error.message || 'Failed to fetch payroll summary');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return `PKR ${amount.toLocaleString()}`;
  };

  return (
    <Space direction="vertical" style={{ width: '100%' }} size="large">
      <Card>
        <Space>
          <MonthPicker
            value={dayjs(period)}
            format="YYYY-MM"
            onChange={(date) => setPeriod(date ? date.format('YYYY-MM') : dayjs().format('YYYY-MM'))}
          />
        </Space>
      </Card>

      {summary && (
        <Row gutter={16}>
          <Col span={6}>
            <Card>
              <Statistic
                title="Total Employees"
                value={summary.totalEmployees}
                prefix={<UserOutlined />}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Total Gross Salary"
                value={summary.totalGrossSalary}
                prefix={<DollarOutlined />}
                formatter={(value) => formatCurrency(Number(value))}
                valueStyle={{ color: '#3f8600' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Total Deductions"
                value={summary.totalDeductions}
                prefix={<DollarOutlined />}
                formatter={(value) => formatCurrency(Number(value))}
                valueStyle={{ color: '#cf1322' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Total Net Salary"
                value={summary.totalNetSalary}
                prefix={<DollarOutlined />}
                formatter={(value) => formatCurrency(Number(value))}
                valueStyle={{ color: '#3f8600' }}
              />
            </Card>
          </Col>
        </Row>
      )}

      {summary && (
        <Row gutter={16}>
          <Col span={6}>
            <Card>
              <Statistic
                title="Total Tax"
                value={summary.totalTax}
                prefix={<DollarOutlined />}
                formatter={(value) => formatCurrency(Number(value))}
                valueStyle={{ color: '#faad14' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Processed Employees"
                value={summary.processedEmployees}
                prefix={<CheckCircleOutlined />}
                valueStyle={{ color: '#3f8600' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Pending Employees"
                value={summary.pendingEmployees}
                prefix={<ClockCircleOutlined />}
                valueStyle={{ color: '#faad14' }}
              />
            </Card>
          </Col>
        </Row>
      )}
    </Space>
  );
};

export default PayrollSummary;

