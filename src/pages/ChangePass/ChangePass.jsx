import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './ChangePass.css';

const ChangePass = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [isVerified, setIsVerified] = useState(false);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // Verify current password
  const handleVerifyPassword = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.currentPassword
        }),
      });

      const data = await response.json();
      
      if (response.ok) {
        setIsVerified(true);
        alert('Current password verified. You can now change your password.');
      } else {
        setError(data.message || 'Invalid email or password');
      }
    } catch (error) {
      console.error('Error:', error);
      setError('An error occurred. Please try again.');
    }
  };

  // Handle password change
  const handleChangePassword = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.newPassword !== formData.confirmPassword) {
      setError("New passwords don't match");
      return;
    }

    if (formData.newPassword.length < 7) {
      setError("Password must be at least 7 characters long");
      return;
    }

    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.newPassword)) {
      setError("Password must contain at least one uppercase letter, one lowercase letter, and one number");
      return;
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/change-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          newPassword: formData.newPassword
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        alert('Password changed successfully!');
        navigate('/login');
      } else {
        setError(data.message || 'Error changing password');
      }
    } catch (error) {
      console.error('Error:', error);
      setError('An error occurred. Please try again.');
    }
  };

  return (
    <div className="changepass-container">
      <div className="changepass-form">
        <h1>Change Password</h1>
        {error && <div className="error-message">{error}</div>}
        
        {!isVerified ? (
          <form onSubmit={handleVerifyPassword}>
            <div className="form-group">
              <label>Email:</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                placeholder="Enter your email"
              />
            </div>
            <div className="form-group">
              <label>Current Password:</label>
              <input
                type="password"
                name="currentPassword"
                value={formData.currentPassword}
                onChange={handleInputChange}
                required
                placeholder="Enter current password"
              />
            </div>
            <button type="submit">Verify Password</button>
          </form>
        ) : (
          <form onSubmit={handleChangePassword}>
            <div className="form-group">
              <label>New Password:</label>
              <input
                type="password"
                name="newPassword"
                value={formData.newPassword}
                onChange={handleInputChange}
                required
                placeholder="Enter new password"
              />
            </div>
            <div className="form-group">
              <label>Confirm New Password:</label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                required
                placeholder="Confirm new password"
              />
            </div>
            <button type="submit">Change Password</button>
          </form>
        )}
        
        <div className="links">
          <p>Back to <a href="/login">Login</a></p>
          <button className="back-button" onClick={() => navigate('/')}>
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChangePass;
