import React, { useState, useEffect } from 'react';
import '../Appointment/Appointment.css';
import Card from '../../component/Card';
import profilePic1 from '../../assets/doctor1.png';
import DrawerComponent from '../../component/Drawers';
import Footer from '../../test/Footer';
import axios from 'axios';

// Step 1: AppointmentType
const AppointmentStepOne = ({ selectedCard, handleCardSelect }) => (
  <div className="appointment-type">
    <h2>Schedule Your Appointment</h2>
    <div className="card-container">
      <label>
        <Card
          name="Tooth Extractions"
          description="I am a dentist from Aziel Dental Clinic"
          image={profilePic1}
          isSelected={selectedCard === "Tooth Extractions"}
          onClick={() => handleCardSelect("Tooth Extractions")}
        />
      </label>
      <label>
        <Card
          name="Braces & Orthodontics"
          description="I am a dentist specializing in orthodontics"
          image={profilePic1}
          isSelected={selectedCard === "Braces & Orthodontics"}
          onClick={() => handleCardSelect("Braces & Orthodontics")}
        />
      </label>
      <label>
        <Card
          name="Dental Fillings"
          description="I am a dentist specializing in cleaning"
          image={profilePic1}
          isSelected={selectedCard === "Dental Fillings"}
          onClick={() => handleCardSelect("Dental Fillings")}
        />
      </label>
    </div>
  </div>
);

// Step 2: AppointmentDate
const AppointmentStepTwo = ({
  availableDates,
  selectedDate,
  handleDateSelect,
  generateTimeSlots,
  selectedTimeFrom,
  handleTimeSelect
}) => (
  <div className="appointment-date">
    <h2>Select an Appointment</h2>
    <div className="calendar-time-container">
      <div className="calendar-container">
        <ul className="calendar">
          {Object.keys(availableDates).map((date) => (
            <li
              key={date}
              className={selectedDate === date ? 'available selected' : 'available'}
              onClick={() => handleDateSelect(date)}
            >
              <span>{date}</span>
            </li>
          ))}
        </ul>
      </div>
      {selectedDate && (
        <div className="time-slots-container">
          <h3>Available Times on {selectedDate}</h3>
          <ul className="time-slots">
            {generateTimeSlots(9, 18).map((time, index) => (
              <li
                key={index}
                className={selectedTimeFrom === time ? 'available selected' : 'available'}
                onClick={() => handleTimeSelect('from', time)}
                style={{
                  backgroundColor: selectedTimeFrom === time ? '#4D869C' : '#E3E3E3',
                  color: selectedTimeFrom === time ? 'white' : 'black',
                  padding: '10px',
                  margin: '5px 0',
                  borderRadius: '5px',
                  textAlign: 'center',
                  cursor: 'pointer'
                }}
              >
                {time}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  </div>
);

// Step 3: AppointmentDetails
const AppointmentStepThree = ({ formData, handleInputChange, handleAppointmentSubmit }) => (
  <div className="appointment-details">
    <h2>Patient Details</h2>
    <form>
      <div>
        <label>Date of Birth</label>
        <input
          type="date"
          name="dob"
          placeholder="Date of Birth"
          value={formData.dob}
          onChange={handleInputChange}
        />
      </div>
      <div>
        <label>First Name</label>
        <input
          type="text"
          name="firstName"
          value={formData.firstName}
          disabled
        />
      </div>
      <div>
        <label>Last Name</label>
        <input
          type="text"
          name="lastName"
          value={formData.lastName}
          disabled
        />
      </div>
      <div>
        <label>Email</label>
        <input
          type="email"
          name="email"
          value={formData.email}
          disabled
        />
      </div>
      <div>
        <label>Phone Number</label>
        <input
          type="tel"
          name="phoneNumber"
          value={formData.phoneNumber}
          disabled
        />
      </div>
    </form>
    <button className="complete-button" onClick={handleAppointmentSubmit}>
      Complete Booking
    </button>
  </div>
);

const TestAppointment = () => {
  const [step, setStep] = useState(1);
  const [selectedCard, setSelectedCard] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTimeFrom, setSelectedTimeFrom] = useState(null);
  const [availableDates, setAvailableDates] = useState({});
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    dob: '',
    phoneNumber: '',
    email: '',
  });

  useEffect(() => {
    // Fetch available dates for appointments
    const dates = generateAvailableDates();
    setAvailableDates(dates);
  }, []);

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
    if (!formData.dob || !formData.firstName || !formData.lastName || !selectedDate || !selectedTimeFrom || !selectedCard) {
      alert('Please fill in all the required fields.');
      return;
    }

    const token = localStorage.getItem('token'); // Get token from localStorage
    const appointmentDetails = {
      patientFirstName: formData.firstName,
      patientLastName: formData.lastName,
      patientEmail: formData.email,
      patientPhone: formData.phoneNumber,
      patientDOB: formData.dob,
      appointmentDate: selectedDate,
      appointmentTimeFrom: selectedTimeFrom,
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

        {step === 1 && (
          <AppointmentStepOne
            selectedCard={selectedCard}
            handleCardSelect={handleCardSelect}
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
          />
        )}
        {step === 3 && (
          <AppointmentStepThree
            formData={formData}
            handleInputChange={handleInputChange}
            handleAppointmentSubmit={handleAppointmentSubmit}
          />
        )}

        <div className="navigation-buttons">
          {step > 1 && <button onClick={prevStep}>Back</button>}
          {step < 3 && <button onClick={nextStep}>Next</button>}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default TestAppointment;
