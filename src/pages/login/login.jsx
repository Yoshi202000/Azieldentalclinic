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
  const [verificationMessage, setVerificationMessage] = useState('');
  const [showVerificationButton, setShowVerificationButton] = useState(false);
  const navigate = useNavigate();

  const [loginMessage, setLoginMessage] = useState('');
  const [loginDescription, setLoginDescription] = useState('');

  useEffect(() => {
    axios.get(`${import.meta.env.VITE_BACKEND_URL}/clinic`)
      .then(response => {
        if (response.data) {
          const { loginMessage, loginDescription } = response.data;
          console.log('Clinic data received:', response.data); 
          setLoginMessage(loginMessage);
          setLoginDescription(loginDescription); // Corrected this line
        }
      })
      .catch(error => {
        console.error('Error fetching clinic data:', error);
      });

    // If the user is already logged in, redirect to home
    if (isLoggedIn()) {
      navigate('/home');
    }

    // Log the backend URL to ensure environment variables are loaded correctly
    console.log(import.meta.env.VITE_BACKEND_URL);

    // Check token expiration on page load
    const checkTokenExpiration = () => {
      const tokenExpiration = localStorage.getItem('tokenExpiration');
      const now = Date.now();
      
      if (tokenExpiration && now > tokenExpiration) {
        localStorage.removeItem('token');
        localStorage.removeItem('tokenExpiration');
        console.log('Token expired, removing from localStorage');
        // Redirect the user to the login page if token is expired
        window.location.href = '/login';
      }
    };

    checkTokenExpiration(); // Run the expiration check on page load

  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setVerificationMessage('');
    setShowVerificationButton(false);
    
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/login`,
        { email, password },
        {
          withCredentials: true, // Include cookies in the request if necessary
        }
      );

      if (response.status === 200) {
        console.log(response);
        const { token, expirationTime } = response.data; // Extract token and expiration time

        // Store token and expiration time in localStorage
        localStorage.setItem('token', token);
        localStorage.setItem('tokenExpiration', expirationTime); // Store expiration time

        // Set token in the HTTP-only cookie
        document.cookie = `token=${token}; path=/; max-age=${24 * 60 * 60}`; // Cookie expires in 1 day

        // Redirect based on user role
        if (response.data.user.role === 'superAdmin') {
          navigate('/superDashboard');
        }
        else if (response.data.user.role === 'admin') {
          navigate('/dashboard');
        }
        else if (response.data.user.role === 'patient') {
          navigate('/home');
        }
        else if (response.data.user.role === 'doctor') {
          navigate('/doctorDashboard');
        }
      }
    } catch (error) {
      if (error.response && error.response.data) {
        if (error.response.data.message === 'Please verify your email before logging in.') {
          setVerificationMessage('Please verify your email before logging in.');
          setShowVerificationButton(true);
        } else {
          setErrorMessage(error.response.data.message);
        }
      } else {
        setErrorMessage('An error occurred during login');
      }
    }
  };

  // Function to send verification code
  const handleSendVerification = async () => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/send-verification`,
        { email },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.status === 200) {
        setVerificationMessage('Verification code sent! Check your email.');
        setShowVerificationButton(false);
      } else {
        setErrorMessage('Failed to send verification code.');
      }
    } catch (error) {
      console.error('Error sending verification code:', error);
      setErrorMessage('An error occurred while sending the verification code.');
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
            <h2>{loginMessage}</h2>
            <p>{loginDescription}</p>
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
              {verificationMessage && <p className="verification-message">{verificationMessage}</p>}
              <button type="submit">Sign In</button><br />
              {showVerificationButton && (
                <button type="button" onClick={handleSendVerification} className="resend-button">
                  Resend Verification Code
                </button>
              )}
              <div className="forgot-password-container">
                <a href="/forgot">Forgot your password?</a>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;
