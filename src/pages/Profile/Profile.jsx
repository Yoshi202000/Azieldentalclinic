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
      <div className='profile-container'>
        <div className='sidebar'>
          <div className='image'>
            <img src={profilePic1} alt="profilePic1"/>
          </div>
          <button className={activeComponent === 'Dashboard' ? 'active' : ''} onClick={() => setActiveComponent('Dashboard')}>
            Dashboard
          </button>
          <button className={activeComponent === 'AccountSettings' ? 'active' : ''} onClick={() => setActiveComponent('AccountSettings')}>
            Account Settings
          </button>
          <button className={activeComponent === 'ChangePassword' ? 'active' : ''} onClick={() => setActiveComponent('ChangePassword')}>
            Change Password
          </button>
          <button className={activeComponent === 'Logout' ? 'active' : ''} onClick={() => setActiveComponent('Logout')}>
            Logout
          </button>
        </div>

        <div className='profile-main-content'>
          {renderComponent()}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Profile;
