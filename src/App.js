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
function App() {
  // let { id } = useParams();

  return (
    <>
      <Router>
        <div style={{ display: "flex" }}>
          <SideMenu />
          <div style={{ marginLeft: 10, padding: 20, width: "100%" }}>
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
