import React from 'react';
import Card from '../Card';

const AppointmentStepOne = ({ 
  selectedCard, 
  handleCardSelect, 
  formData, 
  handleInputChange,
  services, // Services passed from Appointment component
  doctors
}) => {
  return (
    <div className="appointment-type">
      <h2>Schedule Your Appointment</h2>
      
      {/* Clinic Selection */}
      <h2>Choose Your Clinic</h2>
      <select 
        name="bookedClinic" 
        value={formData.bookedClinic} 
        onChange={handleInputChange}
        required
      >
        <option value="" disabled>Choose your clinic</option>
        <option value="Aziel Dental Clinic">Aziel Dental Clinic</option>
        <option value="Arts of Millennials Dental Clinic">Arts of Millennials Dental Clinic</option>
      </select>

      {/* Doctor Selection */}
      <h2>Choose Your Doctor</h2>
      <select
        name="selectedDoctor"
        value={formData.selectedDoctor || ''}
        onChange={handleInputChange}
        required
      >
        <option value="" disabled>Select a doctor</option>
        {doctors && doctors.map((doctor) => (
          <option key={doctor._id} value={doctor.email}>
            Dr. {doctor.firstName} {doctor.lastName}
          </option>
        ))}
      </select>

      {/* Services Selection */}
      <h2>Choose Your Service</h2>
      <div className="app-card-container">
        {services.map((service, index) => (
          <label key={index}>
            <Card
              name={service.name}
              description={service.description}
              image={service.image ? `data:image/png;base64,${service.image}` : null}
              isSelected={selectedCard === service.name}
              onClick={() => handleCardSelect(service.name)}
            />
          </label>
        ))}
      </div>
    </div>
  );
};

export default AppointmentStepOne;
