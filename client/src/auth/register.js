import React from 'react';
import { useState } from 'react'
import './register.css';
import { useSignup } from "../hooks/useSignup"
import { useNavigate } from "react-router-dom";

const Register = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const {signup, error, isLoading} = useSignup()
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Submitting with Email:', email, 'Password:', password);
    const success = await signup(email, password);
    if(success) navigate('/login'); // Navigate to login page after successful registration
  }

    return (
        <div className="register-container">
          <form className="register-form" onSubmit={handleSubmit}>
            <img src={process.env.PUBLIC_URL + "/assets/logoTansp.png"} alt="Logo" className="register-logo" />
            <input type="email" onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
            <input type="password" onChange={(e) => setPassword(e.target.value)} placeholder="Password" />
            <input type="password" placeholder="Confirm Password" />
            <button type="submit" disabled={isLoading}>Sign Up with Email</button>
            <a href="#" className="login-with-google">
              <img src={process.env.PUBLIC_URL + "/assets/google_logo.svg"} alt="Google Logo" />
              Login with Google
            </a>
            <p className="login-text">Already have an account? <a href="/login">Log In</a></p>
            {error && <div className='error'>{error}</div>}
          </form>
        </div>
      );
};

export default Register;
