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

interface DashboardHeaderProps {
  darkMode: boolean;
  toggleTheme: () => void;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  darkMode,
  toggleTheme,
}) => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    window.location.href = "/login";
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
      className={`flex justify-between items-center w-full px-4 shadow-md ${
        darkMode ? "bg-gray-900 text-white" : "bg-blue-300 text-black"
      }`}
    >
      {/* Left: Logo & Title */}
      <Space>
        <Avatar
          src="https://img.freepik.com/premium-photo/blue-purple-wave-that-is-white-background_1309810-40680.jpg?semt=ais_hybrid"
          size="large"
        />
        <Title level={4} className="m-0">
          Noble Grammar School
        </Title>
      </Space>

      {/* Middle: Search Bar */}
      <Input
        placeholder="Search..."
        prefix={<SearchOutlined />}
        className="w-72 rounded-md"
      />

      {/* Clock */}
      <p>
        {currentTime.toLocaleDateString()} {currentTime.toLocaleTimeString()}
      </p>

      {/* Right: Icons & Profile */}
      <Space size="large">
        <Badge count={5}>
          <BellOutlined className="text-lg cursor-pointer" />
        </Badge>

        {/* Dark Mode Toggle */}
        <Switch
          checkedChildren={<SunOutlined />}
          unCheckedChildren={<MoonOutlined />}
          checked={darkMode}
          onChange={toggleTheme}
        />

        {/* User Profile Dropdown */}
        <Dropdown menu={{ items: menuItems }} trigger={["click"]}>
          <Avatar className="cursor-pointer" icon={<UserOutlined />} />
        </Dropdown>
      </Space>
    </Header>
  );
};

export default DashboardHeader;
