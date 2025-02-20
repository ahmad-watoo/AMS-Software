import React from "react";
import {
  UsergroupAddOutlined,
  TeamOutlined,
  DashboardOutlined,
  DesktopOutlined,
  CrownOutlined,
  TrophyOutlined,
} from "@ant-design/icons";
import { Row, Col, Typography, Card } from "antd";
import "./about.css"; // Minimal CSS for background and layout

const { Title, Paragraph } = Typography;

const cardData = [
  {
    id: 1,
    icon: (
      <UsergroupAddOutlined style={{ fontSize: "50px", color: "#4CAF50" }} />
    ),
    numberOfRecords: 1500,
    name: "Total Students Enrolled",
  },
  {
    id: 2,
    icon: <TeamOutlined style={{ fontSize: "50px", color: "#4CAF50" }} />,
    numberOfRecords: 80,
    name: "Experienced Instructors",
  },
  {
    id: 3,
    icon: <DashboardOutlined style={{ fontSize: "50px", color: "#4CAF50" }} />,
    numberOfRecords: 100,
    name: "Courses Available",
  },
  {
    id: 4,
    icon: <DesktopOutlined style={{ fontSize: "50px", color: "#4CAF50" }} />,
    numberOfRecords: 30,
    name: "Advanced Facilities",
  },
  {
    id: 5,
    icon: <CrownOutlined style={{ fontSize: "50px", color: "#4CAF50" }} />,
    numberOfRecords: 15,
    name: "Awards Won",
  },
  {
    id: 6,
    icon: <TrophyOutlined style={{ fontSize: "50px", color: "#4CAF50" }} />,
    numberOfRecords: 90,
    name: "Success Stories",
  },
];

const AboutschoolFacts = () => {
  return (
    <div className="facts-section">
      <Row justify="center">
        <Col span={24} style={{ textAlign: "center" }}>
          <Title style={{ color: "white" }}>
            Key <span style={{ color: "green" }}>Facts</span> for Academy Owners
          </Title>
          <Paragraph style={{ color: "white" }}>
            Discover how our software can transform your academy's management
            and elevate the learning experience for your students.
          </Paragraph>
        </Col>
        <Col span={24}>
          <Row gutter={[16, 16]} justify="center">
            {cardData.map((item) => (
              <Col xs={24} sm={12} md={8} lg={4} key={item.id}>
                <Card bordered hoverable className="fact-card">
                  <div className="card-content">
                    <div className="icon-container">{item.icon}</div>
                    <Title level={3}>{item.numberOfRecords}</Title>
                    <Paragraph>{item.name}</Paragraph>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        </Col>
      </Row>
    </div>
  );
};

export default AboutschoolFacts;
