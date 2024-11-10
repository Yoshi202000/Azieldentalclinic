import React, { useState } from 'react';
import DrawerComponent from '../../component/Drawers';
import Footer from '../../component/Footer';
import profilePic1 from '../../assets/doctor1.png';
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
    <DrawerComponent/>
    <div className="profilePageWrapper">
      <div className='profileContainer'>
        <div className='profileSidebar'>
          <button className={`profileButton ${activeComponent === 'Dashboard' ? 'active' : ''}`} onClick={() => setActiveComponent('Dashboard')}>
            Dashboard
          </button>
          <button className={`profileButton ${activeComponent === 'AccountSettings' ? 'active' : ''}`} onClick={() => setActiveComponent('AccountSettings')}>
            Account Settings
          </button>
          <button className={`profileButton ${activeComponent === 'ViewAppointments' ? 'active' : ''}`} onClick={() => setActiveComponent('ViewAppointments')}>
            View Appointments
          </button>
        </div>

        <div className='profileMainContent'>
          {renderComponent()}
        </div>
      </div>
      <Footer />
    </div>
    </>
  );
};

export default Profile;
