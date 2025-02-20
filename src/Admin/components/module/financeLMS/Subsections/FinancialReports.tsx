import React, { useState } from "react";
import { Card, Table, Statistic, Row, Col } from "antd";
import { ArrowUpOutlined, ArrowDownOutlined } from "@ant-design/icons";
import { Line } from "@ant-design/plots";

const FinancialReports: React.FC = () => {
  // Sample financial data
  const [financialData] = useState([
    { date: "2024-01", revenue: 5000, expenses: 3000 },
    { date: "2024-02", revenue: 6000, expenses: 3500 },
    { date: "2024-03", revenue: 7000, expenses: 4000 },
    { date: "2024-04", revenue: 7500, expenses: 4500 },
    { date: "2024-05", revenue: 8000, expenses: 5000 },
  ]);

  const totalRevenue = financialData.reduce(
    (sum, record) => sum + record.revenue,
    0
  );
  const totalExpenses = financialData.reduce(
    (sum, record) => sum + record.expenses,
    0
  );
  const netProfit = totalRevenue - totalExpenses;

  const chartConfig = {
    data: financialData.flatMap((item) => [
      { date: item.date, value: item.revenue, category: "Revenue" },
      { date: item.date, value: item.expenses, category: "Expenses" },
    ]),
    xField: "date",
    yField: "value",
    seriesField: "category",
    color: ["#52c41a", "#ff4d4f"],
  };

  const columns = [
    { title: "Month", dataIndex: "date", key: "date" },
    { title: "Revenue ($)", dataIndex: "revenue", key: "revenue" },
    { title: "Expenses ($)", dataIndex: "expenses", key: "expenses" },
  ];

  return (
    <div style={{ padding: 20 }}>
      <Row gutter={16}>
        <Col span={8}>
          <Card>
            <Statistic
              title="Total Revenue"
              value={totalRevenue}
              precision={2}
              valueStyle={{ color: "#52c41a" }}
              prefix={<ArrowUpOutlined />}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="Total Expenses"
              value={totalExpenses}
              precision={2}
              valueStyle={{ color: "#ff4d4f" }}
              prefix={<ArrowDownOutlined />}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="Net Profit"
              value={netProfit}
              precision={2}
              valueStyle={{ color: netProfit >= 0 ? "#52c41a" : "#ff4d4f" }}
            />
          </Card>
        </Col>
      </Row>
      <Card style={{ marginTop: 20 }}>
        <Line {...chartConfig} />
      </Card>
      <Card title="Financial Transactions" style={{ marginTop: 20 }}>
        <Table dataSource={financialData} columns={columns} rowKey="date" />
      </Card>
    </div>
  );
};

export default FinancialReports;
