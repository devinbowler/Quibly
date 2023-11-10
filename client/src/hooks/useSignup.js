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

            const json = await response.json(); // Await the resolution of json()

            if (!response.ok) {
                setIsLoading(false);
                setError(json.error); // Use the error from the response
            }

            if (response.ok) {
                localStorage.setItem('user', JSON.stringify(json)); // Save user to local storage
                dispatch({type: 'LOGIN', payload: json}); // Update auth context
                setIsLoading(false);
            }
        } catch (err) {
            setIsLoading(false);
            setError('Failed to sign up'); // Generic error message for network errors
        }
    };

    return { signup, isLoading, error };
};
