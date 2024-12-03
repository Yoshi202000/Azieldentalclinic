import React, { useEffect, useState } from 'react';
import axios from 'axios';

const TestPreview = () => {
  const [clinicName, setClinicName] = useState('');
  const [clinicDescription, setClinicDescription] = useState('');
  const [services, setServices] = useState([]);

  useEffect(() => {
    // Fetch existing clinic data from the backend when the component mounts
    axios.get(`${import.meta.env.VITE_BACKEND_URL}/clinic`)
      .then(response => {
        if (response.data) {
          const { name, description, services } = response.data;
          setClinicName(name);
          setClinicDescription(description);
          setServices(services);
        }
      })
      .catch(error => {
        console.error('Error fetching clinic data:', error);
      });
  }, []);

  return (
    <div className="testPreviewContainer">
      <h2>Preview Clinic Content</h2>
      <h3>Clinic Name: {clinicName}</h3>
      <p>Description: {clinicDescription}</p>

      <div className="servicesPreview">
        <h3>Clinic Services</h3>
        {services.map((service, index) => (
          <div key={index} className="servicePreview">
            <h4>Service {index + 1}: {service.name}</h4>
            <p>Description: {service.description}</p>
            {service.image && (
              <img
                src={`data:image/jpeg;base64,${service.image}`}
                alt={`Service ${index + 1}`}
                style={{ maxWidth: '200px', maxHeight: '200px' }}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default TestPreview;
