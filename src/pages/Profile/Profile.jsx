import React, { useState } from 'react';
import DrawerComponent from '../../component/Drawers';
import Footer from '../../component/Footer';
import Chat from '../../component/chat'
// component from profile 
import Dashboard from '../../component/profile/Dashboard';
import AccountSettings from '../../component/profile/AccountSettings';
import ViewAppointmentByUser from '../../component/profile/ViewAppointmentByUser';
// Add styles for the card
import './Profile.css'; 

const Profile = () => {
  const [activeComponent, setActiveComponent] = useState('AccountSettings'); // Default is AccountSettings

  const renderComponent = () => {
    switch (activeComponent) {
      case 'Dashboard':
        return <Dashboard />;
      case 'AccountSettings':
        return <AccountSettings />;
      case 'ViewAppointments':
        return <ViewAppointmentByUser />;
      default:
        return <AccountSettings />;
    }
  };

  return (
    <>
    <Chat/>
    <DrawerComponent/>
    <div className='profileMainContent'>
    <AccountSettings />
    <ViewAppointmentByUser />
    </div>
      <Footer />
    </>
  );
};

export default Profile;
