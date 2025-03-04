import React, { useEffect, useState, useRef } from 'react';
import '../../admin/dashboard/Dashboard.css';
import AppointmentStepOne from '../../component/appointmentPage/AppointmentStepOne.jsx';
import TestStepTwo from '../../test/TestStepTwo';
import { generateAvailableDates } from '../../utils/appDate';
import "../componentFor/AppointmentModal.css"
import './ViewAppointment.css'

const SuperPatientsInformation = () => {
  const [users, setUsers] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [error, setError] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showAppointments, setShowAppointments] = useState(true);
  const [searchTerm, setSearchTerm] = useState(''); // New state for search term

  // New state variables for editing appointments
  const [editingAppointment, setEditingAppointment] = useState(null);
  const [showTypeChange, setShowTypeChange] = useState(false);
  const [showDateTimeChange, setShowDateTimeChange] = useState(false);
  const [selectedCard, setSelectedCard] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTimeFrom, setSelectedTimeFrom] = useState('');
  const [availableDates, setAvailableDates] = useState({});
  const [bookedAppointments, setBookedAppointments] = useState([]); // New state for booked appointments

  const [isContainerExpanded, setIsContainerExpanded] = useState(false);
  const editSectionRef = useRef(null);

  const [showHealthRecord, setShowHealthRecord] = useState(false);

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

  // Function to fetch users from the backend
  const fetchUsers = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/UserInformation`); // Ensure the correct URL
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setUsers(data);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError(err.message);
    }
  };

  // New function to fetch appointments
  const fetchAppointments = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/ViewAppointment`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setAppointments(data);
      setBookedAppointments(data); // Set booked appointments for managing available slots
    } catch (err) {
      console.error('Error fetching appointments:', err);
      setError(err.message);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchAppointments();
    const dates = generateAvailableDates(); // Generate available dates on mount
    setAvailableDates(dates);
  }, []);

  const handleUserClick = (user) => {
    setSelectedUser(user);
    setShowAppointments(true);
  };

  const toggleAppointments = () => {
    setShowAppointments(!showAppointments);
  };

  const filteredAppointments = selectedUser
    ? appointments.filter(
        (appointment) =>
          appointment.patientFirstName === selectedUser.firstName &&
          appointment.patientLastName === selectedUser.lastName
      )
    : [];

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
      setSelectedTimeFrom(appointment.appointmentTimeFrom);
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
        setAppointments(prevAppointments =>
          prevAppointments.map(app =>
            app._id === updatedData._id ? updatedData : app
          )
        );

        setEditingAppointment(null);
        setShowTypeChange(false);
        setShowDateTimeChange(false);
      } else {
        console.error('Failed to update appointment');
      }
    } catch (err) {
      console.error('Error updating appointment:', err);
    }
  };

  const handleCancelAppointment = async (appointmentId) => {
    // Logic to cancel the appointment (API call to update the status to 'Cancelled')
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/cancelAppointment/${appointmentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        setAppointments(prevAppointments =>
          prevAppointments.filter(appointment => appointment._id !== appointmentId)
        );
      } else {
        console.error('Failed to cancel appointment');
      }
    } catch (err) {
      console.error('Error cancelling appointment:', err);
    }
  };

  // Filter users to show only those with the role of "patient"
  const filteredPatients = users.filter(user => user.role === 'patient' && 
    (user.emailVerified === true) &&
    `${user.firstName} ${user.lastName}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const showHealthRecordOnly = () => {
    setShowHealthRecord(true);
    setShowAppointments(false);
  };
  const showAppointmentsOnly = () => {
    setShowAppointments(true);
    setShowHealthRecord(false);
  };
  
  return (
    <div className="PIContainer">
      <h1 className="PITitle">Patients Information</h1>
      {error ? (
        <p className="PIError">Error fetching data: {error}</p>
      ) : (
        <>
          <input
            type="text"
            placeholder="Search by patient name"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)} // Update search term on input change
            className="SearchInput"
          />
          <table className="AdminAppointmentTable">
            <thead>
              <tr>
                <th>First Name</th>
                <th>Last Name</th>
                <th>Email</th>
                <th>Phone Number</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPatients.map((user) => (
                <tr key={user._id} onClick={() => handleUserClick(user)}>
                  <td>{user.firstName}</td>
                  <td>{user.lastName}</td>
                  <td>{user.email}</td>
                  <td>{user.phoneNumber}</td>
                  <td>
                    <button onClick={showHealthRecordOnly}>
  Health Record
</button>

<button onClick={showAppointmentsOnly}>
  Appointments
</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {selectedUser && (
            <>
             {showAppointments && (
                <>  
                  <div className="modal-overlay">
                    <div className='modal-content'>
                    <h2 className="modal-title">
                      Appointments for {selectedUser.firstName} {selectedUser.lastName}
                    </h2>
                    {/* <button className="modal-close" onClick={onClose}>✖</button> */}
                    <button className="PIHideButton" onClick={toggleAppointments}>
                      Hide Appointments & Health Record
                    </button>
                  {filteredAppointments.length > 0 ? (
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
                        {filteredAppointments.map((appointment) => (
                          <React.Fragment key={appointment._id}>
                            <tr>
                              <td>{appointment.appointmentDate}</td>
                              <td>{appointment.appointmentTimeFrom}</td>
                              <td>{appointment.appointmentType}</td>
                              <td>{appointment.appointmentStatus}</td>
                              <td>
                                <button className="PIButton" onClick={() => handleEditAppointment(appointment)}>
                                  {editingAppointment && editingAppointment._id === appointment._id ? 'Close' : 'Edit'}
                                </button>
                              </td>
                            </tr>
                            {editingAppointment && editingAppointment._id === appointment._id && (
                              <tr>
                                <td colSpan="5">
                                  <div 
                                    ref={editSectionRef}
                                    className={`PIEditSection ${isContainerExpanded ? 'expanded' : ''}`}
                                  >
                                    <h2>Edit Appointment</h2>
                                    <div className="PIEditButtons">
                                      <button className="PIButton" onClick={() => {
                                        setShowTypeChange(!showTypeChange);
                                        setShowDateTimeChange(false);
                                      }}>
                                        Change Appointment Type
                                      </button>
                                      <button className="PIButton" onClick={() => {
                                        setShowDateTimeChange(!showDateTimeChange);
                                        setShowTypeChange(false);
                                      }}>
                                        Change Date and Time
                                      </button>
                                    </div>

                                    <div className="PIEditContent">
                                      {showTypeChange && (
                                        <AppointmentStepOne
                                          selectedCard={selectedCard}
                                          handleCardSelect={handleCardSelect}
                                        />
                                      )}

                                      {showDateTimeChange && (
                                        <TestStepTwo
                                          availableDates={availableDates}
                                          selectedDate={selectedDate}
                                          handleDateSelect={handleDateSelect}
                                          selectedTimeFrom={selectedTimeFrom}
                                          handleTimeSelect={handleTimeSelect}
                                          generateTimeSlots={generateTimeSlots}
                                          bookedAppointments={bookedAppointments}
                                        />
                                      )}
                                    </div>

                                    <div className="PIActionButtons">
                                      <button className="PIButton" onClick={handleUpdateAppointment}>
                                        Update Appointment
                                      </button>
                                      <button className="PIButtonCancel" onClick={() => handleCancelAppointment(editingAppointment._id)}>
                                        Cancel Appointment
                                      </button>
                                      <button className="PIButton" onClick={() => {
                                        setEditingAppointment(null);
                                        setIsContainerExpanded(false);
                                      }}>
                                        Close
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
                  ) : (
                    <p className="PINoAppointments">No appointments found for this patient.</p>
                  )}
                            {/* <button onClick={onClose}>Close</button> */}

                  </div>
                </div></>
              )}
              {showHealthRecord && (
                <div className="modal-overlay">
                  <h2 className="modal-content">
                    Health Record for {selectedUser.firstName} {selectedUser.lastName}
                  </h2>
                  <table className="AdminAppointmentTabl111e">
                    <tbody>
                      <tr>
                        <td>Smoking status:</td>
                        <td>{selectedUser.questionOne === true ? 'Yes' : selectedUser.questionOne === false ? 'No' : 'N/A'}</td>
                      </tr>
                      <tr>
                        <td>Known allergies:</td>
                        <td>{selectedUser.questionTwo === true ? 'Yes' : selectedUser.questionTwo === false ? 'No' : 'N/A'}</td>
                      </tr>
                      <tr>
                        <td>Current medications:</td>
                        <td>{selectedUser.questionThree === true ? 'Yes' : selectedUser.questionThree === false ? 'No' : 'N/A'}</td>
                      </tr>
                      <tr>
                        <td>Previous dental surgeries:</td>
                        <td>{selectedUser.questionFour === true ? 'Yes' : selectedUser.questionFour === false ? 'No' : 'N/A'}</td>
                      </tr>
                      <tr>
                        <td>Anesthesia-related complications history:</td>
                        <td>{selectedUser.questionFive === true ? 'Yes' : selectedUser.questionFive === false ? 'No' : 'N/A'}</td>
                      </tr>
                      <tr>
                        <td>Current pain or discomfort:</td>
                        <td>{selectedUser.questionSix === true ? 'Yes' : selectedUser.questionSix === false ? 'No' : 'N/A'}</td>
                      </tr>
                      <tr>
                        <td>Heart condition history:</td>
                        <td>{selectedUser.questionSeven === true ? 'Yes' : selectedUser.questionSeven === false ? 'No' : 'N/A'}</td>
                      </tr>
                      <tr>
                        <td>Pregnancy status:</td>
                        <td>{selectedUser.questionEight === true ? 'Yes' : selectedUser.questionEight === false ? 'No' : 'N/A'}</td>
                      </tr>
                      <tr>
                        <td>Relevant medical conditions:</td>
                        <td>{selectedUser.questionNine === true ? 'Yes' : selectedUser.questionNine === false ? 'No' : 'N/A'}</td>
                      </tr>
                      <tr>
                        <td>Additional information:</td>
                        <td>{selectedUser.questionTen === true ? 'Yes' : selectedUser.questionTen === false ? 'No' : 'N/A'}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )};

             
            </>
          )}
        </>
      )}
    </div>
  );
};

export default SuperPatientsInformation;
