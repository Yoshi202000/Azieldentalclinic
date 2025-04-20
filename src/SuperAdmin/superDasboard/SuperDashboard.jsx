import React, { useState } from 'react';
import '../../admin/dashboard/Dashboard.css';
import SuperPatientsInformation from '../superComponent/SuperPatientsInformation';
import SuperViewAppointment from '../superComponent/SuperViewAppointment';
import SuperCompletedAppointment from '../superComponent/SuperCompletedAppointment';
import SuperViewFeedback from '../superComponent/SuperViewFeedback';
import SuperApproveToAdmin from '../superComponent/SuperApproveToAdmin';
import AccountSettings from '../../component/profile/AccountSettings';
import SuperAdminSales from '../superComponent/SuperAdminSales';
import DrawerComponent from '../../component/Drawers';
import Footer from '../../component/Footer';
import Chat from '../../component/chat';
import SuperDoctorSignup from '../superComponent/SuperAddUser';
import SuperViewAdminDoctor from '../superComponent/SuperViewAdminDoctor';
import EditContent from '../../component/admin/EditContent.jsx'
import SuperDoctorServices from '../superComponent/SuperDoctorServices';
import SuperTestSchedule from '../superComponent/SuperEditSchedule';
import EditPatientsInformation from '../superComponent/EditPatientsInformation';

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
      case 'EditContent':
        return <EditContent/>
      case 'DoctorServices':
        return <SuperDoctorServices/>
      case 'SuperTestSchedule':
        return <SuperTestSchedule/>
      case 'EditPatientsInformation':
        return <EditPatientsInformation/>
      default:
        return <h2>Select an option</h2>;
    }
  };

  return (
    <>  
    <Chat/>
      <div className='DashContainer'>
        <div className='DashContent'>
          <h1>SuperAdmin Dashboard</h1>
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
          <button
            className={activeComponent === 'DoctorServices' ? 'active' : ''}
            onClick={() => setActiveComponent('DoctorServices')}
          >
            Manage Doctor Services
          </button>
          <button
            className={activeComponent === 'ToAdmin' ? 'active' : ''}
            onClick={() => setActiveComponent('ToAdmin')}
          >
            Manage Role
          </button>
          <button
            className={activeComponent === 'AdminSales' ? 'active' : ''}
            onClick={() => setActiveComponent('AdminSales')}
          >
            Total Gross Sales
          </button>
          <button 
           className={activeComponent === 'EditContent'? 'active' : ''}
            onClick={() => setActiveComponent('EditContent')}
            >
              Edit Content
            </button>
          <button
            className={activeComponent === 'ViewFeedback' ? 'active' : ''}
            onClick={() => setActiveComponent('ViewFeedback')}
          >
            View Feedback
          </button>
          <button
            className={activeComponent === 'SuperTestSchedule' ? 'active' : ''}
            onClick={() => setActiveComponent('SuperTestSchedule')}
          >
            Test Schedule
          </button>
          <button
            className={activeComponent === 'EditPatientsInformation' ? 'active' : ''}
            onClick={() => setActiveComponent('EditPatientsInformation')}
          >
            Edit Patients Information
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
