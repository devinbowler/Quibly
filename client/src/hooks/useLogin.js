import { useState } from 'react'
import { useAuthContext } from './useAuthContext'
import { useNavigate } from "react-router-dom";

export const useLogin = () => {
    const [error, setError] = useState(null)
    const [isLoading, setIsLoading] = useState(null)
    const { dispatch } = useAuthContext()
    const navigate = useNavigate();

    const login = async (email, password) => {
      setIsLoading(true);
      setError(null);
  
      const response = await fetch('http://localhost:4000/api/user/login', { //https://quantumix.onrender.com/api/user/login
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({email, password})
      });
  
      const json = await response.json();
  
      if (!response.ok) {
          setIsLoading(false);
          setError(json.error);
          return false;  // Indicate failure
      }
  
      // save user to local storage
      localStorage.setItem('user', JSON.stringify(json));
  
      // update auth context
      dispatch({type: 'LOGIN', payload: json});
  
      setIsLoading(false);
      return true;  // Indicate success
  }
  

    const loginWithGoogle = async (token) => {
        setIsLoading(true);
        setError(null);
      
        try {
          const response = await fetch('https://quantumix.onrender.com/api/user/google-login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token }),
          });
          const json = await response.json();
      
          if (!response.ok) {
            setIsLoading(false);
            setError(json.error);
          }
      
          if (response.ok) {
            // Save user to local storage and update context
            localStorage.setItem('user', JSON.stringify(json));
            dispatch({ type: 'LOGIN', payload: json });
            navigate('/app/home');
            setIsLoading(false);
          }
        } catch (error) {
          setIsLoading(false);
          setError('Failed to log in with Google');
        }
      };

      return { login, loginWithGoogle, isLoading, error };
}
