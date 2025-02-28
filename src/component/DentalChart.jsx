import React, { useState } from 'react';
import axios from 'axios';
import '../styles/ViewDentalChart.css';
const DentalChartForm = () => {
  const [patientType, setPatientType] = useState('adult'); // Default to adult
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    date: new Date().toISOString().split('T')[0], // Default to today's date
    teeth: {},
  });

  const toothNumbers = patientType === 'adult'
    ? Array.from({ length: 32 }, (_, i) => i + 1) // Adult: 1-32
    : 'ABCDEFGHIJJKLMNOPQRST'.split(''); // Child: A-T

  console.log(toothNumbers);

  const toothStatuses = ['Healthy', 'Cleaned', 'Decayed', 'Removed', 'Filled', 'Crowned', 'Braced'];

  // Initialize teeth status to Healthy
  const initializeTeethStatus = () => {
    const initialTeeth = {};
    toothNumbers.forEach((tooth) => {
      initialTeeth[tooth] = { status: 'Healthy', notes: '' }; // Default status is Healthy
    });
    return initialTeeth;
  };

  // Set initial teeth status when patient type changes
  const handlePatientTypeChange = (type) => {
    setPatientType(type);
    setFormData((prevData) => ({
      ...prevData,
      teeth: initializeTeethStatus(), // Reset teeth status to Healthy
    }));
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle tooth status selection
  const handleToothChange = (tooth, status) => {
    setFormData((prevData) => ({
      ...prevData,
      teeth: {
        ...prevData.teeth,
        [tooth]: { status, notes: '' }, // Update status
      },
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem('token'); // Retrieve the token from local storage
      const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/add-dental-chart`, {
        ...formData,
        type: patientType, // Sending type as "adult" or "child"
      }, {
        headers: {
          Authorization: `Bearer ${token}`, // Include the token in the headers
        },
      });

      alert(response.data.message);
    } catch (error) {
      console.error('Error saving dental chart:', error);
      alert('Failed to save dental chart. Please try again.');
    }
  };

  // Initialize teeth status on component mount
  React.useEffect(() => {
    setFormData((prevData) => ({
      ...prevData,
      teeth: initializeTeethStatus(), // Set default status to Healthy
    }));
  }, [patientType]);

  return (
    <div className="dental-chart-form">
      <h2>Dental Chart Form</h2>

      {/* Patient Type Selection */}
      <div>
        <label>Patient Type:</label>
        <select value={patientType} onChange={(e) => handlePatientTypeChange(e.target.value)}>
          <option value="adult">Adult</option>
          <option value="child">Child</option>
        </select>
      </div>

      {/* Patient Details */}
      <div>
        <label>First Name:</label>
        <input type="text" name="firstName" value={formData.firstName} onChange={handleInputChange} required />
      </div>

      <div>
        <label>Last Name:</label>
        <input type="text" name="lastName" value={formData.lastName} onChange={handleInputChange} required />
      </div>

      <div>
        <label>Email:</label>
        <input type="email" name="email" value={formData.email} onChange={handleInputChange} required />
      </div>

      <div>
        <label>Date:</label>
        <input type="date" name="date" value={formData.date} onChange={handleInputChange} />
      </div>

      {/* Tooth Status Selection */}
      <h3>Select Tooth Status:</h3>
      <div className="tooth-grid">
        {toothNumbers.map((tooth) => (
          <div key={`${patientType}-${tooth}`} className="tooth-box">
            <label>Tooth {tooth}</label>
            <select 
              value={formData.teeth[tooth]?.status || 'Healthy'} // Default to Healthy
              onChange={(e) => handleToothChange(tooth, e.target.value)}
            >
              {toothStatuses.map((status) => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>
        ))}
      </div>

      {/* Submit Button */}
      <button onClick={handleSubmit}>Submit Dental Chart</button>
    </div>
  );
};

export default DentalChartForm;
