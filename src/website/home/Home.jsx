import React, { useState, useEffect, useRef } from "react";
import { Row, Col, Button } from "antd";
import Typed from "typed.js";
import homeImage from "../images/homeImage.png";
import img2 from "../images/img2.webp";
import img3 from "../images/img3.jpeg";
import img4 from "../images/img4.jpeg";
import img5 from "../images/img5.jpg";
import img6 from "../images/img6.jpg";
import img7 from "../images/img7.jpg";
import "./home.css"; // We will use minimal CSS

const Home = () => {
  const [currentBackgroundIndex, setCurrentBackgroundIndex] = useState(0);
  const typedRef = useRef(null);

  useEffect(() => {
    const options = {
      strings: [
        "Fee Management Software",
        "Attendance Management System",
        "Exam Management Software",
        "Virtual Learning Platform",
        "E-learning Solution",
      ],
      typeSpeed: 120,
      backSpeed: 40,
      loop: true,
      backDelay: 4000,
      startDelay: 2000,
    };

    const typed = new Typed(typedRef.current, options);
    return () => {
      typed.destroy();
    };
  }, []);

  const backgrounds = [img2, img3, img4, img5, img6, img7];

  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentBackgroundIndex(
        (prevIndex) => (prevIndex + 1) % backgrounds.length
      );
    }, 6000);
    return () => clearInterval(intervalId);
  }, [backgrounds.length]);

  return (
    <div
      className="hero-section"
      style={{ backgroundImage: `url(${backgrounds[currentBackgroundIndex]})` }}
    >
      <Row
        align="middle"
        justify="space-between"
        className="hero-content-wrapper"
      >
        <Col xs={24} md={12} className="hero-content">
          <h1>
            Welcome to our Awesome <br />
            <span
              style={{ color: "green", fontFamily: "Monospace" }}
              ref={typedRef}
            ></span>
          </h1>
          <p>
            Discover the future of education management. Our user-friendly
            platform offers efficient tools for managing students, staff, and
            finances. Experience the difference today with our academy
            management system. We provide a range of features to help you
            streamline your processes, improve communication, and deliver a
            personalized learning experience.
          </p>
          <Button type="primary" size="large" href="youtube.com">
            APPLY NOW!
          </Button>
        </Col>
        <Col xs={24} md={12} className="hero-image">
          <img src={homeImage} alt="mypic" style={{ width: "100%" }} />
        </Col>
      </Row>
    </div>
  );
};

export default Home;
