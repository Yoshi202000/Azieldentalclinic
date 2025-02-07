import React from 'react';
import Card from '../Card';

const AppointmentStepOne = ({ 
  selectedCard, 
  handleCardSelect, 
  formData, 
  handleInputChange,
  services // Services passed from Appointment component
}) => {
  return (
    <div className="appointment-type">
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
      <h2>Schedule Your Appointment</h2>
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
