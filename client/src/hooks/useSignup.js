import { useState } from 'react'
import { useAuthContext } from './useAuthContext'

export const useSignup = () => {
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false); // Default should be false
    const { dispatch } = useAuthContext();

    const signup = async (email, password) => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch('https://quantumix.onrender.com/api/user/signup', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({email, password})
            });

            // console.log('Sending request to:', 'https://quantumix.onrender.com/api/user/signup');
            // console.log('Request body:', JSON.stringify({email, password}));

            const json = await response.json(); // Await the resolution of json()
            // console.log('Response status:', response.status);
            // console.log('Response payload:', json);

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

    return { signup, isLoading, error };
};
