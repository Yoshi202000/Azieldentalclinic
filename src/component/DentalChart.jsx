import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/DentalChart.css';

const DentalChartForm = ({ initialFirstName = '', initialLastName = '', initialEmail = '', onClose }) => {
  const [patientType, setPatientType] = useState('adult'); // Default to adult
  const [formData, setFormData] = useState({
    firstName: initialFirstName,
    lastName: initialLastName,
    email: initialEmail,
    date: new Date().toISOString().split('T')[0], // Default to today's date
    teeth: {},
  });

  // For adult teeth, split into quadrants for better display
  const getToothNumbers = () => {
    if (patientType === 'adult') {
      // Upper right (1-8), Upper left (9-16), Lower left (17-24), Lower right (25-32)
      const upperRight = Array.from({ length: 8 }, (_, i) => i + 1);
      const upperLeft = Array.from({ length: 8 }, (_, i) => i + 9);
      const lowerLeft = Array.from({ length: 8 }, (_, i) => i + 17);
      const lowerRight = Array.from({ length: 8 }, (_, i) => i + 25);
      return { upperRight, upperLeft, lowerLeft, lowerRight };
    } else {
      // For children's teeth (A-T), split into upper (A-J) and lower (K-T)
      const upperTeeth = 'ABCDEFGHIJ'.split('');
      const lowerTeeth = 'KLMNOPQRST'.split('');
      return { upperTeeth, lowerTeeth };
    }
  };

  const toothNumbers = patientType === 'adult'
    ? Array.from({ length: 32 }, (_, i) => i + 1) // Adult: 1-32 (for data storage)
    : 'ABCDEFGHIJKLMNOPQRST'.split(''); // Child: A-T (for data storage)

  // Updated tooth statuses based on dental notation
  const toothStatuses = [
    { code: 'H', description: 'Healthy' },
    { code: 'C', description: 'Caries' },
    { code: 'Co', description: 'Composite' },
    { code: 'M', description: 'Missing' },
    { code: 'Am', description: 'Amalgam' },
    { code: 'A', description: 'Abutment' },
    { code: 'Cr', description: 'Crown' },
    { code: 'P', description: 'Pontic' },
    { code: 'Ab', description: 'Abrasion' },
    { code: 'X', description: 'Extraction' },
    { code: 'U', description: 'Unerupted' },
    { code: 'RF', description: 'Root Fragment' },
    { code: 'B', description: 'Bridge' }
  ];

  // Initialize teeth status and notes
  const initializeTeethStatus = () => {
    const initialTeeth = {};
    toothNumbers.forEach((tooth) => {
      initialTeeth[tooth] = { status: 'H', notes: '' }; // Default status is Healthy, notes empty
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
        [tooth]: { ...prevData.teeth[tooth], status }, // Update only status
      },
    }));
  };

  // Handle notes input change
  const handleToothNotesChange = (tooth, notes) => {
    setFormData((prevData) => ({
      ...prevData,
      teeth: {
        ...prevData.teeth,
        [tooth]: { ...prevData.teeth[tooth], notes }, // Update only notes
      },
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem('token'); // Retrieve the token from local storage
      const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/add-dental-chart`, {
        ...formData,
        type: patientType, // Sending type as "adult" or "child"
      }, {
        headers: {
          Authorization: `Bearer ${token}`, // Include the token in the headers
        },
      });

      alert(response.data.message);
      onClose(); // Close the DentalChartForm after successful submission
    } catch (error) {
      console.error('Error saving dental chart:', error);
      alert('Failed to save dental chart. Please try again.');
    }
  };

  // Initialize teeth status on component mount
  useEffect(() => {
    setFormData((prevData) => ({
      ...prevData,
      teeth: initializeTeethStatus(), // Set default status to Healthy
    }));
  }, [patientType]);

  // Use useEffect to update formData when initial props change
  useEffect(() => {
    setFormData((prevData) => ({
      ...prevData,
      firstName: initialFirstName,
      lastName: initialLastName,
      email: initialEmail,
    }));
  }, [initialFirstName, initialLastName, initialEmail]);

  // Render tooth box component
  const renderToothBox = (tooth) => {
    const toothData = formData.teeth[tooth] || { status: 'H', notes: '' };
    const statusObj = toothStatuses.find(s => s.code === toothData.status) || toothStatuses[0];
    
    return (
      <div 
        key={`${patientType}-${tooth}`} 
        className={`dentalChartForm-toothBox status-${statusObj.code}`}
      >
        <label>Tooth {tooth}</label>
        <select 
          value={toothData.status} 
          onChange={(e) => handleToothChange(tooth, e.target.value)}
        >
          {toothStatuses.map((status) => (
            <option key={status.code} value={status.code}>
              {status.code} - {status.description}
            </option>
          ))}
        </select>

        <input
          type="text"
          placeholder="Add notes"
          value={toothData.notes}
          onChange={(e) => handleToothNotesChange(tooth, e.target.value)}
        />
      </div>
    );
  };

  // Get organized tooth arrays for display
  const organizedTeeth = getToothNumbers();

  return (
    <div className="dentalChartForm-container">
      <h2>Dental Chart Record</h2>

      {/* Patient Information Section */}
      <div className="dentalChartForm-section">
        <h3>Patient Information</h3>
        <div className="dentalChartForm-patientInfo">
          <div className="dentalChartForm-typeSelection">
            <label htmlFor="patientType">Patient Type</label>
            <select 
              id="patientType"
              value={patientType} 
              onChange={(e) => handlePatientTypeChange(e.target.value)}
            >
              <option value="adult">Adult</option>
              <option value="child">Child</option>
            </select>
          </div>

          <div className="dentalChartForm-inputGroup">
            <label htmlFor="firstName">First Name</label>
            <input 
              type="text" 
              id="firstName"
              name="firstName" 
              value={formData.firstName} 
              onChange={handleInputChange} 
              required 
            />
          </div>

          <div className="dentalChartForm-inputGroup">
            <label htmlFor="lastName">Last Name</label>
            <input 
              type="text" 
              id="lastName"
              name="lastName" 
              value={formData.lastName} 
              onChange={handleInputChange} 
              required 
            />
          </div>

          <div className="dentalChartForm-inputGroup">
            <label htmlFor="email">Email</label>
            <input 
              type="email" 
              id="email"
              name="email" 
              value={formData.email} 
              onChange={handleInputChange} 
              required 
            />
          </div>

          <div className="dentalChartForm-inputGroup">
            <label htmlFor="date">Date of Exam</label>
            <input 
              type="date" 
              id="date"
              name="date" 
              value={formData.date} 
              onChange={handleInputChange} 
            />
          </div>
        </div>
      </div>

      {/* Legend for dental codes */}
      <div className="dentalChartForm-section">
        <h3>Dental Status Legend</h3>
        <div className="dentalChartForm-legend">
          {toothStatuses.map(status => (
            <div key={status.code} className={`legend-item status-${status.code}`}>
              <span className="legend-code">{status.code}</span>
              <span className="legend-description">{status.description}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Tooth Status and Notes Section */}
      <div className="dentalChartForm-section">
        <h3>Dental Chart</h3>
        
        {patientType === 'adult' ? (
          <>
            {/* Adult Teeth Layout */}
            <div className="dentalChartForm-section">
              <h4>Upper Teeth (1-16)</h4>
              <div className="dentalChartForm-toothGrid">
                {/* Upper Right Quadrant (1-8) */}
                {organizedTeeth.upperRight.map(renderToothBox)}
                {/* Upper Left Quadrant (9-16) */}
                {organizedTeeth.upperLeft.map(renderToothBox)}
              </div>
            </div>
            
            <div className="dentalChartForm-section">
              <h4>Lower Teeth (17-32)</h4>
              <div className="dentalChartForm-toothGrid">
                {/* Lower Left Quadrant (17-24) */}
                {organizedTeeth.lowerLeft.map(renderToothBox)}
                {/* Lower Right Quadrant (25-32) */}
                {organizedTeeth.lowerRight.map(renderToothBox)}
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Child Teeth Layout */}
            <div className="dentalChartForm-section">
              <h4>Upper Teeth (A-J)</h4>
              <div className="dentalChartForm-toothGrid">
                {organizedTeeth.upperTeeth.map(renderToothBox)}
              </div>
            </div>
            
            <div className="dentalChartForm-section">
              <h4>Lower Teeth (K-T)</h4>
              <div className="dentalChartForm-toothGrid">
                {organizedTeeth.lowerTeeth.map(renderToothBox)}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Submit Button */}
      <button className="dentalChartForm-submitButton" onClick={handleSubmit}>
        Save Dental Chart
      </button>
    </div>
  );
};

export default DentalChartForm;
