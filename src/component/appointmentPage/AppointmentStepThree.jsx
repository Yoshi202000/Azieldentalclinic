import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../../pages/Appointment/Appointment.css';

const AppointmentStepThree = ({ formData, handleInputChange }) => {
  const [loading, setLoading] = useState(true);
  const [isForOther, setIsForOther] = useState(false);
  const [userData, setUserData] = useState({}); // State to hold user data
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

        // Store fetched data in userData state for future reference
        const userData = {
          firstName: firstName || '',
          lastName: lastName || '',
          email: email || '',
          phoneNumber: phoneNumber || '',
        };
        setUserData(userData);

        // Set initial values if not "for other"
        if (!isForOther) {
          handleInputChange({ target: { name: 'firstName', value: userData.firstName } });
          handleInputChange({ target: { name: 'lastName', value: userData.lastName } });
          handleInputChange({ target: { name: 'email', value: userData.email } });
          handleInputChange({ target: { name: 'phoneNumber', value: userData.phoneNumber } });
        }

        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching user data:', error);
        alert('Error fetching user data. Please log in again.');
        navigate('/login');
      });
  }, [navigate]);

  // Handle checkbox change for "Appointment is for someone else"
  const handleCheckboxChange = () => {
    const newValue = !isForOther;
    setIsForOther(newValue);

    if (newValue) {
      // If "for other" is checked, clear out fields
      handleInputChange({ target: { name: 'firstName', value: '' } });
      handleInputChange({ target: { name: 'lastName', value: '' } });
      handleInputChange({ target: { name: 'dob', value: '' } });
    } else {
      // If "for other" is unchecked, restore original user data
      handleInputChange({ target: { name: 'firstName', value: userData.firstName } });
      handleInputChange({ target: { name: 'lastName', value: userData.lastName } });
    }
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  // Add a function to display appointment type and time slots properly
  const renderAppointmentTypes = () => {
    if (!formData.appointmentType) return 'None selected';
    
    if (Array.isArray(formData.appointmentType)) {
      return formData.appointmentType.join(', ');
    }
    
    return formData.appointmentType;
  };
  
  const renderTimeSlots = () => {
    if (formData.displayTimeFrom) {
      return formData.displayTimeFrom;
    }
    
    if (!formData.appointmentTimeFrom) return 'No time selected';
    
    if (Array.isArray(formData.appointmentTimeFrom)) {
      return formData.appointmentTimeFrom.join(', ');
    }
    
    return formData.appointmentTimeFrom;
  };

  return (
    <div className="appointment-details">
      <h2>Patient Details</h2>

      <div className="appointment-summary">
        <h3>Appointment Summary</h3>
        <p><strong>Clinic:</strong> {formData.bookedClinic || 'Not selected'}</p>
        <p><strong>Doctor:</strong> Dr. {formData.doctorFirstName} {formData.doctorLastName}</p>
        <p><strong>Date:</strong> {formData.appointmentDate || 'Not selected'}</p>
        <p><strong>Time:</strong> {renderTimeSlots()}</p>
        <p><strong>Services:</strong> {renderAppointmentTypes()}</p>
      </div>

      <label>
        <input
          type="checkbox"
          checked={isForOther}
          onChange={handleCheckboxChange}
        />
        Appointment is for someone else?
      </label>

      <div className="stepthree">
        <label>Date of Birth</label>
        <input
          type="date"
          name="dob" 
          value={formData.dob}
          onChange={handleInputChange}
          required
        />

        <label>First Name</label>
        <input
          type="text"
          name="firstName"
          value={formData.firstName}
          onChange={handleInputChange}
          readOnly={!isForOther}
          required
        />

        <label>Last Name</label>
        <input
          type="text"
          name="lastName"
          value={formData.lastName}
          onChange={handleInputChange}
          readOnly={!isForOther}
          required
        />

        <label>Email</label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleInputChange}
          readOnly={!isForOther}
          required
        />

        <label>Phone Number</label>
        <input
          type="tel"
          name="phoneNumber"
          value={formData.phoneNumber}
          onChange={handleInputChange}
          readOnly={!isForOther}
          required
        />
      </div>
    </div>
  );
};

export default AppointmentStepThree;
