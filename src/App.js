import React, { Suspense } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  // useParams,
} from "react-router-dom";
import { protectedRoutes } from "./Admin/routes/routeList";
import SideMenu from "./Admin/components/SideMenu/SideMenu";
import { Spin } from "antd";
import NotFoundPage from "./Admin/pages/404/index";
import DashboardHeader from "./Admin/pages/Dashboardheader/DashboardTopBar";
import "./App.css";
function App() {
  // let { id } = useParams();

  return (
    <>
      <Router>
        <div className="App" style={{ display: "flex" }}>
          <SideMenu />
          <div style={{ width: "100%" }}>
            <DashboardHeader />
            <Suspense fallback={<Spin size="large" />}>
              <Routes>
                {protectedRoutes.map((route, index) => (
                  <Route
                    key={`${index}-${route.path}`}
                    path={route.path}
                    element={route.element}
                  />
                ))}

                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </Suspense>
          </div>
        </div>
      </Router>
    </>
  );
}

export default App;
