// App.js
import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes, useNavigate, Navigate, useLocation } from "react-router-dom";
import { useLogout } from './hooks/useLogout';
import { useAuthContext } from './hooks/useAuthContext';
import { useTheme } from './ThemeContext';
import QuantumixLogoDark from './images/Quantumix-B9.png';
import QuantumixLogoLight from './images/Quantumix-B6.png';

import AuthHome from "./auth/home";
import AuthLogin from "./auth/login";
import AuthRegister from "./auth/register";
import PublicLayout from "./PublicLayout";
import Tasks from "./pages/task";

function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthReady } = useAuthContext(); // Include isAuthReady
  const { logout } = useLogout();
  const { darkMode, setDarkMode } = useTheme();

  const handleClick = (tabId) => {
    navigate(`/app/${tabId.toLowerCase()}`);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  }

  const shouldShowTopbar = () => {
    const noTopbarPaths = ["/login", "/register", "/app/tasks", "/app/leaderboard"];
    return !noTopbarPaths.includes(location.pathname);
  };

  useEffect(() => {
    const storedDarkMode = localStorage.getItem('darkMode') === 'true';
    setDarkMode(storedDarkMode);
  }, []);

  useEffect(() => {
    localStorage.setItem('darkMode', darkMode);
    if (darkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }, [darkMode]);

  // Wait for auth to be ready
  if (!isAuthReady) {
    return null; // or return a loading indicator
  }

  return (
    <div className={`app ${darkMode ? "dark-mode" : ""}`}>
      <div className="content">
        <Routes>
          <Route path="/" element={<PublicLayout><AuthHome /></PublicLayout>} exact />
          <Route path="/login" element={<AuthLogin />} />
          <Route path="/register" element={<AuthRegister />} />
          <Route path="/app/tasks" element={user ? <Tasks /> : <Navigate to="/login" />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;
