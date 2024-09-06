import React from 'react';
import '../styles/Doctors.css';
import doctor1 from '../assets/doctor1.png';
import doctor2 from '../assets/doctor2.jpg';

const Doctors = () => {
  return (
    <div className="doctors-container">
      <h2 className="section-title">Meet Your Doctors</h2>
      <div className="doctors-grid">
        <div className="doctor-card">
          <img src={doctor1} alt="Dr. Prachi Deval" className="doctor-image" />
          <h3>Dr. dey ziram</h3>
          <p>Meet dey ziram, a leading Prosthodontist and Implantologist from GDC Mumbai...</p>
        </div>
        <div className="doctor-card">
          <img src={doctor1} alt="Dr. Rohan Nashikkar" className="doctor-image" />
          <h3>Dr. dey ziram</h3>
          <p>Dr. dey ziram is a 2011 MGV Dental college passout. His skills and passions in practice are focused on...</p>
        </div>
        <div className="doctor-card">
          <img src={doctor1} alt="Dr. Pinal Jain" className="doctor-image" />
          <h3>Dr. dey ziram</h3>
          <p>Dr. dey ziram is a Periodontist and Implantologist and has an experience of 7 years in these fields...</p>
        </div>
      </div>
    </div>
  );
};

export default Doctors;
