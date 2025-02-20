import React, { useState, useEffect } from "react";
import logo from "../images/logo.png";
import { Link } from "react-router-dom";
import { Col, Row, Drawer, Button } from "antd";
import {
  MenuOutlined,
  FacebookOutlined,
  TwitterOutlined,
  InstagramOutlined,
} from "@ant-design/icons";
import "./header.css";

const Header = () => {
  const [isSticky, setIsSticky] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);

  // Handle sticky header on scroll
  const handleScroll = () => {
    setIsSticky(window.scrollY > 100);
  };

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const currentPath = window.location.pathname;

  // Drawer handlers for mobile
  const showDrawer = () => setDrawerVisible(true);
  const closeDrawer = () => setDrawerVisible(false);

  return (
    <div className={`websiteBlog-header ${isSticky ? "fixed-header" : ""}`}>
      <Row
        justify="space-between"
        align="middle"
        className="header-container"
        gutter={16}
      >
        {/* Logo Section */}
        <Col xs={18} sm={6} md={6} lg={6} xl={6}>
          <Link to="/">
            <img src={logo} alt="logo" width="60px" height="60px" />
          </Link>
        </Col>

        {/* Desktop Navigation Links (Hidden on Mobile) */}
        <Col xs={0} sm={12} md={12} lg={12} xl={12} className="desktop-nav">
          <ul className="header-nav-link">
            <li className="header-nav-list">
              <Link
                to="/"
                className={`nav-link ${currentPath === "/" ? "active" : ""}`}
              >
                Home
              </Link>
            </li>
            <li className="header-nav-list">
              <Link
                to="/about"
                className={`nav-link ${
                  currentPath === "/about" ? "active" : ""
                }`}
              >
                About
              </Link>
            </li>
            <li className="header-nav-list">
              <Link
                to="/teachers"
                className={`nav-link ${
                  currentPath === "/teachers" ? "active" : ""
                }`}
              >
                Teachers
              </Link>
            </li>
            <li className="header-nav-list">
              <Link
                to="/courses"
                className={`nav-link ${
                  currentPath === "/courses" ? "active" : ""
                }`}
              >
                Courses
              </Link>
            </li>
            <li className="header-nav-list">
              <Link
                to="/whyUs"
                className={`nav-link ${
                  currentPath === "/whyUs" ? "active" : ""
                }`}
              >
                whyUs
              </Link>
            </li>
            <li className="header-nav-list">
              <Link
                to="/views"
                className={`nav-link ${
                  currentPath === "/views" ? "active" : ""
                }`}
              >
                Views
              </Link>
            </li>
          </ul>
        </Col>

        {/* Social Icons for Larger Screens */}
        <Col
          xs={0}
          sm={6}
          md={6}
          lg={6}
          xl={6}
          className="desktop-social-icons"
        >
          <div className="social-icons">
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              <FacebookOutlined
                style={{ fontSize: "24px", color: "#3b5998" }}
              />
            </a>
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              <TwitterOutlined
                style={{ fontSize: "24px", color: "#1da1f2", margin: "0 10px" }}
              />
            </a>
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              <InstagramOutlined
                style={{ fontSize: "24px", color: "#e4405f" }}
              />
            </a>
          </div>
        </Col>

        {/* Mobile Menu Button (Only visible on mobile) */}
        <Col xs={6} sm={0} md={0} lg={0} xl={0} className="mobile-nav">
          <Button type="primary" icon={<MenuOutlined />} onClick={showDrawer} />
        </Col>
      </Row>

      {/* Drawer for Mobile Navigation */}
      <Drawer
        title="Menu"
        placement="right"
        onClose={closeDrawer}
        visible={drawerVisible}
        className="mobile-drawer"
      >
        <ul className="drawer-nav-link">
          <li className="drawer-nav-list">
            <Link
              to="/"
              className={`nav-link ${currentPath === "/" ? "active" : ""}`}
              onClick={closeDrawer}
            >
              Home
            </Link>
          </li>
          <li className="drawer-nav-list">
            <Link
              to="/about"
              className={`nav-link ${currentPath === "/about" ? "active" : ""}`}
              onClick={closeDrawer}
            >
              About
            </Link>
          </li>
          <li className="drawer-nav-list">
            <Link
              to="/teachers"
              className={`nav-link ${
                currentPath === "/teachers" ? "active" : ""
              }`}
              onClick={closeDrawer}
            >
              Teachers
            </Link>
          </li>
          <li className="drawer-nav-list">
            <Link
              to="/courses"
              className={`nav-link ${
                currentPath === "/courses" ? "active" : ""
              }`}
              onClick={closeDrawer}
            >
              Courses
            </Link>
          </li>
          <li className="drawer-nav-list">
            <Link
              to="/whyUs"
              className={`nav-link ${currentPath === "/whyUs" ? "active" : ""}`}
              onClick={closeDrawer}
            >
              whyUs
            </Link>
          </li>
          <li className="drawer-nav-list">
            <Link
              to="/views"
              className={`nav-link ${currentPath === "/views" ? "active" : ""}`}
              onClick={closeDrawer}
            >
              Views
            </Link>
          </li>
        </ul>

        {/* Social Icons on Mobile */}
        <div className="mobile-social-icons">
          <a
            href="https://facebook.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            <FacebookOutlined style={{ fontSize: "24px", color: "#3b5998" }} />
          </a>
          <a
            href="https://twitter.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            <TwitterOutlined
              style={{ fontSize: "24px", color: "#1da1f2", margin: "0 10px" }}
            />
          </a>
          <a
            href="https://instagram.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            <InstagramOutlined style={{ fontSize: "24px", color: "#e4405f" }} />
          </a>
        </div>
      </Drawer>
    </div>
  );
};

export default Header;
