import React from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../Appointment/Appointment.css';

const AppointmentStepThree = ({ formData, handleInputChange }) => {
  const [user, setUser] = React.useState(null);
  const navigate = useNavigate();

  React.useEffect(() => {
    axios
    .get(`${import.meta.env.VITE_BACKEND_URL}/api/verify-token`, {
      withCredentials: true, // Include cookies with the request
      })
      .then((response) => {
        setUser(response.data.user);
      })
      .catch(() => {
        navigate('/login');
      });
  }, [navigate]);

  const handleSubmit = (event) => {
    event.preventDefault();
    console.log('Form data:', formData);
    // Handle form submission logic
    // Example: axios.post('/your-endpoint', formData).then(response => { ... });
  };

  if (!user) {
    return <p>Loading...</p>;
  }

  // Provide default values for formData
  const dob = formData?.dob || '';
  const firstName = formData?.firstName || '';
  const lastName = formData?.lastName || '';
  const email = formData?.email || '';
  const phoneNumber = formData?.phoneNumber || '';

  return (
    <div className="appointment-details">
      <h2>Patient Details</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Date of Birth</label>
          <input
            type="date"
            name="dob"
            placeholder="Date of Birth"
            value={dob}
            onChange={handleInputChange} // Ensure onChange handler is present
          />
        </div>
        <div>
          <label>First Name</label>
          <input
            type="text"
            name="firstName"
            value={firstName}
            onChange={handleInputChange} // Ensure onChange handler is present
          />
        </div>
        <div>
          <label>Last Name</label>
          <input
            type="text"
            name="lastName"
            value={lastName}
            onChange={handleInputChange} // Ensure onChange handler is present
          />
        </div>
        <div>
          <label>Email</label>
          <input
            type="email"
            name="email"
            value={email}
            onChange={handleInputChange} // Ensure onChange handler is present
          />
        </div>
        <div>
          <label>Phone Number</label>
          <input
            type="tel"
            name="phoneNumber"
            value={phoneNumber}
            onChange={handleInputChange} // Ensure onChange handler is present
          />
        </div>
        <button type="submit">Submit</button>
      </form>
    </div>
  );
};

export default AppointmentStepThree;
