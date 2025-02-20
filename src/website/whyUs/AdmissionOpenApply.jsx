import React from "react";
import { Button, Typography, Space } from "antd";
import "./style.css";

const { Title, Paragraph } = Typography;

const AdmissionOpenApply = () => {
  return (
    <div className="admissionOpen-apply-card">
      <Space
        direction="vertical"
        size="middle"
        style={{ width: "100%", textAlign: "center" }}
      >
        <Title level={2}>
          World's Leading{" "}
          <span style={{ color: "green" }}> Academy Management Software</span>
        </Title>
        <Title level={2}>
          <span style={{ color: "green" }}>Admissions</span> Open Now!
        </Title>
        <Paragraph>
          Our system offers unparalleled features to automate and streamline
          academic operations. Join us today and revolutionize your academy
          management process.
        </Paragraph>
        <Button type="primary" size="large">
          APPLY NOW!
        </Button>
      </Space>
    </div>
  );
};

export default AdmissionOpenApply;
