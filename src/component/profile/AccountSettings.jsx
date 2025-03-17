import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/AccountSettings.css';
import axios from 'axios';

const AccountSettings = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [doctorImage, setDoctorImage] = useState(null);
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
    services: [],
  });
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const [availableServices, setAvailableServices] = useState([]);

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
          headers: { Authorization: `Bearer ${token}` },
          credentials: 'include',
        });

        if (!verifyTokenResponse.ok) {
          throw new Error('Failed to fetch data from the token.');
        }

        const verifyTokenData = await verifyTokenResponse.json();
        const { firstName, lastName, email, phoneNumber, dob, role, clinic, greetings, description, services } = verifyTokenData.user || {};

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
          services: Array.isArray(services) ? services.map(service => service.name) : [],
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

  const handleImageChange = (e) => {
    setDoctorImage(e.target.files[0]);
  };

  const handleImageUpload = async () => {
    if (!doctorImage) {
      setMessage('Please select an image.');
      setIsError(true);
      return;
    }
    
    const formData = new FormData();
    formData.append('doctorImage', doctorImage);

    try {
      const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/upload-doctor-image`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setMessage('Image uploaded successfully!');
      setIsError(false);
    } catch (error) {
      setMessage('Error uploading image.');
      setIsError(true);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
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
    console.log('Submitting with token:', token);

    const requestData = {
      doctorInformation: {
        doctorGreeting: formData.greetings,
        doctorDescription: formData.description,
        services: formData.services.filter(service => availableServices.some(s => s.name === service)),
      },
    };

    console.log('Sending request with data:', requestData);

    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/update-doctor-information`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        credentials: 'include',
        body: JSON.stringify(requestData),
      });

      console.log('Response status:', response.status);
      const data = await response.json();
      console.log('Response data:', data);

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update information');
      }

      if (data.token) {
        localStorage.setItem('token', data.token);
      }

      if (data.user) {
        setFormData(prev => ({
          ...prev,
          greetings: data.user.doctorGreeting,
          description: data.user.doctorDescription,
          services: data.user.services.map(service => service.name),
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

  const isDoctorRole = formData.role === 'doctor';
  const isadmin = formData.role === 'admin'|| formData.role === 'doctor' || formData.role === 'superAdmin';

  if (loading) return <p>Loading...</p>;

  return (
    <div className="account-settings-container">
      <h1>Profile Information</h1>
      {message && <p className={isError ? 'error-message' : 'success-message'}>{message}</p>}

      <label>First Name:</label>
      <input type="text" value={formData.firstName} readOnly />

      <label>Last Name:</label>
      <input type="text" value={formData.lastName} readOnly />

      <label>Email:</label>
      <input type="email" value={formData.email} readOnly />
      {isadmin && (<>
          <label>Role:</label>
            <input type="role" value={formData.role} readOnly />
            </>)}
      {isDoctorRole && (
        <>
          <label>Clinic:</label>
          <input type="text" value={formData.clinic} readOnly />

          <form onSubmit={handleSubmit}>
            <label>Greetings:</label>
            <input type="text" name="greetings" value={formData.greetings} onChange={handleInputChange} />

            <label>Description:</label>
            <input type="text" name="description" value={formData.description} onChange={handleInputChange} />
            
            <h3>Select Services</h3>
            {availableServices.map((service, index) => (
              <div key={index}>
                <input type="checkbox" checked={formData.services.includes(service.name)} onChange={() => handleServiceSelect(service.name)} />
                <label>{service.name}</label>
              </div>
            ))}

            <button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Submitting...' : 'Submit'}</button>
          </form>
          <label>Doctor Image:</label>
      <input type="file" accept="image/*" onChange={handleImageChange} />
      <button onClick={handleImageUpload} disabled={!doctorImage}>Upload Image</button>
        </>
      )}
    </div>
  );
};

export default AccountSettings;
