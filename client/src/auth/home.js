import React, { useState, useEffect } from 'react';
import './home.css';
import QuantumixLogo from '../images/Quantumix-B6.png'; // Adjust the path as necessary
import cloud from "../images/icons8-cloud-100.png";
import ui from "../images/icons8-ui-64.png";
import money from "../images/icons8-money-bag-100.png";
import homepic from "../images/undraw_real_time_sync_re_nky7.svg";

const AuthHome = () => {
  const [showMenu, setShowMenu] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleMenuClick = () => {
    setShowMenu(!showMenu);
  };

  const renderDynamicText = () => {
    if (windowWidth <= 1350) {
      return <span className="type-animation">Quantumix</span>;
    } else {
      return (
        <>
          <li><span className="type-animation">scheduling.</span></li>
          <li><span className="type-animation">tasks.</span></li>
          <li><span className="type-animation">planning.</span></li>
        </>
      );
    }
  };
  

  return (
    <div className="home-page" id="home">
      {/* Navbar */}
      <nav className="navbar">
      <span className="quantumix-nav-title">
        <img src={QuantumixLogo} alt="Quantumix Logo" />
      </span>
        <span className="hamburger-menu mobile-only" onClick={handleMenuClick}>&#9776;</span>
        <ul className={`nav-menu${showMenu ? " show" : ""}`}>
          <li><a href="#home">Home</a></li>
          <li><a href="#about">About</a></li>
          <li className="right-float"><a href="./register" className="start-for-free">Get Started for Free</a></li>
        </ul>
      </nav>

      {/* Main Content */}
      <div className="main-content">
      <div className="landing-container">
        <div className="content-section">
          <h1 className="main-title">
            Begin to <br /> manage your <br /> life with
          </h1>
          <div className="dynamic-text">
            {renderDynamicText()}
          </div>
          <p className="main-description">Quantumix is an all-in-one productivity app <br /> designed to streamline the management of <br />schedules, tasks, projects, and more.</p>
          <a href="./register" className="start-for-free">Get Started for Free</a>
          <a href="#" className="contact-us">Contact The Team</a>
        </div>
        <img className="landing-image" src={homepic} alt="Landing Image" />
        </div>





        <section id="why-choose">
        <div className="cs-container">
            <h2 className="cs-title"><span className="blueFirst">WHAT</span> IS QUANTUMIX</h2>
            <p className="cs-text">
            Quantimix is an all-in-one management app designed to streamline organization 
            and planning by consolidating events, tasks, and projects into a single platform. 
            With its user-friendly interface, it effectively reduces the need for multiple apps, 
            simplifying daily scheduling and task management. Tailored for efficiency and convenience, 
            Quantimix offers a holistic solution for both personal and professional organization needs.
            </p>
            <ul className="cs-card-group">
            <li className="cs-item">
            <div className="cs-box" aria-hidden="true">
                <img loading="lazy" decoding="async" src={cloud} alt="cloud storage" width="42" height="42" />
            </div>
            <h3 className="cs-heading3">Flexible Storage Plans</h3>
            <p className="cs-item-text">Quantimix offers flexible storage plans, allowing you to pay only for the space you need. Begin with a generous amount of free storage, and upgrade seamlessly as your organizational needs grow, ensuring optimal cost efficiency and scalability.</p>
        </li>
        <li className="cs-item">
            <div className="cs-box" aria-hidden="true">
                <img loading="lazy" decoding="async" src={ui} alt="user-friendly interface" width="42" height="42" />
            </div>
            <h3 className="cs-heading3">Simple & Intuitive UI</h3>
            <p className="cs-item-text">Experience the simplicity of Quantimix's user interface, designed for intuitive navigation and ease of use. Our app streamlines task management and planning, allowing you to focus on productivity without the complexity of unnecessary features.</p>
        </li>
        <li className="cs-item">
            <div className="cs-box" aria-hidden="true">
                <img loading="lazy" decoding="async" src={money} alt="affordable pricing" width="42" height="42" />
            </div>
            <h3 className="cs-heading3">Cost-Effective Memberships</h3>
            <p className="cs-item-text">Quantimix offers cost-effective membership options, ensuring that you get maximum value for minimal expense. Our competitive pricing plans are designed to fit a variety of budgets, making high-quality organization tools accessible to everyone.</p>
        </li>
            </ul>
        </div>
    </section>


    <section id="pricing">
        <div className="cs-container">
            <span className="cs-topper">Pricing</span>
            <h2 className="cs-title"><span className="blueFirst">Pick</span> Your Plan</h2>
            <p className="cs-text">
                Welcome to Quantumix, your one solution for all your management needs. Browse through our pricing plans, which offer plans too expand your storage and capabilites.
            </p>
          
            <ul className="cs-card-group">
                <li className="cs-item cs-popular">
                    <div className="cs-top-section">
                        <div className="cs-flex">
                            <h3 className="cs-h3">Free Tier</h3>
                            <p className="cs-item-text">
                            Perfect for getting started.
                            </p>
                        </div>
                        <div className="cs-option-group">
                            <span className="cs-price cs-option1-text">$0<span class="cs-small">/month</span></span>
                        </div>
                    </div>
                    <span className="cs-included">Package Includes</span>
                    <ul className="cs-ul">
                        <li className="cs-li">
                            <img className="cs-li-img" aria-hidden="true" loading="lazy" decoding="async" src="https://csimg.nyc3.digitaloceanspaces.com/Pricing/check-blue.svg" alt="code stitch icon" width="20" height="20"/>
                            1 GB Storage
                        </li>
                        <li className="cs-li">
                            <img className="cs-li-img" aria-hidden="true" loading="lazy" decoding="async" src="https://csimg.nyc3.digitaloceanspaces.com/Pricing/check-blue.svg" alt="code stitch icon" width="20" height="20"/>
                            Basic Task & Event Management
                        </li>
                        <li className="cs-li">
                            <img className="cs-li-img" aria-hidden="true" loading="lazy" decoding="async" src="https://csimg.nyc3.digitaloceanspaces.com/Pricing/check-blue.svg" alt="code stitch icon" width="20" height="20"/>
                            Project Management
                        </li>
                        <li className="cs-li cs-disabled">
                            <img className="cs-li-img" aria-hidden="true" loading="lazy" decoding="async" src="https://csimg.nyc3.digitaloceanspaces.com/Pricing/check-blue.svg" alt="code stitch icon" width="20" height="20"/>
                            Full Project Features
                        </li>
                        <li className="cs-li cs-disabled">
                            <img className="cs-li-img" aria-hidden="true" loading="lazy" decoding="async" src="https://csimg.nyc3.digitaloceanspaces.com/Pricing/check-blue.svg" alt="code stitch icon" width="20" height="20"/>
                            Custom Notifications
                        </li>
                        <li className="cs-li cs-disabled">
                            <img className="cs-li-img" aria-hidden="true" loading="lazy" decoding="async" src="https://csimg.nyc3.digitaloceanspaces.com/Pricing/check-blue.svg" alt="code stitch icon" width="20" height="20"/>
                            Priority Support
                        </li>
                    </ul>
                </li>
                <li className="cs-item">
                    <div className="cs-top-section">
                        <div className="cs-flex">
                            <h3 className="cs-h3">Basic Tier</h3>
                            <p className="cs-item-text">
                            Ideal for individual professionals.
                            </p>
                        </div>
                        <div className="cs-option-group">
                            <span className="cs-price cs-option1-text">$9.99<span className="cs-small">/month</span></span>
                        </div>
                    </div>
                    <span className="cs-included">Package Includes</span>
                    <ul className="cs-ul">
                        <li class="cs-li">
                            <img className="cs-li-img" aria-hidden="true" loading="lazy" decoding="async" src="https://csimg.nyc3.digitaloceanspaces.com/Pricing/check-blue.svg" alt="code stitch icon" width="20" height="20"/>
                            5 GB Storage
                        </li>
                        <li className="cs-li">
                            <img className="cs-li-img" aria-hidden="true" loading="lazy" decoding="async" src="https://csimg.nyc3.digitaloceanspaces.com/Pricing/check-blue.svg" alt="code stitch icon" width="20" height="20"/>
                            Basic Task & Event Management
                        </li>
                        <li className="cs-li">
                            <img className="cs-li-img" aria-hidden="true" loading="lazy" decoding="async" src="https://csimg.nyc3.digitaloceanspaces.com/Pricing/check-blue.svg" alt="code stitch icon" width="20" height="20"/>
                            Advanced Task Management
                        </li>
                        <li className="cs-li">
                            <img className="cs-li-img" aria-hidden="true" loading="lazy" decoding="async" src="https://csimg.nyc3.digitaloceanspaces.com/Pricing/check-blue.svg" alt="code stitch icon" width="20" height="20"/>
                            Priority Support
                        </li>
                        <li className="cs-li">
                            <img className="cs-li-img" aria-hidden="true" loading="lazy" decoding="async" src="https://csimg.nyc3.digitaloceanspaces.com/Pricing/check-blue.svg" alt="code stitch icon" width="20" height="20"/>
                            Most Project Features
                        </li>
                        <li className="cs-li cs-disabled">
                            <img className="cs-li-img" aria-hidden="true" loading="lazy" decoding="async" src="https://csimg.nyc3.digitaloceanspaces.com/Pricing/check-blue.svg" alt="code stitch icon" width="20" height="20"/>
                            Custom Notifications
                        </li>
                    </ul>
                </li>
                <li className="cs-item">
                    <div className="cs-top-section">
                        <div className="cs-flex">
                            <h3 className="cs-h3">Pro Tier</h3>
                            <p className="cs-item-text">
                            For small teams or extensive projects.
                            </p>
                        </div>
                        <div className="cs-option-group">
                            <span className="cs-price cs-option1-text">$22.99<span className="cs-small">/month</span></span>
                        </div>
                    </div>
                    <span className="cs-included">Package Includes</span>
                    <ul className="cs-ul">
                        <li class="cs-li">
                            <img className="cs-li-img" aria-hidden="true" loading="lazy" decoding="async" src="https://csimg.nyc3.digitaloceanspaces.com/Pricing/check-blue.svg" alt="code stitch icon" width="20" height="20"/>
                            15 GB Storage
                        </li>
                        <li className="cs-li">
                            <img className="cs-li-img" aria-hidden="true" loading="lazy" decoding="async" src="https://csimg.nyc3.digitaloceanspaces.com/Pricing/check-blue.svg" alt="code stitch icon" width="20" height="20"/>
                            Basic Task & Event Management
                        </li>
                        <li className="cs-li">
                            <img className="cs-li-img" aria-hidden="true" loading="lazy" decoding="async" src="https://csimg.nyc3.digitaloceanspaces.com/Pricing/check-blue.svg" alt="code stitch icon" width="20" height="20"/>
                            Advanced Task Management
                        </li>
                        <li className="cs-li">
                            <img className="cs-li-img" aria-hidden="true" loading="lazy" decoding="async" src="https://csimg.nyc3.digitaloceanspaces.com/Pricing/check-blue.svg" alt="code stitch icon" width="20" height="20"/>
                            Priority Support
                        </li>
                        <li className="cs-li">
                            <img className="cs-li-img" aria-hidden="true" loading="lazy" decoding="async" src="https://csimg.nyc3.digitaloceanspaces.com/Pricing/check-blue.svg" alt="code stitch icon" width="20" height="20"/>
                            Custom Notifications
                        </li>
                        <li className="cs-li">
                            <img className="cs-li-img" aria-hidden="true" loading="lazy" decoding="async" src="https://csimg.nyc3.digitaloceanspaces.com/Pricing/check-blue.svg" alt="code stitch icon" width="20" height="20"/>
                            All Project Features 
                        </li>
                    </ul>
                </li>
            </ul>
        </div>
    </section>


    <footer id="cs-footer-274">
    <div className="cs-container">
        <div className="cs-logo-group">
            <a aria-label="go back to home" className="cs-logo" href="">
                <img className="cs-logo-img" aria-hidden="true" loading="lazy" decoding="async" src={QuantumixLogo} alt="logo" width="240" height="32"/>
            </a>
        </div>
        <ul className="cs-nav">
            <li className="cs-nav-li">
                <a className="cs-nav-link" href="tel:123-456 7890">(978) 855 6514</a>
            </li>
            <li className="cs-nav-li">
                <a className="cs-nav-link" href="mailto:quantumixcontact@gmail.com">quantumixcontact@gmail.com</a>
            </li>
        </ul>
    
    </div>
</footer>
      </div>
    </div>

    
  );
};

export default AuthHome;
