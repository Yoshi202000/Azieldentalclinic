import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './ForgotPass.css'

const Forgot = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [codeSent, setCodeSent] = useState(false);
  const [enteredCode, setEnteredCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [codeVerified, setCodeVerified] = useState(false);

  // Handle form submission for sending the code
  const handleSendCode = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/api/send-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
  
      if (!response.ok) {
        const errorMessage = await response.text(); // Log the error for debugging
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorMessage}`);
      }
  
      const data = await response.json();
      if (data.success) {
        setCodeSent(true);
        alert('Verification code sent to your email.');
      } else {
        alert(data.message || 'Error sending code. Please try again.');
      }
    } catch (error) {
      console.error('Error:', error.message);
      alert('Error sending code. Please check your network or try again later.');
    }
  };
  

  // Handle code verification
  const handleVerifyCode = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/api/verify-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code: enteredCode }),
      });
  
      // Check if the response is OK (status in the range 200-299)
        // Check if the response is OK (status in the range 200-299)
      if (!response.ok) {
        const errorMessage = await response.text(); // Get the error response as text
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorMessage}`);
      }

      const data = await response.json(); // Convert the response to JSON
      if (data.success) {
        setCodeVerified(true);
        alert('Code verified successfully. You can now change your password.');
      } else {
        alert('Incorrect code. Please try again.');
      }
    } catch (error) {
      console.error('Error:', error.message);
      alert('An error occurred while verifying the code. Please try again.');
    }
  };
  

  // Handle password change
  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      alert("Passwords don't match. Please try again.");
      return;
    }
    try {
      const response = await fetch('http://localhost:5000/api/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, newPassword, code: enteredCode }),
      });
      const data = await response.json(); // Convert the response to JSON
  
      console.log('Response from server:', data);
      console.log({ email, newPassword, enteredCode });
      console.log('Data sent to backend:', { email, newPassword, code: enteredCode });

      if (data.success) {
        alert('Password changed successfully. You can now log in.');
        navigate('/login');
      } else {
        alert('Error changing password. Please try again.');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };
  

  return (
    <>
    <div className="ForgotMainContainer">
    <div className="forgotContainer">
      <h1>Forgot Password</h1>
      {!codeSent ? (
        <form onSubmit={handleSendCode}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <button type="submit">Send Verification Code</button>
        </form>
      ) : !codeVerified ? (
        <form onSubmit={handleVerifyCode}>
          <input
            type="text"
            placeholder="Enter 4-digit code"
            value={enteredCode}
            onChange={(e) => setEnteredCode(e.target.value)}
            required
          />
          <button type="submit">Verify Code</button>
        </form>
      ) : (
        <form onSubmit={handleChangePassword}>
          <input
            type="password"
            placeholder="New Password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Confirm New Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
          <button type="submit">Change Password</button>
        </form>
      )}
      <p>Back to <a href="/login">Login</a></p>
      <p>Don't have an account? <a href="/signup">Sign Up</a></p>
      <div className="backToHome">
        <button onClick={() => navigate('/')}>Back to Home</button>
      </div>
    </div>
    </div>
    </>
  );
};

export default Forgot;
