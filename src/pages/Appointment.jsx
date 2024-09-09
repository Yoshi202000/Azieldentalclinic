import React, { useState, useEffect } from 'react';
import '../styles/Appointment.css'; 
import DrawerComponent from '../component/Drawers';
import Footer from '../test/Footer';
import AppointmentStepOne from '../component/AppointmentStepOne';
import AppointmentStepTwo from '../component/AppointmentStepTwo';
import AppointmentStepThree from '../component/AppointmentStepThree';
import { generateAvailableDates } from '../utils/appDate';

const Appointment = () => {
  const [step, setStep] = useState(1);
  const [selectedTimeFrom, setSelectedTimeFrom] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedCard, setSelectedCard] = useState(null);
  const [availableDates, setAvailableDates] = useState({});
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    dob: '',
    phoneNumber: '',
    email: '',
  });

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
  }, []);

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
  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };
  const handleAppointmentSubmit = async () => {
    // Basic form validation
    if (!formData.dob) {
      alert('Please enter your date of birth.');
      return;
    }

    const token = localStorage.getItem('token'); // Get token from localStorage
    const appointmentDetails = {
      patientFirstName: formData.firstName,
      patientLastName: formData.lastName,
      patientEmail: formData.email,
      patientPhone: formData.phoneNumber,
      patientDOB: formData.dob,
      appointmentDate: selectedDate, // Change this field
      appointmentTimeFrom: selectedTimeFrom, // Change this field
      appointmentType: selectedCard
    };

    try {
      const response = await fetch('http://localhost:5000/appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`, // Include the token in the Authorization header
        },
        body: JSON.stringify(appointmentDetails),
      });

      const result = await response.json();
      if (response.ok) {
        alert('Appointment booked successfully!');
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

        {step === 1 && <AppointmentStepOne selectedCard={selectedCard} handleCardSelect={handleCardSelect} />}
        {step === 2 && (
          <AppointmentStepTwo
            availableDates={availableDates}
            selectedDate={selectedDate}
            handleDateSelect={handleDateSelect}
            generateTimeSlots={generateTimeSlots}
            selectedTimeFrom={selectedTimeFrom}
            handleTimeSelect={handleTimeSelect}
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
          {step < 3 && <button onClick={nextStep}>Next: Your Info</button>}
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
