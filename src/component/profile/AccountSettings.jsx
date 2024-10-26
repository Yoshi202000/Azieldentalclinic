import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/AccountSettings.css';

const AccountSettings = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false); // For form submission state
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

    const fetchData = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/verify-token', {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`, // Ensure Bearer token format
          },
          credentials: 'include', // if using cookies
        });
        if (!response.ok) {
          throw new Error('Session expired or invalid.');
        
        }
        const data = await response.json();
        const { firstName, lastName, email, phoneNumber, dob } = data.user || {};
        setFormData({
          firstName,
          lastName,
          email,
          phoneNumber,
          dob: dob || '', // Default to empty string if no DOB
        });
        setLoading(false);
      } catch (error) {
        alert('Session expired or invalid. Please log in again.');
        navigate('/login');
      }
    };

    fetchData();
  }, [navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage('');
    setIsError(false);

    const token = localStorage.getItem('token');

    try {
      // Update this URL to match the server route
      const response = await fetch('http://localhost:5000/api/updateAccount', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
        credentials: 'include',
      });

      const data = await response.json(); // Parse the response

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Unauthorized. Please log in again.');
        }
        throw new Error('Failed to update profile.');
      }

      setMessage(data.message || 'Profile updated successfully!');
      setIsError(false);
    } catch (error) {
      console.error('Error updating profile:', error.message);
      setMessage(error.message);
      setIsError(true);
    } finally {
      setIsSubmitting(false); // Reset submitting state
    }
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
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Submitting...' : 'Edit Profile'}
        </button>
      </form>
    </div>
  );
};

export default AccountSettings;
