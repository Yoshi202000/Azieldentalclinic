import React, { useEffect, useState, useRef } from 'react';
import '../../admin/dashboard/Dashboard.css';
import AppointmentStepOne from '../../component/appointmentPage/AppointmentStepOne.jsx';
import TestStepTwo from '../../test/TestStepTwo';
import ViewDentalChart from '../../component/ViewDentalChart.jsx';
import { generateAvailableDates } from '../../utils/appDate';
import '../../component/admin/ViewAppointment.css'
import axios from 'axios';
import UpdateFee from '../../test/UpdateFee.jsx';
import doctor1 from '../../assets/doctor1.png';

const calculateAge = (birthdate) => {
  console.log('Calculating age from birthdate:', birthdate);
  
  if (!birthdate) return 'N/A';
  
  const dob = new Date(birthdate);
  const today = new Date();
  
  // Check if birthdate is valid
  if (isNaN(dob.getTime())) return 'Invalid date';
  
  let age = today.getFullYear() - dob.getFullYear();
  const monthDiff = today.getMonth() - dob.getMonth();
  
  // Adjust age if birthday hasn't occurred yet this year
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
    age--;
  }
  
  console.log('Calculated age:', age);
  return age;
};

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

  const [showUpdateFee, setShowUpdateFee] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);

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
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/UserInformation`); // Ensure the correct URL
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
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/ViewAppointment`);
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
      // Set all state updates in a single batch
      const appointmentType = Array.isArray(appointment.appointmentType) 
        ? appointment.appointmentType[0] 
        : appointment.appointmentType;

      const updatedFormData = {
        ...formData,
        doctorEmail: appointment.doctor,
        mainID: appointment.mainID,
        slotID: appointment.slotID,
        slotCount: appointment.slotCount,
        selectedSlots: appointment.selectedSlots,
        appointmentTimeFrom: appointment.appointmentTimeFrom,
        appointmentTimeTo: appointment.appointmentTimeTo,
        selectedServices: Array.isArray(appointment.appointmentType) 
          ? appointment.appointmentType 
          : [appointment.appointmentType]
      };

      // Batch state updates
      Promise.resolve().then(() => {
        setEditingAppointment(appointment);
        setIsContainerExpanded(true);
        setShowTypeChange(false);
        setShowDateTimeChange(false);
        setSelectedCard(appointmentType);
        setSelectedDate(appointment.appointmentDate);
        setSelectedTimeFrom(appointment.appointmentTimeFrom);
        setFormData(updatedFormData);
      });
    }
  };

  const handleCardSelect = (cardName) => {
    setSelectedCard(cardName);
    // Find the selected service to get its required slots
    const selectedService = services.find(service => service.name === cardName);
    if (selectedService) {
      setFormData(prev => ({
        ...prev,
        requiredSlots: selectedService.requiredSlots || 1
      }));
    }
  };

  const handleDateSelect = (date) => {
    setSelectedDate(date);
    setSelectedTimeFrom(null);
  };

  const handleTimeSelect = (type, time) => {
    if (type === 'from') setSelectedTimeFrom(time);
  };

  const checkSlotStatus = async (mainID, slotIDs) => {
    try {
      // Split the slotIDs string into an array
      const slotIDArray = slotIDs.split(',');
      
      // Check each slot individually
      for (const slotID of slotIDArray) {
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/schedule/check-slot-status/${mainID}/${slotID}`);
        const result = await response.json();

        if (!response.ok) {
          console.error('Error checking slot status:', result.message);
          return null;
        }

        if (result.status === "Unavailable") {
          return "Unavailable";
        }
      }

      return "Available";
    } catch (error) {
      console.error('Error checking slot status:', error);
      return null;
    }
  };

  const updateSlotsToUnavailable = async (mainID, slotIDs) => {
    try {
      // Split the slotIDs string into an array
      const slotIDArray = slotIDs.split(',');
      
      // Update each slot individually
      for (const slotID of slotIDArray) {
        const response = await axios.put(
          `${import.meta.env.VITE_BACKEND_URL}/api/schedule/update-slot-status/${mainID}/${slotID}`,
          {},
          { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
        );
        
        if (response.status !== 200) {
          console.error('Failed to update slot:', response.data.message);
          return false;
        }
      }
      
      return true;
    } catch (error) {
      console.error('Error updating slot status:', error);
      return false;
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    // Use Promise.resolve().then to batch state updates
    Promise.resolve().then(() => {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    });
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
      const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/clinic`);
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
        const doctorsResponse = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/doctor-info`);
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
      const token = localStorage.getItem('token');
      
      // Check slot status before updating
      const slotStatus = await checkSlotStatus(formData.mainID, formData.slotID);

      if (slotStatus === "Unavailable") {
        alert("The selected slot is unavailable. Cannot update appointment.");
        return;
      }

      // Prepare appointment details
      const updatedAppointment = {
        patientFirstName: editingAppointment.patientFirstName,
        patientLastName: editingAppointment.patientLastName,
        patientEmail: editingAppointment.patientEmail,
        patientPhone: editingAppointment.patientPhone,
        patientDOB: editingAppointment.patientDOB,
        bookedClinic: formData.bookedClinic,
        appointmentDate: selectedDate,
        appointmentTimeFrom: formData.appointmentTimeFrom,
        appointmentType: formData.selectedServices || [selectedCard], // Ensure it's an array
        fee: editingAppointment.fee,
        doctor: formData.doctorEmail,
        slotCount: formData.requiredSlots || 1,
        selectedSlots: formData.selectedSlots,
        mainID: formData.mainID,
        slotID: formData.slotID
      };

      // Update status to Rebooked if date changed
      if (selectedDate !== editingAppointment.appointmentDate) {
        updatedAppointment.appointmentStatus = 'Approved';
      }

      console.log('Updating Appointment:', updatedAppointment);

      const response = await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/api/updateAppointment/${editingAppointment._id}`,
        updatedAppointment,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.status === 200) {
        // Update slots to unavailable after successful update
        const slotsUpdated = await updateSlotsToUnavailable(formData.mainID, formData.slotID);
        
        if (slotsUpdated) {
          // Update the appointments list with the new data
          setAppointments(prevAppointments =>
            prevAppointments.map(app =>
              app._id === response.data._id ? {
                ...app,
                ...response.data,
                appointmentType: response.data.appointmentType || [response.data.appointmentType] // Ensure it's an array
              } : app
            )
          );
          
          alert('Appointment updated successfully');
        } else {
          alert('Appointment updated but failed to update slot status');
        }
      } else {
        alert(`Error: ${response.data.message}`);
      }

      setEditingAppointment(null);
      setShowTypeChange(false);
      setShowDateTimeChange(false);
    } catch (error) {
      console.error('Error updating appointment:', error);
      setError('Failed to update appointment');
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

  const handleComplete = (appointment) => {
    setSelectedAppointment({
      ...appointment,
      userId: appointment.userId,
      patientFirstName: appointment.patientFirstName,
      patientLastName: appointment.patientLastName,
      patientEmail: appointment.patientEmail
    });
    setShowDentalChart(true);
  };

  const handleApprovedAppointment = async (appointmentId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/ViewAppointment/updateStatus`, 
        { appointmentId, newStatus: 'Approved' },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.status === 200) {
        // Update the appointments list with the new status
        setAppointments(prevAppointments =>
          prevAppointments.map(app =>
            app._id === appointmentId ? { ...app, appointmentStatus: 'Approved' } : app
          )
        );
        alert('Appointment approved successfully');
      }
    } catch (error) {
      console.error('Error approving appointment:', error);
      alert('Failed to approve appointment. Please try again.');
    }
  };

  const updateAppointmentStatus = async (appointmentId, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      const appointment = appointments.find(app => app._id === appointmentId);

      // Check the slot status before updating
      const slotStatus = await checkSlotStatus(appointment.mainID, appointment.slotID);

      if (slotStatus === "Unavailable") {
        alert("The selected slot is unavailable. Cannot update appointment status.");
        return;
      }

      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/ViewAppointment/updateStatus`,
        { appointmentId, newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const updatedAppointment = response.data;

      setAppointments(prevAppointments =>
        prevAppointments.map(app =>
          app._id === updatedAppointment._id ? { ...app, appointmentStatus: updatedAppointment.appointmentStatus } : app
        )
      );

      if (newStatus === 'Completed') {
        setSelectedAppointment(updatedAppointment);
        setShowUpdateFee(true);
      }
    } catch (err) {
      console.error('Error updating appointment status:', err);
      setError('Failed to update appointment status');
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
                <th>Age</th>
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
                  <td>{calculateAge(user.dob)} years old</td>
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
                          <th>Payment Image</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredAppointments.map((appointment) => (
                          <React.Fragment key={appointment._id}>
                            <tr>
                              <td>{new Date(appointment.appointmentDate).toLocaleDateString('en-CA')}</td>
                              <td>
                                {Array.isArray(appointment.appointmentTimeFrom) 
                                  ? appointment.appointmentTimeFrom.map((time, index) => (
                                      <span key={index}>{time}<br /></span>
                                    )) 
                                  : appointment.appointmentTimeFrom}
                              </td>

                              <td>
                                {Array.isArray(appointment.appointmentType) 
                                  ? appointment.appointmentType.map((type, index) => (
                                      <span key={index}>{type}<br /></span>
                                    )) 
                                  : appointment.appointmentType}
                          </td>
                              <td>{appointment.appointmentStatus}</td>
                              <td>
                        {appointment.paymentImage ? (
                          <div className="payment-image-container">
                            <img 
                          src={appointment.paymentImage
                            ? `${import.meta.env.VITE_BACKEND_URL.replace(/\/$/, '')}/api/uploads/${appointment.paymentImage.split('/').pop()}`
                            : doctor1
                          }
                          alt="Payment proof" 
                          className="payment-image-preview"
                          onClick={() => handleImageClick(appointment.paymentImage)}
                          style={{ cursor: 'pointer' }}
                        />
                          </div>
                        ) : (
                          <span>No payment image</span>
                        )}
                      </td>
                              <td className='tableActionButtons'>
                                <button className="PIButton" onClick={() => handleEditAppointment(appointment)}>
                                  {editingAppointment && editingAppointment._id === appointment._id ? 'Close' : 'Edit'}
                                </button>
                                <button className="PIButton" onClick={() => handleComplete(appointment)}>
                                  Create Dental Record
                                </button>
                              </td>
                            </tr>
                            {editingAppointment && editingAppointment._id === appointment._id && (
                              <tr>
                                <td colSpan="6">
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
                                            requiredSlots={formData.requiredSlots || 1}
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
                                        {['Cancelled', 'Completed', 'No Show', 'Approved'].map(status => (
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

          {showUpdateFee && (
            <UpdateFee 
              selectedAppointment={selectedAppointment}
              onClose={() => setShowUpdateFee(false)} 
            />
          )}
        </>
      )}
    </div>
  );
};

export default DoctorPatientsInformation;
