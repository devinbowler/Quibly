import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { EventContextProvider } from './context/EventContext';
import { AuthContextProvider } from './context/AuthContext';

ReactDOM.render(
  <React.StrictMode>
   <AuthContextProvider>
    <EventContextProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </EventContextProvider>
   </AuthContextProvider>
  </React.StrictMode>,
  document.getElementById('root')
);