import React from 'react';
import './home.css';
import logo from '../images/Quantumix-B6.png';
import taskImg from '../images/QuiblyTasks.png';
import noteImg1 from '../images/QuiblyNote.png';
import noteImg2 from '../images/QuiblyFolder.png';
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

        <section className="feature-section">
          <div className="feature-block">
            <div className="feature-images">
              <img src={taskImg} alt="Task Management Screenshot" />
            </div>
            <div className="feature-content">
              <h2 className="feature-title">Smart Task Management</h2>
              <p>Track your daily responsibilities with precision and ease. Our task management interface is built for clarity, speed, and efficiency—helping you stay on top of your goals.</p>
            </div>
          </div>

          <div className="feature-block reverse">
            <div className="feature-images">
              <img src={noteImg1} alt="Note Section Screenshot 1" />
              <img src={noteImg2} alt="Note Section Screenshot 2" />
            </div>
            <div className="feature-content">
              <h2 className="feature-title">Your Ideas, Noted Instantly</h2>
              <p>Quickly capture thoughts, ideas, or important information. Our note-taking feature is built to let you write and organize without the clutter, giving you a digital notepad that works like you think.</p>
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
