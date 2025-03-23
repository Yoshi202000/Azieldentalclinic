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
    services: [],
    doctorImage: '',
  });
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const [availableServices, setAvailableServices] = useState([]);
  const [doctorImage, setDoctorImage] = useState(null);
  const [doctorImagePreview, setDoctorImagePreview] = useState('');

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
          doctorImage: '',
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

  const handleImageUpload = async () => {
    if (!doctorImage) {
      setMessage('Please select an image.');
      setIsError(true);
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setMessage('Please log in again.');
        setIsError(true);
        return;
      }

      const formDataObj = new FormData();
      formDataObj.append('doctorImage', doctorImage);

      const uploadResponse = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/upload-doctor-image`, 
        formDataObj, 
        {
          headers: { 
            Authorization: `Bearer ${token}`
          },
          withCredentials: true
        }
      );

      if (uploadResponse.data.path) {
        setDoctorImagePreview(`${import.meta.env.VITE_BACKEND_URL}${uploadResponse.data.path}`);
        setFormData(prev => ({
          ...prev,
          doctorImage: uploadResponse.data.path
        }));
        setMessage('Image uploaded successfully!');
        setIsError(false);
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      setMessage(error.response?.data?.error || 'Error uploading image.');
      setIsError(true);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage('');
    setIsError(false);

    const token = localStorage.getItem('token');
    if (!token) {
      setMessage('Please log in again.');
      setIsError(true);
      setIsSubmitting(false);
      return;
    }

    const requestData = {
      doctorInformation: {
        doctorGreeting: formData.greetings || '',
        doctorDescription: formData.description || '',
        services: Array.isArray(formData.services) ? formData.services : []
      }
    };

    try {
      const response = await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/update-doctor-information`,
        requestData,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          withCredentials: true
        }
      );

      if (response.data.user) {
        setFormData(prev => ({
          ...prev,
          greetings: response.data.user.doctorGreeting || '',
          description: response.data.user.doctorDescription || '',
          services: response.data.user.services || []
        }));
        setMessage('Information updated successfully');
      }
    } catch (error) {
      console.error('Error updating doctor information:', error);
      setMessage(error.response?.data?.message || 'An error occurred while updating information');
      setIsError(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isDoctorRole = formData.role === 'doctor';
  const isAdminRole = formData.role === 'admin';
  const isSuperAdminRole = formData.role === 'superAdmin';
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
      <input type="file" accept="image/*" onChange={(e) => {
        const file = e.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onloadend = () => {
            setDoctorImage(file);
            setDoctorImagePreview(reader.result);
          };
          reader.readAsDataURL(file);
        }
      }} />
        </>
      )}

      {isAdminRole && (
        <>
          <label>Clinic:</label>
          <input type="text" value={formData.clinic} readOnly />
        </>
      )}
      {isSuperAdminRole && (
        <>
          <label>Clinic:</label>
          <input type="text" value={formData.clinic} readOnly />
        </>
      )}

      
      
      {doctorImagePreview && <img src={doctorImagePreview} alt="Doctor" style={{ maxWidth: '200px', marginTop: '10px' }} />}

      <button onClick={handleImageUpload}>Upload Image</button>
    </div>
  );
};

export default AccountSettings;