import React from 'react';
import './home.css';
import logo from '../images/Quantumix-B6.png';
import { useTheme } from '../ThemeContext';
import { Link } from 'react-router-dom';

function Home() {
  const { darkMode, toggleTheme } = useTheme();
  
  return (
    <div className="home">
      <header className="topbar">
        <a aria-label="go back to home" href="">
          <img src={logo} alt="Quibly Logo" className="logo" />
        </a>
        <nav className="navbar">
          <div className="theme-toggle-container">
            <label className="toggle-switch">
              <input 
                type="checkbox" 
                checked={darkMode}
                onChange={toggleTheme}
              />
              <span className="toggle-slider">
                <i className="fas fa-sun light-icon"></i>
                <i className="fas fa-moon dark-icon"></i>
              </span>
            </label>
          </div>
          <a href="./register" className="login-button">Sign Up</a>
        </nav>
      </header>

      <main className="content">
        <section className="hero">
          <h1>
            Organize Your Life,<br />
            with <span>Quibly</span>
          </h1>
          <p>
            Effortlessly manage, sort, and track your tasks with efficient and simple task management.
          </p>
          <a className="cta-button" href="./register">
            Sign up for Free
          </a>
        </section>
      </main>

      <footer id="cs-footer-274">
        <div className="cs-container">
          <div className="cs-logo-group">
            <a aria-label="go back to home" className="cs-logo" href="">
              <img 
                className="cs-logo-img" 
                aria-hidden="true" 
                loading="lazy" 
                decoding="async" 
                src={logo} 
                alt="logo" 
              />
            </a>
          </div>
          <ul className="cs-nav">
            <li className="cs-nav-li">
              <a className="cs-nav-link" href="mailto:quiblycontact@gmail.com">
                quiblycontact@gmail.com
              </a>
            </li>
            <li className="cs-nav-li">
              <Link className="cs-nav-link" to="/privacypolicy">
                Privacy Policy
              </Link>
            </li>
            <li className="cs-nav-li">
              <Link className="cs-nav-link" to="/termsandconditions">
                Terms and Conditions
              </Link>
            </li>
          </ul>
        </div>
      </footer>
    </div>
  );
}

export default Home;
