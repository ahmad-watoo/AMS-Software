import React, { useState } from "react";
import { Menu, Button } from "antd";
import { Link, useLocation } from "react-router-dom";
import { sideManueRoutes } from "./cardData";
import { MenuFoldOutlined, MenuUnfoldOutlined } from "@ant-design/icons";
import "./SideMenu.css";

const SideMenu = () => {
  const { pathname } = useLocation(); // to track the active route
  const [collapsed, setCollapsed] = useState(false); // to toggle menu collapse

  // Toggle menu collapse
  const toggleCollapse = () => {
    setCollapsed(!collapsed);
  };

  // Generate menu items from protectedRoutes
  // const renderMenuItems = () => {
  //   return sideManueRoutes.map((route) => (
  //     <Menu.SubMenu key={route.id} icon={route.icon} title={route.name}>
  //       {route.subsections.map((subsection, index) =>
  //         typeof subsection === "string" ? (
  //           <Menu.Item key={`${route.id}-${index}`}>{subsection}</Menu.Item>
  //         ) : (
  //           <Menu.Item
  //             key={`${route.id}-${index}`}
  //             // icon={subsection.icon}
  //           >
  //             <Link to={subsection.path}>{subsection.sub_name}</Link>
  //           </Menu.Item>
  //         )
  //       )}
  //     </Menu.SubMenu>
  //   ));
  // };
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
          <img
            src="https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png"
            alt="adminpic"
            className="admin-pic"
          />
          <span>Ahmad</span>
        </div>
      )}

      {/* AntD Menu */}
      {/* <Menu
        mode="inline"
        theme="dark"
        inlineCollapsed={collapsed}
        selectedKeys={[pathname]}
        defaultOpenKeys={["1", "2"]} // auto expand some menus on load
      >
      </Menu> */}
      {/* {renderMenuItems()} */}
      <Menu
        mode="inline"
        theme="dark"
        inlineCollapsed={collapsed}
        selectedKeys={[pathname]}
        items={renderMenuItems()} // Use items instead of children
      />
    </div>
  );
};

export default SideMenu;
