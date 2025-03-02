import React, { useEffect, useState } from "react";
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
  const [currentTime, setCurrentTime] = useState(new Date());
  // timer
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000); // Update every second

    return () => clearInterval(interval); // Cleanup interval on unmount
  }, []);

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
        background: "#86cb87",
        padding: "0",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
        paddingLeft: 10,
        paddingRight: 10,
      }}
    >
      {/* Left Side: Logo & Title */}
      <Space>
        <Avatar
          src="https://img.freepik.com/premium-photo/blue-purple-wave-that-is-white-background_1309810-40680.jpg?semt=ais_hybrid"
          size="large"
        />
        <Title level={4} style={{ margin: 0 }}>
          Noble Grammer School
        </Title>
      </Space>

      {/* Middle: Search Bar */}
      <Input
        placeholder="Search..."
        prefix={<SearchOutlined />}
        style={{ width: "300px", borderRadius: "5px" }}
      />
      <p className="font-sm!">
        {currentTime.toLocaleDateString()} {currentTime.toLocaleTimeString()}
      </p>
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
