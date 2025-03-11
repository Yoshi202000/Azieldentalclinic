import React, { useEffect, useState, useRef } from 'react';
import '../../admin/dashboard/Dashboard.css';
import AppointmentStepOne from '../../component/appointmentPage/AppointmentStepOne.jsx';
import TestStepTwo from '../../test/TestStepTwo';
import ViewDentalChart from '../../component/viewDentalChart.jsx';
import { generateAvailableDates } from '../../utils/appDate';
import '../../component/admin/ViewAppointment.css'
import axios from 'axios';


const DoctorPatientsInformation = () => {
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
  const [showDentalChart, setShowDentalChart] = useState(false);

  const [showNavigationButtons, setShowNavigationButtons] = useState(true);
  const [showStatusButtons, setShowStatusButtons] = useState(true);
  const [currentStep, setCurrentStep] = useState(1);
  const [doctorEmailFilter, setDoctorEmailFilter] = useState('');
  const [services, setServices] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    dob: '',
    phoneNumber: '',
    bookedClinic: '',
    email: '',
    selectedDoctor: '',
    doctorEmail: '',
    doctorFirstName: '',
    doctorLastName: '',
    appointmentTimeFrom: '',
  });
  const [nameOne, setNameOne] = useState('Default Clinic 1');
  const [nameTwo, setNameTwo] = useState('Default Clinic 2');

  const [questions, setQuestions] = useState({
    questionOne: '',
    questionTwo: '',
    questionThree: '',
    questionFour: '',
    questionFive: '',
    questionSix: '',
    questionSeven: '',
    questionEight: '',
    questionNine: '',
    questionTen: ''
  });

  const generateTimeSlots = (start, end) => {
    const timeSlots = [];
    let current = new Date();
    current.setHours(start, 0, 0);
    
    const endTime = new Date();
    endTime.setHours(end, 0, 0);
  
    while (current < endTime) {
      const nextTime = new Date(current.getTime() + 30 * 60000); // 30 minutes interval
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

  const checkSlotStatus = async (mainID, slotID) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/schedule/check-slot-status/${mainID}/${slotID}`);
      const result = await response.json();

      if (response.ok) {
        console.log('Slot Status:', result.status);
        return result.status;
      } else {
        console.error('Error checking slot status:', result.message);
        return null;
      }
    } catch (error) {
      console.error('Error checking slot status:', error);
      return null;
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleScheduleSelect = (selectedSchedule) => {
    const timeFrom = selectedSchedule.timeFrom;
    const timeTo = selectedSchedule.timeTo;
    
    // Format the time string
    const formattedTime = `${timeFrom} → ${timeTo}`;
    
    setFormData(prev => ({
      ...prev,
      mainID: selectedSchedule.mainID,
      slotID: selectedSchedule.slotID,
      appointmentTimeFrom: formattedTime, // Use the formatted time string
      appointmentTimeTo: timeTo
    }));
  };

  const handleClinicSelect = (clinic) => {
    setFormData(prev => ({
      ...prev,
      bookedClinic: clinic,
      selectedDoctor: '' // Reset doctor when clinic changes
    }));
  };

  const handleDoctorSelect = (doctor) => {
    setFormData(prev => ({
      ...prev,
      selectedDoctor: doctor.name,
      doctorEmail: doctor.email,
      doctorFirstName: doctor.firstName,
      doctorLastName: doctor.lastName
    }));
    setDoctorEmailFilter(doctor.email);
  };

  const fetchServicesData = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/clinic`);
      if (response.data) {
        const { 
          nameOne, 
          nameTwo, 
          services,
          questionOne,
          questionTwo,
          questionThree,
          questionFour,
          questionFive,
          questionSix,
          questionSeven,
          questionEight,
          questionNine,
          questionTen
        } = response.data;

        setServices(services || []);
        setNameOne(nameOne);
        setNameTwo(nameTwo);
        
        // Set questions
        setQuestions({
          questionOne,
          questionTwo,
          questionThree,
          questionFour,
          questionFive,
          questionSix,
          questionSeven,
          questionEight,
          questionNine,
          questionTen
        });
      } else {
        console.error('Failed to fetch services data');
      }
    } catch (error) {
      console.error('Error fetching services data:', error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch services and clinic names
        await fetchServicesData();

        // Fetch doctors
        const doctorsResponse = await fetch(`${import.meta.env.VITE_BACKEND_URL}/doctor-info`);
        if (!doctorsResponse.ok) {
          throw new Error('Failed to fetch doctors');
        }
        const doctorsData = await doctorsResponse.json();
        const formattedDoctors = Array.isArray(doctorsData.doctors) ? doctorsData.doctors : [];
        setDoctors(formattedDoctors);

      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to fetch data');
      }
    };

    fetchData();
  }, []);

  const handleUpdateAppointment = async () => {
    try {
      const slotStatus = await checkSlotStatus(formData.mainID, formData.slotID);

      if (slotStatus === "Unavailable") {
        alert("The selected slot is unavailable. Cannot update appointment.");
        return;
      }

      // Extract timeFrom from the formatted string if needed
      const timeFrom = formData.appointmentTimeFrom.split(' → ')[0];
      const timeTo = formData.appointmentTimeFrom.split(' → ')[1];

      const updatedAppointment = {
        appointmentType: selectedCard,
        appointmentDate: selectedDate,
        appointmentTimeFrom: formData.appointmentTimeFrom, // Use the full formatted time string
        appointmentTimeTo: timeTo,
        bookedClinic: formData.bookedClinic,
        doctor: formData.doctorEmail,
        mainID: formData.mainID,
        slotID: formData.slotID,
        doctorFirstName: formData.doctorFirstName,
        doctorLastName: formData.doctorLastName
      };

      if (selectedDate !== editingAppointment.appointmentDate) {
        updatedAppointment.appointmentStatus = 'Rebooked';
      }

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
        setShowDateTimeChange(false);
        setShowStatusButtons(true);
        setCurrentStep(1);
        alert('Appointment updated successfully');
      } else {
        alert('Failed to update appointment');
      }
    } catch (err) {
      console.error('Error updating appointment:', err);
      alert('Error updating appointment');
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
                    <button onClick={() => {
                      setSelectedUser(user);
                      setShowHealthRecord(true);
                      setShowAppointments(true);
                      setShowDentalChart(true);
                    }}>
                      Show Records
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {selectedUser && (
            <>
              {showHealthRecord && (
                <div className="PIQuestionsHeader">
                  <h2 className="PIQuestionsTitle">
                    Health Record for {selectedUser.firstName} {selectedUser.lastName}
                  </h2>
                  <button className="PIHideButton" onClick={() => setShowHealthRecord(false)}>
                    Hide Health Record
                  </button>
                  <table className="AdminAppointmentTable">
                    <tbody>
                      <tr>
                      <td>{questions.questionOne || 'N/A'}</td>
                        <td>{selectedUser.questionOne === true ? 'Yes' : selectedUser.questionOne === false ? 'No' : 'N/A'}</td>
                      </tr>
                      <tr>
                      <td>{questions.questionTwo || 'N/A'}</td>
                        <td>{selectedUser.questionTwo === true ? 'Yes' : selectedUser.questionTwo === false ? 'No' : 'N/A'}</td>
                      </tr>
                      <tr>
                      <td>{questions.questionThree || 'N/A'}</td>
                        <td>{selectedUser.questionThree === true ? 'Yes' : selectedUser.questionThree === false ? 'No' : 'N/A'}</td>
                      </tr>
                      <tr>
                      <td>{questions.questionFour || 'N/A'}</td>
                        <td>{selectedUser.questionFour === true ? 'Yes' : selectedUser.questionFour === false ? 'No' : 'N/A'}</td>
                      </tr>
                      <tr>
                        <td>{questions.questionFive || 'N/A'}</td>
                        <td>{selectedUser.questionFive === true ? 'Yes' : selectedUser.questionFive === false ? 'No' : 'N/A'}</td>
                      </tr>
                      <tr>
                      <td>{questions.questionSix || 'N/A'}</td>
                      <td>{selectedUser.questionSix === true ? 'Yes' : selectedUser.questionSix === false ? 'No' : 'N/A'}</td>
                      </tr>
                      <tr>
                      <td>{questions.questionSeven || 'N/A'}</td>
                        <td>{selectedUser.questionSeven === true ? 'Yes' : selectedUser.questionSeven === false ? 'No' : 'N/A'}</td>
                      </tr>
                      <tr>
                      <td>{questions.questionEight || 'N/A'}</td>
                        <td>{selectedUser.questionEight === true ? 'Yes' : selectedUser.questionEight === false ? 'No' : 'N/A'}</td>
                      </tr>
                      <tr>
                      <td>{questions.questionNine || 'N/A'}</td>
                        <td>{selectedUser.questionNine === true ? 'Yes' : selectedUser.questionNine === false ? 'No' : 'N/A'}</td>
                      </tr>
                      <tr>
                      <td>{questions.questionTen || 'N/A'}</td>
                        <td>{selectedUser.questionTen === true ? 'Yes' : selectedUser.questionTen === false ? 'No' : 'N/A'}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}

              {showAppointments && (
                <>
                  <div className="PIAppointmentsHeader">
                    <h2 className="PIAppointmentsTitle">
                      Appointments for {selectedUser.firstName} {selectedUser.lastName}
                    </h2>
                    <button className="PIHideButton" onClick={() => setShowAppointments(false)}>
                      Hide Appointments
                    </button>
                  </div>
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
                            <td>{new Date(appointment.appointmentDate).toLocaleDateString('en-CA')}</td>
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
                                      <button 
                                        className="PIButton" 
                                        onClick={() => {
                                          setShowDateTimeChange(true);
                                          setShowStatusButtons(false);
                                          setShowNavigationButtons(true);
                                        }}
                                      >
                                        Edit Appointment Details
                                      </button>
                                      <button 
                                        className="PIButton" 
                                        onClick={() => {
                                          setShowDateTimeChange(false);
                                          setShowStatusButtons(true);
                                          setShowNavigationButtons(false);
                                        }}
                                      >
                                        Cancel Editing
                                      </button>
                                    </div>

                                    {showDateTimeChange && (
                                      <div className="PIEditContent">
                                        {currentStep === 1 && (
                                          <AppointmentStepOne 
                                            formData={formData}
                                            handleInputChange={handleInputChange}
                                            selectedCard={selectedCard} 
                                            handleCardSelect={handleCardSelect}
                                            services={services}
                                            doctors={doctors}
                                            nameOne={nameOne}
                                            nameTwo={nameTwo}
                                            handleClinicSelect={handleClinicSelect}
                                            handleDoctorSelect={handleDoctorSelect}
                                          />                                                         
                                        )}

                                        {currentStep === 2 && (
                                          <TestStepTwo
                                            selectedDoctor={formData.selectedDoctor}
                                            onScheduleSelect={handleScheduleSelect}
                                            filterEmail={doctorEmailFilter}
                                          />
                                        )}
                                      </div>
                                    )}

                                    {showNavigationButtons && (
                                      <div className="PINavigationButtons">
                                        {currentStep > 1 && (
                                          <button 
                                            className="PIButton" 
                                            onClick={() => setCurrentStep(currentStep - 1)}
                                          >
                                            Previous
                                          </button>
                                        )}
                                        {currentStep === 1 && showDateTimeChange && (
                                          <button 
                                            className="PIButton" 
                                            onClick={() => setCurrentStep(currentStep + 1)}
                                          >
                                            Next
                                          </button>
                                        )}
                                        {currentStep === 2 && (
                                          <button 
                                            className="PIButton" 
                                            onClick={() => {
                                              console.log("Completing edit for doctor:", selectedDoctor);
                                            }}
                                          >
                                            Complete Edit
                                          </button>
                                        )}
                                      </div>
                                    )}

                                    {showStatusButtons && (
                                      <div className="PIStatusButtons">
                                        {['Cancelled', 'Completed', 'No Show'].map(status => (
                                          <button
                                            key={status}
                                            className="PIStatusButton"
                                            onClick={() => updateAppointmentStatus(appointment._id, status)}
                                          >
                                            {status}
                                          </button>
                                        ))}
                                      </div>
                                    )}

                                    <div className="PIActionButtons">
                                      <button 
                                        className="PIButton UpdateButton" 
                                        onClick={handleUpdateAppointment}
                                      >
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
                  ) : (
                    <p className="PINoAppointments">No appointments found for this patient.</p>
                  )}
                </>
              )}

              {showDentalChart && (
                <div>
                  <button className="PIHideButton" onClick={() => setShowDentalChart(false)}>
                    Hide Dental Chart
                  </button>
                  <ViewDentalChart email={selectedUser.email} />
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
};

export default DoctorPatientsInformation;
