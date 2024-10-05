// Profile.js
import React, { useState } from 'react';
import DrawerComponent from '../../component/Drawers';
import Footer from '../../component/Footer';
import profilePic1 from '../../assets/doctor1.png';
// component from profile 
import Dashboard from '../../component/profile/Dashboard';
import AccountSettings from '../../component/profile/AccountSettings';
import ChangePassword from '../../component/profile/ChangePassword';
import Logout from '../../component/profile/Logout';
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
      case 'ChangePassword':
        return <ChangePassword />;
      case 'Logout':
        return <Logout />;
      default:
        return <AccountSettings />;
    }
  };

  return (
    <>
      <div className='profilecontainer'>
        <div className='oneContainer'>
          <div className='image'>
            <img src={profilePic1} alt="profilePic1"/>
          </div>
          <button onClick={() => setActiveComponent('Dashboard')}>
            Dashboard
          </button>
          <button onClick={() => setActiveComponent('AccountSettings')}>
            Account Settings
          </button>
          <button onClick={() => setActiveComponent('ChangePassword')}>
            Change Password
          </button>
          <button onClick={() => setActiveComponent('Logout')}>
            Logout
          </button>
        </div>

        <div className='ProfilemainContainer'>
          {renderComponent()}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Profile;
