import React from 'react'; 
import '../styles/Doctors.css';
import doctor1 from '../assets/doctor1.png';

const Doctors = () => {
  return (
    <div className="doctors-container">
      <h2 className="section-title">Meet Our Doctors</h2>
      <div className="doctors-grid">
        <div className="doctor-card">
          <img src={doctor1} alt="Dr. Prachi Deval" className="doctor-image" />
          <div className="doctor-info">
            <h3 className="doctor-name">Dr. dey ziram</h3>
            <p className="doctor-experience">7 years of experience</p>
            <p className="doctor-specialization">Prosthodontist and Implantologist</p>
            <p className="doctor-description">
              Meet Dr. dey ziram, a leading Prosthodontist and Implantologist from GDC Mumbai...
            </p>
          </div>
        </div>
        <div className="doctor-card">
          <img src={doctor1} alt="Dr. Prachi Deval" className="doctor-image" />
          <div className="doctor-info">
            <h3 className="doctor-name">Dr. dey ziram</h3>
            <p className="doctor-experience">7 years of experience</p>
            <p className="doctor-specialization">Prosthodontist and Implantologist</p>
            <p className="doctor-description">
              Meet Dr. dey ziram, a leading Prosthodontist and Implantologist from GDC Mumbai...
            </p>
          </div>
        </div>
        <div className="doctor-card">
          <img src={doctor1} alt="Dr. Prachi Deval" className="doctor-image" />
          <div className="doctor-info">
            <h3 className="doctor-name">Dr. dey ziram</h3>
            <p className="doctor-experience">7 years of experience</p>
            <p className="doctor-specialization">Prosthodontist and Implantologist</p>
            <p className="doctor-description">
              Meet Dr. dey ziram, a leading Prosthodontist and Implantologist from GDC Mumbai...
            </p>
          </div>
        </div>
        <div className="doctor-card">
          <img src={doctor1} alt="Dr. Prachi Deval" className="doctor-image" />
          <div className="doctor-info">
            <h3 className="doctor-name">Dr. dey ziram</h3>
            <p className="doctor-experience">7 years of experience</p>
            <p className="doctor-specialization">Prosthodontist and Implantologist</p>
            <p className="doctor-description">
              Meet Dr. dey ziram, a leading Prosthodontist and Implantologist from GDC Mumbai...
            </p>
          </div>
        </div>
        {/* Repeat for each doctor */}
      </div>
    </div>
  );
};

export default Doctors;
