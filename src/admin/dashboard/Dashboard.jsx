import React, { useState } from 'react';
import './dashboard.css';
import AccountSettings from '../../component/admin/AccountSettings';
import ChangePassword from '../../component/admin/ChangePassword';
import PatientsInformation from '../../component/admin/PatientsInformation';
import ViewAppointment from '../../component/admin/ViewAppointment';
import CompletedAppointment from '../../component/admin/CompletedAppointment';
import ViewFeedback from '../../component/admin/ViewFeedback';

function Dashboard() {
  const [activeComponent, setActiveComponent] = useState('AccountSettings');

  const renderComponent = () => {
    switch (activeComponent) {
      case 'AccountSettings':
        return <AccountSettings />;
      case 'ChangePassword':
        return <ChangePassword />;
      case 'PatientsInformation':
        return <PatientsInformation />;
      case 'ViewAppointment':
        return <ViewAppointment />;
      case 'CompletedAppointment':
        return <CompletedAppointment />;
      case 'ViewFeedback':
        return <ViewFeedback />;
      default:
        return <h2>Select an option</h2>;
    }
  };

  return (
    <>  
      <div className='DashContainer'>
        <div className='DashContent'>
          <h1>Dashboard content</h1>
          <button
            className={activeComponent === 'AccountSettings' ? 'active' : ''}
            onClick={() => setActiveComponent('AccountSettings')}
          >
            Account Settings
          </button>
          <button
            className={activeComponent === 'ChangePassword' ? 'active' : ''}
            onClick={() => setActiveComponent('ChangePassword')}
          >
            Change Password
          </button>
          <button
            className={activeComponent === 'PatientsInformation' ? 'active' : ''}
            onClick={() => setActiveComponent('PatientsInformation')}
          >
            Patients Information
          </button>
          <button
            className={activeComponent === 'ViewAppointment' ? 'active' : ''}
            onClick={() => setActiveComponent('ViewAppointment')}
          >
            View Appointment
          </button>
          <button
            className={activeComponent === 'CompletedAppointment' ? 'active' : ''}
            onClick={() => setActiveComponent('CompletedAppointment')}
          >
            Completed Appointments
          </button>
          <button
            className={activeComponent === 'ViewFeedback' ? 'active' : ''}
            onClick={() => setActiveComponent('ViewFeedback')}
          >
            View Feedback
          </button>
        </div>
        <div className='DashMainContainer'>
          {renderComponent()}
        </div>
      </div>
    </>
  );
}

export default Dashboard;