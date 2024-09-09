import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/AdminLogin.css'; // Renamed to AdminLogin.css

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // Check if the token already exists
    const token = localStorage.getItem('token');
    if (token) {
      navigate('/admin-dashboard'); // Redirect if already logged in
    }
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post('http://localhost:5000/admin-login', { email, password });

      if (response.status === 200) {
        // Save the token to localStorage and redirect to the admin dashboard
        localStorage.setItem('token', response.data.token);
        navigate('/admin-dashboard');
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
    <div className="admin-container">
      <div className="admin-login-container">
        <h2>Admin Sign In</h2>
        <form onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="Admin Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Admin Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {errorMessage && <p className="admin-error">{errorMessage}</p>}
          <button type="submit" className="admin-login-btn">Sign In</button>
        </form>
        <a href="#" className="forgot-password">Forgot your password?</a>
      </div>
    </div>
  );
};

export default AdminLogin;
