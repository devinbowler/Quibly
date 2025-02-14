// hooks/useVerifyOTP.js
import { useState } from 'react';

export const useVerifyOTP = () => {
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const verifyOTP = async (email, otp) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('https://quibly.onrender.com/api/user/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp })
      });
      const json = await response.json();
      if (!response.ok) {
        setError(json.error || 'Verification failed');
        setIsLoading(false);
        return false;
      }
      setIsLoading(false);
      return json;
    } catch (err) {
      setError(err.message || 'Verification failed');
      setIsLoading(false);
      return false;
    }
  };

  const resendOTP = async (email) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('https://quibly.onrender.com/api/user/resend-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const json = await response.json();
      if (!response.ok) {
        setError(json.error || 'Resend failed');
        setIsLoading(false);
        return false;
      }
      setIsLoading(false);
      return json;
    } catch (err) {
      setError(err.message || 'Resend failed');
      setIsLoading(false);
      return false;
    }
  };

  return { verifyOTP, resendOTP, isLoading, error, setError };
};
