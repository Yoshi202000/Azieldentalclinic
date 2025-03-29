import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/Doctors.css';
import doctor1 from '../assets/doctor1.png';

const Doctors = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        console.log('Fetching doctors from:', `${import.meta.env.VITE_API_BASE_URL}/api/doctor-info`);
        const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/doctor-info`);
        console.log('Doctors response:', response.data);
        
        if (response.data && Array.isArray(response.data.doctors)) {
          setDoctors(response.data.doctors);
        } else {
          console.error('Invalid response format:', response.data);
          setError('Invalid data format received from server');
          setDoctors([]);
        }
      } catch (error) {
        console.error('Error fetching doctors:', error);
        setError('Failed to load doctors. Please try again later.');
        setDoctors([]);
      } finally {
        setLoading(false);
      }
    };

    fetchDoctors();
  }, []);

  if (loading) return <div>Loading doctors...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="doctors-container">
      <h2 className="section-title">Meet Our Doctors</h2>
      <div className="doctors-grid">
        {doctors && doctors.length > 0 ? (
          doctors.map((doctor) => (
            <div className="doctor-card" key={doctor._id}>
              <img 
                src={doctor.doctorImage ? `${import.meta.env.VITE_API_BASE_URL}${doctor.doctorImage}` : doctor1} 
                className="doctor-image"
                alt={`Dr. ${doctor.lastName}`}
              />
              <div className="doctor-info">
                <h3 className="doctor-name">Dr. {doctor.lastName}</h3>
                <p className="doctor-greetings">{doctor.doctorGreeting}</p>
                <p className="doctor-description">{doctor.doctorDescription}</p>
              </div>
            </div>
          ))
        ) : (
          <div>No doctors available</div>
        )}
      </div>
    </div>
  );
};

export default Doctors;
