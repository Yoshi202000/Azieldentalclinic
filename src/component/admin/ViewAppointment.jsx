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

  const [currentPage, setCurrentPage] = useState(1); // New state for current page
  const appointmentsPerPage = 5; // Number of appointments to display per page

  const [editingAppointmentId, setEditingAppointmentId] = useState(null); // New state to track the currently editing appointment

  // Effect to fetch user info and available dates on component mount
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

  // Function to fetch user information from the server
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
  
  // Function to fetch appointments for the logged-in user
  const fetchAppointments = async (token, clinic) => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/ViewAppointment`, {
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

  // Function to update the status of an appointment
  const updateAppointmentStatus = async (appointmentId, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/ViewAppointment/updateStatus`, 
        { appointmentId, newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setAppointments(prevAppointments =>
        prevAppointments.map(app =>
          app._id === response.data._id ? { ...app, appointmentTimeFrom: response.data.appointmentTimeFrom } : app
        )
      );
      
    } catch (err) {
      console.error('Error updating appointment status:', err);
      setError('Failed to update appointment status');
    }
  };

  // Function to handle editing an appointment
  const handleEditAppointment = (appointment) => {
    if (editingAppointmentId === appointment._id) {
      setEditingAppointmentId(null); // Close the editing section
      setIsContainerExpanded(false);
      setShowTypeChange(false);
      setShowDateTimeChange(false);
    } else {
      setEditingAppointmentId(appointment._id); // Set the currently editing appointment
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

  // Function to handle card selection for appointment type
  const handleCardSelect = (cardName) => setSelectedCard(cardName);

  // Function to handle date selection for the appointment
  const handleDateSelect = (date) => {
    setSelectedDate(date);
    setSelectedTimeFrom(null); 
  };
  
  // Function to handle time selection for the appointment
  const handleTimeSelect = (type, time) => {
    if (type === 'from') setSelectedTimeFrom(time);
  };

  // Function to update an appointment with new details
  const handleUpdateAppointment = async () => {
    try {
      const token = localStorage.getItem('token');
      // Use the old time if the selected time is null
      const updatedAppointment = {
        appointmentType: selectedCard,
        appointmentDate: selectedDate,
        appointmentTimeFrom: selectedTimeFrom || editingAppointment.appointmentTimeFrom,
      };
  
      if (selectedDate !== editingAppointment.appointmentDate) {
        updatedAppointment.appointmentStatus = 'Rebooked'; // Change status if the date is different
      }
  
      const response = await axios.put(
      `${import.meta.env.VITE_BACKEND_URL}/api/updateAppointment/${editingAppointment._id}`,
        updatedAppointment,
        { headers: { Authorization: `Bearer ${token}` } }
      );
  
      // Update the state with the new appointment data
      setAppointments(prevAppointments =>
        prevAppointments.map(app =>
          app._id === response.data._id ? { 
            ...app, 
            appointmentDate: response.data.appointmentDate, 
            appointmentTimeFrom: response.data.appointmentTimeFrom,
            appointmentType: response.data.appointmentType, // Update the appointment type
            appointmentStatus: response.data.appointmentStatus // Update the appointment status if changed
          } : app
        )
      );
  
      // Reset the editing state after successful update
      setEditingAppointmentId(null); // Close the edit appointment container
      setEditingAppointment(null); // Reset editing appointment
      setShowTypeChange(false); // Reset type change visibility
      setShowDateTimeChange(false); // Reset date/time change visibility
    } catch (error) {
      console.error('Error updating appointment:', error);
      setError('Failed to update appointment');
    }
  };
  

  // Function to cancel an appointment
  const handleCancelAppointment = (appointmentId) => {
    updateAppointmentStatus(appointmentId, 'Cancelled');
  };

  // Function to toggle the expansion of the edit section
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

  

  // Function to filter and sort appointments based on user input
  const filteredAppointments = appointments.filter(appointment => {
    const nameMatch = `${appointment.patientFirstName} ${appointment.patientLastName}`.toLowerCase().includes(nameFilter.toLowerCase());

    !typeFilter || 
      appointment.appointmentType.toLowerCase() === typeFilter.toLowerCase()
    return nameMatch && typeMatch;
  }).sort((a, b) => {
    if (dateSortOrder === 'asc') {
      return new Date(a.appointmentDate) - new Date(b.appointmentDate);
    } else if (dateSortOrder === 'desc') {
      return new Date(b.appointmentDate) - new Date(a.appointmentDate);
    }
    return 0;
  });

  const totalPages = Math.ceil(filteredAppointments.length / appointmentsPerPage); // Calculate total pages

  // Function to handle moving to the next page of appointments
  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(prevPage => prevPage + 1);
    }
  };

  // Function to handle moving to the previous page of appointments
  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prevPage => prevPage - 1);
    }
  };

  // Function to get appointments for the current page
  const displayedAppointments = filteredAppointments
    .filter(appointment => editingAppointmentId ? appointment._id === editingAppointmentId : true) // Show only the editing appointment if one is being edited
    .slice((currentPage - 1) * appointmentsPerPage, currentPage * appointmentsPerPage);

  // Function to generate time slots for appointments
  const generateTimeSlots = (start, end) => {
    const timeSlots = [];
    let current = new Date();
    current.setHours(start, 0, 0);
    
    const endTime = new Date();
    endTime.setHours(end, 0, 0);
  
    while (current < endTime) {
      const nextTime = new Date(current.getTime() + 15 * 60000);
      const formattedTime = `${current.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})} → ${nextTime.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})}`;
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
                                bookedAppointments={bookedAppointments} // Pass booked appointments here
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
