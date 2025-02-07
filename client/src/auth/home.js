import React from 'react';
import './home.css';
import logo from '../images/Quantumix-B6.png'; // Adjust the path as necessary
import privacypolicy from './privacypolicy.js';
import { Link } from 'react-router-dom';

function Home() {
  return (
    <div className="home">
      <header className="topbar">
        <img src={logo} alt="Quibly Logo" className="logo" />
        <nav className="navbar">
          <a href="#about">About</a>
          <a href="#support">Support</a>
          <a href="./register" className="login-button">Sign Up</a>
        </nav>
      </header>
      <main className="content">
        <section className="hero">
          <h1>Organize Your Life,<br />with <span>Quibly</span></h1>
          <p>Effortlessly manage, sort, and track your tasks with efficient and simple task management.</p>
          <a className="cta-button" href="./register">Sign up for Free</a>
        </section>
      </main>
      <footer id="cs-footer-274">
        <div className="cs-container">
          <div className="cs-logo-group">
            <a aria-label="go back to home" className="cs-logo" href="">
              <img className="cs-logo-img" aria-hidden="true" loading="lazy" decoding="async" src={logo} alt="logo" width="140" height="140" />
            </a>
          </div>
          <ul className="cs-nav">
            <li className="cs-nav-li">
              <a className="cs-nav-link" href="mailto:quiblycontact@gmail.com">quiblycontact@gmail.com</a>
            </li>
            <li className="cs-nav-li">
              <Link className="cs-nav-link" to="/privacypolicy">Privacy Policy</Link>
            </li>
            <li className="cs-nav-li">
              <Link className="cs-nav-link" to="/termsandconditions">Terms and Conditions</Link>
            </li>
          </ul>
        </div>
      </footer>
    </div>
  );
}

export default Home;
