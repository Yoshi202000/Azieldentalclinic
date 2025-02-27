import React, { useState } from 'react';
import '../../admin/dashboard/Dashboard.css';
import SuperPatientsInformation from '../superComponent/SuperPatientsInformation';
import SuperViewAppointment from '../superComponent/SuperViewAppointment';
import SuperCompletedAppointment from '../superComponent/superComponent/SuperCompletedAppointment';
import SuperViewFeedback from '../superComponent/SuperViewFeedback';
import SuperApproveToAdmin from '../superComponent/SuperApproveToAdmin';
import AccountSettings from '../superComponent/SuperAccountSettings';
import SuperAdminSales from '../../superComponent/SuperAdminSales';
import DrawerComponent from '../../component/Drawers';
import Footer from '../../component/Footer';
import Chat from '../../component/chat';
import SuperDoctorSignup from '../superComponent/SuperAddUser';
import SuperViewAdminDoctor from '../../component/admin/ViewAdminDoctor';
import SuperEditContent from '../superComponent/SuperEditContent'

function SuperDashboard() {
  const [activeComponent, setActiveComponent] = useState('AccountSettings');

  const renderComponent = () => {
    switch (activeComponent) {
      case 'AccountSettings':
        return <AccountSettings />;
      case 'PatientsInformation':
        return <SuperPatientsInformation />;
      case 'ViewAppointment':
        return <SuperViewAppointment />;
      case 'CompletedAppointment':
        return <SuperCompletedAppointment />;
      case 'ViewFeedback':
        return <SuperViewFeedback />;
      case 'ToAdmin':
        return <SuperApproveToAdmin/>
        case 'AdminSales':
          return <SuperAdminSales/>
      case 'DoctorSignup':
        return <SuperDoctorSignup/>
        case 'ViewAdminDoctor':
        return <SuperViewAdminDoctor/>
      default:
        return <h2>Select an option</h2>;
    }
  };

  return (
    <>  
    <Chat/>
      <div className='DashContainer'>
        <div className='DashContent'>
          <h1>SuperAdmin Dashboard content</h1>
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
            className={activeComponent === 'DoctorSignup' ? 'active' : ''}
            onClick={() => setActiveComponent('DoctorSignup')}
          >
            Add User
          </button>
          <button
            className={activeComponent === 'ViewAdminDoctor' ? 'active' : ''}
            onClick={() => setActiveComponent('ViewAdminDoctor')}
          >
            View Admin Doctor
          </button>
          <button>
            edit schedule
          </button>
          
          {/* <button
            className={activeComponent === 'AdminSales' ? 'active' : ''}
            onClick={() => setActiveComponent('AdminSales')}
          >
            Total Sales
          </button> */}
          {/* <button
            className={activeComponent === 'ToAdmin' ? 'active' : ''}
            onClick={() => setActiveComponent('ToAdmin')}
          >
            Approve User to Admin
          </button> */}
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

export default SuperDashboard;
