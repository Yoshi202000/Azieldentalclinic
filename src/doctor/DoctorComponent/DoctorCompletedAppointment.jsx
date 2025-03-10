import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../../admin/dashboard/Dashboard.css';
import '../../component/admin/ViewAppointment.css';

const DoctorCompletedAppointment = () => {
  const [appointments, setAppointments] = useState([]);
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [user, setUser] = useState(null); // New state for user info
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('All');
  const navigate = useNavigate();

  // Effect to fetch user info and appointments
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Please log in to continue.');
      navigate('/login');
      return;
    }

    fetchUserInfo(token);
  }, [navigate]);

  // Function to fetch user information
  const fetchUserInfo = async (token) => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/verify-token`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        withCredentials: true,
      });

      const { clinic } = response.data.user;
      setUser({ clinic });
      fetchAppointments(token, clinic);
    } catch (error) {
      console.error('Error fetching user info:', error);
      setError('Failed to fetch user information');
      if (error.response && error.response.status === 401) {
        alert('Session expired or invalid. Please log in again.');
        navigate('/login');
      }
    }
  };

  // Function to fetch appointments from the backend
  const fetchAppointments = async (token, clinic) => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/ViewAppointment`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Filter appointments to include only those that belong to the user's clinic and have status 'Completed', 'No Show', 'Cancelled'
      const relevantAppointments = response.data.filter(
        (app) => 
          ['Completed', 'No Show', 'Cancelled'].includes(app.appointmentStatus) &&
          app.bookedClinic === clinic // Match logged-in user's clinic
      );

      setAppointments(relevantAppointments);
      setFilteredAppointments(relevantAppointments);
    } catch (err) {
      console.error('Error fetching appointments:', err);
      setError(err.message);
    }
  };

  // Function to handle filter change
  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
    if (newFilter === 'All') {
      setFilteredAppointments(appointments);
    } else {
      const filtered = appointments.filter((app) => app.appointmentStatus === newFilter);
      setFilteredAppointments(filtered);
    }
  };

  return (
    <div className="completed-appointments-container">
      <h1>Completed, No Show, and Cancelled Appointments</h1>
      <div className="filter-buttons">
        <button onClick={() => handleFilterChange('All')} className={filter === 'All' ? 'active' : ''}>All</button>
        <button onClick={() => handleFilterChange('Completed')} className={filter === 'Completed' ? 'active' : ''}>Completed</button>
        <button onClick={() => handleFilterChange('No Show')} className={filter === 'No Show' ? 'active' : ''}>No Show</button>
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
                  <th>Clinic</th>
                  <th>Status</th>
                  <th>fee</th>
                </tr>
              </thead>
              <tbody>
                {filteredAppointments.map((appointment) => (
                  <tr key={appointment._id}>
                    <td>{appointment.patientFirstName}</td>
                    <td>{appointment.patientLastName}</td>
                    <td>{new Date(appointment.appointmentDate).toLocaleDateString()}</td>
                    <td>{appointment.appointmentTimeFrom}</td>
                    <td>{appointment.bookedClinic}</td>
                    <td>{appointment.appointmentStatus}</td>
                    <td>₱{appointment.fee}</td>
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

export default DoctorCompletedAppointment;
