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

  useEffect(() => {
    fetchDoctorsAndServices();
  }, []);

  const fetchDoctorsAndServices = async () => {
    try {
      setLoading(true);
      const [doctorsResponse, clinicResponse] = await Promise.all([
        axios.get(`${import.meta.env.VITE_BACKEND_URL}/doctor-info`),
        axios.get(`${import.meta.env.VITE_BACKEND_URL}/clinic`)
      ]);

      setDoctors(doctorsResponse.data.doctors);
      setServices(clinicResponse.data.services || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to load doctors and services');
      setLoading(false);
    }
  };

  const handleDoctorSelect = async (doctorId) => {
    setSelectedDoctor(doctorId);
    try {
      const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/doctor-services/${doctorId}`);
      const doctor = doctors.find(d => d._id === doctorId);
      if (doctor) {
        doctor.services = response.data.services;
        setDoctors([...doctors]);
      }
    } catch (error) {
      console.error('Error fetching doctor services:', error);
      setError('Failed to load doctor services');
    }
  };

  const handleServiceToggle = async (doctorId, service) => {
    const doctor = doctors.find(d => d._id === doctorId);
    if (!doctor) return;

    const updatedServices = doctor.services || [];
    const serviceIndex = updatedServices.findIndex(s => s.serviceId === service._id);

    try {
      const response = await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/doctor-services/${doctorId}`,
        {
          services: serviceIndex === -1
            ? [...updatedServices, { serviceId: service._id, isActive: true }]
            : updatedServices.filter(s => s.serviceId !== service._id)
        },
        {
          withCredentials: true // Important for cookie handling
        }
      );

      // Update the token in localStorage if provided
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
      }

      // Update the doctor's services in the state
      const updatedDoctor = doctors.find(d => d._id === doctorId);
      if (updatedDoctor) {
        updatedDoctor.services = response.data.services;
        setDoctors([...doctors]);
      }

      setSuccessMessage('Services updated successfully');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Error updating services:', error);
      setError('Failed to update services');
      setTimeout(() => setError(''), 3000);
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
        {doctors.map(doctor => (
          <div
            key={doctor._id}
            className={`doctor-item ${selectedDoctor === doctor._id ? 'selected' : ''}`}
            onClick={() => handleDoctorSelect(doctor._id)}
          >
            <span>Dr. {doctor.firstName} {doctor.lastName}</span>
            <span className="clinic-tag">{doctor.clinic}</span>
          </div>
        ))}
      </div>

      {selectedDoctor && (
        <div className="services-list">
          <h3>Available Services</h3>
          {services.map(service => {
            const doctor = doctors.find(d => d._id === selectedDoctor);
            const isAssigned = doctor?.services?.some(s => s.serviceId === service._id);

            return (
              <div
                key={service._id}
                className={`service-item ${isAssigned ? 'assigned' : ''}`}
                onClick={() => handleServiceToggle(selectedDoctor, service)}
              >
                <div className="service-info">
                  <h4>{service.name}</h4>
                  <p>{service.description}</p>
                  <p className="service-fee">Fee: ₱{service.fee?.toLocaleString()}</p>
                </div>
                <div className="service-status">
                  {isAssigned ? '✓' : '+'}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default DoctorServices; 