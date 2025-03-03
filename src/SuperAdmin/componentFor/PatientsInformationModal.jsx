import React, { useState } from 'react';
import "./AppointmentModal.css"; 
import '../../admin/dashboard/Dashboard.css';
import '../../component/admin/ViewAppointment.css';
import AppointmentStepOne from '../../component/appointmentPage/AppointmentStepOne';
import TestStepTwo from '../../test/TestStepTwo';

const PatientsInformationModal = ({ isOpen, onClose, appointments, handleEditAppointment, editingAppointment }) => {
  const [selectedCard, setSelectedCard] = useState('');
  const [selectedDate, setSelectedDate] = useState('');

  const handleCardSelect = (cardName) => setSelectedCard(cardName);
  const handleDateSelect = (date) => setSelectedDate(date);
  const handleTimeSelect = (type, time) => {
    if (type === 'from') setSelectedTimeFrom(time);
  };


  const handleUpdateAppointment = async () => {
    // Logic to update the appointment (API call to update the backend)
    try {
      const updatedAppointment = {
        appointmentType: selectedCard,
        appointmentDate: selectedDate,
        appointmentTimeFrom: selectedTimeFrom,
      };

      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/updateAppointment/${editingAppointment._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedAppointment),
      });

      if (response.ok) {
        const updatedData = await response.json();
        handleEditAppointment(updatedData); // Call the parent function to update the appointment in the list
        onClose(); // Close the modal after updating
      } else {
        console.error('Failed to update appointment');
      }
    } catch (err) {
      console.error('Error updating appointment:', err);
    }
  };

  if (!isOpen) return null; 

  console.log('Editing Appointment:', editingAppointment);

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2 className="modal-title">Appointments</h2>
        <button className="modal-close" onClick={onClose}>✖</button>
        
        {appointments.length > 0 ? (
          <table className="AdminAppointmentTable">
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
              {appointments.map((appointment) => (
                <React.Fragment key={appointment._id}>
                  <tr>
                    <td>{appointment.appointmentDate}</td>
                    <td>{appointment.appointmentTimeFrom}</td>
                    <td>{appointment.appointmentType}</td>
                    <td>{appointment.appointmentStatus}</td>
                    <td>
                      <button className="PIButton" onClick={() => handleEditAppointment(appointment)}>
                        {editingAppointment && editingAppointment._id === appointment._id ? "Close" : "Edit"}
                      </button>
                    </td>
                  </tr>
                </React.Fragment>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="PINoAppointments">No appointments found for this patient.</p>
        )}

        <div>
          <button onClick={() => setShowTypeChange(!showTypeChange)}>
            Change Appointment Type
          </button>
          <button onClick={() => setShowDateTimeChange(!showDateTimeChange)}>
            Change Date and Time
          </button>
        </div>

        {showTypeChange && (
          <AppointmentStepOne
            selectedCard={selectedCard}
            handleCardSelect={handleCardSelect}
            bookedClinic={editingAppointment?.bookedClinic || ''}
          />
        )}

        {showDateTimeChange && (
          <TestStepTwo
            availableDates={[]} // Pass available dates if needed
            selectedDate={selectedDate}
            handleDateSelect={handleDateSelect}
            selectedTimeFrom={selectedTimeFrom}
            handleTimeSelect={handleTimeSelect}
            generateTimeSlots={() => {}} // Implement if needed
            bookedAppointments={[]} // Pass booked appointments if needed
          />
        )}

        <div>
          <button onClick={handleUpdateAppointment}>Update Appointment</button>
          <button onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
};

export default PatientsInformationModal;
