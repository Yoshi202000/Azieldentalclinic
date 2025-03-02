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

  useEffect(() => {
    // Fetch the services data from the backend when the component mounts
    axios.get(`${import.meta.env.VITE_BACKEND_URL}/clinic`)
      .then(response => {
        if (response.data && response.data.services) {
          console.log('Fetched Services:', response.data.services);
          setServices(response.data.services);
        }
      })
      .catch(error => {
        console.error('Error fetching services data:', error);
      });
  }, []);

  return (
    <>
      <Chat />
      {/* Ensure the DrawerComponent is positioned correctly and doesn't overlap content */}
      <DrawerComponent />

      {/* Wrap First and Card components in a main content container for better layout control */}
      <div className="main-content">
        <First />
        <div className="card-container">
          {services.map((service, index) => (
            <Card
              key={index}
              name={service.name}
              description={service.image}
              image={service.image ? `src${service.image}` : null}

            />
          ))}
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
