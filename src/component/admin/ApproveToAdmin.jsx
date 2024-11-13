import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../../admin/dashboard/Dashboard.css';

const ApproveToAdmin = () => {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [user, setUser] = useState(null);
  const [password, setPassword] = useState(''); // State for password input
  const [actionUserId, setActionUserId] = useState(null); // State for storing action user ID
  const [actionType, setActionType] = useState(null); // State for action type ('approve' or 'revert')
  const [showPasswordPopup, setShowPasswordPopup] = useState(false); // State for showing password popup
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Please log in to continue.');
      navigate('/login');
      return;
    }

    fetchUserInfo(token);
    fetchUsers();
  }, []);

  const fetchUserInfo = async (token) => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/verify-token`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        withCredentials: true,
      });

      const { firstName, lastName, email, phoneNumber, dob, clinic } = response.data.user;
      setUser({ firstName, lastName, email, phoneNumber, dob, clinic });
    } catch (error) {
      console.error('Error fetching user info:', error);
      setError('Failed to fetch user information');
      if (error.response && error.response.status === 401) {
        alert('Session expired or invalid. Please log in again.');
        navigate('/login');
      }
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/UserInformation`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setUsers(data);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError(err.message);
    }
  };

  const handleUserClick = (user) => {
    setSelectedUser(user);
  };

  const verifyUserPassword = async () => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/login`,
        { email: user.email, password },
        {
          withCredentials: true,
        }
      );

      if (response.status === 200) {
        return true;
      }
    } catch (error) {
      if (error.response && error.response.status === 400) {
        setError('Incorrect email or password. Please try again.');
      } else {
        setError('An error occurred during verification. Please try again later.');
      }
      return false;
    }
  };

  const handleRoleChange = async () => {
    const isVerified = await verifyUserPassword();
    if (!isVerified) return;

    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/updateUserRole/${actionUserId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ loggedInUserClinic: user.clinic }),
      });

      if (response.ok) {
        setUsers((prevUsers) =>
          prevUsers.map((user) =>
            user._id === actionUserId ? { ...user, role: 'admin', clinic: user.clinic } : user
          )
        );
        setPassword(''); // Clear the password input
        setShowPasswordPopup(false); // Hide the password popup
      } else {
        console.error('Failed to update user role');
      }
    } catch (err) {
      console.error('Error updating user role:', err);
    }
  };

  const revertUserRole = async () => {
    const isVerified = await verifyUserPassword();
    if (!isVerified) return;

    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/revertUserRole/${actionUserId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        setUsers((prevUsers) =>
          prevUsers.map((user) =>
            user._id === actionUserId ? { ...user, role: 'patient', clinic: 'both' } : user
          )
        );
        setPassword(''); // Clear the password input
        setShowPasswordPopup(false); // Hide the password popup
      } else {
        console.error('Failed to revert user role');
      }
    } catch (err) {
      console.error('Error reverting user role:', err);
    }
  };

  const handleAction = (userId, type) => {
    setActionUserId(userId);
    setActionType(type);
    setShowPasswordPopup(true); // Show the password popup
  };

  const executeAction = () => {
    if (actionType === 'approve') {
      handleRoleChange();
    } else if (actionType === 'revert') {
      revertUserRole();
    }
  };

  const filteredUsers = users.filter(
    (u) =>
      `${u.firstName} ${u.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) &&
      u.email !== (user && user.email)
  );

  return (
    <div className="PIContainer">
      <h1 className="PITitle">Users Information</h1>
      {error ? (
        <p className="PIError">Error fetching data: {error}</p>
      ) : (
        <>
        <p>search user</p>
          <input
            type="text"
            placeholder="Search by user name"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="SearchInput styled-input"
          />
          {showPasswordPopup && selectedUser && (
            <div className="PasswordPopup styled-popup">
              <p>Are you sure you want to change {selectedUser.firstName} {selectedUser.lastName}'s role to {actionType === 'approve' ? 'admin' : 'patient'} and clinic to {actionType === 'approve' ? user.clinic : 'both'}?</p>
              <input
                type="password"
                placeholder="Enter your password to confirm"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="PasswordInput styled-input"
              />
              <div className="ButtonContainer">
                <button onClick={executeAction} className="PIButton">Confirm Action</button>
                <button onClick={() => setShowPasswordPopup(false)} className="CancelButton">Cancel</button>
              </div>
            </div>
          )}
          <div className="PiTableDiv">
            <table className="PITable">
              <thead>
                <tr>
                  <th>First Name</th>
                  <th>Last Name</th>
                  <th>Email</th>
                  <th>Phone Number</th>
                  <th>Role</th>
                  <th>Clinic</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user._id} onClick={() => handleUserClick(user)}>
                    <td>{user.firstName}</td>
                    <td>{user.lastName}</td>
                    <td>{user.email}</td>
                    <td>{user.phoneNumber}</td>
                    <td>{user.role}</td>
                    <td>{user.clinic}</td>
                    <td>
                      {user.role === 'patient' && (
                        <button className="PIButton" onClick={() => handleAction(user._id, 'approve')}>
                          Approve as Admin
                        </button>
                      )}
                      {user.role === 'admin' && (
                        <button className="PIButton" onClick={() => handleAction(user._id, 'revert')}>
                          Revert to Patient
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};

export default ApproveToAdmin;