// hooks/useSignup.js
import { useState } from 'react';
import { useAuthContext } from './useAuthContext';

export const useSignup = () => {
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const { dispatch } = useAuthContext();

  const signup = async (email, password) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('https://quibly.onrender.com/api/user/signup', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ email, password })
      });
      const json = await response.json();
      if (!response.ok) {
        setIsLoading(false);
        setError(json.error || 'An error occurred');
        return json;
      }
      setIsLoading(false);
      return json;
    } catch (err) {
      setIsLoading(false);
      setError(err.message || 'Failed to sign up');
      return null;
    }
  };

  return { signup, isLoading, error };
};