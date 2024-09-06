import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/login.css'

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // Check if the token already exists
    const token = localStorage.getItem('token');
    if (token) {
      navigate('/home'); // Redirect if already logged in
    }
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post('http://localhost:5000/login', { email, password });

      if (response.status === 200) {
        // Save the token to localStorage and redirect to the home page
        localStorage.setItem('token', response.data.token);
        navigate('/home');
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
    <div className="container">
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
          <a href="#">Forgot your password?</a>
          <button type="submit">Sign In</button>
        </form>
      </div>
      <div className="sign-up-container">
        <h2>Hello, Friend!</h2>
        <p>Enter your personal details and start your journey with us</p>
        <button onClick={() => window.location.href = '/signup'}>Sign Up</button>
      </div>
    </div>
  );
};

export default AdminLogin;
