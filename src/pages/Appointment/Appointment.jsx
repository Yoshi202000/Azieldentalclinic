import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

import './Appointment.css'; 
import DrawerComponent from '../../component/Drawers';
import Footer from '../../component/Footer';
import AppointmentStepOne from '../../component/appointmentPage/AppointmentStepOne';
// import AppointmentStepTwo from '../../component/appointmentPage/AppointmentStepTwo';
import TestStepTwo from '../../test/TestStepTwo';
import AppointmentStepThree from '../../component/appointmentPage/AppointmentStepThree'; // Direct import
import { generateAvailableDates } from '../../utils/appDate';
import AppointmentStepFour from '../../component/appointmentPage/AppointmentStepFour'; // Import the modal component

const Appointment = () => {
  const [step, setStep] = useState(1);
  const [selectedTimeFrom, setSelectedTimeFrom] = useState(null);
  const [selectedTimeTo, setSelectedTimeTo] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedCard, setSelectedCard] = useState(null);
  const [availableDates, setAvailableDates] = useState({});
  const [services, setServices] = useState([]); // State to hold services data
  const navigate = useNavigate();
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
  
  const [bookedAppointments, setBookedAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [nameOne, setNameOne] = useState('');
  const [nameTwo, setNameTwo] = useState(''); 
  const [showModal, setShowModal] = useState(false); // State to control modal visibility
  const [isSubmitting, setIsSubmitting] = useState(false); // Add this state for loading indicator

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

  useEffect(() => {
    const dates = generateAvailableDates();
    setAvailableDates(dates);
    fetchBookedAppointments();
    fetchServicesData();
    fetchDoctors();
  }, []);

 const fetchServicesData = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/clinic`);
      if (response.data && response.data.services) {
        const { nameOne, nameTwo } = response.data; 
        setServices(response.data.services);
        setNameOne(nameOne); 
        setNameTwo(nameTwo); 
      } else {
        console.error('Failed to fetch services data');
      }
    } catch (error) {
      console.error('Error fetching services data:', error);
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

  const nextStep = () => setStep(step + 1);
  const prevStep = () => setStep(step - 1);

  const handleCardSelect = (cardName) => setSelectedCard(cardName);
  const handleClinicSelect = (clinicName) => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      bookedClinic: clinicName,
    }));
    console.log(formData.bookedClinic);
  };

  const handleDateSelect = (date) => {
    setSelectedDate(date);
    setSelectedTimeFrom(null); 
  };
  
  const handleTimeSelect = (type, time) => {
    if (type === 'from') setSelectedTimeFrom(time);
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));
  };

  const handleScheduleSelect = (scheduleInfo) => {
    setSelectedSchedule(scheduleInfo);
    setSelectedTimeFrom(scheduleInfo.timeFrom);
    setSelectedTimeTo(scheduleInfo.timeTo);
    setSelectedDate(scheduleInfo.date);
    
    // Check if the selected slot is available
    if (scheduleInfo.slotStatus === 'unavailable') {
      alert('The selected slot is already taken. Please repeat the appointment process again.');
      return;
    }
    console.log('the booked appointment slot is' + scheduleInfo.slotStatus);

    setSelectedSchedule(scheduleInfo); // Store the selected schedule data
    setFormData((prev) => ({
      ...prev,
      doctorEmail: scheduleInfo.doctorEmail,
      doctorFirstName: scheduleInfo.doctorFirstName,
      doctorLastName: scheduleInfo.doctorLastName,
      appointmentTimeFrom: scheduleInfo.appointmentTimeFrom, // This is now an array
      formattedTimeSlot: scheduleInfo.formattedTimeSlot, // For display purposes
      mainID: scheduleInfo.mainID,
      slotID: scheduleInfo.slotID,
      slotCount: scheduleInfo.slotCount,
      selectedSlots: scheduleInfo.selectedSlots,
    }));
    console.log('Selected Schedule:', scheduleInfo);
  };

  const handleAppointmentSubmit = async () => {
    // Validate all required fields
    if (!formData.appointmentType || !formData.dob || !formData.lastName || !formData.firstName || !selectedDate || !selectedTimeFrom || !formData.bookedClinic) {
      alert('Please fill in all required fields.');
      return;
    }

    // Validate DOB format
    if (!formData.dob.match(/^\d{4}-\d{2}-\d{2}$/)) {
      alert('Please enter a valid date of birth.');
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      alert('Please log in.');
      return;
    }

    // Set loading state to true
    setIsSubmitting(true);

    // Function to check slot status before booking
    const checkSlotStatus = async (mainID, slotIDs) => {
      try {
        // Split the comma-separated slotIDs string into an array
        const slotIDArray = slotIDs.split(',');
        
        // Check status for each slot
        const statusPromises = slotIDArray.map(slotID => 
          fetch(`${import.meta.env.VITE_BACKEND_URL}/api/schedule/check-slot-status/${mainID}/${slotID}`)
            .then(response => response.json())
        );
        
        const results = await Promise.all(statusPromises);
        
        // If any slot is unavailable, return "Unavailable"
        if (results.some(result => result.status === "Unavailable")) {
          return "Unavailable";
        }
        
        return "Available";
      } catch (error) {
        console.error('Error checking slot status:', error);
        return null;
      }
    };

    // Check the slot status before proceeding
    const slotStatus = await checkSlotStatus(formData.mainID, formData.slotID);

    if (slotStatus === "Unavailable" || slotStatus === null) {
      setIsSubmitting(false); // Reset loading state
      alert("One or more selected slots are unavailable. Your appointment has been canceled.");
      navigate('/');
      return;
    }

    // Prepare appointment details
    const appointmentDetails = {
      patientFirstName: formData.firstName,
      patientLastName: formData.lastName,
      patientEmail: formData.email,
      patientPhone: formData.phoneNumber,
      patientDOB: formData.dob,
      bookedClinic: formData.bookedClinic,
      appointmentDate: selectedDate,
      appointmentTimeFrom: formData.appointmentTimeFrom,
      appointmentType: formData.appointmentType,
      fee: null, 
      doctor: formData.doctorEmail,
      slotCount: formData.slotCount,
      selectedSlots: formData.selectedSlots,
      mainID: formData.mainID,
      slotID: formData.slotID
    };

    console.log('Appointment Details:', appointmentDetails);

    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/appointments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `${token}`,
        },
        body: JSON.stringify(appointmentDetails),
      });

      const result = await response.json();

      if (response.ok) {
        // Update all selected slots to Unavailable after booking
        await updateSlotsToUnavailable(formData.mainID, formData.slotID);
        setShowModal(true);
      } else {
        alert(`Error: ${result.message}`);
      }
    } catch (error) {
      console.error('Error booking appointment:', error);
      alert('An error occurred while booking the appointment.');
    } finally {
      setIsSubmitting(false); // Reset loading state regardless of outcome
    }
  };

  // Updated function to handle multiple slots
  const updateSlotsToUnavailable = async (mainID, slotIDs) => {
    try {
      // Split the comma-separated slotIDs string into an array
      const slotIDArray = slotIDs.split(',');
      
      // Update each slot
      const updatePromises = slotIDArray.map(slotID => 
        axios.put(`${import.meta.env.VITE_BACKEND_URL}/api/schedule/update-slot-status/${mainID}/${slotID}`)
      );
      
      const results = await Promise.all(updatePromises);
      
      // Check if all updates were successful
      if (results.every(response => response.status === 200)) {
        console.log('All slots updated successfully');
      } else {
        console.error('Some slots failed to update');
      }
    } catch (error) {
      console.error('Error updating slot status:', error);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false); // Close the modal
    navigate('/healthRecord'); // Navigate to health record after closing the modal
  };

  return (
    <>
      <DrawerComponent />
      <div className="appointment-container">
        <div className="appointment-progress-bar">
          <div className={`step ${step === 1 ? 'active' : ''}`}>Appointment Type</div>
          <div className={`step ${step === 2 ? 'active' : ''}`}>Pick a Time</div>
          <div className={`step ${step === 3 ? 'active' : ''}`}>Complete Booking</div>
        </div>

        {step === 1 && (
          <AppointmentStepOne 
            formData={formData}
            handleInputChange={handleInputChange}
            selectedCard={selectedCard} 
            handleCardSelect={handleCardSelect}
            services={services}
            doctors={doctors}
            nameOne={nameOne} 
            nameTwo={nameTwo} 
            handleClinicSelect={handleClinicSelect} // Pass the function as a prop
          />
        )}
        {step === 2 && (
          <TestStepTwo
            selectedDoctor={formData.selectedDoctor}
            onScheduleSelect={handleScheduleSelect}
            requiredSlots={formData.requiredSlots || 1}
          />
        )}
        {step === 3 && (
          <AppointmentStepThree
            formData={{
              ...formData,
              displayTimeFrom: formData.formattedTimeSlot || (Array.isArray(formData.appointmentTimeFrom) ? formData.appointmentTimeFrom.join(', ') : formData.appointmentTimeFrom)
            }}
            handleInputChange={handleInputChange}
          />
        )}
        
        <div className="footer">
          {step > 1 && <button className="previous-button" onClick={prevStep} disabled={isSubmitting}>Previous</button>}
          {step < 3 && <button onClick={nextStep} disabled={isSubmitting}>Next</button>}
          {step === 3 && (
            isSubmitting ? (
              <button className="complete-button loading" disabled>
                <span className="spinner"></span> Processing...
              </button>
            ) : (
              <button className="complete-button" onClick={handleAppointmentSubmit}>
                Complete Booking
              </button>
            )
          )}
        </div>
        {showModal && <AppointmentStepFour onClose={handleCloseModal} />} {/* Render the modal */}
      </div>
      <Footer />
      
      {/* Add CSS for the loading spinner */}
      <style jsx>{`
        .spinner {
          display: inline-block;
          width: 20px;
          height: 20px;
          border: 3px solid rgba(255,255,255,.3);
          border-radius: 50%;
          border-top-color: #fff;
          animation: spin 1s ease-in-out infinite;
          margin-right: 10px;
        }
        
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        
        .loading {
          opacity: 0.7;
          cursor: not-allowed;
        }
      `}</style>
    </>
  );
};

export default Appointment;
