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
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/verify-token`, {
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

    
  };
  

  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <div className="account-settings-container">
      <h1>Profile Information</h1>
      {message && <p className={isError ? 'error-message' : 'success-message'}>{message}</p>}
      <form onSubmit={handleSubmit}>
        <label htmlFor="firstName">First Name:</label>
        <input 
          type="text"
          readOnly
          name="firstName"
          value={formData.firstName || ''}
          onChange={handleInputChange}
        />
        <label htmlFor="lastName">Last Name:</label>
        <input 
        readOnly
          type="text"
          name="lastName"
          value={formData.lastName || ''}
          onChange={handleInputChange}
        />
        <label htmlFor="email">Email:</label>
        <input 
        readOnly
          type="email"
          name="email"
          value={formData.email || ''}
          onChange={handleInputChange}
        />
        <label htmlFor="phoneNumber">Phone Number:</label>
        <input 
        readOnly
          type="text"
          name="phoneNumber"
          value={formData.phoneNumber || ''}
          onChange={handleInputChange}
        />
      </form>
    </div>
  );
};

export default AccountSettings;
