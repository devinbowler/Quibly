import React, { useState } from 'react';
import './login.css';
import { useLogin } from '../hooks/useLogin';
import { useNavigate } from "react-router-dom";
import { useAuthContext } from "../hooks/useAuthContext";
import QuantumixLogo from '../images/Quantumix-B6.png';

const Login = () => {
    const { dispatch } = useAuthContext();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { login, error, isLoading } = useLogin();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        const success = await login(email, password);
        if (success) {
            navigate('/app/tasks');  // Make sure this is the correct and exact path
        }
    };

 /*   const responseGoogle = (response) => {
        if (response?.tokenId) {
          loginWithGoogle(response.tokenId);
        } else {
          // Handle the error case here
          console.error("Google Login was unsuccessful", response);
        }
      };

                    <GoogleLogin
                    clientId={clientId}
                    buttonText="Login with Google"
                    onSuccess={responseGoogle}
                    onFailure={responseGoogle}
                    cookiePolicy={'single_host_origin'}
                    className="login-with-google"
                />
*/

    return (
        <div className="login-container">
            <form className="login-form" onSubmit={handleSubmit}>
                <img src={QuantumixLogo} alt="Logo" className="login-logo" />
                <input type="email" onChange={(e) => setEmail(e.target.value)} placeholder="Email" required />
                <input type="password" onChange={(e) => setPassword(e.target.value)} placeholder="Password" required />
                <button type="submit" disabled={isLoading}>Log In</button>
                <p className="signup-text">Don't have an account? <a href="/register">Sign Up</a></p>
                {error && <div className="error">{error}</div>}
            </form>
        </div>
    );
};

export default Login;
