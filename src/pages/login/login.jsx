// src/pages/Login.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './login.css';
import { setToken, isLoggedIn } from '../../utils/auth'; // Import utility functions
import HomeButton from '../../component/HomeButton';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // If the user is already logged in, redirect to home
    if (isLoggedIn()) {
      navigate('/home');
    }

    // Log the backend URL to ensure environment variables are loaded correctly
    console.log(import.meta.env.VITE_BACKEND_URL);
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/login`,
        { email, password },
        {
          withCredentials: true, // Include cookies in the request if necessary
        }
      );

      if (response.status === 200) {
        console.log(response);
        setToken(response.data.token); // Store token using auth.js
        navigate('/home'); // Redirect to home after successful login
      }
    } catch (error) {
      if (error.response && error.response.data) {
        setErrorMessage(error.response.data.message);
      } else {
        setErrorMessage('An error occurred during login');
      }
    }
  };

  return (
    <>
    <div className="container">
      <div className="HomeBtnContainer">
        <HomeButton />  
      </div>
    
    <div className="sign-in-form">
      <div className="sign-up-container">
          <h2>Hello, Friend!</h2>
          <p>Enter your personal details and start your journey with us</p>
          <button onClick={() => navigate('/signup')}>Sign Up</button>
        </div>
        <div className="sign-in-container">
          <h2>Sign in</h2>
          <form onSubmit={handleLogin}>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            {errorMessage && <p className="error">{errorMessage}</p>}
            <button type="submit">Sign In</button><br />
            <a href="/forgot">Forgot your password?</a>
          </form>
        </div>
      </div>
    </div>
    </>
    );
};

export default Login;
