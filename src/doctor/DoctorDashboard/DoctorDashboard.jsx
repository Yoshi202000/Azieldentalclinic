import React, { useState } from 'react';
import '../../admin/dashboard/Dashboard.css';
import DoctorPatientsInformation from '../DoctorComponent/DoctorPatientsInformation';
import DoctorCompletedAppointment from '../DoctorComponent/DoctorCompletedAppointment';
import DoctorViewAppointment from '../DoctorComponent/DoctorViewAppointment'
import ViewFeedback from '../../component/admin/ViewFeedback';
import AccountSettings from '../../component/profile/AccountSettings'
import DrawerComponent from '../../component/Drawers';
import Footer from '../../component/Footer';
import Chat from '../../component/chat';
import TestSchedule from '../../test/TestSchedule.jsx'

function DoctorDashboard() {
  const [activeComponent, setActiveComponent] = useState('AccountSettings');

  const renderComponent = () => {
    switch (activeComponent) {
      case 'AccountSettings':
        return <AccountSettings />;
      case 'PatientsInformation':
        return <DoctorPatientsInformation />;
      case 'ViewAppointment':
        return <DoctorViewAppointment />;
      case 'CompletedAppointment':
        return <DoctorCompletedAppointment />;
      case 'ViewFeedback':
        return <ViewFeedback />;
      case 'TestSchedule':
        return <TestSchedule />;
      default:
        return <h2>Select an option</h2>;
    }
  };

  return (
    <>  
    <Chat/>
      <div className='DashContainer'>
        <div className='DashContent'>
          <h1>Doctors Dashboard</h1>
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

          <button
            className={activeComponent === 'TestSchedule'? 'active' : ''}
            onClick={() => setActiveComponent('TestSchedule')}
          >Edit Schedule</button>

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
