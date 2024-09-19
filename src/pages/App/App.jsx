import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import DrawerComponent from '../../component/Drawers';
import Footer from '../../test/Footer';
import First from '../../component/First';
import Card from '../../component/Card';
import profilePic1 from '../../assets/azielDental.png';
import profilePic2 from '../../assets/hero-bg.png';
import extract from '../../assets/toothExtraction.png'
import './App.css';
import Doctors from '../../component/Doctors';
import Chat from '../../component/chat';

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
            description="I am a dentist specializing in orthodontics" 
            image={extract} 
          />
          <Card 
            name="Dental Fillings" 
            description="I am a dentist specializing in cleaning" 
            image={extract} 
          />
          <Card 
            name="Dr. Sheela" 
            description="I am a dentist specializing in ewan" 
            image={extract} 
          />
        </div>

        {/* Doctors component */}
        <Doctors />
      </div>
      
      {/* Footer */}
      <Footer />
    </>
  );
}

export default App;
