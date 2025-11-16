import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuthContext } from "../../../contexts/AuthContext";
import { Spin } from "antd";

const UserAuthentication: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuthContext();

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100%",
        }}
      >
        <Spin size="large" />
      </div>
    );
  }

  // If user is authenticated, allow access to protected routes
  if (isAuthenticated) {
    return <Outlet />;
  }

  // If not authenticated, redirect to login page
  return <Navigate to="/login" replace />;
};

export default UserAuthentication;
