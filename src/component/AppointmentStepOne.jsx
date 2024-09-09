// AppointmentStepOne.jsx
import React from 'react';
import Card from '../component/Card';
import profilePic1 from '../assets/azielDental.png';

const AppointmentStepOne = ({ selectedCard, handleCardSelect }) => {
  return (
    <div className="appointment-type">
      <h2>Schedule Your Appointment</h2>
      <div className="card-container">
        <label>
          <Card
            name="Tooth Extractions"
            description="I am a dentist from Aziel Dental Clinic"
            image={profilePic1}
            isSelected={selectedCard === "Tooth Extractions"}
            onClick={() => handleCardSelect("Tooth Extractions")}
          />
        </label>
        <label>
          <Card
            name="Braces & Orthodontics"
            description="I am a dentist specializing in orthodontics"
            image={profilePic1}
            isSelected={selectedCard === "Braces & Orthodontics"}
            onClick={() => handleCardSelect("Braces & Orthodontics")}
          />
        </label>
        <label>
          <Card
            name="Dental Fillings"
            description="I am a dentist specializing in cleaning"
            image={profilePic1}
            isSelected={selectedCard === "Dental Fillings"}
            onClick={() => handleCardSelect("Dental Fillings")}
          />
        </label>
      </div>
    </div>
  );
};

export default AppointmentStepOne;
