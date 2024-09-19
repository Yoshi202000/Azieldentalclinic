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
        confirmPassword: ''
    });

    const [error, setError] = useState(''); // State to hold the error message
    const [successMessage, setSuccessMessage] = useState(''); // State to hold the success message
    const navigate = useNavigate(); // Initialize useNavigate

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.id]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(''); // Clear any previous error message
        setSuccessMessage(''); // Clear any previous success message

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        const { firstName, lastName, email, phoneNumber, password } = formData;

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
                    password, // Send plain text password
                }),
            });

            const result = await response.json();
            if (response.ok) {
                setSuccessMessage(result.message);
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
        <HomeButton/>
        <div className="signup-container">
            <h2 className="signup-title">Create an Account</h2>
            {error && <div className="error-message">{error}</div>} {/* Display error message */}
            {successMessage && <div className="success-message">{successMessage}</div>} {/* Display success message */}
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
            </form>
        </div>
        </>
    );
}

export default Signup;