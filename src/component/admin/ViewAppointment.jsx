import React, { useState, useEffect } from 'react';
import '../../admin/dashboard/Dashboard.css';


const ViewAppointment = () => {
  const [appointments, setAppointments] = useState([]);
  const [error, setError] = useState(null);

  // Function to fetch appointments from the backend
  const fetchAppointments = async () => {
    try {
      const response = await fetch('http://localhost:5000/ViewAppointment'); // Ensure this matches your backend URL
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setAppointments(data);
    } catch (err) {
      console.error('Error fetching appointments:', err);
      setError(err.message);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  return (
    <div className="view-appointments-container">
      <h1>Appointments</h1>
      {error ? (
        <p>Error fetching appointments: {error}</p>
      ) : appointments.length === 0 ? (
        <p>No appointments found.</p>
      ) : (
        <table className="patients-table">
          <thead>
            <tr>
              <th>Patient Frist Name</th>
              <th>Patient Last Name</th>
              <th>Date</th>
              <th>Appointment Time</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {appointments.map((appointments) => (
              <tr key={appointments._id}>
                <td>{appointments.patientFirstName}</td>
                <td>{appointments.patientLastName}</td>
                <td>{new Date(appointments.appointmentDate).toLocaleDateString()}</td>
                <td>{appointments.appointmentTimeFrom}</td>
                <td>{appointments.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default ViewAppointment;
