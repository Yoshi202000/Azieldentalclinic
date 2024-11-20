import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/Drawer.css'; // Import the CSS file for styling
import Notification from './notification'; // Import the Notification component

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
      // Call the backend logout endpoint to clear the server-side cookie
      await axios.post(`${import.meta.env.VITE_BACKEND_URL}/logout`, {}, { withCredentials: true });
  
      // Clear client-side storage
      localStorage.removeItem('token'); // Remove the token from localStorage
      sessionStorage.clear();           // Clear all session storage
  
      // Update the state to reflect that the user is logged out
      setIsLoggedIn(false);
      setUserRole(null); // Reset user role
  
      // Redirect to login page
      window.location.href = '/login';
    } catch (error) {
      console.error('Error logging out:', error);
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
        className={`drawer-toggle ${open ? 'hidden' : ''}`} 
        onClick={toggleDrawer(true)}
      >
        &#9776; {/* Unicode for hamburger icon */}
      </button>

      {/* Navigation bar for larger screens */}
      <nav className="navcontainer">
        <nav className="navbar">
          <div className="logo-container">
            <img src="src/assets/aziel.png" alt="Logo" className="logo" />
          </div>
          <ul className="navbar-menu">
            {userRole !== 'admin' && (
              <>
                <li className="navbar-item">
                  <a href="/home" className="navbar-link">Home</a>
                </li>
                <li className="navbar-item">
                  <a href="/services" className="navbar-link">Services</a>
                </li>
                <li className="navbar-item">
                  <a href={isLoggedIn ? "/appointment" : "#"} className="navbar-link" onClick={handleAppointmentClick}>Appointment</a>
                </li>
              </>
            )}
            <li className="navbar-item">
              <a 
                href={userRole === 'admin' ? '/dashboard' : userRole === 'patient' ? '/profile' : '#'} 
                className="navbar-link"
              >
                {userRole === 'admin' ? 'Dashboard' : userRole === 'patient' ? 'Profile' : ''}
              </a>
            </li>
            <li className="navbar-item">
              <a 
                href={userRole === 'admin' ? '/' : userRole === 'patient' ? '/feedback' : '#'} 
                className="navbar-link"
              >
                {userRole === 'admin' ? '' : userRole === 'patient' ? 'Feedback' : ''}
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
                <li className="navbar-item">
                  <a href="/admin" className="navbar-link">Admin</a>
                </li>
              </>
            ) : (
              <li className="navbar-item">
                <button onClick={handleLogout} className="navbar-link">Logout</button>
              </li>
            )}
          </ul>
        </nav>
      </nav>

      {/* Drawer for smaller screens */}
      <div className={`drawer ${open ? 'open' : ''}`}>
        <button className="close-btn" onClick={toggleDrawer(false)}>
          &times; {/* Unicode for close icon */}
        </button>
        <div className="drawer-content">
          <ul>
            {userRole !== 'admin' && (
              <>
                <li className="drawer-item">
                  <a href="/home" className="drawer-link">Home</a>
                </li>
                <li className="drawer-item">
                  <a href="/services" className="drawer-link">Services</a>
                </li>
                <li className="drawer-item">
                  <a href="/appointment" className="drawer-link">Appointment</a>
                </li>
              </>
            )}
            <li className="drawer-item">
              <a 
                href={userRole === 'admin' ? '/dashboard' : userRole === 'patient' ? '/profile' : '#'} 
                className="drawer-link"
              >
                {userRole === 'admin' ? 'Dashboard' : userRole === 'patient' ? 'Profile' : ''}
              </a>
            </li>
            <li className="drawer-item">
              <a 
                href={userRole === 'admin' ? '/' : userRole === 'patient' ? '/feedback' : '#'} 
                className="drawer-link"
              >
                {userRole === 'admin' ? '' : userRole === 'patient' ? 'Feedback' : ''}
              </a>
            </li>
            {isLoggedIn && (
              <li className="drawer-item">
                <Notification />
              </li>
            )}

            {/* Conditionally render the Login/Logout link in the drawer */}
            {!isLoggedIn ? (
              <>
                <li className="drawer-item">
                  <a href="/login" className="drawer-link">Login</a>
                </li>
                <li className="drawer-item">
                  <a href="/admin" className="drawer-link">Admin</a>
                </li>
              </>
            ) : (
              <li className="drawer-item">
                <button onClick={handleLogout} className="drawer-link">Logout</button>
              </li>
            )}
          </ul>
        </div>
      </div>
    </>
  );
};

export default DrawerComponent;
