import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../../pages/Appointment/Appointment.css';

const TestLogin = () => {
  const [loading, setLoading] = useState(true); // Track loading state
  const [isForOther, setIsForOther] = useState(false); // Track if appointment is for another person
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    dob: '',
    phoneNumber: '',
    email: '',
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Please log in to continue.');
      navigate('/login');
      return;
    }

    axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/verify-token`, {
      headers: {
          Authorization: `${token}`,
        },
        withCredentials: true, // If using cookies
      })

      .then((response) => {
        if (!isForOther) {
          const { firstName, lastName, email, phoneNumber } = response.data.user;
          setFormData({
            firstName,
            lastName,
            email,
            phoneNumber,
          });
          setLoading(false);
        }
      })
      .catch(() => {
        alert('Error fetching user data. Please log in again.');
        navigate('/login');
      });
      }, [navigate, isForOther, setFormData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
     ...prevData,
      [name]: value,
    }));
  };

  
  const handleCheckboxChange = () => {
    setIsForOther(!isForOther);
    if (!isForOther) {
      // Clear the form data when the checkbox is selected
      setFormData({ target: { name: 'firstName', value: '' } });
      setFormData({ target: { name: 'lastName', value: '' } });
      setFormData({ target: { name: 'dob', value: '' } });
      setFormData({ target: { name: 'email', value: '' } });
      setFormData({ target: { name: 'phoneNumber', value: '' } });
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

export default TestLogin;
