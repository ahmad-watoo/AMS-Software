import React, { useState } from "react";
import { Menu, Button } from "antd";
import { Link, useLocation } from "react-router-dom";
import { sideManueRoutes } from "./cardData";
import { MenuFoldOutlined, MenuUnfoldOutlined } from "@ant-design/icons";
import "./SideMenu.css";
import AdminPic from "../../../images/ahmadw2.png";
const SideMenu = () => {
  const { pathname } = useLocation(); // Track active route
  const [collapsed, setCollapsed] = useState(false); // Toggle menu collapse
  const [openKeys, setOpenKeys] = useState<string[]>([]);

  // Toggle menu collapse
  const toggleCollapse = () => {
    setCollapsed(!collapsed);
    if (collapsed) {
      setOpenKeys([]); // Close all when collapsing
    }
  };
  // Handle menu open change (only one open at a time)
  const handleOpenChange = (keys: any) => {
    setOpenKeys(keys.length > 0 ? [keys[keys.length - 1]] : []);
  };

  // Generate menu items from sideManueRoutes
  const renderMenuItems = () => {
    return sideManueRoutes.map((route) => ({
      key: route.id,
      icon: route.icon,
      label: route.name,
      children: route.subsections.map((subsection, index) => ({
        key: `${route.id}-${index}`,
        label:
          typeof subsection === "string" ? (
            subsection
          ) : (
            <Link to={`${subsection.path}`}>{subsection.sub_name}</Link>
          ),
      })),
    }));
  };
  return (
    <div className={`side-menu ${collapsed ? "collapsed" : ""}`}>
      {/* Collapse button */}
      <Button
        type="text"
        onClick={toggleCollapse}
        style={{
          position: "absolute",
          top: 10,
          left: collapsed ? 25 : 178,
          zIndex: 1,
          margin: 0,
          color: "white",
          backgroundColor: "#001529",
        }}
      >
        {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
      </Button>

      {/* Admin section (optional) */}
      {!collapsed && (
        <div className="admin-section">
          <img src={AdminPic} alt="adminpic" className="admin-pic" />
          <span className="text-white font-semibold">Ahmad</span>
        </div>
      )}

      <Menu
        mode="inline"
        theme="dark"
        inlineCollapsed={collapsed}
        selectedKeys={[pathname]}
        openKeys={openKeys} // Control open keys
        onOpenChange={handleOpenChange} // Ensure only one is open
        items={renderMenuItems()} // Use items instead of children
      />
    </div>
  );
};

export default SideMenu;
