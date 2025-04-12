import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/Drawer.css'; // Import the CSS file for styling
import Notification from './notification'; // Import the Notification component
import clinicLogo from '../uploads/clinicLogo.png';

const DrawerComponent = () => {
  const [open, setOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    const verifyAuth = async () => {
      console.log("Verifying auth...");
      const token = localStorage.getItem('token'); // Check token from localStorage as a quick validation

      if (!token) {
        console.log("Not logged in");
        setIsLoggedIn(false);
        return;
      }

      try {
        const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/verify-token`, {
          headers: {
            Authorization: `Bearer ${token}`
          },
          withCredentials: true,
        });

        console.log("Auth response:", response.data);

        if (response.status === 200 && response.data.user && response.data.user.role) {
          setIsLoggedIn(true);
          setUserRole(response.data.user.role);
          console.log("User role:", response.data.user.role);
        } else {
          console.log("Invalid response or missing role");
          setIsLoggedIn(false);
        }
      } catch (error) {
        console.error("Auth error:", error);
        setIsLoggedIn(false);
      }
    };

    verifyAuth();
  }, []);

  const toggleDrawer = (newOpen) => () => {
    setOpen(newOpen);
  };

  const handleLogout = async () => {
    try {
      console.log('Attempting to logout...');
      // Call the backend logout endpoint with the correct URL
      await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/logout`, {}, { 
        withCredentials: true 
      });
      console.log('Logout successful');
  
      // Clear client-side storage
      localStorage.removeItem('token');
      sessionStorage.clear();
  
      // Update the state to reflect that the user is logged out
      setIsLoggedIn(false);
      setUserRole(null);
  
      // Redirect to login page
      window.location.href = '/login';
    } catch (error) {
      console.error('Error logging out:', error);
      // Even if the server request fails, we should still clear local storage and redirect
      localStorage.removeItem('token');
      sessionStorage.clear();
      setIsLoggedIn(false);
      setUserRole(null);
      window.location.href = '/login';
    }
  };

  const handleAppointmentClick = (e) => {
    if (!isLoggedIn) {
      e.preventDefault();
      window.location.href = '/login';
    }
  };

  return (
    <>
      {/* Drawer toggle button for smaller screens */}
      <button 
        className={`MainDrawer-toggle ${open ? 'hidden' : ''}`} 
        onClick={toggleDrawer(true)}
      >
        &#9776; {/* Unicode for hamburger icon */}
      </button>

      {/* Navigation bar for larger screens */}
      <nav className="Aziel-navcontainer">
        <nav className="Aziel-navbar">
          <div className="logo-container">
            <img src={clinicLogo} alt="Logo" className="logo" />
          </div>
          <ul className="navbar-menu">
          {isLoggedIn ? (
              <>
                {userRole === 'superAdmin' && (
                  <li className="navbar-item">
                    <a href="/superDashboard" className="navbar-link">Dashboard (Super)</a>
                  </li>
                )}
                {userRole === 'admin' && (
                  <li className="navbar-item">
                    <a href="/dashboard" className="navbar-link">Dashboard</a>
                  </li>
                )}
                {userRole === 'doctor' && (
                  <li className="navbar-item">
                    <a href="/doctorDashboard" className="navbar-link">Dashboard</a>
                  </li>
                )}
              </>
            ) : (
              <>
                <li className="navbar-item">
                  <a href="/" className="navbar-link">Home</a>
                  <a href="/feedback" className="navbar-link">Feedback</a>
                </li>
                <li className="navbar-item">
                  <a href="/Services" className="navbar-link">Services</a>
                </li>
              </>
            )}
            
            <li className="navbar-item">
              <a 
                href={ userRole === 'patient' ? '/' : '#'} 
                className="navbar-link"
              >
                {userRole === 'patient' ? 'Home' : ''}
              </a>
            </li>
            
            <li className="navbar-item">
              <a 
                href={ userRole === 'patient' ? '/appointment' : '#'} 
                className="navbar-link"
              >
                {userRole === 'patient' ? 'Appointment' : ''}
              </a>
            </li>
            <li className="navbar-item">
              <a 
                href={ userRole === 'patient' ? '/feedback' : '#'} 
                className="navbar-link"
              >
                {userRole === 'patient' ? 'Feedback' : ''}
              </a>
            </li>
            <li className="navbar-item">
              <a 
                href={ userRole === 'patient' ? '/Services' : '#'} 
                className="navbar-link"
              >
                {userRole === 'patient' ? 'Services' : ''}
              </a>
            </li>
            <li className="navbar-item">
              <a 
                href={ userRole === 'patient' ? '/profile' : '#'} 
                className="navbar-link"
              >
                {userRole === 'patient' ? 'Profile and Appointments' : ''}
              </a>
            </li>
            
            {isLoggedIn && (
              <li className="navbar-item">
                <Notification />
              </li>
            )}

            {/* Conditionally render the Login/Logout button */}
            {!isLoggedIn ? (
              <>
                <li className="navbar-item">
                  <a href="/login" className="navbar-link">Login</a>
                </li>
              </>
            ) : (
              <li className="navbar-item">
                <button onClick={handleLogout} type="button" class="btn btn-primary btn-primary">Logout</button>
              </li>
            )}
            <li className="navbar-item">
              <a 
                className="navbar-link"
              >
                {userRole === 'patient' ? 'Patient' : ''}
              </a>
            </li>
            

          </ul>
        </nav>
      </nav>
{/* Drawer for smaller screens */}
<div className={`drawer ${open ? 'open' : ''}`}>
        <button className="CloseButton close-btn" onClick={toggleDrawer(false)}>
          &times; {/* Unicode for close icon */}
        </button>
  <div className="MainDrawer-content">
    <ul>
      {isLoggedIn ? (
        <>
          {userRole === 'superAdmin' && (
            <li className="drawer-item">
              <a href="/superDashboard" className="drawer-link">Dashboard (Super)</a>
            </li>
          )}
          {userRole === 'admin' && (
            <li className="drawer-item">
              <a href="/dashboard" className="drawer-link">Dashboard</a>
            </li>
          )}
          {userRole === 'doctor' && (
            <li className="drawer-item">
              <a href="/doctorDashboard" className="drawer-link">Dashboard</a>
            </li>
          )}
          {userRole === 'patient' && (
            <>
              <li className="drawer-item"><a href="/" className="drawer-link">Home</a></li>
              <li className="drawer-item"><a href="/appointment" className="drawer-link">Appointment</a></li>
              <li className="drawer-item"><a href="/feedback" className="drawer-link">Feedback</a></li>
              <li className="drawer-item"><a href="/services" className="drawer-link">Services</a></li>
              <li className="drawer-item"><a href="/profile" className="drawer-link">Profile and Appointments</a></li>
            </>
          )}
          <li className="drawer-item">
            <Notification />
          </li>
          <li className="drawer-item">
            <button onClick={handleLogout} type="button" class="btn btn-primary btn-sm"
            >
              Logout
            </button>
          </li>
        </>
      ) : (
        <>
          <li className="drawer-item"><a href="/" className="drawer-link">Home</a></li>
          <li className="drawer-item"><a href="/services" className="drawer-link">Services</a></li>
          <li className="drawer-item"><a href="/feedback" className="drawer-link">Feedback</a></li>
          <li className="drawer-item"><a href="/login" className="drawer-link">Login</a></li>
        </>
      )}
    </ul>
  </div>
</div>

    </>
  );
};

export default DrawerComponent;
