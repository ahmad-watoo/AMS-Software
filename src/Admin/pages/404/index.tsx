import React from "react";
import { Link } from "react-router-dom";

const NotFoundPage = () => {
  return (
    <div style={containerStyle}>
      <h1 style={headingStyle}>404 - Page Not Found</h1>
      <p style={messageStyle}>
        Oops! The page you're looking for doesn't exist or has been moved.
      </p>
      <Link to="/" style={linkStyle}>
        Go Back to Home
      </Link>
    </div>
  );
};

const containerStyle: React.CSSProperties = {
  textAlign: "center" as const, // 'center' is a valid 'textAlign' value
  padding: "50px",
  fontFamily: "Arial, sans-serif",
};

const headingStyle: React.CSSProperties = {
  fontSize: "3rem",
  color: "#ff6347",
};

const messageStyle: React.CSSProperties = {
  fontSize: "1.5rem",
  color: "#333",
  marginBottom: "20px",
};

const linkStyle: React.CSSProperties = {
  fontSize: "1.2rem",
  color: "#007bff",
  textDecoration: "none",
  padding: "10px 20px",
  border: "1px solid #007bff",
  borderRadius: "5px",
};

export default NotFoundPage;
