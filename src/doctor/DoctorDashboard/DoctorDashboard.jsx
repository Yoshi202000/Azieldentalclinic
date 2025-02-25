import React, { useState } from 'react';
import '../../admin/dashboard/Dashboard.css';
import PatientsInformation from '../../component/admin/PatientsInformation';
import DoctorViewAppointment from '../DoctorComponent/DoctorViewAppointment.jsx';
import CompletedAppointment from '../../component/admin/CompletedAppointment';
import ViewFeedback from '../../component/admin/ViewFeedback';
import AccountSettings from '../../component/profile/AccountSettings'
import DrawerComponent from '../../component/Drawers';
import Footer from '../../component/Footer';
import Chat from '../../component/chat';


function DoctorDashboard() {
  const [activeComponent, setActiveComponent] = useState('AccountSettings');

  const renderComponent = () => {
    switch (activeComponent) {
      case 'AccountSettings':
        return <AccountSettings />;
      case 'PatientsInformation':
        return <PatientsInformation />;
      case 'ViewAppointment':
        return <DoctorViewAppointment />;
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
    <Chat/>
      <div className='DashContainer'>
        <div className='DashContent'>
          <h1>Dashboard content</h1>
          <div className="button-container">
          <button
            className={activeComponent === 'AccountSettings' ? 'active' : ''}
            onClick={() => setActiveComponent('AccountSettings')}
          >
            Profile Information
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
          <button>
            edit schedule
          </button>

          <button
            className={activeComponent === 'ViewFeedback' ? 'active' : ''}
            onClick={() => setActiveComponent('ViewFeedback')}
          >
            View Feedback
          </button>
          </div>
        </div>
        <div className='DashMainContainer'>
          {renderComponent()}
        </div>
      </div>
      <DrawerComponent/>
      <Footer/>
    </>
  );
}

export default DoctorDashboard;
