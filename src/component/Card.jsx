// Card.js
import React from 'react';
import '../styles/Card.css'; // Add styles for the card
import defaultImage from '../assets/dentist.png';

const Card = ({ name, description, image, isSelected, onClick, fee }) => {
  const handleImageError = (e) => {
    e.target.src = defaultImage; // Using imported image
  };

  return (
    <div 
      className={`card ${isSelected ? 'selected' : ''}`} 
      onClick={onClick}
    >
      <img 
        src={image || defaultImage} 
        alt={name}
        onError={handleImageError}
      />
      <h3>{name}</h3>
      <p>{description}</p>
      {fee !== undefined && (
        <p className="service-fee">Fee: ₱{fee.toLocaleString()}</p>
      )}
    </div>
  );
};

export default Card;
