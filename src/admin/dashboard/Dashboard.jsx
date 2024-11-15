import React, { useState } from 'react';
import './dashboard.css';
import PatientsInformation from '../../component/admin/PatientsInformation';
import ViewAppointment from '../../component/admin/ViewAppointment';
import CompletedAppointment from '../../component/admin/CompletedAppointment';
import ViewFeedback from '../../component/admin/ViewFeedback';
import ApproveToAdmin from '../../component/admin/ApproveToAdmin'
import AccountSettings from '../../component/profile/AccountSettings'
import AdminSales from '../../component/admin/AdminSales';
import DrawerComponent from '../../component/Drawers';
import Footer from '../../component/Footer';

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
      default:
        return <h2>Select an option</h2>;
    }
  };

  return (
    <>  
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
          <button
            className={activeComponent === 'AdminSales' ? 'active' : ''}
            onClick={() => setActiveComponent('AdminSales')}
          >
            Total Sales
          </button>
          <button
            className={activeComponent === 'ToAdmin' ? 'active' : ''}
            onClick={() => setActiveComponent('ToAdmin')}
          >
            Approve User to Admin
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

export default Dashboard;
