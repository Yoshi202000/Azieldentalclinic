import React, { useState, useEffect } from 'react';
import '../styles/Appointment.css'; 

const AppointmentStepThree = ({ formData, handleInputChange }) => {

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('token'); // Assuming you store the token in localStorage
        const response = await fetch('http://localhost:5000/verify-token', {
          headers: {
            Authorization: `Bearer ${token}`, // Send the token in Authorization header
          },
        });
        const result = await response.json();
        
        if (response.ok) {
          // Populate formData with user details
          setFormData({
            firstName: result.user.firstName || '',   // Fallback in case data is missing
            lastName: result.user.lastName || '',     // Fallback in case data is missing
            email: result.user.email || '',           // Fallback in case data is missing
            phoneNumber: result.user.phoneNumber || '', // Fallback in case data is missing
            dob: '', // Leave DOB empty for user input
          });
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };
  
    fetchUserData();
  }, []); // Run this effect only once on component mount
  



  return (
    <>
        <div className="appointment-details">
          <h2>Patient Details</h2>
          <form>
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
                disabled 
              />
            </div>
            <div>
              <label>Last Name</label>
              <input 
                type="text" 
                name="lastName" 
                value={formData.lastName} 
                disabled 
              />
            </div>
            <div>
              <label>Email</label>
              <input 
                type="email" 
                name="email" 
                value={formData.email} 
                disabled 
              />
            </div>
            <div>
              <label>Phone Number</label>
              <input 
                type="tel" 
                name="phoneNumber" 
                value={formData.phoneNumber} 
                disabled 
              />
            </div>
          </form>
        </div>
    </>
  );
};

export default AppointmentStepThree;
