import React, { useEffect, useState } from 'react';
import axios from 'axios';


const TestPreview = () => {
  const [clinicName, setClinicName] = useState('');
  const [clinicDescription, setClinicDescription] = useState('');
  const [clinicAddress, setClinicAddress] = useState('');
  const [clinicAddressTwo, setClinicAddressTwo] = useState('');
  const [clinicCatchLine, setClinicCatchLine] = useState('');
  const [clinicHeader, setClinicHeader] = useState('');
  const [welcomeMessage, setWelcomeMessage] = useState('');
  const [services, setServices] = useState([]);

  useEffect(() => {
    // Fetch existing clinic data from the backend when the component mounts
    axios.get(`${import.meta.env.VITE_BACKEND_URL}/clinic`)
      .then(response => {
        if (response.data) {
          const {
            name,
            description,
            address,
            addressTwo,
            clinicCatchLine,
            clinicHeader,
            welcomeMessage,
            services,
          } = response.data;
          console.log('Clinic data received:', response.data); // Debugging the received clinic data
          setClinicName(name);
          setClinicDescription(description);
          setClinicAddress(address);
          setClinicAddressTwo(addressTwo);
          setClinicCatchLine(clinicCatchLine);
          setClinicHeader(clinicHeader);
          setWelcomeMessage(welcomeMessage);
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

      <h3>Clinic Header: {clinicHeader}</h3>
      <h3>Clinic Name: {clinicName}</h3>
      <p>Description: {clinicDescription}</p>
      <p>Address: {clinicAddress}</p>
      <p>Address Two: {clinicAddressTwo}</p>
      <p>Clinic Catch Line: {clinicCatchLine}</p>
      <p>Welcome Message: {welcomeMessage}</p>

      <div className="servicesPreview">
        <h3>Clinic Services</h3>
        {services.map((service, index) => (
          <div key={index} className="servicePreview">
            <h4>Service {index + 1}: {service.name}</h4>
            <p>Description: {service.description}</p>
            {service.image && typeof service.image === 'string' && (
              <div>
                {/* Displaying the image only if service.image is a valid string */}
                <img
              image={service.image ? `src${service.image}` : null}
              alt={`Service ${index + 1}`}
                  style={{ maxWidth: '200px', maxHeight: '200px' }}
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
export default TestPreview;
