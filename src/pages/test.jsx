import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Test = () => {
  const [user, setUser] = useState(null); // Store user details
  const [appointments, setAppointments] = useState([]); // Store appointments
  const navigate = useNavigate();

  useEffect(() => {
    // Check if the token is available
    const token = localStorage.getItem('token');

    if (!token) {
      // If no token, redirect to login
      navigate('/login');
    } else {
      // Verify token and fetch user details
      axios
        .get('http://localhost:5000/verify-token', {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((response) => {
          setUser(response.data.user);
        })
        .catch(() => {
          localStorage.removeItem('token');
          navigate('/login');
        });

      // Fetch available appointments from the server
      axios
        .get('http://localhost:5000/appointments')
        .then((response) => {
          setAppointments(response.data);
        })
        .catch((error) => {
          console.error('Error fetching appointments:', error);
        });
    }
  }, [navigate]);

  // If the user is not loaded yet, show loading
  if (!user) {
    return <p>Loading...</p>;
  }

  // Render Hello message and appointment slots
  return (
    <div>
      <h1>Hello {user.firstName} {user.lastName} {user.email} {user.phoneNumber}</h1>
      <button onClick={() => {
        localStorage.removeItem('token');
        navigate('/login'); // Logout and redirect to login page
      }}>
        Logout
      </button>

      {/* Display available appointments */}
      <div>
        <h2>Available Appointments:</h2>
        {appointments.map((appointment, index) => (
          <div key={index}>
            <h3>Date: {appointment.appointmentDate}</h3>
            {Object.keys(appointment).map((timeSlot) => (
              timeSlot !== 'appointmentDate' && (
                <p key={timeSlot}>
                  {timeSlot}: {appointment[timeSlot] === '' ? 'Available' : 'Booked'}
                </p>
              )
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Test;
