import React, { useState } from "react";
import {
  Layout,
  Avatar,
  Dropdown,
  Input,
  Badge,
  Switch,
  Typography,
  Space,
} from "antd";
import {
  BellOutlined,
  UserOutlined,
  LogoutOutlined,
  SearchOutlined,
  MoonOutlined,
  SunOutlined,
} from "@ant-design/icons";

const { Header } = Layout;
const { Title } = Typography;

const DashboardHeader: React.FC = () => {
  const [darkMode, setDarkMode] = useState(false);

  const handleLogout = () => {
    console.log("Logout Clicked!");
    // Implement logout logic
  };

  const menuItems = [
    { key: "1", label: "Profile", icon: <UserOutlined /> },
    {
      key: "2",
      label: "Logout",
      icon: <LogoutOutlined />,
      onClick: handleLogout,
    },
  ];

  return (
    <Header
      style={{
        background: "#fff",
        padding: "0",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
      }}
    >
      {/* Left Side: Logo & Title */}
      <Space>
        <Avatar src="https://via.placeholder.com/40" size="large" />
        <Title level={4} style={{ margin: 0 }}>
          Academy Management system 00
        </Title>
      </Space>

      {/* Middle: Search Bar */}
      <Input
        placeholder="Search..."
        prefix={<SearchOutlined />}
        style={{ width: "300px", borderRadius: "5px" }}
      />

      {/* Right Side: Icons & Profile */}
      <Space size="large">
        {/* Notifications Bell */}
        <Badge count={5}>
          <BellOutlined style={{ fontSize: "20px", cursor: "pointer" }} />
        </Badge>

        {/* Dark Mode Toggle */}
        <Switch
          checkedChildren={<SunOutlined />}
          unCheckedChildren={<MoonOutlined />}
          checked={darkMode}
          onChange={() => setDarkMode(!darkMode)}
        />

        {/* User Profile Dropdown */}
        <Dropdown menu={{ items: menuItems }} trigger={["click"]}>
          <Avatar style={{ cursor: "pointer" }} icon={<UserOutlined />} />
        </Dropdown>
      </Space>
    </Header>
  );
};

export default DashboardHeader;
