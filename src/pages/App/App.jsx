import React from 'react';
import DrawerComponent from '../../component/Drawers';
import Footer from '../../component/Footer';
import First from '../../component/First';
import Card from '../../component/Card';
import extract from '../../assets/remove.png'
import clean from '../../assets/clean.png'
import brace from '../../assets/brace.png'
import './App.css';
import Doctors from '../../component/Doctors';
import Chat from '../../component/chat';
import HomeFeedback from '../../component/homeFeedback';

function App() {
  return (
    <>
      <Chat />
      {/* Ensure the DrawerComponent is positioned correctly and doesn't overlap content */}
      <DrawerComponent />

      {/* Wrap First and Card components in a main content container for better layout control */}
      <div className="main-content">
        <First />
        <div className="card-container">
          <Card
            name="Tooth Extractions"
            description="I am a dentist from Aziel Dental Clinic"
            image={extract}
          />
          <Card
            name="Braces & Orthodontics"
            description="I am a dentist specializing in braces and orthodontics"
            image={brace}
          />
          <Card
            name="dental cleaning"
            description="I am a dentist specializing in dental cleaning"
            image={clean}
          />
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
