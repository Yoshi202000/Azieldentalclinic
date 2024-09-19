import React, { useState, useEffect } from 'react';
import '../styles/Drawer.css'; // Import the CSS file for styling

const DrawerComponent = () => {
  const [open, setOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // Check if the user is logged in by checking for a token in localStorage
    const token = localStorage.getItem('token');
    if (token) {
      setIsLoggedIn(true);
    } else {
      setIsLoggedIn(false);
    }
  }, []);

  const toggleDrawer = (newOpen) => () => {
    setOpen(newOpen);
  };

  const handleLogout = () => {
    localStorage.removeItem('token'); // Remove the token from localStorage
    setIsLoggedIn(false); // Update the state to reflect that the user is logged out
    window.location.href = '/login'; // Redirect the user to the login page after logging out
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
          <img src="src/assets/azieldental.png" alt="Logo" className="logo" />
        </div>
        <ul className="navbar-menu">
          <li className="navbar-item">
            <a href="/home" className="navbar-link">Home</a>
          </li>
          <li className="navbar-item">
            <a href="#services" className="navbar-link">Services</a>
          </li>
          <li className="navbar-item">
            <a href="#appointment" className="navbar-link">Appointment</a>
          </li>
          <li className="navbar-item">
            <a href="#branches" className="navbar-link">Branches</a>
          </li>
          
          
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
            <li className="drawer-item">
              <a href="/home" className="drawer-link">Home</a>
            </li>
            <li className="drawer-item">
              <a href="#services" className="drawer-link">Services</a>
            </li>
            <li className="drawer-item">
              <a href="#appointment" className="drawer-link">Appointment</a>
            </li>
            <li className="drawer-item">
              <a href="#branches" className="drawer-link">Branches</a>
            </li>

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
