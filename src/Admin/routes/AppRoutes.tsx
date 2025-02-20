// import { map } from "lodash";
// import { lazy } from "react";
// import PrivateRoute from "./PrivateRoute";
// import { Route, Routes } from "react-router-dom";
// import { protectedRoutes, publicRoutes } from "./routeList";
// import React from "react";

// const NotFoundPage = lazy(() => import("../pages/404/index"));

// function AppRoutes() {
//   return (
//     <Routes>
//       {map(publicRoutes, ({ path, element }:any, index:any) => (
//         <Route path={path} element={element} key={`${index}-${path}`} />
//       ))}
//       <Route element={<PrivateRoute />}>
//         {map(protectedRoutes, ({ path, element }:any, index:any) => (
//           <Route path={path} element={element} key={`${index}-${path}`} />
//         ))}
//       </Route>

//       <Route path="*" element={<NotFoundPage />} />
//     </Routes>
//   );
// }

// export default AppRoutes;
