import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/First.css';
import dentist from '../uploads/mainImg.png';
import axios from 'axios';

const First = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();
  const [welcomeMessage, setWelcomeMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check if the user is logged in
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);

    const fetchClinicData = async () => {
      try {
        console.log('Fetching clinic data from:', `${import.meta.env.VITE_API_BASE_URL}/clinic`);
        const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/clinic`);
        console.log('Clinic data response:', response.data);
        
        if (response.data) {
          setWelcomeMessage(response.data.welcomeMessage || 'Welcome to Our Dental Clinic');
        } else {
          setWelcomeMessage('Welcome to Our Dental Clinic');
        }
      } catch (error) {
        console.error('Error fetching clinic data:', error);
        setWelcomeMessage('Welcome to Our Dental Clinic');
      } finally {
        setLoading(false);
      }
    };

    fetchClinicData();
  }, []);

  const handleAppointmentClick = () => {
    if (isLoggedIn) {
      navigate('/appointment');
    } else {
      navigate('/login');
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="first-container">
      <div className="background-overlay"></div>
      <div className="content">
        <div className="text-section">
          <h1>{welcomeMessage}</h1>
          <h2>Book Appointment.</h2>
          <p>Book Services and Doctors.</p>
          <button className="search-button" onClick={handleAppointmentClick}>
            <span className="icon">📅</span> Book an Appointment
          </button>
        </div>
        <div className="image-section">
          <img src={dentist} alt="Dentist Team" className="dentist-image" />
        </div>
      </div>
    </div>
  );
};

export default First;
