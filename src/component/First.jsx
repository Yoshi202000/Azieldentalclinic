import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/First.css';
import dentist from '../uploads/mainImg.png';
import axios from 'axios';


const First = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();

  const [welcomeMessage, setWelcomeMessage] = useState('');


  useEffect(() => {
    // Check if the user is logged in by checking for a token in localStorage
    const token = localStorage.getItem('token');
    if (token) {
      setIsLoggedIn(true);
    } else {
      setIsLoggedIn(false);
    }

    axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/clinic`)
    .then(response => {
      if (response.data) {
        const {
          welcomeMessage,
        } = response.data;
        console.log('Clinic data received:', response.data); 
        setWelcomeMessage(welcomeMessage);
      }
    })
    .catch(error => {
      console.error('Error fetching clinic data:', error);
    });

  }, []);

  const handleAppointmentClick = () => {
    if (isLoggedIn) {
      navigate('/appointment');
    } else {
      navigate('/login');
    }
  };

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
