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
      const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/clinic`);
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
      const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/booked-appointments`);
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
      const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/doctor-info`);
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
    if (scheduleInfo.slotStatus === 'unavailable') { // Assuming slotStatus is part of scheduleInfo
      alert('The selected slot is already taken. Please repeat the appointment process again.');
      return; // Cancel the appointment process
    }
    console.log('the booked appointment slot is' + scheduleInfo.slotStatus);

    setSelectedSchedule(scheduleInfo); // Store the selected schedule data
    setFormData((prev) => ({
      ...prev,
      doctorEmail: scheduleInfo.doctorEmail,
      doctorFirstName: scheduleInfo.doctorFirstName,
      doctorLastName: scheduleInfo.doctorLastName,
      appointmentTimeFrom: scheduleInfo.appointmentTimeFrom,
      mainID: scheduleInfo.mainID, // Store mainID
      slotID: scheduleInfo.slotID, // Store slotID
    }));
    console.log('Selected Schedule:', scheduleInfo);
  };

  const handleAppointmentSubmit = async () => {
    if (!selectedCard || !formData.dob || !formData.lastName || !formData.firstName || !selectedDate || !selectedTimeFrom || !formData.bookedClinic) {
      alert('Please fill in all required fields.');
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      alert('Please log in.');
      return;
    }

    // Function to check slot status before booking
    const checkSlotStatus = async (mainID, slotID) => {
        try {
            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/schedule/check-slot-status/${mainID}/${slotID}`);
            const result = await response.json();

            if (response.ok) {
                console.log('Slot Status:', result.status); // Log the slot status
                return result.status; // Return the slot status
            } else {
                console.error('Error checking slot status:', result.message);
                return null; // Return null in case of error
            }
        } catch (error) {
            console.error('Error checking slot status:', error);
            return null; // Return null in case of error
        }
    };

    // **Check the slot status before proceeding**
    const slotStatus = await checkSlotStatus(formData.mainID, formData.slotID);

    if (slotStatus === "Unavailable" || slotStatus === null) {
        alert("The selected slot is unavailable. Your appointment has been canceled.");
        navigate('/'); // Redirect the user to the appointment page
        return; // Stop execution to prevent booking
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
        appointmentType: selectedCard,
        fee: null, 
        doctor: formData.doctorEmail,
    };

    console.log('Appointment Details:', appointmentDetails);

    try {
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/appointments`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `${token}`,
            },
            body: JSON.stringify(appointmentDetails),
        });

        const result = await response.json();

        if (response.ok) {
            alert('Appointment booked successfully!');
            setShowModal(true); // Show modal after successful booking

            // Update the slot status to Unavailable after booking
            await updateSlotToUnavailable(formData.mainID, formData.slotID);
        } else {
            alert(`Error: ${result.message}`);
        }
    } catch (error) {
        console.error('Error booking appointment:', error);
        alert('An error occurred while booking the appointment.');
    }
};

  const updateSlotToUnavailable = async (mainID, slotID) => {
    try {
        const response = await axios.put(`${import.meta.env.VITE_BACKEND_URL}/api/schedule/update-slot-status/${mainID}/${slotID}`);
        
        if (response.status === 200) {
            console.log('Slot updated successfully:', response.data);
        } else {
            console.error('Failed to update slot:', response.data.message);
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
          />
        )}
        {step === 3 && (
          <AppointmentStepThree
            formData={formData}
            handleInputChange={handleInputChange}
          />
        )}
        
        <div className="footer">
          {step > 1 && <button className="previous-button" onClick={prevStep}>Previous</button>}
          {step < 3 && <button onClick={nextStep}>Next</button>}
          {step === 3 && <button className="complete-button" 
            onClick={handleAppointmentSubmit}>
            Complete Booking
          </button>}
        </div>
        {showModal && <AppointmentStepFour onClose={handleCloseModal} />} {/* Render the modal */}
      </div>
      <Footer />
    </>
  );
};

export default Appointment;
