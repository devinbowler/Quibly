import React, { useState } from 'react';
import './home.css';

const AuthHome = () => {
  const [showMenu, setShowMenu] = useState(false);

  const handleMenuClick = () => {
    setShowMenu(!showMenu);
  };

  return (
    <div className="home-page" id="home">
      {/* Navbar */}
      <nav className="navbar">
        <span className="quantumix-nav-title">Quantumix</span>
        <span className="hamburger-menu mobile-only" onClick={handleMenuClick}>&#9776;</span>
        <ul className={`nav-menu${showMenu ? " show" : ""}`}>
          <li><a href="#home">Home</a></li>
          <li><a href="#about">About</a></li>
          <li className="right-float"><a href="./register" className="start-for-free">Get Started for Free</a></li>
        </ul>
      </nav>

      {/* Main Content */}
      <div className="main-content">
        <div className="content-section">
          <h1 className="main-title">
            Begin to <br /> manage your <br /> life with
          </h1>
          <div className="dynamic-text">
            <li><span className="type-animation">scheduling.</span></li>
            <li><span className="type-animation">tasks.</span></li>
            <li><span className="type-animation">planning.</span></li>
          </div>
          <p className="main-description">Quantumix is an all-in-one productivity app <br /> designed to streamline the management of <br />schedules, tasks, projects, and more.</p>
          <a href="./register" className="start-for-free">Get Started for Free</a>
          <a href="#" className="contact-us">Contact The Team</a>
        </div>
      </div>
    </div>
  );
};

export default AuthHome;
