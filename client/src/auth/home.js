import React, { useState } from 'react';
import './home.css';

const AuthHome = () => {
  const [showMenu, setShowMenu] = useState(false);

  const handleMenuClick = () => {
    setShowMenu(!showMenu);
  };

  return (
    <div className="home-page" id="home">
      <nav className="navbar">
        <img src={process.env.PUBLIC_URL + "/assets/logoTansp.png"} alt="Logo" className="navbar-logo desktop-only" />
        <span className="hamburger-menu mobile-only" onClick={handleMenuClick}>&#9776;</span>
        <ul className={`nav-menu${showMenu ? " show" : ""}`}>
          <li><a href="#home">Home</a></li>
          <li><a href="#about">About</a></li>
          <li><a href="#contact">Contact</a></li>
          <li className="right-float"><a href="./register" className="start-for-free">Start for Free</a></li>
        </ul>
      </nav>
      <div className="main-content">
        <h1 className="quantumix-title">Quantumix</h1>
        <p className="slogan">Finally unlock your  true potential.<br/>Conquer every challenge.<br/>Empower your journey with Quantumix.</p>
        <li className="li-center">
           <a href="./register" className="start-for-free-center">Start for Free</a>
        </li>
      </div>
      <footer className="footer" id="contact">
        <div className="social-icons">
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">
            <img src={process.env.PUBLIC_URL + "/assets/instagram.png"} alt="Instagram" />
            </a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">
            <img src={process.env.PUBLIC_URL + "/assets/twitter.png"} alt="Twitter" />
            </a>

            <a href="/" rel="noopener noreferrer">
            <img className="footer-logo" src={process.env.PUBLIC_URL + "/assets/logoTansp.png"} alt="Footer Logo" />
            </a>

            <a href="https://youtube.com" target="_blank" rel="noopener noreferrer">
            <img src={process.env.PUBLIC_URL + "/assets/youtube.png"} alt="YouTube" />
            </a>
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">
            <img src={process.env.PUBLIC_URL + "/assets/facebook.png"} alt="Facebook" />
            </a>
        </div>
        </footer>
    </div>
  );
};

export default AuthHome;