import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../../pages/Appointment/Appointment.css';

const AppointmentStepThree = ({ formData, handleInputChange }) => {
  const [loading, setLoading] = useState(true);
  const [isForOther, setIsForOther] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Please log in to continue.');
      navigate('/login');
      return;
    }

    // Fetch user data only once on component mount
    axios
    .get(`${import.meta.env.VITE_BACKEND_URL}/api/verify-token`, {
      headers: {
          Authorization: `${token}`,
        },
        withCredentials: true,
      })
      .then((response) => {
        const { firstName, lastName, email, phoneNumber } = response.data.user;

        console.log('Fetched Data:', { firstName, lastName, email, phoneNumber });

        if (!isForOther) {
          handleInputChange({ target: { name: 'firstName', value: firstName || '' } });
          handleInputChange({ target: { name: 'lastName', value: lastName || '' } });
          handleInputChange({ target: { name: 'email', value: email || '' } });
          handleInputChange({ target: { name: 'phoneNumber', value: phoneNumber || '' } });
        }

        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching user data:', error);
        alert('Error fetching user data. Please log in again.');
        navigate('/login');
      });
  }, [navigate]);  // Only include necessary dependencies

  // No need to put handleInputChange here if it's not changing frequently

  const handleCheckboxChange = () => {
    setIsForOther(!isForOther);
    if (!isForOther) {
      handleInputChange({ target: { name: 'firstName', value: '' } });
      handleInputChange({ target: { name: 'lastName', value: '' } });
      handleInputChange({ target: { name: 'dob', value: '' } });
      handleInputChange({ target: { name: 'clinic', value: '' } });
    }
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <div className="appointment-details">
      <h2>Patient Details</h2>

      <label>
        <input
          type="checkbox"
          checked={isForOther}
          onChange={handleCheckboxChange}
        />
        Appointment is for someone else
      </label>

      <div className="stepthree">
        <label>Choose your clinic</label>
        <select 
          name='bookedClinic' 
          value={formData.bookedClinic} 
          onChange={handleInputChange}
        >
          <option value="" disabled>Choose your clinic</option>
          <option value="Aziel Dental Clinic">Aziel Dental Clinic</option>
          <option value="Arts of Millennials Dental Clinic">Arts of Millennials Dental Clinic</option>
        </select>

        <label>Date of Birth</label>
        <input
          type="date"
          name="dob"
          value={formData.dob}
          onChange={handleInputChange}
        />

        <label>First Name</label>
        <input
          type="text"
          name="firstName"
          value={formData.firstName}
          onChange={handleInputChange}
          readOnly={!isForOther}
        />

        <label>Last Name</label>
        <input
          type="text"
          name="lastName"
          value={formData.lastName}
          onChange={handleInputChange}
          readOnly={!isForOther}
        />

        <label>Email</label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleInputChange}
          readOnly={!isForOther}
        />

        <label>Phone Number</label>
        <input
          type="tel"
          name="phoneNumber"
          value={formData.phoneNumber}
          onChange={handleInputChange}
          readOnly={!isForOther}
        />
      </div>
    </div>
  );
};

export default AppointmentStepThree;
