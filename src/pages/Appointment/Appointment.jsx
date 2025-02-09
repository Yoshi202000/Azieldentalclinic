import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

import './Appointment.css'; 
import DrawerComponent from '../../component/Drawers';
import Footer from '../../component/Footer';
import AppointmentStepOne from '../../component/appointmentPage/AppointmentStepOne';
import AppointmentStepTwo from '../../component/appointmentPage/AppointmentStepTwo';
import AppointmentStepThree from '../../component/appointmentPage/AppointmentStepThree'; // Direct import
import { generateAvailableDates } from '../../utils/appDate';

const Appointment = () => {
  const [step, setStep] = useState(1);
  const [selectedTimeFrom, setSelectedTimeFrom] = useState(null);
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
  });
  const [bookedAppointments, setBookedAppointments] = useState([]);

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
    fetchServicesData(); // Fetch services when component mounts
  }, []);

  const fetchServicesData = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/clinic`);
      if (response.data && response.data.services) {
        setServices(response.data.services);
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

  const nextStep = () => setStep(step + 1);
  const prevStep = () => setStep(step - 1);

  const handleCardSelect = (cardName) => setSelectedCard(cardName);
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

  const handleAppointmentSubmit = async () => {
    if (!selectedCard || !formData.dob || !formData.lastName || !formData.firstName || !selectedDate || !selectedTimeFrom) {
      alert('Please fill in all required fields.');
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      alert('Please log in.');
      return;
    }

    const appointmentDetails = {
      patientFirstName: formData.firstName,
      patientLastName: formData.lastName,
      patientEmail: formData.email,
      patientPhone: formData.phoneNumber,
      patientDOB: formData.dob,
      bookedClinic: formData.bookedClinic, 
      appointmentDate: selectedDate,
      appointmentTimeFrom: selectedTimeFrom,
      appointmentType: selectedCard,
      fee: null,
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
        navigate('/healthRecord');
      } else {
        alert(`Error: ${result.message}`);
      }
    } catch (error) {
      console.error('Error booking appointment:', error);
      alert('An error occurred while booking the appointment.');
    }
  };

  return (
    <>
      <DrawerComponent />
      <div className="appointment-container">
        <div className="progress-bar">
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
            services={services} // Pass services to AppointmentStepOne
          />
        )}
        {step === 2 && (
          <AppointmentStepTwo
            availableDates={availableDates}
            selectedDate={selectedDate}
            handleDateSelect={handleDateSelect}
            generateTimeSlots={generateTimeSlots}
            selectedTimeFrom={selectedTimeFrom}
            handleTimeSelect={handleTimeSelect}
            bookedAppointments={bookedAppointments}
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
      </div>
      <Footer />
    </>
  );
};

export default Appointment;
