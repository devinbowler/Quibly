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
    
    console.log('🚀 Attempting signup for:', email); // ADD THIS
    
    try {
      const response = await fetch('https://quibly.onrender.com/api/user/signup', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ email, password })
      });
      
      const json = await response.json();
      
      // ADD DETAILED LOGGING
      console.log('📨 Response status:', response.status);
      console.log('📦 Response data:', json);
      
      if (!response.ok) {
        console.error('❌ Signup failed:', json.error); // ADD THIS
        setIsLoading(false);
        setError(json.error || 'An error occurred');
        return json;
      }
      
      console.log('✅ Signup successful:', json); // ADD THIS
      setIsLoading(false);
      return json;
    } catch (err) {
      console.error('💥 Network/Parse error:', err); // ADD THIS
      setIsLoading(false);
      setError(err.message || 'Failed to sign up');
      return null;
    }
  };

  return { signup, isLoading, error };
};
