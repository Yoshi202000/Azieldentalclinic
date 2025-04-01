import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../../styles/AddUser.css';

function SuperDoctorSignup() {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phoneNumber: '',
        clinic: '',
        role: 'doctor',
    });

    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [nameOne, setNameOne] = useState('');
    const [nameTwo, setNameTwo] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        fetchClinicNames();
    }, []);

    const fetchClinicNames = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/clinic`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            
            if (response.data) {
                setNameOne(response.data.nameOne);
                setNameTwo(response.data.nameTwo);
                // Set default clinic value
                setFormData(prev => ({
                    ...prev,
                    clinic: response.data.nameOne
                }));
            }
        } catch (error) {
            console.error('Error fetching clinic names:', error);
            setError('Failed to fetch clinic names');
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

        const { firstName, lastName, email, phoneNumber, clinic, role } = formData;

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
                clinic: nameOne, // Reset to default clinic
                role: 'doctor',
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
                            <label htmlFor="clinic">Select Clinic</label>
                            <select
                                id="clinic"
                                name="clinic"
                                value={formData.clinic}
                                onChange={handleChange}
                                required
                            >
                                {nameOne && <option value={nameOne}>{nameOne}</option>}
                                {nameTwo && <option value={nameTwo}>{nameTwo}</option>}
                            </select>
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

export default SuperDoctorSignup;
