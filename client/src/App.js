import React, { useState, useEffect } from "react";
import './App.css';
import { FaBars } from 'react-icons/fa';
import Project from './components/Project';
import { useLogout } from './hooks/useLogout';
import { useAuthContext } from './hooks/useAuthContext';
import { useTheme } from './ThemeContext';
import QuantumixLogoDark from './images/Quantumix-B9.png'; // Adjust the path as necessary
import QuantumixLogoLight from './images/Quantumix-B6.png'

import {
  BrowserRouter as Router,
  Route,
  Routes,
  useLocation,
  useNavigate,
  Navigate,
} from "react-router-dom";
import {
  FaCog,
  FaUserCircle,
  FaHome,
  FaCalendar,
  FaTasks,
  FaBullseye,
  FaLightbulb,
  FaRedoAlt,
} from "react-icons/fa";
import "./App.css";

import AuthHome from "./auth/home";
import AuthLogin from "./auth/login";
import AuthRegister from "./auth/register";

import PublicLayout from "./PublicLayout";

import Home from "./pages/Home";
import Schedule from "./pages/Schedule";
import Tasks from "./pages/Tasks";
import Visionboard from "./pages/Visionboard";

const tabs = [
  { id: 1, title: "Home", icon: <FaHome /> },
  { id: 2, title: "Schedule", icon: <FaCalendar /> },
  { id: 3, title: "Tasks", icon: <FaTasks /> },
  { id: 4, title: "Visionboard", icon: <FaBullseye /> },
];

function App() {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(1);
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const { logout } = useLogout();
  const { darkMode, setDarkMode } = useTheme();



  const handleClick = (tabId) => {
    setActiveTab(tabId);
    switch (tabId) {
      case 1:
        navigate('/app/home');
        break;
      case 2:
        navigate('/app/schedule');
        break;
      case 3:
        navigate('/app/tasks');
        break;
      case 4:
        navigate('/app/visionboard');
        break;
      default:
        break;
    }
  };
  



  const handleLogout = () => {
    logout();
    navigate('/login');
  }

  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const ContentWrapper = ({ children }) => {
    if (isPublicPage()) {
      return <PublicLayout>{children}</PublicLayout>;
    }
    return <>{children}</>;
  };

  const changeDays = (days) => {
    setCurrentDate(
      (prevDate) =>
        new Date(
          prevDate.getFullYear(),
          prevDate.getMonth(),
          prevDate.getDate() + days
        )
    );

    if (selectedEvent) {
      const updatedDate = new Date(selectedEvent.date);
      updatedDate.setDate(updatedDate.getDate() + days);
      setSelectedEvent({
        ...selectedEvent,
        date: updatedDate.toISOString().split("T")[0],
      });
    }
  };

  const isPublicPage = () => {
    const publicPaths = ["/", "/login", "/register"];
    return publicPaths.includes(location.pathname);
  };

  const contentClassName = isPublicPage() ? 'public-content' : (isSidebarOpen ? 'content' : 'content content-expanded');

  useEffect(() => {
    const storedDarkMode = localStorage.getItem('darkMode') === 'true';
    setDarkMode(storedDarkMode);
  }, []);

  // Update localStorage and body class on dark mode change
  useEffect(() => {
    localStorage.setItem('darkMode', darkMode);
    if (darkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }, [darkMode]);

  return (
    <div className={`app ${darkMode ? "dark-mode" : ""}`}>
      {!isPublicPage() && (
        <>
          <div className={`topbar ${darkMode ? "dark-topbar" : ""}`}>
            <button className={`toggle-sidebar-button ${darkMode ? "dark-toggle-sidebar-button" : ""}`} onClick={toggleSidebar}>
              <FaBars />
            </button>
            <div className="right">
              <div className="settings">
                <div className="settings-dropdown">
                  <button className="settings-toggle">Settings</button>
                  <div className={`settings-menu ${darkMode ? "dark-settings-menu" : ""}`}>
                    <div className="dark-light-toggle">
                      <span className="mode-text">Dark Mode</span>
                      <label>
                      <input
                          type="checkbox"
                          onChange={(e) => {
                            setDarkMode(e.target.checked);
                            localStorage.setItem('darkMode', e.target.checked);
                          }}
                          checked={darkMode}
                        />
                        <span className="slider"></span>
                      </label>
                    </div>
                    <hr />
                    <button className={`settings-option ${darkMode ? "dark-settings-option" : ""}`}>Profile</button>
                    <button className={`settings-option ${darkMode ? "dark-settings-option" : ""}`}>Settings</button>
                    <button className={`settings-option ${darkMode ? "dark-settings-option" : ""}`} onClick={handleLogout}>Logout</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className={`sidebar ${isSidebarOpen ? "" : "sidebar-collapsed"} ${darkMode ? "dark-sidebar" : ""}`}>
          <div className="sidebar-logo">
            <img src={darkMode ? QuantumixLogoDark : QuantumixLogoLight} alt="Quantumix Logo" />
          </div>
            <div className="tabs">
              {tabs.map((tab) => (
                <div
                  key={tab.id}
                  className={`tab ${activeTab === tab.id ? "active" : ""}`}
                  onClick={() => handleClick(tab.id)}
                >
                  <span className="tab-icon">{tab.icon}</span>
                  {tab.title}
                </div>
              ))}
            </div>
          </div>
        </>
      )}
      <div className={`${contentClassName} ${darkMode ? "dark-content" : ""}`}>
        <ContentWrapper>
          <Routes>
            <Route path="/" element={<PublicLayout><AuthHome /></PublicLayout>} exact />
            <Route path="/login" element={!user ? <PublicLayout><AuthLogin /></PublicLayout> : <Navigate to="/app/home" />} />
            <Route path="/register" element={<PublicLayout><AuthRegister /></PublicLayout>} />
            <Route path="/app/home" element={user ? <Home /> : <Navigate to="/login" />} />
            <Route path="/app/schedule" element={user ? <Schedule currentDate={currentDate} setCurrentDate={setCurrentDate} /> : <Navigate to="/login" />} />
            <Route path="/app/tasks" element={user ? <Tasks /> : <Navigate to="/login" />} />
            <Route path="/app/visionboard" element={user ? <Visionboard /> : <Navigate to="/login" />} />
            <Route path="/app/project/:id" element={user ? <Project /> : <Navigate to="/login" />} />
          </Routes>
        </ContentWrapper>
      </div>
    </div>
  );
};

export default App;
