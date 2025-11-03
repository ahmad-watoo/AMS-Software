import React, { useState, useEffect } from 'react';
import { Card, DatePicker, Space, Button, Table, Statistic, Row, Col, message } from 'antd';
import { FileExcelOutlined, PrinterOutlined, DollarOutlined } from '@ant-design/icons';
import financeAPI, { FinancialReport as Report } from '@/api/finance.api';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;

const FinancialReport: React.FC = () => {
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | undefined>([
    dayjs().startOf('month'),
    dayjs().endOf('month'),
  ]);

  useEffect(() => {
    if (dateRange) {
      fetchReport();
    }
  }, [dateRange]);

  const fetchReport = async () => {
    if (!dateRange) return;

    setLoading(true);
    try {
      const response = await financeAPI.getFinancialReport({
        startDate: dateRange[0].format('YYYY-MM-DD'),
        endDate: dateRange[1].format('YYYY-MM-DD'),
      });
      setReport(response);
    } catch (error: any) {
      message.error(error.message || 'Failed to fetch financial report');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return `PKR ${amount.toLocaleString()}`;
  };

  const breakdownColumns = [
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount: number) => formatCurrency(amount),
    },
    {
      title: 'Percentage',
      dataIndex: 'percentage',
      key: 'percentage',
      render: (percentage: number) => `${percentage.toFixed(2)}%`,
    },
  ];

  return (
    <Space direction="vertical" style={{ width: '100%' }} size="large">
      <Card>
        <Space style={{ width: '100%', justifyContent: 'space-between', flexWrap: 'wrap' }}>
          <RangePicker
            value={dateRange}
            onChange={(dates) => setDateRange(dates as [dayjs.Dayjs, dayjs.Dayjs] | undefined)}
            format="YYYY-MM-DD"
          />
          <Space>
            <Button
              icon={<FileExcelOutlined />}
              onClick={() => message.info('Export feature coming soon')}
            >
              Export Excel
            </Button>
            <Button
              icon={<PrinterOutlined />}
              onClick={() => message.info('Print feature coming soon')}
            >
              Print
            </Button>
          </Space>
        </Space>
      </Card>

      {report && (
        <>
          <Row gutter={16}>
            <Col span={6}>
              <Card>
                <Statistic
                  title="Total Revenue"
                  value={report.totalRevenue}
                  prefix={<DollarOutlined />}
                  formatter={(value) => formatCurrency(Number(value))}
                  valueStyle={{ color: '#3f8600' }}
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card>
                <Statistic
                  title="Total Expenses"
                  value={report.totalExpenses}
                  prefix={<DollarOutlined />}
                  formatter={(value) => formatCurrency(Number(value))}
                  valueStyle={{ color: '#cf1322' }}
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card>
                <Statistic
                  title="Net Income"
                  value={report.netIncome}
                  prefix={<DollarOutlined />}
                  formatter={(value) => formatCurrency(Number(value))}
                  valueStyle={{ color: report.netIncome >= 0 ? '#3f8600' : '#cf1322' }}
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card>
                <Statistic
                  title="Pending Fees"
                  value={report.pendingFees}
                  prefix={<DollarOutlined />}
                  formatter={(value) => formatCurrency(Number(value))}
                  valueStyle={{ color: '#faad14' }}
                />
              </Card>
            </Col>
          </Row>

          <Card title="Revenue Breakdown" loading={loading}>
            <Table
              columns={breakdownColumns}
              dataSource={report.breakdown}
              rowKey="category"
              pagination={false}
              size="small"
            />
          </Card>

          <Card title="Report Period" loading={loading}>
            <p>
              <strong>Period:</strong> {report.reportPeriod}
            </p>
            <p>
              <strong>Fee Collections:</strong> {formatCurrency(report.feeCollections)}
            </p>
          </Card>
        </>
      )}
    </Space>
  );
};

export default FinancialReport;

