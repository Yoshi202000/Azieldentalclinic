import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import DrawerComponent from '../../component/Drawers';
import Footer from '../../test/Footer';
import './dashboard.css';

import './Manager.css';
function Dashboard() {

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
    <title>Dashboard</title>
    <DrawerComponent/>
        <div className='DashContainer'>
            <div className='DashContent'>
                <h1>Dashboard content</h1>
                <button onClick={() => setActiveComponent('Dashboard')}>
                    Appointment Status
                </button>
                <button onClick={() => setActiveComponent('Dashboard')}>
                    Appointments
                </button>
                <button onClick={() => setActiveComponent('Dashboard')}>
                    Patients
                </button>
                <button onClick={() => setActiveComponent('Dashboard')}>
                    Doctors
                </button>
                <button onClick={() => setActiveComponent('Dashboard')}>
                    Reports
                </button>
                <button onClick={() => setActiveComponent('Dashboard')}>
                    summary
                </button>
            </div>
            <div className='DashMainContainer'>
                {renderComponent()}
            </div>

        </div>

    <Footer/>
    </>
  );
}

export default Dashboard;
