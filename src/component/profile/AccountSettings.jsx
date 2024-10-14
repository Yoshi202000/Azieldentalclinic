import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../../styles/AccountSettings.css';

const AccountSettings = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    dob: '',
    phoneNumber: '',
    email: '',
  });
  const [message, setMessage] = useState(''); // For success/error messages
  const [isError, setIsError] = useState(false); // Track if message is an error or success

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Please log in to continue.');
      navigate('/login');
      return;
    }

    axios
      .get('http://localhost:5000/verify-token', {
        headers: {
          Authorization: `${token}`,
        },
        withCredentials: true, // if using cookies
      })
      .then((response) => {
        // Set all user details
        const { firstName, lastName, email, phoneNumber, dob } = response.data.user;
        setFormData({
          firstName,
          lastName,
          email,
          phoneNumber,
          dob: dob || '', // Default to empty string if no DOB
        });
        setLoading(false);
      })
      .catch(() => {
        alert('Session expired or invalid. Please log in again.');
        navigate('/login');
      });
  }, [navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault(); // Prevent page refresh
    const token = localStorage.getItem('token');
  
    axios.put('http://localhost:5000/api/updateAccount', formData, {
      headers: {
        Authorization: `Bearer ${token}`,
          },
        }
      )
      .then((response) => {
        setMessage('Profile updated successfully!');
        setIsError(false);
      })
      .catch((error) => {
        console.error('Error updating profile:', error.response?.data || error.message);
        setMessage('Failed to update profile. Please try again.');
        setIsError(true);
      });
  };
  
  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <div className="account-settings-container">
      <h1>Account Settings</h1>
      {message && <p className={isError ? 'error-message' : 'success-message'}>{message}</p>}
      <form onSubmit={handleSubmit}>
        <label htmlFor="firstName">First Name:</label>
        <input 
          type="text"
          name="firstName"
          value={formData.firstName || ''}
          onChange={handleInputChange}
        />
        <label htmlFor="lastName">Last Name:</label>
        <input 
          type="text"
          name="lastName"
          value={formData.lastName || ''}
          onChange={handleInputChange}
        />
        <label htmlFor="email">Email:</label>
        <input 
          type="email"
          name="email"
          value={formData.email || ''}
          onChange={handleInputChange}
        />
        <label htmlFor="phoneNumber">Phone Number:</label>
        <input 
          type="text"
          name="phoneNumber"
          value={formData.phoneNumber || ''}
          onChange={handleInputChange}
        />
        <button type="submit">Edit Profile</button>
      </form>
    </div>
  );
};

export default AccountSettings;
