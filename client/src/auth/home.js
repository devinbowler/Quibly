import React from 'react';
import './home.css';
import logo from '../images/Quantumix-B6.png';
import taskImg from '../images/QuiblyTasks.png';
import noteImg1 from '../images/QuiblyNote.png';
import noteImg2 from '../images/QuiblyFolder.png';
import privacypolicy from './privacypolicy.js';
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
          <a href="#about">About</a>
          <a href="#cs-footer-274">Support</a>
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
          <h1>Organize Your Life,<br />with <span>Quibly</span></h1>
          <p>Effortlessly manage, sort, and track your tasks with efficient and simple task management.</p>
          <a className="cta-button" href="./register">Sign up for Free</a>
        </section>
    
        <div id="about"></div>
        <section className="feature-section">
          {/* Task Section - IMAGE LEFT, TEXT RIGHT */}
          <div className="feature-block">
            <div className="feature-images">
              <img src={taskImg} alt="Task Management Screenshot" />
            </div>
            <div className="feature-content">
              <h2 className="feature-title">
                <span style={{ color: '#495BFA' }}>Smart</span> Task Management
              </h2>
              <p>
                With Quibly you can track your daily responsibilities with precision and ease. Our task management interface is built for clarity, speed, and efficiency—helping you stay on top of your goals.
              </p>
            </div>
          </div>
        
          {/* Notes Section - TEXT LEFT, IMAGES RIGHT */}
          <div className="feature-block stacked-notes-section reverse">
            <div className="feature-content tight">
              <h2 className="feature-title">
                <span style={{ color: '#495BFA' }}>View & Edit</span> Your Notes Clearly
              </h2>
              <p>
                View all your notes in one place and easily dive into details. With simple yet powerful editing, and viewing for all projects and ideas. Simple layout, organized folders, and distraction-free editing built for clarity. 
              </p>
            </div>
            <div className="stacked-images">
              <div className="img-wrapper bottom">
                <img src={noteImg2} alt="Notes Folder View" />
              </div>
              <div className="img-wrapper top">
                <img src={noteImg1} alt="Single Note View" />
              </div>
            </div>
          </div>
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
