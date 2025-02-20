import React from "react";
import { Card, Row, Col, Typography } from "antd";
import AboutschoolVideo from "./AboutschoolVideo";
import AboutschoolFacts from "./AboutschoolFacts";

const { Title, Paragraph } = Typography;

const cardData = [
  {
    id: 1,
    icon: "cloud1.jpg",
    name: "Cloud-Based Accessibility",
    text: "Access your school management software seamlessly from anywhere with an internet connection.",
  },
  {
    id: 2,
    icon: "whatsapp.jpeg",
    name: "Enhanced Communication with WhatsApp Integration",
    text: "Leverage WhatsApp to send reports and other important information in media format.",
  },
  {
    id: 3,
    icon: "multiCampus.jpeg",
    name: "Multi-Campus Management",
    text: "Efficiently manage multiple school campuses within a single platform.",
  },
  {
    id: 4,
    icon: "ruleBase.png",
    name: "Role-Based Access Control",
    text: "Assign appropriate permissions to administrators, teachers, parents, and students for secure access.",
  },
  {
    id: 5,
    icon: "payment.png",
    name: "Convenient Digital Payments",
    text: "Accept fee payments through popular digital wallets and online banking channels.",
  },
  {
    id: 6,
    icon: "highperformance.jpeg",
    name: "High-Performance Infrastructure",
    text: "Experience lightning-fast performance and reliability with our cutting-edge server technology.",
  },
  {
    id: 7,
    icon: "accounting.png",
    name: "Comprehensive Financial Management",
    text: "Streamline your school's accounting processes with our robust financial tools.",
  },
  {
    id: 8,
    icon: "biomatric.jpeg", // Updated to UserOutlined for attendance
    name: "Biometric Attendance Tracking",
    text: "Ensure accurate attendance records using biometric technology for teachers, volunteers, and students.",
  },
  {
    id: 9,
    icon: "reporting.jpeg",
    name: "User-Friendly Reporting",
    text: "Generate insightful reports on finances, attendance, and other key metrics with ease.",
  },
  {
    id: 10,
    icon: "notify.png",
    name: "Real-Time Notifications",
    text: "Keep parents, staff, and administrators informed with timely SMS alerts.",
  },
  {
    id: 11,
    icon: "setting.jpeg",
    name: "Tailored Customization",
    text: "Adapt the system to your specific needs and preferences through flexible customization options.",
  },
];

const About = () => {
  return (
    <div style={{ background: "#f5f5f5", padding: "20px" }}>
      <Row justify="center" gutter={[16, 16]}>
        <Col span={24} style={{ textAlign: "center" }}>
          <Title level={2}>
            We Provide You the Best{" "}
            <span style={{ color: "green" }}>Features</span>
          </Title>
          <Paragraph>
            Our free school management system manages everything starting from
            admission to attendance and exams to result cards & certification.
          </Paragraph>
        </Col>
      </Row>

      <Row gutter={[16, 16]} justify="center">
        {cardData.map((item) => (
          <Col xs={24} sm={12} md={8} lg={6} key={item.id}>
            <Card
              hoverable
              cover={
                <img
                  src={require(`../images/${item.icon}`)}
                  alt={item.name}
                  style={{ height: "200px", objectFit: "cover" }}
                />
              }
            >
              <Card.Meta
                title={item.name.toUpperCase()}
                description={item.text}
              />
            </Card>
          </Col>
        ))}
      </Row>

      {/* Include video and facts section */}
      <AboutschoolVideo />
      <AboutschoolFacts />
    </div>
  );
};

export default About;
