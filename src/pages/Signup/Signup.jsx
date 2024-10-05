import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import HomeButton from '../../component/HomeButton';
import './Signup.css';
import { Home } from '@mui/icons-material';

function Signup() {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phoneNumber: '',
        password: '',
        confirmPassword: '',
        verifyEmailCode: '', // For verification code input
    });

    const [error, setError] = useState(''); // State to hold the error message
    const [successMessage, setSuccessMessage] = useState(''); // State to hold the success message
    const [verificationSent, setVerificationSent] = useState(false); // Track if verification was sent
    const navigate = useNavigate(); // Initialize useNavigate

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.id]: e.target.value
        });
    };

    // Function to send verification code
    const handleSendVerification = async () => {
        if (!formData.email) {
            setError('Please enter a valid email address.');
            return;
        }

        try {
            const response = await fetch('http://localhost:5000/send-verification', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email: formData.email }),
            });

            const result = await response.json();
            if (response.ok) {
                setSuccessMessage(result.message || 'Verification code sent! Check your email.');
                setVerificationSent(true);
            } else {
                setError(result.message || 'Failed to send verification code.');
            }
        } catch (error) {
            console.error('Error sending verification code:', error);
            setError('An error occurred while sending the verification code.');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(''); // Clear any previous error message
        setSuccessMessage(''); // Clear any previous success message

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        const { firstName, lastName, email, phoneNumber, password, verifyEmailCode } = formData;

        try {
            const response = await fetch('http://localhost:5000/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    firstName,
                    lastName,
                    email,
                    phoneNumber,
                    password,
                    verifyEmailCode, // Send verification code for validation
                }),
            });

            const result = await response.json();
            if (response.ok) {
                setSuccessMessage(result.message);
                alert('email was sent successfully please verify your email');
                navigate('/login'); // Redirect to login page on successful registration
            } else {
                setError(result.message || 'Signup failed');
            }
        } catch (error) {
            console.error('Error signing up:', error);
            setError('An error occurred while signing up.');
        }
    };

    return (
        <>
        <div className="signupMainContainer">
            <div className="HomeButtonContainer">
                <HomeButton/>
            </div>
            <div className="signUpForm">
                <div className="signupDesignContainer">
                    <h1>hello world</h1>
                    <p>hello world</p>
                </div>
                <div className="signup-container">
                    <h2 className="signup-title">Create an Account</h2>
                    {error && <div className="error-message">{error}</div>} {/* Display error message */}
                    {successMessage && <div className="success-message">{successMessage} <br /><small>Please check your email for verification code.</small></div>} {/* Display success message */}
                    <form className="signup-form" onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label htmlFor="firstName">First Name</label>
                            <input
                                type="text"
                                id="firstName"
                                placeholder="Enter your first name"
                                value={formData.firstName}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="lastName">Last Name</label>
                            <input
                                type="text"
                                id="lastName"
                                placeholder="Enter your last name"
                                value={formData.lastName}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="email">Email</label>
                            <input
                                type="email"
                                id="email"
                                placeholder="Enter your email"
                                value={formData.email}
                                onChange={handleChange}
                            />
                        </div>
                        {verificationSent ? (
                            <div className="form-group">
                                <label htmlFor="verifyEmailCode">Verification Code</label>
                                
                            </div>
                        ) : (
                            <button type="button" className="signup-button" onClick={handleSendVerification}>
                                Send Verification Code
                            </button>
                        )}
                        <div className="form-group">
                            <label htmlFor="phoneNumber">Phone Number</label>
                            <input
                                type="text"
                                id="phoneNumber"
                                placeholder="Enter your phone number"
                                value={formData.phoneNumber}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="password">Password</label>
                            <input
                                type="password"
                                id="password"
                                placeholder="Enter your password"
                                value={formData.password}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="confirmPassword">Confirm Password</label>
                            <input
                                type="password"
                                id="confirmPassword"
                                placeholder="Confirm your password"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                            />
                        </div>
                        <button type="submit" className="signup-button">Sign Up</button>

                        <p>already have an account? <a href="/login">Log in</a></p>
                    </form>
                </div>
            </div>
        </div>
        </>
    );
}

export default Signup;
