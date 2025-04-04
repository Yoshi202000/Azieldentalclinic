import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import AppointmentStepOne from '../../component/appointmentPage/AppointmentStepOne';
import TestStepTwo from '../../test/TestStepTwo';
import { generateAvailableDates } from '../../utils/appDate';
import UpdateFee from '../../test/UpdateFee.jsx';
import '../../component/admin/ViewAppointment.css';
import DentalChartForm from '../../component/DentalChart.jsx';

function SuperViewAppointment() {
  const [user, setUser] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [bookedAppointments, setBookedAppointments] = useState([]);

  const [editingAppointment, setEditingAppointment] = useState(null);
  const [showTypeChange, setShowTypeChange] = useState(false);
  const [showDateTimeChange, setShowDateTimeChange] = useState(false);
  const [selectedCard, setSelectedCard] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTimeFrom, setSelectedTimeFrom] = useState('');
  const [availableDates, setAvailableDates] = useState({});
  const [isContainerExpanded, setIsContainerExpanded] = useState(false);
  const [nameFilter, setNameFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [dateSortOrder, setDateSortOrder] = useState('');
  const [doctors, setDoctors] = useState([]);
  const [doctorEmailFilter, setDoctorEmailFilter] = useState('');
  const [selectedTimeTo, setSelectedTimeTo] = useState(null);


  const editSectionRef = useRef(null);
  const navigate = useNavigate();

  const [currentPage, setCurrentPage] = useState(1);
  const appointmentsPerPage = 5;

  const [services, setServices] = useState([]); // State to hold services data


  const [editingAppointmentId, setEditingAppointmentId] = useState(null);
  const [showUpdateFee, setShowUpdateFee] = useState(false);
  const [showDentalChart, setShowDentalChart] = useState(false);
  const [dentalChartData, setDentalChartData] = useState({ firstName: '', lastName: '', email: '' });
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [schedules, setSchedules] = useState([]);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);

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
    requiredSlots: 1, // Add default required slots
  });

  const [nameOne, setNameOne] = useState('Default Clinic 1'); 
  const [nameTwo, setNameTwo] = useState('Default Clinic 2'); 
  
  const [selectedDoctor, setSelectedDoctor] = useState(''); // State to hold the selected doctor

  const [currentStep, setCurrentStep] = useState(1); // State to track the current step

  const [showStatusButtons, setShowStatusButtons] = useState(true);
  const [showNavigationButtons, setShowNavigationButtons] = useState(true);

  useEffect(() => {
    fetchDoctors();
    fetchServicesData();
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Please log in to continue.');
      navigate('/login');
      return;
    }

    fetchUserInfo(token);
    const dates = generateAvailableDates();
    setAvailableDates(dates);
    fetchSchedules();
  }, [navigate]);

  
  const handleClinicSelect = (selectedClinic) => {
    setFormData((prevData) => ({
      ...prevData,
      bookedClinic: selectedClinic,
      selectedDoctor: '', // Reset doctor when clinic changes
    }));
  };
  

  const fetchServicesData = async () => {
    try {
        const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/clinic`);
        if (response.data && response.data.services) {
            setServices(response.data.services);

            // Ensure nameOne and nameTwo are correctly extracted from the response
            if (response.data.nameOne && response.data.nameTwo) {
                setNameOne(response.data.nameOne);
                setNameTwo(response.data.nameTwo);
            } else {
                console.error('Clinic names missing in API response');
            }
        } else {
            console.error('Failed to fetch services data');
        }
    } catch (error) {
        console.error('Error fetching services data:', error);
    }
};
 

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

      // Set the selectedDoctor to the logged-in user's email
      setSelectedDoctor(email); // Assuming email is used to identify the doctor

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

  const fetchDoctors = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/doctor-info`);
      if (response.status === 200) {
        setDoctors(response.data.doctors);
      } else {
        console.error('Failed to fetch doctors');
      }
    } catch (error) {
      console.error('Error fetching doctors:', error);
    }
  };

  const fetchSchedules = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/all-schedules`);
      setSchedules(response.data);
    } catch (err) {
      console.error('Error fetching schedules:', err);
      setError('Failed to fetch schedules');
    }
  };
  
  const handleComplete = (appointment) => {
    setSelectedAppointment({
      ...appointment,
      // Include patient information from the appointment
      userId: appointment.userId, // Patient's user ID
      patientFirstName: appointment.patientFirstName,
      patientLastName: appointment.patientLastName,
      patientEmail: appointment.patientEmail
    });
    setShowUpdateFee(true);
  };

  const fetchAppointments = async (clinic) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/ViewAppointment`, {
        headers: { Authorization: `Bearer ${token}` },
      });
  
      const filteredAppointments = response.data.filter(
        appointment =>
          (appointment.appointmentStatus === 'pending' || appointment.appointmentStatus === 'Rebooked' || appointment.appointmentStatus === 'Approved')
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
  

  // Function to check slot status before updating
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

  const updateAppointmentStatus = async (appointmentId, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      const appointment = appointments.find(app => app._id === appointmentId); // Find the appointment to get its details

      // Check the slot status before updating
      const slotStatus = await checkSlotStatus(appointment.mainID, appointment.slotID); // Assuming mainID and slotID are available in appointment

      if (slotStatus === "Unavailable") {
        alert("The selected slot is unavailable. Cannot update appointment status.");
        return; // Stop execution if the slot is unavailable
      }

      const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/ViewAppointment/updateStatus`, 
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
  const handleShowDentalChart = (appointment) => {
    setSelectedAppointment(appointment);
    setDentalChartData({
      firstName: appointment.patientFirstName,
      lastName: appointment.patientLastName,
      email: appointment.patientEmail
    });
    setShowDentalChart(true);
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
      
      // Set the selected card to the first appointment type if it's an array
      setSelectedCard(Array.isArray(appointment.appointmentType) 
        ? appointment.appointmentType[0] 
        : appointment.appointmentType);
      
      setSelectedDate(appointment.appointmentDate);
      setSelectedTimeFrom(appointment.appointmentTimeFrom);
      
      // Set form data with existing appointment details
      setFormData(prev => ({
        ...prev,
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
      }));
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
        updatedAppointment.appointmentStatus = 'Rebooked';
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

  const handleApprovedAppointment = (appointmentId) => {
    updateAppointmentStatus(appointmentId, 'Approved');
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

  const updateBookedAppointment = async (appointmentId, newDate, newTimeFrom) => {
    if (!newDate || !newTimeFrom) {
      alert("Please select a valid date and time.");
      return;
    }
  
    try {
      const token = localStorage.getItem('token');
      
      console.log("Updating Appointment:", { appointmentId, newDate, newTimeFrom });
  
      const response = await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/api/updateAppointment/${appointmentId}`,
        {
          appointmentDate: newDate,
          appointmentTimeFrom: newTimeFrom,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
  
      if (response.status === 200) {
        setAppointments(prevAppointments =>
          prevAppointments.map(app =>
            app._id === appointmentId
              ? { ...app, appointmentDate: newDate, appointmentTimeFrom: newTimeFrom }
              : app
          )
        );
        alert('Appointment updated successfully!');
      } else {
        alert('Failed to update appointment.');
      }
    } catch (error) {
      console.error('Error updating appointment:', error);
      alert('An error occurred while updating the appointment.');
    }
  };

  // teststep two constsssss
  const handleScheduleSelect = (scheduleInfo) => {
    setSelectedSchedule(scheduleInfo);
    setSelectedTimeFrom(scheduleInfo.timeFrom);
    setSelectedTimeTo(scheduleInfo.timeTo);
    setSelectedDate(scheduleInfo.date);
    
    // Check if the selected slot is available
    if (scheduleInfo.slotStatus === 'unavailable') {
      alert('The selected slot is already taken. Please select a different time.');
      return;
    }

    setFormData((prev) => ({
      ...prev,
      doctorEmail: scheduleInfo.doctorEmail,
      doctorFirstName: scheduleInfo.doctorFirstName,
      doctorLastName: scheduleInfo.doctorLastName,
      appointmentTimeFrom: scheduleInfo.appointmentTimeFrom,
      formattedTimeSlot: scheduleInfo.formattedTimeSlot,
      mainID: scheduleInfo.mainID,
      slotID: scheduleInfo.slotID,
      slotCount: scheduleInfo.slotCount,
      selectedSlots: scheduleInfo.selectedSlots,
    }));
  };
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
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
          {services.map((service) => (
            <option key={service._id || service.id} value={service.name}>
              {service.name}
            </option>
          ))}
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
                  <th>Dental Chart</th>
                </tr>
              </thead>
              <tbody>
                {displayedAppointments.map((appointment) => (
                  <React.Fragment key={appointment._id}>
                    <tr>
                      <td>{`${appointment.patientFirstName} ${appointment.patientLastName}`}</td>
                      <td>{new Date(appointment.appointmentDate).toLocaleDateString('en-CA')}</td>
                      <td>
                        {Array.isArray(appointment.appointmentTimeFrom)
                          ? appointment.appointmentTimeFrom.join(', ')
                          : appointment.appointmentTimeFrom || 'N/A'}
                      </td>
                      <td>
                        {Array.isArray(appointment.appointmentType)
                          ? appointment.appointmentType.join(', ')
                          : appointment.appointmentType || 'N/A'}
                      </td>
                      <td>{appointment.bookedClinic}</td>
                      <td>{appointment.appointmentStatus}</td>
                      <td>
                        <button type="button" className="AdminViewAppointmentButton" onClick={() => handleEditAppointment(appointment)}>
                          {editingAppointmentId === appointment._id ? 'Close' : 'Edit'}
                        </button>
                        
                      </td>
                      <td>
                      <button className="AdminViewAppointmentButton" onClick={() => handleShowDentalChart(appointment)}>
                          Create Dental Record
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
                              <button 
                                className="AdminViewAppointmentButton" 
                                onClick={() => {
                                  setShowDateTimeChange(true);
                                  setShowStatusButtons(false);
                                  setShowNavigationButtons(true);
                                }}
                              >
                                Edit Appointment Details
                              </button>
                              <button 
                                className="AdminViewAppointmentButton" 
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
                              <div className="AdminAppointmentEditContent">
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
                              <div className="AdminAppointmentNavigationButtons">
                                {currentStep > 1 && (
                                  <button 
                                  type="button" class="btn btn-primary btn-sm"
                                  onClick={() => setCurrentStep(currentStep - 1)}
                                  >
                                    Previous
                                  </button>
                                )}
                                {currentStep === 1 && showDateTimeChange && (
                                  <button 
                                  type="button" class="btn btn-primary btn-sm"
                                  onClick={() => setCurrentStep(currentStep + 1)}
                                  >
                                    Next
                                  </button>
                                )}
                                
                              </div>
                            )}

                            {showStatusButtons && (
                              <div className="AdminAppointmentStatusButtons">
                                {['Cancelled', 'Completed', 'No Show', 'Approved'].map(status => (
                                  <button
                                    key={status}
                                    className="AdminAppointmentStatusButton"
                                    onClick={() => updateAppointmentStatus(appointment._id, status)}
                                  >
                                    {status}
                                  </button>
                                ))}
                              </div>
                            )}
                            <div className="AdminAppointmentActionButtons">
                              <button className="AdminViewAppointmentButton UpdateButton" onClick={handleUpdateAppointment}>
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
        <button  onClick={handleNextPage} disabled={currentPage === totalPages}>Next</button>
      </div>
      {showUpdateFee && (
        <UpdateFee 
          selectedAppointment={selectedAppointment}
          onClose={() => setShowUpdateFee(false)} 
        />
      )}
      {showDentalChart && (
        <DentalChartForm 
          initialFirstName={selectedAppointment.patientFirstName}
          initialLastName={selectedAppointment.patientLastName}
          initialEmail={selectedAppointment.patientEmail}
          onClose={() => setShowDentalChart(false)}
        />
      )}
    </div>
  );
}

export default SuperViewAppointment;
