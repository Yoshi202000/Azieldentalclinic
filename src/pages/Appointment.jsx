import React, { useState, useEffect } from 'react';
import '../styles/Appointment.css'; // Import the CSS file for styling
import DrawerComponent from '../component/Drawers';
import Footer from '../test/Footer';
import Card from '../component/Card';
import profilePic1 from '../assets/azielDental.png';

const Appointment = () => {
  const [step, setStep] = useState(1);
  const [selectedCard, setSelectedCard] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    dob: '',
    phoneNumber: '',
    email: '',
  });

  // Fetch user data from the server (or decode it from the token)
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('token'); // Assuming you store the token in localStorage
        const response = await fetch('http://localhost:5000/verify-token', {
          headers: {
            Authorization: `Bearer ${token}`, // Send the token in Authorization header
          },
        });
        const result = await response.json();
        
        if (response.ok) {
          // Populate formData with user details
          setFormData({
            firstName: result.user.firstName,
            lastName: result.user.lastName,
            email: result.user.email,
            phoneNumber: result.user.phoneNumber,
            dob: '', // Leave DOB empty for user input
          });
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };
    
    fetchUserData();
  }, []); // Run this effect only once on component mount

  const handleAppointmentSubmit = async () => {
    // Basic form validation
    if (!selectedCard || !selectedDate || !selectedTime || !formData.dob) {
        alert('Please fill in all required fields.');
        return;
    }

    const token = localStorage.getItem('token'); // Get token from localStorage
    const appointmentDetails = {
      appointmentType: selectedCard,
      appointmentDate: selectedDate,
      appointmentTime: selectedTime,
      patientFirstName: formData.firstName,
      patientLastName: formData.lastName,
      patientEmail: formData.email,
      patientPhone: formData.phoneNumber,
      patientDOB: formData.dob, // Changed from 'dob' to 'patientDOB'
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
        // Optionally, redirect the user or reset the form here
      } else {
        alert(`Error: ${result.message}`);
      }
    } catch (error) {
      console.error('Error booking appointment:', error);
      alert('An error occurred while booking the appointment.');
    }
};
  

  const availableDates = {
    'October 22': ['9:00 AM', '10:00 AM', '11:00 AM'],
    'October 24': ['9:00 AM', '12:00 PM', '3:00 PM'],
  };

  const nextStep = () => {
    setStep(step + 1);
  };

  const prevStep = () => {
    setStep(step - 1);
  };

  const handleCardSelect = (cardName) => {
    setSelectedCard(cardName);
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleDateSelect = (date) => {
    setSelectedDate(date);
    setSelectedTime(null); // Reset the time when a new date is selected
  };

  const handleTimeSelect = (time) => {
    setSelectedTime(time);
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
        )}
        
        {step === 2 && (
          <div className="appointment-date">
            <h2>Select an Appointment</h2>
            <ul>
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
            {selectedDate && (
              <div className="time-slots">
                <h3>Available Times on {selectedDate}</h3>
                <ul>
                  {availableDates[selectedDate].map((time) => (
                    <li 
                      key={time}
                      className={selectedTime === time ? 'available selected' : 'available'}
                      onClick={() => handleTimeSelect(time)}
                    >
                      <span className="time-slot">{time}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
        
        {step === 3 && (
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
                  disabled // Disable input for first name
                />
              </div>
              <div>
                <label>Last Name</label>
                <input 
                  type="text" 
                  name="lastName" 
                  value={formData.lastName} 
                  disabled // Disable input for last name
                />
              </div>
              <div>
                <label>Email</label>
                <input 
                  type="email" 
                  name="email" 
                  value={formData.email} 
                  disabled // Disable input for email
                />
              </div>
              <div>
                <label>Phone Number</label>
                <input 
                  type="tel" 
                  name="phoneNumber" 
                  value={formData.phoneNumber} 
                  disabled // Disable input for phone number
                />
              </div>
            </form>
          </div>
        )}

        <div className="footer">
          {step > 1 && <button className="previous-button" onClick={prevStep}>Previous</button>}
          {step < 3 && (
            <button 
              onClick={nextStep}
              disabled={step === 2 && (!selectedDate || !selectedTime)} // Disable next button if no date or time is selected
            >
              Next: Your Info
            </button>
          )}
          {step === 3 && <button className="complete-button" onClick={handleAppointmentSubmit}>Complete Booking</button>}
        </div>
      </div>
    </>
  );
};

export default Appointment;
