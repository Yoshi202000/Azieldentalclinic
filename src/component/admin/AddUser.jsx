import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../../styles/AddUser.css';

function DoctorSignup() {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phoneNumber: '',
        password: '',
        confirmPassword: '',
        clinic: '', // Remove default value
        role: 'doctor',
    });

    const [user, setUser] = useState(null);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            alert('Please log in to continue.');
            navigate('/login');
            return;
        }

        fetchUserInfo(token);
    }, [navigate]);

    const fetchUserInfo = async (token) => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/verify-token`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                withCredentials: true,
            });

            const userData = response.data.user;
            setUser(userData);
            
            // Set the clinic in formData to match the user's clinic
            setFormData(prev => ({
                ...prev,
                clinic: userData.clinic
            }));

        } catch (error) {
            console.error('Error fetching user info:', error);
            setError('Failed to fetch user information');
            if (error.response && error.response.status === 401) {
                alert('Session expired or invalid. Please log in again.');
                navigate('/login');
            }
        }
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.id || e.target.name]: e.target.value,
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

        const { firstName, lastName, email, phoneNumber, password, clinic, role } = formData;

        try {
            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/signup`, {
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
                    role, // Role selected by the user
                    clinic,
                }),
            });

            const result = await response.json();
            if (response.ok) {
                setSuccessMessage(result.message);
                alert('Signup successful. Please verify your email by clicking the link sent to your email address.');
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
        <div className="adduserMainContainer">
            <div className="adduserSignUpForm">
                <div className="adduserSignupDesignContainer">
                    <h1>Add Account for Doctor or Admin</h1>
                </div>
                <div className="adduserSignupContainer">
                    <h2 className="adduserSignupTitle">Signup</h2>
                    {error && <div className="adduserErrorMessage">{error}</div>} {/* Display error message */}
                    {successMessage && <div className="adduserSuccessMessage">{successMessage}</div>} {/* Display success message */}
                    <form className="adduserSignupForm" onSubmit={handleSubmit}>
                        <div className="adduserFormGroup">
                            <label htmlFor="firstName">First Name</label>
                            <input
                                type="text"
                                id="firstName"
                                placeholder="Enter your first name"
                                value={formData.firstName}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="adduserFormGroup">
                            <label htmlFor="lastName">Last Name</label>
                            <input
                                type="text"
                                id="lastName"
                                placeholder="Enter your last name"
                                value={formData.lastName}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="adduserFormGroup">
                            <label htmlFor="email">Email</label>
                            <input
                                type="email"
                                id="email"
                                placeholder="Enter your email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="adduserFormGroup">
                            <label htmlFor="phoneNumber">Phone Number</label>
                            <input
                                type="text"
                                id="phoneNumber"
                                placeholder="Enter your phone number"
                                value={formData.phoneNumber}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="adduserFormGroup">
                            <label htmlFor="clinic">Clinic</label>
                            <input
                                type="text"
                                id="clinic"
                                name="clinic"
                                value={formData.clinic}
                                readOnly // Make it read-only since it should match the user's clinic
                                className="readOnlyInput"
                            />
                        </div>
                        <div className="adduserFormGroup">
                            <label htmlFor="role">Role</label>
                            <select
                                id="role"
                                name="role"
                                value={formData.role}
                                onChange={handleChange}
                                required
                            >
                                <option value="doctor">Doctor</option>
                                <option value="admin">Admin</option>
                            </select>
                        </div>
                        <div className="adduserFormGroup">
                            <label htmlFor="password">Password</label>
                            <input
                                type="password"
                                id="password"
                                placeholder="Enter your password"
                                value={formData.password}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="adduserFormGroup">
                            <label htmlFor="confirmPassword">Confirm Password</label>
                            <input
                                type="password"
                                id="confirmPassword"
                                placeholder="Confirm your password"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <button type="submit" className="adduserSignupButton">
                            Sign Up
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default DoctorSignup;
