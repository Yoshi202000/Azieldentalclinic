import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './DoctorServices.css';

const DoctorServices = () => {
  const [doctors, setDoctors] = useState([]);
  const [services, setServices] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [pendingChanges, setPendingChanges] = useState(new Set());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [userId, setUserId] = useState(null);
  const [userClinic, setUserClinic] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decodedToken = JSON.parse(atob(token.split('.')[1]));
        setUserRole(decodedToken.role);
        setUserId(decodedToken.userId);
        fetchUserInfo(token);
      } catch (error) {
        console.error('Error decoding token:', error);
        setError('Authentication error');
      }
    }
  }, []);

  useEffect(() => {
    if (userRole && userId) {
      fetchDoctorsAndServices();
    }
  }, [userRole, userId]);

  const fetchDoctorsAndServices = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      // Different endpoints based on user role
      const doctorsEndpoint = userRole === 'admin' 
        ? `${import.meta.env.VITE_BACKEND_URL}/api/doctor-info`
        : `${import.meta.env.VITE_BACKEND_URL}/api/doctor-info/${userId}`;

      const [doctorsResponse, clinicResponse] = await Promise.all([
        axios.get(doctorsEndpoint, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }),
        axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/clinic`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
      ]);

      if (doctorsResponse.data.doctors) {
        setDoctors(doctorsResponse.data.doctors);
      } else {
        // Handle case where response is a single doctor
        setDoctors([doctorsResponse.data]);
      }
      setServices(clinicResponse.data.services || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError(error.response?.data?.message || 'Failed to load doctors and services');
      setLoading(false);
    }
  };

  const fetchUserInfo = async (token) => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/verify-token`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        withCredentials: true,
      });

      const { clinic } = response.data.user;
      setUserClinic(clinic);
    } catch (error) {
      console.error('Error fetching user info:', error);
      setError('Failed to fetch user information');
      if (error.response && error.response.status === 401) {
        alert('Session expired or invalid. Please log in again.');
        // You might want to add navigation to login here
      }
    }
  };

  const handleDoctorSelect = async (doctorId) => {
    setSelectedDoctor(doctorId);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/doctor-services/${doctorId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      const doctor = doctors.find(d => d._id === doctorId);
      if (doctor) {
        doctor.services = response.data.services;
        setDoctors([...doctors]);
      }
    } catch (error) {
      console.error('Error fetching doctor services:', error);
      setError(error.response?.data?.message || 'Failed to load doctor services');
    }
  };

  const handleServiceToggle = (doctorId, service) => {
    const changeKey = `${doctorId}-${service._id}`;
    setPendingChanges(prev => {
      const newChanges = new Set(prev);
      if (newChanges.has(changeKey)) {
        newChanges.delete(changeKey);
      } else {
        newChanges.add(changeKey);
      }
      return newChanges;
    });
  };

  const handleSubmitChanges = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError('Not authorized. Please log in again.');
      setTimeout(() => setError(''), 3000);
      return;
    }

    if (!selectedDoctor || pendingChanges.size === 0) return;

    setIsSubmitting(true);
    const doctor = doctors.find(d => d._id === selectedDoctor);
    if (!doctor) return;

    try {
      const currentServices = doctor.services || [];
      const updatedServices = services
        .filter(service => {
          const changeKey = `${selectedDoctor}-${service._id}`;
          const isCurrentlyAssigned = currentServices.some(s => s.serviceId === service._id);
          const isInPendingChanges = pendingChanges.has(changeKey);
          return (isCurrentlyAssigned && !isInPendingChanges) || 
                 (!isCurrentlyAssigned && isInPendingChanges);
        })
        .map(service => ({
          serviceId: service._id,
          isActive: true
        }));

      // Log the data being sent for debugging AFTER updatedServices is defined
      console.log('Submitting services update:', {
        doctorId: selectedDoctor,
        services: updatedServices,
        userRole,
        userId
      });

      const response = await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/api/doctor-services/${selectedDoctor}`,
        { 
          services: updatedServices,
          userId: userId,
          userRole: userRole
        },
        {
          withCredentials: true,
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.services) {
        // Update local state
        const updatedDoctor = doctors.find(d => d._id === selectedDoctor);
        if (updatedDoctor) {
          updatedDoctor.services = response.data.services;
          setDoctors([...doctors]);
        }
        setPendingChanges(new Set());
        setSuccessMessage('Services updated successfully');
        
        // Refresh the doctor's services
        await handleDoctorSelect(selectedDoctor);
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      console.error('Error updating services:', error);
      const errorMessage = error.response?.data?.message || 
                          error.message || 
                          'Failed to update services';
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
      setTimeout(() => {
        setError('');
        setSuccessMessage('');
      }, 3000);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="doctor-services-container">
      <h2>Manage Doctor Services</h2>
      {successMessage && <div className="success-message">{successMessage}</div>}
      
      <div className="doctors-list">
        <h3>Select a Doctor</h3>
        {doctors
          .filter(doctor => {
            if (doctor.clinic === userClinic) return true;
            return doctor.clinic === userClinic;
          })
          .map(doctor => (
            <div
              key={doctor._id}
              className={`doctor-item ${selectedDoctor === doctor._id ? 'selected' : ''}`}
              onClick={() => handleDoctorSelect(doctor._id)}
            >
              <span>Dr. {doctor.firstName} {doctor.lastName}</span>
              <span className={`clinic-tag ${doctor.clinic}`}>
                {doctor.clinic.charAt(0).toUpperCase() + doctor.clinic.slice(1)}
              </span>
            </div>
          ))}
        {doctors.filter(doctor => {
          if (userRole === 'admin') return true;
          if (doctor.clinic === userClinic) return true;
          return doctor.clinic === userClinic;
        }).length === 0 && (
          <div className="no-doctors">
            No doctors available for your clinic
          </div>
        )}
      </div>

      {selectedDoctor && (
        <div className="right-panel">
          <div className="doctor-details">
            <h3>Doctor Information</h3>
            {doctors.map(doctor => {
              if (doctor._id === selectedDoctor) {
                return (
                  <div key={doctor._id} className="doctor-info-container">
                    <div className="doctor-info-card">
                      {doctor.doctorImage && (
                        <div className="doctor-image">
                        <img src={doctor.doctorImage} className="doctor-image"/>

                        </div>
                      )}
                      <div className="doctor-info">
                        <h4>Dr. {doctor.firstName} {doctor.lastName}</h4>
                        <p><strong>Email:</strong> {doctor.email}</p>
                        <p><strong>Phone:</strong> {doctor.phoneNumber}</p>
                        <p><strong>Clinic:</strong> {doctor.clinic}</p>
                        {doctor.doctorGreeting && (
                          <div className="doctor-greeting">
                            <h5>Greeting</h5>
                            <p>{doctor.doctorGreeting}</p>
                          </div>
                        )}
                        {doctor.doctorDescription && (
                          <div className="doctor-description">
                            <h5>Description</h5>
                            <p>{doctor.doctorDescription}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="current-services">
                      <h4>Current Services</h4>
                      <div className="current-services-grid">
                        {doctor.services && doctor.services.length > 0 ? (
                          doctor.services.map(service => (
                            <div key={service.serviceId} className="service-card">
                              <h5>{service.name}</h5>
                              <p>{service.description}</p>
                              
                            </div>
                          ))
                        ) : (
                          <p className="no-services">No services assigned yet</p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              }
              return null;
            })}
          </div>
          <h3>Available Services</h3>
          <div className="services-list">
            {services.map(service => {
              const doctor = doctors.find(d => d._id === selectedDoctor);
              const isAssigned = doctor?.services?.some(s => s.serviceId === service._id);
              const isPending = pendingChanges.has(`${selectedDoctor}-${service._id}`);
              const finalStatus = isPending ? !isAssigned : isAssigned;

              return (
                <div
                  key={service._id}
                  className={`service-item ${finalStatus ? 'assigned' : ''} ${isPending ? 'pending' : ''}`}
                  onClick={() => handleServiceToggle(selectedDoctor, service)}
                >
                  <div className="service-info">
                    <h4>{service.name}</h4>
                    <p>{service.description}</p>
                  </div>
                  <div className="service-status">
                    {finalStatus ? '✓' : '+'}
                  </div>
                </div>
              );
            })}
            
            {pendingChanges.size > 0 && (
              <div className="submit-section">
                <button 
                  className="submit-button"
                  onClick={handleSubmitChanges}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Updating...' : 'Save Changes'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorServices; 