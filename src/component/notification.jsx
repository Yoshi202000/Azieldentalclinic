import React, { useState, useCallback, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Notification.css';

function Notification() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const notificationRef = useRef(null);

  const fetchNotifications = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Please log in to continue.');
      navigate('/login');
      return;
    }

    try {
      setLoading(true);
      // Fetch user data
      const userResponse = await fetch('http://localhost:5000/api/verify-token', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        credentials: 'include',
      });

      if (!userResponse.ok) {
        throw new Error('Session expired or invalid.');
      }

      const userData = await userResponse.json();

      // Fetch notifications based on user role
      let notificationsResponse;
      if (userData.user.role.toLowerCase() === 'admin') {
        notificationsResponse = await axios.get('http://localhost:5000/api/admin-notifications', {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        notificationsResponse = await axios.get('http://localhost:5000/api/patient-notifications', {
          headers: { Authorization: `Bearer ${token}` }
        });
      }

      let roleSpecificNotifications = notificationsResponse.data.map(n => ({
        ...n,
        type: userData.user.role.toLowerCase()
      }));

      // Filter patient notifications by user email
      if (userData.user.role.toLowerCase() !== 'admin') {
        roleSpecificNotifications = roleSpecificNotifications.filter(
          notification => notification.userEmail === userData.user.email
        );
      }

      roleSpecificNotifications.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      setNotifications(roleSpecificNotifications);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to fetch notifications. Please try again later.');
      setLoading(false);
      if (error.message === 'Session expired or invalid.') {
        alert('Session expired or invalid. Please log in again.');
        navigate('/login');
      }
    }
  }, [navigate]);

  const toggleDropdown = () => {
    if (!isOpen) {
      fetchNotifications();
    }
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    function handleClickOutside(event) {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [notificationRef]);

  const markNotificationAsRead = async (notificationId, notificationType) => {
    try {
      await axios.post('http://localhost:5000/api/mark-notification-read', {
        notificationId,
        notificationType
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });

      setNotifications(prevNotifications =>
        prevNotifications.map(notification =>
          notification._id === notificationId
            ? { ...notification, isRead: true }
            : notification
        )
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleNotificationClick = (notification) => {
    setSelectedNotification(notification);
    markNotificationAsRead(notification._id, notification.type);
  };

  const closeModal = () => {
    setSelectedNotification(null);
  };

  return (
    <div className="notifications-dropdown" ref={notificationRef}>
      <button onClick={toggleDropdown} className="notifications-icon-btn" aria-label="Notifications">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
          <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.89 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z" />
        </svg>
        {notifications.filter(n => !n.isRead).length > 0 && (
          <span className="notification-count">
            {notifications.filter(n => !n.isRead).length}
          </span>
        )}
      </button>
      {isOpen && (
        <div className="notifications-content">
          {loading ? (
            <div className="loading">Loading...</div>
          ) : error ? (
            <div className="error">{error}</div>
          ) : notifications.length === 0 ? (
            <p>No notifications found.</p>
          ) : (
            <ul className="notifications-list">
              {notifications.map((notification, index) => (
                <li
                  key={index}
                  className={`notification-item ${notification.type} ${notification.isRead ? 'read' : 'unread'}`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="notification-header">
                    <span className="notification-type">{notification.type.toUpperCase()}</span>
                    <span className="notification-date">
                      {new Date(notification.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <p className="notification-message">{notification.message}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
      {selectedNotification && (
        <div className="notification-modal">
          <div className="notification-modal-content">
            <h2>{selectedNotification.type.toUpperCase()} Notification</h2>
            <p><strong>Date:</strong> {new Date(selectedNotification.createdAt).toLocaleString()}</p>
            <p><strong>Message:</strong> {selectedNotification.message}</p>
            <button onClick={closeModal}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Notification;