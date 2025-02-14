// auth/Verify.js
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useVerifyOTP } from '../hooks/useVerifyOTP';
import './Verify.css';

const Verify = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const initialEmail = location.state?.email || '';
  const [email, setEmail] = useState(initialEmail);
  const [otp, setOtp] = useState('');
  const { verifyOTP, resendOTP, isLoading, error } = useVerifyOTP();

  const handleVerify = async (e) => {
    e.preventDefault();
    const result = await verifyOTP(email, otp);
    if (result) {
      // On successful verification, redirect to login
      navigate('/login');
    }
  };

  const handleResend = async () => {
    const result = await resendOTP(email);
    if (result) {
      alert("OTP has been resent.");
    }
  };

  return (
    <div className="verify-container">
      <form className="verify-form" onSubmit={handleVerify}>
        <h2>Verify Your Account</h2>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          required
        />
        <input
          type="text"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          placeholder="Enter OTP"
          required
        />
        <button type="submit" disabled={isLoading}>Verify</button>
        <button type="button" onClick={handleResend} disabled={isLoading}>Resend Code</button>
        {error && <div className="error">{error}</div>}
      </form>
    </div>
  );
};

export default Verify;
