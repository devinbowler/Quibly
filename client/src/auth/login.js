import React from 'react';
import { useState } from 'react'
import './login.css';
import { useLogin } from '../hooks/useLogin'
import { useNavigate } from "react-router-dom";
import { GoogleLogin } from 'react-google-login';
import QuantumixLogo from '../images/Quantumix-B6.png'; // Adjust the path as necessary

const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const { login, error, isLoading } = useLogin()
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = await login(email, password);
    if(success) navigate('/app/home'); // Navigate to home page after successful login
  }

  /*const responseGoogle = (response) => {
    console.log(response);
  
    if (response.profileObj) {
      const { email, googleId } = response.profileObj; // Extract email and Google ID
      // Send this data to your backend for further processing
    } else {
      // Handle login failure
      console.error('Google Login was unsuccessful');
    }
  };
  <GoogleLogin
  clientId={process.env.REACT_APP_CLIENT_ID}
  buttonText="Login with Google"
  onSuccess={responseGoogle}
  onFailure={responseGoogle}
  cookiePolicy={'single_host_origin'}
  className="login-with-google"
/>*/

  return (
    <div className="login-container">
      <form className="login-form" onSubmit={handleSubmit}>
        <img src={QuantumixLogo} alt="Logo" className="login-logo" />
        <input type="email" onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
        <input type="password" onChange={(e) => setPassword(e.target.value)} placeholder="Password" />
        <button type="submit" disabled={isLoading}>Log In</button>
        <p className="signup-text">Don't have an account? <a href="/register">Sign Up</a></p>
        {error && <div className="error">{error}</div>}
      </form>
    </div>
  );
};

export default Login;
