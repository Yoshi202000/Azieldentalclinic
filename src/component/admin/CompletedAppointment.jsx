import React, { useState, useEffect } from 'react';
import '../../admin/dashboard/Dashboard.css';
import './ViewAppointment.css';

const CompletedAppointment = () => {
  const [appointments, setAppointments] = useState([]);
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('All');

  // Function to fetch appointments from the backend
  const fetchAppointments = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/ViewAppointment`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      // Filter appointments to include only 'Completed', 'Not Showed', and 'Cancelled' status
      const relevantAppointments = data.filter(app => 
        ['Completed', 'Not Showed', 'Cancelled'].includes(app.appointmentStatus)
      );
      setAppointments(relevantAppointments);
      setFilteredAppointments(relevantAppointments);
    } catch (err) {
      console.error('Error fetching appointments:', err);
      setError(err.message);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  // Function to handle filter change
  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
    if (newFilter === 'All') {
      setFilteredAppointments(appointments);
    } else {
      const filtered = appointments.filter(app => app.appointmentStatus === newFilter);
      setFilteredAppointments(filtered);
    }
  };

  return (
    <div className="completed-appointments-container">
      <h1>Completed, Not Showed, and Cancelled Appointments</h1>
      <div className="filter-buttons">
        <button onClick={() => handleFilterChange('All')} className={filter === 'All' ? 'active' : ''}>All</button>
        <button onClick={() => handleFilterChange('Completed')} className={filter === 'Completed' ? 'active' : ''}>Completed</button>
        <button onClick={() => handleFilterChange('Not Showed')} className={filter === 'Not Showed' ? 'active' : ''}>Not Showed</button>
        <button onClick={() => handleFilterChange('Cancelled')} className={filter === 'Cancelled' ? 'active' : ''}>Cancelled</button>
      </div>
      {error ? (
        <p>Error: {error}</p>
      ) : filteredAppointments.length === 0 ? (
        <p>No appointments found for the selected filter.</p>
      ) : (
        <div className='table-responsive-container'>
          <div className='table-responsive'>
        <table className="AdminAppointmentTable">
          <thead>
            <tr>
              <th>Patient First Name</th>
              <th>Patient Last Name</th>
              <th>Date</th>
              <th>Appointment Time</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredAppointments.map((appointment) => (
              <tr key={appointment._id}>
                <td>{appointment.patientFirstName}</td>
                <td>{appointment.patientLastName}</td>
                <td>{new Date(appointment.appointmentDate).toLocaleDateString()}</td>
                <td>{appointment.appointmentTimeFrom}</td>
                <td>{appointment.appointmentStatus}</td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
        </div>
      )}
    </div>
  );
};

export default CompletedAppointment;

