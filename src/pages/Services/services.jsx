import React, { useEffect, useState } from 'react';
import axios from 'axios';  // Import axios for making API requests
import Drawer from '../../component/Drawers';
import Footer from '../../component/Footer';
import clinic from '../../assets/clinic.png';
import './services.css';
import '../../styles/Card.css';
import '../../styles/Doctors.css';

const Services = () => {
  const [clinicName, setClinicName] = useState('');  // State to store clinic name
  const [clinicDescription, setClinicDescription] = useState('');  // State to store clinic description
  const [services, setServices] = useState([]);  // State to store services data

  useEffect(() => {
    // Fetch clinic data from the backend when the component mounts
    axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/clinic`)
      .then(response => {
        if (response.data) {
          const { name, description, services } = response.data;
          setClinicName(name);  // Set the clinic name from the response
          setClinicDescription(description);  // Set the clinic description from the response
          setServices(services);  // Set the fetched services data
          
        }
      })
      .catch(error => {
        console.error('Error fetching clinic data:', error);
      });
  }, []);

  return (
    <>
      <Drawer />
      <div className="Services-container">
        <div className="Services-hero">
        <h1 className="Services-hero-title">Our Dental Services</h1>
        <h1>{clinicDescription}</h1>
        <p className="Services-hero-description">Comprehensive care for your smile</p>
        </div>
        <div className="Services-main-content">
          <div className="Services-image-container">
            <img src={clinic} alt="Dental Services" className="Services-main-image" />
          </div>
          <div className="Services-text-container">
            <h2 className="Services-main-title">Expert Dental Care</h2>
            <p className="Services-main-description">{clinicDescription}</p>
          </div>
        </div>
        <h2 className="Services-section-title">Our Services</h2>
        <div className="Services-dental-grid">
          {services.length > 0 ? (
            services.map((service, index) => (
              <div key={index} className="service-card">
                {service.image && (
                  <img
                    src={service.image ? `${import.meta.env.VITE_BACKEND_URL}${service.image}` : null}
                    alt={service.name}
                    className="doctor-image"
                  />
                )}
                <div className="doctor-info">
                  <h3 className="doctor-name">{service.name}</h3>
                  <p className="doctor-description">{service.description}</p>
                </div>
              </div>
            ))
          ) : (
            <p>Loading services...</p>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Services;
