import React, { Suspense, useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Outlet,
  Navigate,
} from "react-router-dom";
import { protectedRoutes } from "./Admin/routes/routeList";
import SideMenu from "./Admin/components/SideMenu/SideMenu";
import { Spin, ConfigProvider, theme } from "antd";
import NotFoundPage from "./Admin/pages/404/index";
import DashboardHeader from "./Admin/pages/Dashboardheader/DashboardTopBar";
import UserAuthentication from "./Admin/pages/userAuth/userAuthentication";
import LoginPage from "./Admin/pages/userAuth/Login"; // Create this component for the login page
import SignUp from "./Admin/pages/userAuth/SignUp"; // Create this component for the signup page
import { AuthProvider } from "./contexts/AuthContext";

import "./App.css";

function App() {
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("theme") === "dark";
  });

  // Toggle theme and save to localStorage
  const toggleTheme = () => {
    const newTheme = !darkMode;
    setDarkMode(newTheme);
    localStorage.setItem("theme", newTheme ? "dark" : "light");
  };

  // Apply the theme globally
  useEffect(() => {
    document.body.className = darkMode ? "dark" : "light";
  }, [darkMode]);
  // Layout for protected routes (includes SideMenu and DashboardHeader)
  const ProtectedLayout = () => (
    <div className="flex w-full">
      <SideMenu />
      <div className="w-full">
        <DashboardHeader darkMode={darkMode} toggleTheme={toggleTheme} />
        {/* Move Suspense here so only inner content is lazy-loaded */}
        <Suspense
          fallback={
            <Spin
              size="large"
              style={{
                marginTop: "20px",
                display: "block",
                textAlign: "center",
              }}
            />
          }
        >
          <Outlet />
        </Suspense>
      </div>
    </div>
  );
  return (
    <>
      <ConfigProvider
        theme={{
          algorithm: darkMode ? theme.darkAlgorithm : theme.defaultAlgorithm,
        }}
      >
        <AuthProvider>
          <Router>
            <div className="App">
              <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Navigate to="/login" replace />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignUp />} />

              {/* Protected Routes */}
              <Route element={<UserAuthentication />}>
                <Route element={<ProtectedLayout />}>
                  {protectedRoutes.map((route, index) => (
                    <Route
                      key={`${index}-${route.path}`}
                      path={route.path}
                      element={route.element}
                    />
                  ))}
                </Route>
              </Route>

              {/* 404 Not Found Page */}
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </div>
        </Router>
        </AuthProvider>
      </ConfigProvider>
    </>
  );
}

export default App;
