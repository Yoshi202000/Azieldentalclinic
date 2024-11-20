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

  const [user, setUser] = useState(null);
  const [editingAppointment, setEditingAppointment] = useState(null);
  const [showTypeChange, setShowTypeChange] = useState(false);
  const [showDateTimeChange, setShowDateTimeChange] = useState(false);
  const [selectedCard, setSelectedCard] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTimeFrom, setSelectedTimeFrom] = useState('');
  const [availableDates, setAvailableDates] = useState({});
  const [bookedAppointments, setBookedAppointments] = useState([]);
  const [isContainerExpanded, setIsContainerExpanded] = useState(false);
  const [nameFilter, setNameFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [dateSortOrder, setDateSortOrder] = useState('');
  const editSectionRef = useRef(null);
  const navigate = useNavigate();

  const [currentPage, setCurrentPage] = useState(1);
  const appointmentsPerPage = 5;

  const [editingAppointmentId, setEditingAppointmentId] = useState(null);

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
      const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/verify-token`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        withCredentials: true,
      });

      const { firstName, lastName, email, phoneNumber, dob, clinic } = response.data.user;
      setUser({ firstName, lastName, email, phoneNumber, dob, clinic });

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

  const fetchAppointments = async (token, clinic) => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/ViewAppointment`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const filteredAppointments = response.data.filter(
        appointment =>
          (appointment.appointmentStatus === 'pending' || appointment.appointmentStatus === 'Rebooked') &&
          appointment.bookedClinic === clinic
      );
      setAppointments(filteredAppointments);
      setBookedAppointments(filteredAppointments);
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
      const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/ViewAppointment/updateStatus`, 
        { appointmentId, newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setAppointments(prevAppointments =>
        prevAppointments.map(app =>
          app._id === response.data._id ? { ...app, appointmentStatus: response.data.appointmentStatus } : app
        )
      );
    } catch (err) {
      console.error('Error updating appointment status:', err);
      setError('Failed to update appointment status');
    }
  };

  const handleEditAppointment = (appointment) => {
    if (editingAppointmentId === appointment._id) {
      setEditingAppointmentId(null);
      setIsContainerExpanded(false);
      setShowTypeChange(false);
      setShowDateTimeChange(false);
    } else {
      setEditingAppointmentId(appointment._id);
      setEditingAppointment(appointment);
      setIsContainerExpanded(true);
      setShowTypeChange(false);
      setShowDateTimeChange(false);
      setSelectedCard(appointment.appointmentType);
      setSelectedDate(appointment.appointmentDate);
      setSelectedTimeFrom(appointment.appointmentTimeFrom);
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
        appointmentTimeFrom: selectedTimeFrom || editingAppointment.appointmentTimeFrom,
      };

      if (selectedDate !== editingAppointment.appointmentDate) {
        updatedAppointment.appointmentStatus = 'Rebooked';
      }

      const response = await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/api/updateAppointment/${editingAppointment._id}`,
        updatedAppointment,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setAppointments(prevAppointments =>
        prevAppointments.map(app =>
          app._id === response.data._id ? {
            ...app,
            appointmentDate: response.data.appointmentDate,
            appointmentTimeFrom: response.data.appointmentTimeFrom,
            appointmentType: response.data.appointmentType,
            appointmentStatus: response.data.appointmentStatus
          } : app
        )
      );

      setEditingAppointmentId(null);
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

  const filteredAppointments = appointments.filter(appointment => {
    const nameMatch = `${appointment.patientFirstName} ${appointment.patientLastName}`.toLowerCase().includes(nameFilter.toLowerCase());
    const typeMatch = !typeFilter || appointment.appointmentType.toLowerCase() === typeFilter.toLowerCase();
    return nameMatch && typeMatch;
  }).sort((a, b) => {
    if (dateSortOrder === 'asc') {
      return new Date(a.appointmentDate) - new Date(b.appointmentDate);
    } else if (dateSortOrder === 'desc') {
      return new Date(b.appointmentDate) - new Date(a.appointmentDate);
    }
    return 0;
  });

  const totalPages = Math.ceil(filteredAppointments.length / appointmentsPerPage);

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(prevPage => prevPage + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prevPage => prevPage - 1);
    }
  };

  const displayedAppointments = filteredAppointments
    .slice((currentPage - 1) * appointmentsPerPage, currentPage * appointmentsPerPage);

  const generateTimeSlots = (start, end) => {
    const timeSlots = [];
    let current = new Date();
    current.setHours(start, 0, 0);

    const endTime = new Date();
    endTime.setHours(end, 0, 0);

    while (current < endTime) {
      const nextTime = new Date(current.getTime() + 15 * 60000);
      const formattedTime = `${current.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} → ${nextTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
      timeSlots.push(formattedTime);
      current = nextTime;
    }

    return timeSlots;
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className={`AdminAppointmentContainer ${isContainerExpanded ? 'expanded' : ''}`}>
      <h1>Pending and Rebooked Appointments</h1>
      <div className="FilterSortSection">
        <input
          type="text"
          placeholder="Filter by patient name"
          value={nameFilter}
          onChange={(e) => setNameFilter(e.target.value)}
        />
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
        >
          <option value="">All Appointment Types</option>
          <option value="Braces & Orthodontics">Braces & Orthodontics</option>
          <option value="Tooth Extractions">Tooth Extractions</option>
          <option value="Dental cleaning">Dental cleaning</option>
        </select>
        <select
          value={dateSortOrder}
          onChange={(e) => setDateSortOrder(e.target.value)}
        >
          <option value="">Sort by Date</option>
          <option value="asc">Date Ascending</option>
          <option value="desc">Date Descending</option>
        </select>
      </div>
      {displayedAppointments.length === 0 ? (
        <p>No pending or rebooked appointments found.</p>
      ) : (
        <div className='table-responsive-container'>
          <div className="table-responsive">
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
                {displayedAppointments.map((appointment) => (
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
                          {editingAppointmentId === appointment._id ? 'Close' : 'Edit'}
                        </button>
                      </td>
                    </tr>
                    {editingAppointmentId === appointment._id && (
                      <tr>
                        <td colSpan="10">
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
                                  bookedAppointments={bookedAppointments}
                                />
                              )}
                            </div>
                            <div className="AdminAppointmentStatusButtons">
                              {['Cancelled', 'Completed', 'Not Show'].map(status => (
                                <button
                                  key={status}
                                  className="AdminAppointmentStatusButton"
                                  onClick={() => updateAppointmentStatus(appointment._id, status)}
                                >
                                  {status}
                                </button>
                              ))}
                            </div>
                            <div className="AdminAppointmentActionButtons">
                              <button className="AdminAppointmentButton UpdateButton" onClick={handleUpdateAppointment}>
                                Update Appointment
                              </button>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      <div className="pagination">
        <button onClick={handlePreviousPage} disabled={currentPage === 1}>Previous</button>
        <span>Page {currentPage} of {totalPages}</span>
        <button onClick={handleNextPage} disabled={currentPage === totalPages}>Next</button>
      </div>
    </div>
  );
}

export default ViewAppointment;
