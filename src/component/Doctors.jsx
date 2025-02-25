import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/Doctors.css';
import doctor1 from '../assets/doctor1.png';

const Doctors = () => {
  const [doctors, setDoctors] = useState([]);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/doctor-info`);
        if (response.status === 200) {
          setDoctors(response.data.doctors);
        } else {
          console.error('Failed to fetch doctors');
        }
      } catch (error) {
        console.error('Error fetching doctors:', error);
      }
    };

    fetchDoctors();
  }, []);

  return (
    <div className="doctors-container">
      <h2 className="section-title">Meet Our Doctors</h2>
      <div className="doctors-grid">
        {doctors.map((doctor) => (
          <div className="doctor-card" key={doctor._id}>
            <img src={doctor1} alt={`Dr. ${doctor.lastName}`} className="doctor-image" />
            <div className="doctor-info">
              <h3 className="doctor-name">Dr. {doctor.lastName}</h3>
              <p className="doctor-greetings">{doctor.doctorGreeting}</p>
              <p className="doctor-description">{doctor.doctorDescription}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Doctors;
