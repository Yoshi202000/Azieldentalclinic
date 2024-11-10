import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import AppointmentStepOne from '../appointmentPage/AppointmentStepOne';
import AppointmentStepTwo from '../appointmentPage/AppointmentStepTwo';
import { generateAvailableDates } from '../../utils/appDate';

function ViewAppointmentByUser() {
  const [user, setUser] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [bookedAppointments, setBookedAppointments] = useState([]);
  const navigate = useNavigate();

  const [editingAppointment, setEditingAppointment] = useState(null);
  const [showTypeChange, setShowTypeChange] = useState(false);
  const [showDateTimeChange, setShowDateTimeChange] = useState(false);
  const [selectedCard, setSelectedCard] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTimeFrom, setSelectedTimeFrom] = useState('');
  const [availableDates, setAvailableDates] = useState({});
  const [isContainerExpanded, setIsContainerExpanded] = useState(false);
  const editSectionRef = useRef(null);

  const generateTimeSlots = (start, end) => {
    const timeSlots = [];
    let current = new Date();
    current.setHours(start, 0, 0);
    
    const endTime = new Date();
    endTime.setHours(end, 0, 0);
  
    while (current < endTime) {
      const nextTime = new Date(current.getTime() + 15 * 60000);
      const formattedTime = `${current.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} → ${nextTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`;
      timeSlots.push(formattedTime);
      current = nextTime;
    }
    
    return timeSlots;
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Please log in to continue.');
      navigate('/login');
      return;
    }

    fetchUserInfo(token);
    const dates = generateAvailableDates();
    setAvailableDates(dates);
    fetchBookedAppointments();
  }, [navigate]);

  const fetchUserInfo = async (token) => {
    try {
      const response = await axios.get('http://localhost:5000/api/verify-token', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        withCredentials: true,
      });

      const { firstName, lastName, email, phoneNumber, dob, clinic } = response.data.user;
      setUser({ firstName, lastName, email, phoneNumber, dob, clinic });

      fetchAppointments(token, email);
    } catch (error) {
      console.error('Error fetching user info:', error);
      setError('Failed to fetch user information');
      if (error.response && error.response.status === 401) {
        alert('Session expired or invalid. Please log in again.');
        navigate('/login');
      }
    }
  };

  const fetchAppointments = async (token, userEmail) => {
    try {
      const response = await axios.get('http://localhost:5000/ViewAppointment', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      const filteredAppointments = response.data.filter(
        appointment => appointment.patientEmail === userEmail
      );
      
      setAppointments(filteredAppointments);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching appointments:', err);
      setError('Failed to fetch appointments');
      setLoading(false);
    }
  };

  const fetchBookedAppointments = async () => {
    try {
      const response = await axios.get('http://localhost:5000/booked-appointments');
      if (response.status === 200) {
        setBookedAppointments(response.data.bookedAppointments);
      } else {
        console.error('Failed to fetch booked appointments');
      }
    } catch (error) {
      console.error('Error fetching booked appointments:', error);
    }
  };

  const updateAppointmentStatus = async (appointmentId, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('http://localhost:5000/ViewAppointment/updateStatus', 
        { appointmentId, newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setAppointments(prevAppointments => 
        prevAppointments.map(app => 
          app._id === response.data._id ? response.data : app
        )
      );
    } catch (err) {
      console.error('Error updating appointment status:', err);
      setError('Failed to update appointment status');
    }
  };

  const handleEditAppointment = (appointment) => {
    if (editingAppointment && editingAppointment._id === appointment._id) {
      // If clicking on the same appointment, close it
      setEditingAppointment(null);
      setIsContainerExpanded(false);
      setShowTypeChange(false);
      setShowDateTimeChange(false);
    } else {
      // If clicking on a different appointment, open it and close others
      setEditingAppointment(appointment);
      setIsContainerExpanded(true);
      setShowTypeChange(false);
      setShowDateTimeChange(false);
      setSelectedCard(appointment.appointmentType);
      setSelectedDate(appointment.appointmentDate);
      setSelectedTimeFrom(appointment.appointmentTime);
      // Regenerate available dates when editing an appointment
      const dates = generateAvailableDates();
      setAvailableDates(dates);
    }
  };

  const handleCardSelect = (cardName) => setSelectedCard(cardName);
  const handleDateSelect = (date) => {
    setSelectedDate(date);
    setSelectedTimeFrom(null); 
  };
  
  const handleTimeSelect = (type, time) => {
    if (type === 'from') setSelectedTimeFrom(time);
  };

  const handleUpdateAppointment = async () => {
    try {
      const token = localStorage.getItem('token');
      const updatedAppointment = {
        appointmentType: selectedCard,
        appointmentDate: selectedDate,
        appointmentTime: selectedTimeFrom,
      };

      // Check if the date has changed
      if (selectedDate !== editingAppointment.appointmentDate) {
        updatedAppointment.appointmentStatus = 'Rebooked';
      }

      const response = await axios.put(
        `http://localhost:5000/api/updateAppointment/${editingAppointment._id}`,
        updatedAppointment,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setAppointments(prevAppointments =>
        prevAppointments.map(app =>
          app._id === response.data._id ? response.data : app
        )
      );

      setEditingAppointment(null);
      setShowTypeChange(false);
      setShowDateTimeChange(false);
    } catch (error) {
      console.error('Error updating appointment:', error);
      setError('Failed to update appointment');
    }
  };

  const handleCancelAppointment = (appointmentId) => {
    // Change status to 'Cancelled'
    updateAppointmentStatus(appointmentId, 'Cancelled');
  };

  const toggleExpansion = (expand) => {
    setIsContainerExpanded(expand);
    if (!expand) {
      setShowTypeChange(false);
      setShowDateTimeChange(false);
    }
    
    if (expand && editSectionRef.current) {
      setTimeout(() => {
        editSectionRef.current.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  };

  const [statusFilter, setStatusFilter] = useState('All');

  const filteredAppointments = appointments.filter(appointment => 
    statusFilter === 'All' || appointment.appointmentStatus === statusFilter
  );

  const handleStatusFilterChange = (event) => {
    setStatusFilter(event.target.value);
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className={`ProfileAppointmentContainer ${isContainerExpanded ? 'expanded' : ''}`}>
      {user && (
        <div className="ProfileAppointmentUserInfo">
          <h2>User Information</h2>
          <p>Name: {user.firstName} {user.lastName}</p>
          <p>Email: {user.email}</p>
          <p>Phone: {user.phoneNumber}</p>
          <p>Date of Birth: {user.dob}</p>
          <p>clinic: {user.clinic}</p>
        </div>
      )}

      <h1>Your Appointments</h1>
      
      <div className="ProfileAppointmentFilter">
        <label htmlFor="statusFilter">Filter by Status: </label>
        <select 
          id="statusFilter" 
          value={statusFilter} 
          onChange={handleStatusFilterChange}
          className="ProfileAppointmentSelect"
        >
          <option value="All">All</option>
          <option value="pending">Pending</option>
          <option value="Completed">Completed</option>
          <option value="Cancelled">Cancelled</option>
          <option value="Rebooked">Rebooked</option>
        </select>
      </div>

      {filteredAppointments.length === 0 ? (
        <p>No appointments found.</p>
      ) : (
        <table className="ProfileAppointmentTable">
          <thead>
            <tr>
              <th>Date</th>
              <th>Time</th>
              <th>Type</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredAppointments.map((appointment) => (
              <React.Fragment key={appointment._id}>
                <tr>
                  <td>{appointment.appointmentDate}</td>
                  <td>{appointment.appointmentTimeFrom}</td>
                  <td>{appointment.appointmentType}</td>
                  <td>{appointment.appointmentStatus}</td>
                  <td>
                    <button className="ProfileAppointmentButton" onClick={() => handleEditAppointment(appointment)}>
                      {editingAppointment && editingAppointment._id === appointment._id ? 'Close' : 'Edit'}
                    </button>
                  </td>
                </tr>
                {editingAppointment && editingAppointment._id === appointment._id && (
                  <tr>
                    <td colSpan="5">
                      <div 
                        ref={editSectionRef}
                        className={`ProfileAppointmentEditSection ${isContainerExpanded ? 'expanded' : ''}`}
                      >
                        <h2>Edit Appointment</h2>
                        <button className="ProfileAppointmentButton" onClick={() => {
                          setShowTypeChange(!showTypeChange);
                          setShowDateTimeChange(false);
                        }}>
                          Change Appointment Type
                        </button>
                        <button className="ProfileAppointmentButton" onClick={() => {
                          setShowDateTimeChange(!showDateTimeChange);
                          setShowTypeChange(false);
                        }}>
                          Change Date and Time
                        </button>   

                        <div className="ProfileAppointmentEditContent">
                          {showTypeChange && (
                            <AppointmentStepOne
                              selectedCard={selectedCard}
                              handleCardSelect={handleCardSelect}
                            />
                          )}

                          {showDateTimeChange && (
                            <AppointmentStepTwo
                              availableDates={availableDates}
                              selectedDate={selectedDate}
                              handleDateSelect={handleDateSelect}
                              generateTimeSlots={generateTimeSlots}
                              selectedTimeFrom={selectedTimeFrom}
                              handleTimeSelect={handleTimeSelect}
                              bookedAppointments={bookedAppointments}
                            />
                          )}
                        </div>

                        <button className="ProfileAppointmentButton" onClick={handleUpdateAppointment}>Update Appointment</button>
                        <button className="ProfileAppointmentButton" onClick={() => handleCancelAppointment(editingAppointment._id)}>
                          Cancel Appointment
                        </button>
                        <button className="ProfileAppointmentButton" onClick={() => {
                          setEditingAppointment(null);
                          toggleExpansion(false);
                        }}>Close</button>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default ViewAppointmentByUser;
