import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../../styles/AddUser.css';

function AddUser() {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phoneNumber: '',
        clinic: '', // Remove default value
        role: 'doctor',
        dob: '',
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
        setError('');
        setSuccessMessage('');

        const { firstName, lastName, email, phoneNumber, clinic, role, dob } = formData;

        try {
            const response = await axios.post(
                `${import.meta.env.VITE_BACKEND_URL}/api/admin-signup`,
                {
                    firstName,
                    lastName,
                    email,
                    phoneNumber,
                    role,
                    clinic,
                    dob,
                }
            );

            setSuccessMessage(response.data.message);
            alert('Account created successfully. Login credentials have been sent to the email address.');
            
            // Clear form
            setFormData({
                firstName: '',
                lastName: '',
                email: '',
                phoneNumber: '',
                clinic: user?.clinic || '', // Maintain the clinic value
                role: 'doctor',
                dob: '',
            });

        } catch (error) {
            console.error('Error creating account:', error);
            setError(error.response?.data?.message || 'An error occurred while creating the account.');
        }
    };

    return (
        <div className="adduserMainContainer">
            <div className="adduserSignUpForm">
                <div className="adduserSignupDesignContainer">
                    <h1>Add Account for Doctor or Admin</h1>
                </div>
                <div className="adduserSignupContainer">
                    <h2 className="adduserSignupTitle">Create Account</h2>
                    {error && <div className="adduserErrorMessage">{error}</div>}
                    {successMessage && <div className="adduserSuccessMessage">{successMessage}</div>}
                    <form className="adduserSignupForm" onSubmit={handleSubmit}>
                        <div className="adduserFormGroup">
                            <label htmlFor="firstName">First Name</label>
                            <input
                                type="text"
                                id="firstName"
                                placeholder="Enter first name"
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
                                placeholder="Enter last name"
                                value={formData.lastName}
                                onChange={handleChange}
                                required
                            />
                        </div>  
                        <div className="adduserFormGroup">
                            <label htmlFor="dob">Date of Birth</label>
                            <input
                                type="date"
                                id="dob"
                                name="dob"
                                value={formData.dob}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="adduserFormGroup">
                            <label htmlFor="email">Email</label>
                            <input
                                type="email"
                                id="email"
                                placeholder="Enter email"
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
                                placeholder="Enter phone number"
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
                                readOnly
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
                        <button type="submit" className="adduserSignupButton">
                            Create Account
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default AddUser;
