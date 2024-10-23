import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import AppointmentStepOne from '../appointmentPage/AppointmentStepOne';
import AppointmentStepTwo from '../appointmentPage/AppointmentStepTwo';
import { generateAvailableDates } from '../../utils/appDate';
import './ViewAppointment.css';

function ViewAppointment() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
    fetchAppointments();
    const dates = generateAvailableDates();
    setAvailableDates(dates);
  }, []);

  const fetchAppointments = async () => {
    try {
      const response = await axios.get('http://localhost:5000/ViewAppointment');
      console.log('All appointments:', response.data); // Log all appointments
      const filteredAppointments = response.data.filter(
        appointment => appointment.appointmentStatus === 'pending' || appointment.appointmentStatus === 'Rebooked'
      );
      console.log('Filtered appointments:', filteredAppointments); // Log filtered appointments
      setAppointments(filteredAppointments);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching appointments:', err);
      setError('Failed to fetch appointments');
      setLoading(false);
    }
  };

  const updateAppointmentStatus = async (appointmentId, newStatus) => {
    try {
      const response = await axios.post('http://localhost:5000/ViewAppointment/updateStatus', 
        { appointmentId, newStatus }
      );
      
      setAppointments(prevAppointments => 
        prevAppointments.map(app => 
          app._id === response.data._id ? response.data : app
        ).filter(app => app.appointmentStatus === 'Pending' || app.appointmentStatus === 'Rebooked')
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
        updatedAppointment
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

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className={`AdminAppointmentContainer ${isContainerExpanded ? 'expanded' : ''}`}>
      <h1>Pending and Rebooked Appointments</h1>
      {appointments.length === 0 ? (
        <p>No pending or rebooked appointments found.</p>
      ) : (
        <table className="AdminAppointmentTable">
          <thead>
            <tr>
              <th>Patient Name</th>
              <th>Date</th>
              <th>Time</th>
              <th>Type</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {appointments.map((appointment) => (
              <React.Fragment key={appointment._id}>
                <tr>
                  <td>{`${appointment.patientFirstName} ${appointment.patientLastName}`}</td>
                  <td>{appointment.appointmentDate}</td>
                  <td>{appointment.appointmentTimeFrom}</td>
                  <td>{appointment.appointmentType}</td>
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
                            />
                          )}
                        </div>

                        <div className="AdminAppointmentActionButtons">
                          <button className="AdminAppointmentButton UpdateButton" onClick={handleUpdateAppointment}>
                            Update Appointment
                          </button>
                          <button className="AdminAppointmentButton CancelButton" onClick={() => {
                            setEditingAppointment(null);
                            toggleExpansion(false);
                          }}>
                            Cancel
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
