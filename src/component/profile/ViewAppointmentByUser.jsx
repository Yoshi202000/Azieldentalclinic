import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import AppointmentStepOne from '../appointmentPage/AppointmentStepOne';
import TestStepTwo from '../../test/TestStepTwo';
import { generateAvailableDates } from '../../utils/appDate';
import '../../pages/Profile/Profile.css'
import '../../styles/ViewAppointmentByUser.css'

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

  const [currentStep, setCurrentStep] = useState(1);
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

  const [schedules, setSchedules] = useState([]);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [selectedTimeTo, setSelectedTimeTo] = useState(null);
  const [nameOne, setNameOne] = useState('Default Clinic 1');
  const [nameTwo, setNameTwo] = useState('Default Clinic 2');

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
    fetchDoctors();
    fetchServicesData();
    fetchSchedules();
    const dates = generateAvailableDates();
    setAvailableDates(dates);
    fetchBookedAppointments();
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
      const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/ViewAppointment`, {
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
      const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/booked-appointments`);
      if (response.status === 200) {
        setBookedAppointments(response.data.bookedAppointments);
      } else {
        console.error('Failed to fetch booked appointments');
      }
    } catch (error) {
      console.error('Error fetching booked appointments:', error);
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

  const fetchServicesData = async () => {
    console.log('Fetching services data...');
    try {
      const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/clinic`);
      console.log('Services response:', response.data);
      if (response.data && response.data.services) {
        setServices(response.data.services);
        console.log('Services set:', response.data.services);
        if (response.data.nameOne && response.data.nameTwo) {
          setNameOne(response.data.nameOne);
          setNameTwo(response.data.nameTwo);
          console.log('Clinic names set:', { nameOne: response.data.nameOne, nameTwo: response.data.nameTwo });
        } else {
          console.warn('Clinic names not found in response:', response.data);
        }
      } else {
        console.error('Invalid services data format:', response.data);
      }
    } catch (error) {
      console.error('Error fetching services:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
    }
  };

  const fetchSchedules = async () => {
    console.log('Fetching schedules...');
    try {
      const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/all-schedules`);
      console.log('Fetched schedules:', response.data);
      setSchedules(response.data);
    } catch (err) {
      console.error('Error fetching schedules:', err);
      console.error('Error details:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status
      });
      setError('Failed to fetch schedules');
    }
  };

  const checkSlotStatus = async (mainID, slotIDs) => {
    console.log('Checking slot status for:', { mainID, slotIDs });
    try {
      const slotIDArray = slotIDs.split(',');
      console.log('Checking slots:', slotIDArray);
      
      for (const slotID of slotIDArray) {
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/schedule/check-slot-status/${mainID}/${slotID}`);
        const result = await response.json();
        console.log(`Slot ${slotID} status:`, result);

        if (!response.ok) {
          console.error('Error checking slot status:', result.message);
          return null;
        }

        if (result.status === "Unavailable") {
          console.warn(`Slot ${slotID} is unavailable`);
          return "Unavailable";
        }
      }

      console.log('All slots are available');
      return "Available";
    } catch (error) {
      console.error('Error in checkSlotStatus:', error);
      return null;
    }
  };

  const updateSlotsToUnavailable = async (mainID, slotIDs) => {
    try {
      const slotIDArray = slotIDs.split(',');
      
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
      const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/ViewAppointment/updateStatus`, 
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
    console.log('Starting edit process for appointment:', appointment);
    
    if (editingAppointment && editingAppointment._id === appointment._id) {
      console.log('Closing edit mode for current appointment');
      setEditingAppointment(null);
      setIsContainerExpanded(false);
      setShowTypeChange(false);
      setShowDateTimeChange(false);
    } else {
      console.log('Opening edit mode for new appointment');
      setEditingAppointment(appointment);
      setIsContainerExpanded(true);
      setShowTypeChange(false);
      setShowDateTimeChange(false);
      
      const selectedCardValue = Array.isArray(appointment.appointmentType) 
        ? appointment.appointmentType[0] 
        : appointment.appointmentType;
      console.log('Setting selected card:', selectedCardValue);
      setSelectedCard(selectedCardValue);
      
      console.log('Setting form data for editing');
      setFormData(prev => {
        const newFormData = {
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
        };
        console.log('Updated form data:', newFormData);
        return newFormData;
      });
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

  const handleClinicSelect = (selectedClinic) => {
    setFormData((prevData) => ({
      ...prevData,
      bookedClinic: selectedClinic,
      selectedDoctor: '',
    }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleScheduleSelect = (scheduleInfo) => {
    console.log('Selected Schedule Info:', scheduleInfo);
    setSelectedSchedule(scheduleInfo);
    setSelectedTimeFrom(scheduleInfo.timeFrom);
    setSelectedTimeTo(scheduleInfo.timeTo);
    setSelectedDate(scheduleInfo.date);
    
    if (scheduleInfo.slotStatus === 'unavailable') {
      console.warn('Attempted to select unavailable slot:', scheduleInfo);
      alert('The selected slot is already taken. Please select a different time.');
      return;
    }

    console.log('Updating form data with schedule info');
    setFormData((prev) => {
      const newFormData = {
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
      };
      console.log('Updated Form Data:', newFormData);
      return newFormData;
    });
  };

  const handleUpdateAppointment = async () => {
    try {
      console.log('Starting appointment update process...');
      console.log('Form Data:', formData);
      console.log('Selected Date:', selectedDate);
      console.log('Editing Appointment:', editingAppointment);
      
      const token = localStorage.getItem('token');
      
      // Check slot status
      const slotStatus = await checkSlotStatus(formData.mainID, formData.slotID);
      console.log('Slot Status Check:', slotStatus);

      if (slotStatus === "Unavailable") {
        console.error('Slot unavailable:', formData.mainID, formData.slotID);
        alert("The selected slot is unavailable. Cannot update appointment.");
        return;
      }

      const updatedAppointment = {
        patientFirstName: editingAppointment.patientFirstName,
        patientLastName: editingAppointment.patientLastName,
        patientEmail: editingAppointment.patientEmail,
        patientPhone: editingAppointment.patientPhone,
        patientDOB: editingAppointment.patientDOB,
        bookedClinic: formData.bookedClinic,
        appointmentDate: selectedDate,
        appointmentTimeFrom: formData.appointmentTimeFrom,
        appointmentType: formData.selectedServices || [selectedCard],
        fee: editingAppointment.fee,
        doctor: formData.doctorEmail,
        slotCount: formData.requiredSlots || 1,
        selectedSlots: formData.selectedSlots,
        mainID: formData.mainID,
        slotID: formData.slotID
      };
      console.log('Prepared Updated Appointment:', updatedAppointment);

      const response = await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/api/updateAppointment/${editingAppointment._id}`,
        updatedAppointment,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log('Update Response:', response.data);

      if (response.status === 200) {
        const slotsUpdated = await updateSlotsToUnavailable(formData.mainID, formData.slotID);
        console.log('Slots Update Status:', slotsUpdated);
        
        if (slotsUpdated) {
          console.log('Successfully updated appointment and slots');
          setAppointments(prevAppointments =>
            prevAppointments.map(app =>
              app._id === response.data._id ? {
                ...app,
                ...response.data,
                appointmentType: response.data.appointmentType || [response.data.appointmentType]
              } : app
            )
          );
          
          alert('Appointment updated successfully');
        } else {
          console.warn('Appointment updated but slot status update failed');
        }
      }

      setEditingAppointment(null);
      setShowTypeChange(false);
      setShowDateTimeChange(false);
    } catch (error) {
      console.error('Error in handleUpdateAppointment:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
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
                        <div className="ProfileAppointmentEditButtons">
                          <button 
                            className="ProfileAppointmentButton" 
                            onClick={() => {
                              setShowDateTimeChange(true);
                              setShowTypeChange(false);
                              setCurrentStep(1);
                            }}
                          >
                            Edit Appointment Details
                          </button>
                          <button 
                            className="ProfileAppointmentButton" 
                            onClick={() => {
                              setShowDateTimeChange(false);
                              setShowTypeChange(false);
                              setEditingAppointment(null);
                              setIsContainerExpanded(false);
                              setCurrentStep(1);
                              setFormData({
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
                            }}
                          >
                            Cancel Editing
                          </button>
                        </div>

                        <div className="ProfileAppointmentEditContent">
                          {showDateTimeChange && currentStep === 1 && (
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

                          {showDateTimeChange && currentStep === 2 && (
                            <TestStepTwo
                              selectedDoctor={formData.selectedDoctor}
                              onScheduleSelect={handleScheduleSelect}
                              filterEmail={formData.doctorEmail}
                              requiredSlots={formData.requiredSlots || 1}
                            />
                          )}
                        </div>

                        {showDateTimeChange && (
                          <div className="ProfileAppointmentNavigationButtons">
                            {currentStep > 1 && (
                              <button 
                                type="button" 
                                className="btn btn-primary btn-sm"
                                onClick={() => setCurrentStep(currentStep - 1)}
                              >
                                Previous
                              </button>
                            )}
                            {currentStep === 1 && (
                              <button 
                                type="button" 
                                className="btn btn-primary btn-sm"
                                onClick={() => setCurrentStep(currentStep + 1)}
                              >
                                Next
                              </button>
                            )}
                          </div>
                        )}

                        <div className="ProfileAppointmentActionButtons">
                          <button 
                            className="ProfileAppointmentButton UpdateButton" 
                            onClick={handleUpdateAppointment}
                          >
                            Update Appointment
                          </button>
                          <button 
                            className="ProfileAppointmentButton" 
                            onClick={() => handleCancelAppointment(editingAppointment._id)}
                          >
                            Cancel Appointment
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
      )}
    </div>
  );
}

export default ViewAppointmentByUser;
