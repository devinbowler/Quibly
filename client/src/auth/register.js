import React from 'react';
import { useState } from 'react'
import './register.css';
import { useSignup } from "../hooks/useSignup"
import { useNavigate } from "react-router-dom";
import { GoogleLogin } from 'react-google-login';
import QuantumixLogo from '../images/Quantumix-B6.png'; // Adjust the path as necessary

const Register = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const {signup, error, isLoading} = useSignup()
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Submitting with Email:', email, 'Password:', password);
    // console.log('Submitting with Email:', email, 'Password:', password);
    const success = await signup(email, password);
    if(success) navigate('/login'); // Navigate to login page after successful registration
  }

/*const responseGoogle = async (response) => {
  console.log('Google response:', response);
  if (response.tokenId) {
    try {
      const res = await fetch('https://quantumix.onrender.com/api/user/google-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token: response.tokenId }),
      });
      const data = await res.json();
      if (data.error) {
        console.error('Error logging in with Google:', data.error);
      } else {
        // Handle successful login, e.g., store the received token, navigate to another page, etc.
      }
    } catch (error) {
      console.error('Error during Google login:', error);
    }
  } else {
    console.error('Google Login was unsuccessful');
  }
};

<GoogleLogin
clientId={process.env.REACT_APP_CLIENT_ID}
buttonText="Signup with Google"
onSuccess={responseGoogle}
onFailure={responseGoogle}
cookiePolicy={'single_host_origin'}
className="login-with-google"
/>*/

  

    return (
        <div className="register-container">
          <form className="register-form" onSubmit={handleSubmit}>
            <img src={QuantumixLogo} alt="Logo" className="register-logo" />
            <input type="email" onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
            <input type="password" onChange={(e) => setPassword(e.target.value)} placeholder="Password" />
            <input type="password" placeholder="Confirm Password" />
            <button type="submit" disabled={isLoading}>Sign Up with Email</button>
            <p className="login-text">Already have an account? <a href="/login">Log In</a></p>
            {error && <div className='error'>{error}</div>}
          </form>
        </div>
      );
};

export default Register;
