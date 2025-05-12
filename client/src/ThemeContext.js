// client/src/ThemeContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }) => {
    // Initialize darkMode from localStorage or set to true as default (dark mode)
    const [darkMode, setDarkMode] = useState(() => {
        const savedTheme = localStorage.getItem('darkMode');
        return savedTheme === null ? true : savedTheme === 'true';
    });

    // Update localStorage and apply classes when darkMode changes
    useEffect(() => {
        localStorage.setItem('darkMode', darkMode);
        
        if (darkMode) {
            document.body.classList.add('dark-mode');
            document.body.classList.remove('light-mode');
        } else {
            document.body.classList.add('light-mode');
            document.body.classList.remove('dark-mode');
        }
    }, [darkMode]);

    // Toggle function for switching between modes
    const toggleTheme = () => {
        setDarkMode(!darkMode);
    };

    return (
        <ThemeContext.Provider value={{ darkMode, setDarkMode, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};
