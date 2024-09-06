// Card.js
import React from 'react';
import '../styles/Card.css'; // Add styles for the card

const Card = ({ name, description, image, isSelected, onClick }) => {
  return (
    <div 
      className={`card ${isSelected ? 'selected' : ''}`} 
      onClick={onClick}
    >
      <img src={image} alt={name} />
      <h3>{name}</h3>
      <p>{description}</p>
    </div>
  );
};

export default Card;
