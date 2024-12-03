import React from 'react';
import Card from '../Card';
import brace from '../../assets/brace.png';
import clean from '../../assets/clean.png';
import remove from '../../assets/remove.png';

const AppointmentStepOne = ({ 
  selectedCard, 
  handleCardSelect, 
  formData, 
  handleInputChange 
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
        <label>
          <Card
            name="Tooth Extractions"
            description="I am a dentist from Aziel Dental Clinic"
            image={remove}
            isSelected={selectedCard === "Tooth Extractions"}
            onClick={() => handleCardSelect("Tooth Extractions")}
          />
        </label>
        <label>
          <Card
            name="Braces & Orthodontics"
            description="I am a dentist specializing in orthodontics"
            image={brace}
            isSelected={selectedCard === "Braces & Orthodontics"}
            onClick={() => handleCardSelect("Braces & Orthodontics")}
          />
        </label>
        <label>
          <Card
            name="Dental cleaning"
            description="I am a dentist specializing in cleaning"
            image={clean}
            isSelected={selectedCard === "Dental cleaning"}
            onClick={() => handleCardSelect("Dental cleaning")}
          />
        </label>
      </div>
    </div>
  );
};

export default AppointmentStepOne;
