import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import AppointmentStepOne from '../appointmentPage/AppointmentStepOne';
import AppointmentStepTwo from '../appointmentPage/AppointmentStepTwo';
import { generateAvailableDates } from '../../utils/appDate';
import './ViewAppointment.css';

function ViewAppointment() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [user, setUser] = useState(null); // Added user state
  const [editingAppointment, setEditingAppointment] = useState(null);
  const [showTypeChange, setShowTypeChange] = useState(false);
  const [showDateTimeChange, setShowDateTimeChange] = useState(false);
  const [selectedCard, setSelectedCard] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTimeFrom, setSelectedTimeFrom] = useState('');
  const [availableDates, setAvailableDates] = useState({});
  const [bookedAppointments, setBookedAppointments] = useState([]); // New state for booked appointments
  const [isContainerExpanded, setIsContainerExpanded] = useState(false);
  const [nameFilter, setNameFilter] = useState(''); // New state for name filter
  const [typeFilter, setTypeFilter] = useState(''); // New state for type filter
  const [dateSortOrder, setDateSortOrder] = useState(''); // New state for date sort order
  const editSectionRef = useRef(null);
  const navigate = useNavigate();

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

      fetchAppointments(token, clinic); // Fetch appointments after getting user info
    } catch (error) {
      console.error('Error fetching user info:', error);
      setError('Failed to fetch user information');
      if (error.response && error.response.status === 401) {
        alert('Session expired or invalid. Please log in again.');
        navigate('/login');
      }
    }
  };
  
  const fetchAppointments = async (token, clinic) => {
    try {
      const response = await axios.get('http://localhost:5000/ViewAppointment', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log('All appointments:', response.data);
      const filteredAppointments = response.data.filter(
        appointment =>
          (appointment.appointmentStatus === 'pending' || appointment.appointmentStatus === 'Rebooked') &&
          appointment.bookedClinic === clinic // Filter appointments by user's clinic
      );
      console.log('Filtered appointments:', filteredAppointments);
      setAppointments(filteredAppointments);
      setBookedAppointments(filteredAppointments); // Set booked appointments for managing available slots
      setLoading(false);
    } catch (err) {
      console.error('Error fetching appointments:', err);
      setError('Failed to fetch appointments');
      setLoading(false);
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
      setEditingAppointment(null);
      setIsContainerExpanded(false);
      setShowTypeChange(false);
      setShowDateTimeChange(false);
    } else {
      setEditingAppointment(appointment);
      setIsContainerExpanded(true);
      setShowTypeChange(false);
      setShowDateTimeChange(false);
      setSelectedCard(appointment.appointmentType);
      setSelectedDate(appointment.appointmentDate);
      setSelectedTimeFrom(appointment.appointmentTime);
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

  const filteredAppointments = appointments.filter(appointment => {
    const nameMatch = `${appointment.patientFirstName} ${appointment.patientLastName}`.toLowerCase().includes(nameFilter.toLowerCase());
    const typeMatch = !typeFilter || appointment.appointmentType.toLowerCase().includes(typeFilter.toLowerCase());
    return nameMatch && typeMatch;
  }).sort((a, b) => {
    if (dateSortOrder === 'asc') {
      return new Date(a.appointmentDate) - new Date(b.appointmentDate);
    } else if (dateSortOrder === 'desc') {
      return new Date(b.appointmentDate) - new Date(a.appointmentDate);
    }
    return 0;
  });

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className={`AdminAppointmentContainer ${isContainerExpanded ? 'expanded' : ''}`}>
      {user && (
        <div className="UserInfo">
          <h2>Welcome, {user.firstName} {user.lastName}!</h2>
          <p>Clinic: {user.clinic}</p>
        </div>
      )}
      <h1>Pending and Rebooked Appointments</h1>
      <div className="AdminAppointmentFilters">
        <input
          type="text"
          placeholder="Filter by patient name"
          value={nameFilter}
          onChange={(e) => setNameFilter(e.target.value)}
        />
        <input
          type="text"
          placeholder="Filter by appointment type"
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
        />
        <select
          value={dateSortOrder}
          onChange={(e) => setDateSortOrder(e.target.value)}
        >
          <option value="">Sort by Date</option>
          <option value="asc">Date Ascending</option>
          <option value="desc">Date Descending</option>
        </select>
      </div>
      {filteredAppointments.length === 0 ? (
        <p>No pending or rebooked appointments found.</p>
      ) : (
        <table className="AdminAppointmentTable">
          <thead>
            <tr>
              <th>Patient Name</th>
              <th>Date</th>
              <th>Time</th>
              <th>Type</th>
              <th>Clinic</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredAppointments.map((appointment) => (
              <React.Fragment key={appointment._id}>
                <tr>
                  <td>{`${appointment.patientFirstName} ${appointment.patientLastName}`}</td>
                  <td>{appointment.appointmentDate}</td>
                  <td>{appointment.appointmentTimeFrom}</td>
                  <td>{appointment.appointmentType}</td>
                  <td>{appointment.bookedClinic}</td>
                  <td>{appointment.appointmentStatus}</td>
                  <td>
                    <button className="AdminAppointmentButton" onClick={() => handleEditAppointment(appointment)}>
                      {editingAppointment && editingAppointment._id === appointment._id ? 'Close' : 'Edit'}
                    </button>
                  </td>
                </tr>
                {editingAppointment && editingAppointment._id === appointment._id && (
                  <tr>
                    <td colSpan="6">
                      <div 
                        ref={editSectionRef}
                        className={`AdminAppointmentEditSection ${isContainerExpanded ? 'expanded' : ''}`}
                      >
                        <h2>Edit Appointment</h2>
                        <div className="AdminAppointmentEditButtons">
                          <button className="AdminAppointmentButton" onClick={() => {
                            setShowTypeChange(!showTypeChange);
                            setShowDateTimeChange(false);
                          }}>
                            Change Appointment Type
                          </button>
                          <button className="AdminAppointmentButton" onClick={() => {
                            setShowDateTimeChange(!showDateTimeChange);
                            setShowTypeChange(false);
                          }}>
                            Change Date and Time
                          </button>
                        </div>

                        <div className="AdminAppointmentEditContent">
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
                              bookedAppointments={bookedAppointments} // Pass booked appointments here
                            />
                          )}
                        </div>

                        <div className="AdminAppointmentActionButtons">
                          <button className="AdminAppointmentButton UpdateButton" onClick={handleUpdateAppointment}>
                            Update Appointment
                          </button>
                          <button className="AdminAppointmentButton CancelButton" onClick={() => handleCancelAppointment(editingAppointment._id)}>
                            Cancel Appointment
                          </button>
                          <button className="AdminAppointmentButton CloseButton" onClick={() => {
                            setEditingAppointment(null);
                            toggleExpansion(false);
                          }}>
                            Close
                          </button>
                        </div>

                        <div className="AdminAppointmentStatusButtons">
                          {['Cancelled', 'Completed', 'Not Showed'].map(status => (
                            <button
                              key={status}
                              className="AdminAppointmentStatusButton"
                              onClick={() => updateAppointmentStatus(appointment._id, status)}
                            >
                              {status}
                            </button>
                          ))}
                        </div>
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

export default ViewAppointment;