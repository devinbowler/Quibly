import React, { useState } from 'react';
import './login.css'; // Reuse login styles
import { useNavigate } from "react-router-dom";
import QuantumixLogo from '../images/Quantumix-B6.png';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch('https://quibly.onrender.com/api/user/forgot-password', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({ email })
            });

            const json = await response.json();

            if (!response.ok) {
                throw new Error(json.error || 'An error occurred');
            }

            setSuccess(true);
        } catch (error) {
            setError(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="login-container">
            <form className="login-form" onSubmit={handleSubmit}>
                <img src={QuantumixLogo} alt="Logo" className="login-logo" />
                <h2>Reset Password</h2>
                
                {success ? (
                    <div className="success-message">
                        <p>A temporary password has been sent to your email.</p>
                        <p>Please check your inbox and use it to log in.</p>
                        <button type="button" onClick={() => navigate('/login')}>Back to Login</button>
                    </div>
                ) : (
                    <>
                        <p>Enter your email address to receive a temporary password</p>
                        <input 
                            type="email" 
                            value={email} 
                            onChange={(e) => setEmail(e.target.value)} 
                            placeholder="Email" 
                            required 
                        />
                        <button type="submit" disabled={isLoading}>
                            {isLoading ? "Sending..." : "Reset Password"}
                        </button>
                        <p className="signup-text">
                            <a href="/login">Back to Login</a>
                        </p>
                    </>
                )}
                
                {error && <div className="error">{error}</div>}
            </form>
        </div>
    );
};

export default ForgotPassword;
