// hooks/useSignup.js
import { useState } from 'react';

export const useUpdate = () => {
  const [error, setError] = useState(null);

  const update = async (email, password) => {
    setError(null);
    try {
      const response = await fetch('https://quibly.onrender.com/api/user/update', {
        method: 'PATCH',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ email, password })
      });
      const json = await response.json();
      if (!response.ok) {
        setError(json.error || 'An error occurred');
        return json;
      }
      return json;
    } catch (err) {
      setError(err.message || 'Failed to update');
      return null;
    }
  };

  return { update, error };
};