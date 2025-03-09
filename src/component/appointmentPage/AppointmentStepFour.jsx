import React from 'react';
import './AppointmentStepFour.css';
import gcashQR from '../../uploads/gcashQR.png';

const AppointmentStepFour = ({ onClose }) => {
  return (
    <div className="modal-overlay">
      <div className="stepfour-modal-content">
        <h4>Please pay 50 pesos to reserve your Appointment</h4>
        <a href={gcashQR} download>
          <img src={gcashQR} alt="GCash QR Code" className="gcash-qr" />
        </a>
        <p>Kindly click the image to save the Gcash QR Code</p>
        <button className="close-button" onClick={onClose}>Done</button>
      </div>
    </div>
  );
};

export default AppointmentStepFour;

