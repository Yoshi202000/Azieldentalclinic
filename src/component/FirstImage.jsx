import React from 'react';
import '../styles/FirstImage.css'; // Add styles for the card
import image from '../uploads/responsiveBg.png'; // Adjust path to where the image is stored

const FirstImage = () => {
  return (
    <div className="FirstImageContainer">
      <div className="shape"></div>
      <div className="image-container">
        <img src={image} alt="Medical Team" className="image" />
      </div>
    </div>
  );
};

export default FirstImage;
