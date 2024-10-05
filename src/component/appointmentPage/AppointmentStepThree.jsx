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
      .get('http://localhost:5000/verify-token', {
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

      <div className="stepthree">
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
