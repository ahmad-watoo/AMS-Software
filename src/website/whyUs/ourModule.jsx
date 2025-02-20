import React from "react";
import { Card, Row, Col, Typography, Space } from "antd";
import AdmissionOpenApply from "./AdmissionOpenApply";
import AdminsionMS from "../images/AdminsionMS.png";
import libraryLMS from "../images/libraryLMS.png";
import administratorLMS from "../images/administratorLMS.png";
import timetableLMS from "../images/timetableLMS.png";
import studentLMS from "../images/studentLMS.png";
import financeLMS from "../images/financeLMS.png";
import learningLMS from "../images/learningLMS.png";
import examLMS from "../images/examLMS.png";
import attendanceLMS from "../images/attendanceLMS.png";
import certificationLMS from "../images/certificationLMS.png";
import hrMS from "../images/hrMS.png";
import multiCampLMS from "../images/multiCampLMS.png";
import payrolLMS from "../images/payrolLMS.png";

const { Title, Paragraph } = Typography;

const OurModule = () => {
  const cardData = [
    { id: 1, icon: AdminsionMS, name: "Admission" },
    { id: 2, icon: libraryLMS, name: "Library" },
    { id: 3, icon: administratorLMS, name: "Administration" },
    { id: 4, icon: timetableLMS, name: "Timetable" },
    { id: 5, icon: studentLMS, name: "Student Management" },
    { id: 6, icon: financeLMS, name: "Finance" },
    { id: 7, icon: learningLMS, name: "Learning" },
    { id: 8, icon: examLMS, name: "Exams" },
    { id: 9, icon: attendanceLMS, name: "Attendance" },
    { id: 10, icon: certificationLMS, name: "Certifications" },
    { id: 11, icon: hrMS, name: "HR Management" },
    { id: 12, icon: multiCampLMS, name: "Multi-Campus" },
    { id: 13, icon: payrolLMS, name: "Payroll" },
  ];

  return (
    <div
      style={{
        padding: "20px 50px", // Added padding for left and right sides
        backgroundColor: "#f5f5f5",
      }}
    >
      <Space direction="vertical" size="large" style={{ width: "100%" }}>
        <div style={{ textAlign: "center" }}>
          <Title level={2}>
            Top Academy Management{" "}
            <span style={{ color: "green" }}>Modules</span>
          </Title>
          <Paragraph>
            Our robust academy management system comes equipped with a wide
            range of modules designed to simplify your day-to-day operations.
            With features like student management, finance, HR, and more, our
            solution enables streamlined communication and efficiency across the
            board.
          </Paragraph>
        </div>

        <Row gutter={[10, 10]} justify="center">
          {cardData.map((item) => (
            <Col xs={24} sm={12} md={8} lg={8} xl={6} key={item.id}>
              <Card
                hoverable
                style={{
                  textAlign: "center",
                  padding: "6px", // Adds padding around the card content
                }}
                cover={
                  <img
                    alt={item.name}
                    src={item.icon}
                    style={{
                      width: "100%", // Smaller icon size
                      height: "80px",
                      objectFit: "contain",
                      marginBottom: "5px",
                    }}
                  />
                }
              >
                <Title level={4}>{item.name}</Title>
                <Paragraph>Manage {item.name} with ease</Paragraph>{" "}
                {/* Changed paragraph text */}
              </Card>
            </Col>
          ))}
        </Row>

        <AdmissionOpenApply />
      </Space>
    </div>
  );
};

export default OurModule;
