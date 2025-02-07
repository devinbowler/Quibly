import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { AuthContextProvider } from './context/AuthContext';
import { ThemeProvider } from './ThemeContext';

ReactDOM.render(
  <React.StrictMode>
      <AuthContextProvider>
          <ThemeProvider>
            <BrowserRouter>
              <App />
            </BrowserRouter>
          </ThemeProvider>
      </AuthContextProvider>
  </React.StrictMode>,
  document.getElementById('root')
);
