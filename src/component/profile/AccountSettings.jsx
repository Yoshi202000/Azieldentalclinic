import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/AccountSettings.css';
import axios from 'axios';

const AccountSettings = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    dob: '',
    phoneNumber: '',
    email: '',
    role: '',
    clinic: '',
    greetings: '',
    description: '',
    services: [], // Initialize services as an empty array
  });
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const [availableServices, setAvailableServices] = useState([]); // Initialize as an empty array

  useEffect(() => {
    const fetchServicesData = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/clinic`);
        if (response.data && response.data.services) {
          setAvailableServices(response.data.services);
        } else {
          console.error('Failed to fetch services data');
        }
      } catch (error) {
        console.error('Error fetching services data:', error);
      }
    };

    fetchServicesData();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Please log in to continue.');
        navigate('/login');
        return;
      }

      try {
        const verifyTokenResponse = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/verify-token`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
          },
          credentials: 'include',
        });

        if (!verifyTokenResponse.ok) {
          throw new Error('Failed to fetch data from the token.');
        }

        const verifyTokenData = await verifyTokenResponse.json();

        const {
          firstName,
          lastName,
          email,
          phoneNumber,
          dob,
          role,
          clinic,
          greetings,
          description,
          services,
        } = verifyTokenData.user || {};

        setFormData({
          firstName,
          lastName,
          email,
          phoneNumber,
          dob: dob || '',
          role,
          clinic,
          greetings: greetings || '',
          description: description || '',
          services: Array.isArray(services) ? services.map((service) => service.name) : [],
        });

        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        alert(error.message || 'An unexpected error occurred.');
        navigate('/login');
      }
    };

    fetchData();
  }, [navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleServiceSelect = (serviceName) => {
    setFormData((prevData) => {
      const services = prevData.services.includes(serviceName)
        ? prevData.services.filter((service) => service !== serviceName)
        : [...prevData.services, serviceName];
      return { ...prevData, services };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage('');
    setIsError(false);

    const token = localStorage.getItem('token');
    console.log('Submitting with token:', token); // Debug log

    const requestData = {
      doctorInformation: {
        doctorGreeting: formData.greetings,
        doctorDescription: formData.description,
        services: formData.services
      }
    };

    console.log('Sending request with data:', requestData); // Debug log

    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/update-doctor-information`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(requestData)
      });

      console.log('Response status:', response.status); // Debug log

      const data = await response.json();
      console.log('Response data:', data); // Debug log

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update information');
      }

      if (data.user) {
        setFormData(prev => ({
          ...prev,
          greetings: data.user.doctorGreeting,
          description: data.user.doctorDescription,
          services: data.user.services.map(service => service.name)
        }));
      }

      setMessage('Information updated successfully');
    } catch (error) {
      console.error('Error updating doctor information:', error);
      setMessage(error.message || 'An error occurred while updating information');
      setIsError(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Only show doctor-specific fields if user is a doctor
  const isDoctorRole = formData.role === 'doctor';

  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <div className="account-settings-container">
      <h1>Profile Information</h1>
      {message && <p className={isError ? 'error-message' : 'success-message'}>{message}</p>}

      <label htmlFor="firstName">First Name:</label>
      <input type="text" name="firstName" value={formData.firstName || ''} onChange={handleInputChange}   readOnly
 />

      <label htmlFor="lastName">Last Name:</label>
      <input type="text" name="lastName" value={formData.lastName || ''} onChange={handleInputChange}  readOnly
 />

      <label htmlFor="email">Email:</label>
      <input type="email" name="email" value={formData.email || ''} onChange={handleInputChange}  readOnly
 />

      {isDoctorRole && (
        <>
          <label htmlFor="role">Role:</label>
          <input type="text" name="role" value={formData.role || ''} onChange={handleInputChange}   readOnly
          />

          <label htmlFor="clinic">Clinic:</label>
          <input type="text" name="clinic" value={formData.clinic || ''} onChange={handleInputChange}   readOnly
          />

          <form onSubmit={handleSubmit}>
            <label htmlFor="greetings">Greetings:</label>
            <input
              type="text"
              name="greetings"
              value={formData.greetings || ''}
              onChange={(e) => setFormData({ ...formData, greetings: e.target.value })}
            />

            <label htmlFor="description">Description:</label>
            <input
              type="text"
              name="description"
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />

            <div className="services-container">
              <h3>Select Services</h3>
              {availableServices && availableServices.length > 0 ? (
                availableServices.map((service, index) => (
                  <div key={index}>
                    <input
                      type="checkbox"
                      checked={formData.services.includes(service.name)}
                      onChange={() => handleServiceSelect(service.name)}
                    />
                    <label>{service.name}</label>
                  </div>
                ))
              ) : (
                <p>No services available</p>
              )}
            </div>

            <button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Submitting...' : 'Submit'}
            </button>
          </form>
        </>
      )}
    </div>
  );
};

export default AccountSettings;
