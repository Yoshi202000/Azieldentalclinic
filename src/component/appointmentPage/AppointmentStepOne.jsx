// AppointmentStepOne.jsx
import React from 'react';
import Card from '../Card';
import brace from '../../assets/brace.png';
import clean from '../../assets/clean.png';
import remove from '../../assets/remove.png';

const AppointmentStepOne = ({ selectedCard, handleCardSelect }) => {
  return (
    <div className="appointment-type">
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
            name="dental cleaning"
            description="I am a dentist specializing in cleaning"
            image={clean}
            isSelected={selectedCard === "dental cleaning"}
            onClick={() => handleCardSelect("dental cleaning")}
          />
        </label>
      </div>
    </div>
  );
};

export default AppointmentStepOne;
