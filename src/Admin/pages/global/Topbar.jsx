import React, { useContext } from "react";
import { Layout, Input, Button } from "antd";
import {
  SearchOutlined,
  BellOutlined,
  SettingOutlined,
  UserOutlined,
  BulbOutlined,
  MoonOutlined,
} from "@ant-design/icons";
import { ColorModeContext } from "../../theme"; // Keep your existing context
const { Header } = Layout;

function Topbar() {
  const colorMode = useContext(ColorModeContext);
  const isDarkMode = colorMode.isDark; // assuming you have `isDark` in your ColorModeContext

  return (
    <Header
      style={{
        display: "flex",
        justifyContent: "space-between",
        padding: "0 16px",
      }}
    >
      {/* SEARCH BAR */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          backgroundColor: "#f0f0f0",
          borderRadius: "3px",
          padding: "0 8px",
        }}
      >
        <Input
          placeholder="Search"
          bordered={false}
          style={{ width: 200 }} // adjust width as needed
        />
        <Button type="text" icon={<SearchOutlined />} />
      </div>

      {/* ICONS */}
      <div style={{ display: "flex", alignItems: "center", color: "white" }}>
        <Button type="text" onClick={colorMode.toggleColorMode}>
          {isDarkMode ? <MoonOutlined /> : <BulbOutlined />}
        </Button>
        <Button type="text" icon={<BellOutlined />} />
        <Button type="text" icon={<SettingOutlined />} />
        <Button type="text" icon={<UserOutlined />} />
      </div>
    </Header>
  );
}

export default Topbar;
