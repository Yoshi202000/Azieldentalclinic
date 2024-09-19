import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Test = () => {
  const [user, setUser] = useState(null); // Store user details
  const [appointments, setAppointments] = useState([]); // Store appointments
  const navigate = useNavigate();

  useEffect(() => {
    // Verify token and fetch user details
    axios
      .get('http://localhost:5000/verify-token', {
        withCredentials: true, // Include cookies with the request
      })
      .then((response) => {
        setUser(response.data.user);

        // Fetch appointments after the user is successfully set
        return axios.get('http://localhost:5000/appointments', {
          headers: {
              Authorization: `Bearer ${response.data.token}`,
          },
          withCredentials: true,
      });
      })
      .then((response) => {
        // Set appointments data
        setAppointments(response.data.appointments);
      })
      .catch(() => {
        navigate('/login');
      });
  }, [navigate]);

  if (!user) {
    return <p>Loading...</p>;
  }

  return (
    <div>
      <h1>Hello {user.firstName} {user.lastName} {user.phoneNumber}</h1>
      <button onClick={() => {
        navigate('/login'); // Redirect to login on logout
      }}>
        Logout
      </button>

      <h2>Your Appointments</h2>
      {appointments.length > 0 ? (
        <ul>
          {appointments.map((appointment) => (
            <li key={appointment._id}>
              {appointment.appointmentDate} - {appointment.appointmentTimeFrom} - {appointment.appointmentType}
            </li>
          ))}
        </ul>
      ) : (
        <p>No appointments found.</p>
      )}
    </div>
  );
};

export default Test;
