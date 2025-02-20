import React from "react";
import Header from "../header/Header";
import Home from "../home/Home";
import About from "../about/About";
import OurModule from "../whyUs/ourModule";

const MainComp = () => {
  return (
    <div className="main-web">
      <Header />
      <Home />
      <About />
      <OurModule />
    </div>
  );
};

export default MainComp;
