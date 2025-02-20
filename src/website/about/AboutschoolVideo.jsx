import React from "react";
import {
  AudioMutedOutlined,
  WifiOutlined,
  FlagOutlined,
} from "@ant-design/icons";
import { Row, Col, Typography, Card } from "antd";

const { Title, Paragraph } = Typography;

const AboutschoolVideo = () => {
  return (
    <div style={{ padding: "20px" }}>
      <Row gutter={[16, 16]} justify="center">
        <Col span={24} style={{ textAlign: "center" }}>
          <Title level={2}>
            Our software with demo <span style={{ color: "green" }}>video</span>
          </Title>
          <Paragraph>
            Curious about <span style={{ color: "green" }}>AMS</span>? Our demo
            video provides a visual overview of its features and capabilities.
            Watch now to see how it can benefit your business.
          </Paragraph>
        </Col>
        <Col xs={24} lg={12}>
          <iframe
            width="100%"
            height="300"
            src="https://www.youtube.com/embed/-t29Ppog9Qs"
            title="YouTube video"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        </Col>
        <Col xs={24} lg={12}>
          <Card>
            <Paragraph>
              See our software in action! Watch our demo video to discover how
              [AMS] can streamline your workflow and [mention a key benefit].
            </Paragraph>
            <ul>
              <li>
                <AudioMutedOutlined /> <span>Lorem ipsum dolor sit amet.</span>
              </li>
              <li>
                <WifiOutlined />{" "}
                <span>
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                </span>
              </li>
              <li>
                <FlagOutlined /> <span>Lorem ipsum dolor sit amet.</span>
              </li>
            </ul>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default AboutschoolVideo;
