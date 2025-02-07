import React from 'react';
import { useState } from 'react'
import './register.css';
import { useSignup } from "../hooks/useSignup"
import { useAuthContext } from "../hooks/useAuthContext";  // Adjust the path as needed
import { useNavigate } from "react-router-dom";
import { GoogleLogin } from 'react-google-login';
import QuantumixLogo from '../images/Quantumix-B6.png'; // Adjust the path as necessary

const Register = () => {
  const { dispatch } = useAuthContext();  // This extracts `dispatch` from your auth context
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { signup, signupWithGoogle, error, setError, isLoading } = useSignup();
  const navigate = useNavigate();
  const clientId = "29168999303-vmtaaefror3d4938htsitj3cufrstenm.apps.googleusercontent.com";

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Submitting with Email:', email, 'Password:', password);
    const success = await signup(email, password);
    if(success) navigate('/login'); // Navigate to login page after successful registration
  }

  /*const responseGoogle = (response) => {
    if (response.error) {
      // Now setError is defined because it's being used from useSignup hook
      console.error('Google Sign Up was unsuccessful:', response);
    } else {
      // Ensure the response has the tokenId property before proceeding
      if(response.tokenId) {
        signupWithGoogle(response.tokenId);
      } else {
        // If the tokenId is not available, log the entire response for further inspection
        console.error('Unexpected error with Google response:', response);
      }
    }
  };*/

  // Add to return.
  /*
              <GoogleLogin
              clientId={clientId}
              buttonText="Signup with Google"
              onSuccess={responseGoogle}
              onFailure={responseGoogle}
              cookiePolicy={'single_host_origin'}
              className="login-with-google"
              />
              */

  

    return (
        <div className="register-container">
          <form className="register-form" onSubmit={handleSubmit}>
            <img src={QuantumixLogo} alt="Logo" className="register-logo" />
            <input type="email" onChange={(e) => setEmail(e.target.value)} placeholder="Email" autoComplete="email" required />
            <input type="password" onChange={(e) => setPassword(e.target.value)} placeholder="Password" autoComplete="new-password" required />
            <input type="password" placeholder="Confirm Password" autoComplete="new-password" required />
            <button type="submit" disabled={isLoading}>Sign Up with Email</button>
            <p className="login-text">Already have an account? <a href="./login">Log In</a></p>
            {error && <div className='error'>{error}</div>}
          </form>
        </div>
      );
};

export default Register;
