// auth/Register.js
import React, { useState } from 'react';
import { useSignup } from "../hooks/useSignup";
import { useAuthContext } from "../hooks/useAuthContext";
import { useNavigate } from "react-router-dom";
import './register.css';
import QuantumixLogo from '../images/Quantumix-B6.png';

const Register = () => {
  const { dispatch } = useAuthContext();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { signup, error, isLoading } = useSignup();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Submitting with Email:', email, 'Password:', password);
    const response = await signup(email, password);
    // Check if the signup returned a PENDING status
    if (response && response.status === "PENDING") {
      // Redirect to the verify page, passing the email (so it can be pre-filled)
      navigate('/verify', { state: { email } });
    }
  };

  return (
    <div className="register-container">
      <form className="register-form" onSubmit={handleSubmit}>
        <img src={QuantumixLogo} alt="Logo" className="register-logo" />
        <input type="email" onChange={(e) => setEmail(e.target.value)} placeholder="Email" autoComplete="email" required />
        <input type="password" onChange={(e) => setPassword(e.target.value)} placeholder="Password" autoComplete="new-password" required />
        <input type="password" placeholder="Confirm Password" autoComplete="new-password" required />
        <button type="submit" disabled={isLoading}>Sign Up with Email</button>
        <p className="login-text">Already have an account? <a href="/login">Log In</a></p>
        {error && <div className='error'>{error}</div>}
      </form>
    </div>
  );
};

export default Register;
