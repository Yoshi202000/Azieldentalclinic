import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../../pages/Appointment/Appointment.css';

const AppointmentStepThree = ({ formData, handleInputChange }) => {
  const [loading, setLoading] = useState(true); // Track loading state
  const [isForOther, setIsForOther] = useState(false); // Track if appointment is for another person
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Please log in to continue.');
      navigate('/login');
      return;
    }

    axios.get('http://localhost:5000/verify-token', {
        headers: {
          Authorization: `${token}`,
        },
        withCredentials: true, // If using cookies
      })
      .then((response) => {
        if (!isForOther) {
          handleInputChange({ target: { name: 'firstName', value: response.data.user.firstName } });
          handleInputChange({ target: { name: 'lastName', value: response.data.user.lastName } });
          handleInputChange({ target: { name: 'email', value: response.data.user.email } });
          handleInputChange({ target: { name: 'phoneNumber', value: response.data.user.phoneNumber } });
        }
        setLoading(false);
      })
      .catch(() => {
        alert('Error fetching user data. Please log in again.');
        navigate('/login');
      });
  }, [navigate, isForOther, handleInputChange]);

  const handleCheckboxChange = () => {
    setIsForOther(!isForOther);
    if (!isForOther) {
      // Clear the form data when the checkbox is selected
      handleInputChange({ target: { name: 'firstName', value: '' } });
      handleInputChange({ target: { name: 'lastName', value: '' } });
      handleInputChange({ target: { name: 'dob', value: '' } });
      handleInputChange({ target: { name: 'email', value: '' } });
      handleInputChange({ target: { name: 'phoneNumber', value: '' } });
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

      <div className='stepthree'>
        <div>
          <label>Date of Birth</label>
          <input
            type="date"
            name="dob"
            placeholder="Date of Birth"
            value={formData.dob}
            onChange={handleInputChange}
          />
        </div>
        <div>
          <label>First Name</label>
          <input
            type="text"
            name="firstName"
            value={formData.firstName}
            onChange={handleInputChange}
            readOnly={!isForOther} // Allow editing only if for someone else
          />
        </div>
        <div>
          <label>Last Name</label>
          <input
            type="text"
            name="lastName"
            value={formData.lastName}
            onChange={handleInputChange}
            readOnly={!isForOther} // Allow editing only if for someone else
          />
        </div>
        <div>
          <label>Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            readOnly={!isForOther} // Allow editing only if for someone else
          />
        </div>
        <div>
          <label>Phone Number</label>
          <input
            type="tel"
            name="phoneNumber"
            value={formData.phoneNumber}
            onChange={handleInputChange}
            readOnly={!isForOther} // Allow editing only if for someone else
          />
        </div>
      </div>
    </div>
  );
};

export default AppointmentStepThree;
