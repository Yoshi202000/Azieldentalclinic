import React, { useEffect, useState } from 'react';
import axios from 'axios';
import DrawerComponent from '../../component/Drawers';
import Footer from '../../component/Footer';
import First from '../../component/First';
import Card from '../../component/Card';
import './App.css';
import Doctors from '../../component/Doctors';
import Chat from '../../component/chat';
import HomeFeedback from '../../component/homeFeedback';

function App() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dentalChart, setDentalChart] = useState(null);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const apiUrl = `${import.meta.env.VITE_BACKEND_URL}/api/clinic`;
        console.log('API URL:', apiUrl);
        
        const response = await axios.get(apiUrl);
        console.log('Response headers:', response.headers);
        console.log('Response status:', response.status);
        console.log('Response data:', response.data);
        
        if (response.data && Array.isArray(response.data.services)) {
          console.log('Fetched Services:', response.data.services);
          setServices(response.data.services);
        } else {
          console.error('Invalid response format:', response.data);
          setError('Invalid data format received from server');
          setServices([]);
        }
      } catch (error) {
        console.error('Full error object:', error);
        console.error('Error response:', error.response);
        setError('Failed to load services. Please try again later.');
        setServices([]);
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <>
      <Chat />
      {/* Ensure the DrawerComponent is positioned correctly and doesn't overlap content */}
      <DrawerComponent />

      {/* Wrap First and Card components in a main content container for better layout control */}
      <div className="main-content">
        <First />
        <div className="app-card-container">
          {services && services.length > 0 ? (
            services.map((service, index) => (
              <Card
                key={index}
                name={service.name}
                description={service.description}
                image={
                  service.image
                    ? `${import.meta.env.VITE_BACKEND_URL.replace(/\/$/, '')}/api/${service.image.replace(/^\/+/, '')}`
                    : null
                }
                              />
            ))
          ) : (
            <div>No services available</div>
          )}
        </div>

        {/* Doctors component */}
        <Doctors />

        {/* HomeFeedback component */}
        <HomeFeedback />
      </div>

      {/* Footer */}
      <Footer />
    </>
  );
}

export default App;
