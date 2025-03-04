// import { lazy } from "react";
// import { RouteObject } from "react-router-dom";
// import { protectedRoutes } from "../components/CardData/cardData";
// // import ApplicationForm from "../components/module/Admission/Subsections/ApplicationForms";
// // Lazy load components to optimize performance
// const LazyLoadComponent = (moduleName: string, subsectionName: string) => {
//   // console.log(
//   //   "Module Name:  " + moduleName + ", SubsectionName: " + subsectionName
//   // );
//   return lazy(
//     () =>
//       import(`../components/module/${moduleName}/Subsections/${subsectionName}`)
//   );
// };
// // Create routes based on cardData
// export const routes: RouteObject[] = protectedRoutes.map((module: any) => {
//   const moduleName = module.name.replace(/ /g, ""); // Remove spaces for folder structure
//   // Map subsections to their respective components
//   const subsections = module.subsections.map((sub: any) => {
//     const subsectionName = sub.replace(/ /g, ""); // Convert names like "Application Forms" to "ApplicationForms"

//     const Component = LazyLoadComponent(moduleName, subsectionName);
//     return {
//       path: subsectionName.toLowerCase(), // Subroute like /applicationforms
//       element: <Component />, // Assign the lazily loaded component
//     };
//   });

//   const MainComponent = lazy(
//     () => import(`../components/module/${moduleName}/${moduleName}`)
//   ); // Load the main component for the module
//   // console.log("Module Name issue" + moduleName + "" + subsections);
//   return {
//     path: moduleName.toLowerCase(), // Route like /admission
//     element: <MainComponent />, // Main component of the module
//     children: subsections, // Subsections as children routes
//   };
// });
export default {};
