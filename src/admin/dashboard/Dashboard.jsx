import React, { useState } from 'react';
import './Dashboard.css';
import PatientsInformation from '../../component/admin/PatientsInformation';
import ViewAppointment from '../../component/admin/ViewAppointment';
import CompletedAppointment from '../../component/admin/CompletedAppointment';
import ViewFeedback from '../../component/admin/ViewFeedback';
import ApproveToAdmin from '../../component/admin/ApproveToAdmin'
import AccountSettings from '../../component/profile/AccountSettings'
import AdminSales from '../../component/admin/AdminSales';
import DrawerComponent from '../../component/Drawers';
import Footer from '../../component/Footer';
import Chat from '../../component/chat'
import DoctorSignup from '../../component/admin/AddUser';
import ViewAdminDoctor from '../../component/admin/ViewAdminDoctor';
import DoctorServices from '../../component/admin/DoctorServices';
import AdminEditSchedule from '../../component/admin/AdminEditSchedule';
import ApproveToAdmin from '../../component/admin/ApproveToAdmin';

function Dashboard() {
  const [activeComponent, setActiveComponent] = useState('AccountSettings');

  const renderComponent = () => {
    switch (activeComponent) {
      case 'AccountSettings':
        return <AccountSettings />;
      case 'PatientsInformation':
        return <PatientsInformation />;
      case 'ViewAppointment':
        return <ViewAppointment />;
      case 'CompletedAppointment':
        return <CompletedAppointment />;
      case 'ViewFeedback':
        return <ViewFeedback />;
      case 'ToAdmin':
        return <ApproveToAdmin/>
      case 'AdminSales':
        return <AdminSales/>
      case 'DoctorSignup':
        return <DoctorSignup/>
      case 'ViewAdminDoctor':
        return <ViewAdminDoctor/>
      case 'DoctorServices':
        return <DoctorServices/>
      case 'AdminSchedule':
        return <AdminEditSchedule/>
      case 'ApproveToAdmin':
        return <ApproveToAdmin/>
      default:
        return <h2>Select an option</h2>;
    }
  };

  return (
    <>  
    <Chat/>
      <div className='DashContainer'>
        <div className='DashContent'>
          <h1>Admin Dashboard Content</h1>
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
            <button
            className={activeComponent === 'ApproveToAdmin' ? 'active' : ''}
            onClick={() => setActiveComponent('ApproveToAdmin')}
          >
            Approve to Admin
          </button>
            Manage Doctor Services
          </button>
          <button
            className={activeComponent === 'AdminSales' ? 'active' : ''}
            onClick={() => setActiveComponent('AdminSales')}
          >
            Total Sales
          </button>
          <button
            className={activeComponent === 'ViewFeedback' ? 'active' : ''}
            onClick={() => setActiveComponent('ViewFeedback')}
          >
            View Feedback
          </button>
          <button
            className={activeComponent === 'AdminSchedule' ? 'active' : ''}
            onClick={() => setActiveComponent('AdminSchedule')}
          >
            Edit Schedule
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

export default Dashboard;
