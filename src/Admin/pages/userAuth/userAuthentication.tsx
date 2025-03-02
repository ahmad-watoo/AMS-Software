import React from "react";
import { Navigate, Outlet } from "react-router-dom";

const UserAuthentication: React.FC = () => {
  const user = localStorage.getItem("user");

  // If user data exists in localStorage, allow access to protected routes
  if (user) {
    return <Outlet />;
  }

  // If no user data, redirect to login page
  return <Navigate to="/login" replace />;
};

export default UserAuthentication;
