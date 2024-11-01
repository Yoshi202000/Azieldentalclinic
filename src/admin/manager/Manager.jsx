import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import DrawerComponent from '../../component/Drawers';
import Footer from '../../component/Footer';
import First from '../../component/First';
import Card from '../../component/Card';
import profilePic1 from '../../assets/azielDental.png';
import profilePic2 from '../../assets/hero-bg.png';
import extract from '../../assets/toothExtraction.png'
import './Manager.css';
import Doctors from '../../component/Doctors';
import Chat from '../../component/chat';

function Manager() {
  return (
    <>  
    <title>Dentist management</title>
    <DrawerComponent/>
        <div className='adminContainer'>
            <div className='adminCardContainer'>
        <Card
            name="Appointments"
            description="View available Appointments"
            image={profilePic1}
            href= "/appointments"
        />
        <Card
            name="Reports"
            description="Generate reports on Appointments"
            image={profilePic1}
        />
        <Card 
            name="Files"
            description="view files on Appointments"
            image={profilePic1}
            />
        <Card
            name="Dentist schedule"
            description="view and manage schedule of the Dentist"
            image={profilePic1}
        />
        <Card
            name="Dentist schedule"
            description="view and manage schedule of the Dentist"
            image={profilePic1}
        />
        <Card
            name="Dentist schedule"
            description="view and manage schedule of the Dentist"
            image={profilePic1}
        />
        </div>
        </div>

    <Footer/>
    </>
  );
}

export default Manager;
