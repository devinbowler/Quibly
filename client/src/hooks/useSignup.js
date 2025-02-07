import { useState } from 'react'
import { useAuthContext } from './useAuthContext'
import { useNavigate } from "react-router-dom";

export const useSignup = () => {
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false); // Default should be false
    const { dispatch } = useAuthContext();
    const navigate = useNavigate();

    const signup = async (email, password) => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch('https://quantumix.onrender.com/api/user/signup', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({email, password})
            });


            const json = await response.json(); // Await the resolution of json()

            if (!response.ok) {
                setIsLoading(false);
                setError(json.error || 'An error occurred'); // Fallback error message
            }

            if (response.ok) {
                localStorage.setItem('user', JSON.stringify(json)); // Save user to local storage
                dispatch({type: 'LOGIN', payload: json}); // Update auth context
                setIsLoading(false);
            }
        } catch (err) {
            setIsLoading(false);
            setError(err.message || 'Failed to sign up');
        }
    };

    const signupWithGoogle = async (token) => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch('https://quantumix.onrender.com/api/user/google-signup', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({ token })
            });

            const json = await response.json();

            if (!response.ok) {
                setIsLoading(false);
                setError(json.error || 'An error occurred during Google sign-up.');
            }

            if (response.ok) {
                // Save user to local storage
                localStorage.setItem('user', JSON.stringify(json));

                // Update auth context
                dispatch({ type: 'LOGIN', payload: json });

                // Redirect to home page or other post-signup page
                navigate('/app/home');

                setIsLoading(false);
            }
        } catch (err) {
            setIsLoading(false);
            setError(err.message || 'Failed to sign up with Google');
        }
    };

    return { signup, signupWithGoogle, isLoading, error };
};
