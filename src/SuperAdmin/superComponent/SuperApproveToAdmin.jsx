import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../../admin/dashboard/Dashboard.css';

const SuperApproveToAdmin = () => {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [user, setUser] = useState(null);
  const [password, setPassword] = useState('');
  const [actionUserId, setActionUserId] = useState(null);
  const [actionType, setActionType] = useState(null);
  const [showPasswordPopup, setShowPasswordPopup] = useState(false);
  const [clinics, setClinics] = useState([]);
  const [selectedClinic, setSelectedClinic] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
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
    fetchClinics();
  }, []);

  const fetchClinics = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/clinic`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setClinics(data);
    } catch (err) {
      console.error('Error fetching clinics:', err);
      setError('Failed to fetch clinic information');
    }
  };

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
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/UserInformation`);
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
        `${import.meta.env.VITE_BACKEND_URL}/api/login`,
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

  const handleAction = (userId, user) => {
    setActionUserId(userId);
    setSelectedUser(user);
    setSelectedRole(user.role);
    setSelectedClinic('');
    setShowPasswordPopup(true);
  };

  const handleRoleChange = async () => {
    if (!selectedClinic || !selectedRole) {
      alert('Please select both a clinic and a role');
      return;
    }

    const isVerified = await verifyUserPassword();
    if (!isVerified) return;

    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/updateUserRole/${actionUserId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          newRole: selectedRole,
          loggedInUserClinic: selectedClinic 
        }),
      });

      if (response.ok) {
        const updatedUser = await response.json();
        setUsers((prevUsers) =>
          prevUsers.map((u) =>
            u._id === actionUserId ? { ...u, role: selectedRole, clinic: selectedClinic } : u
          )
        );
        setPassword('');
        setSelectedClinic('');
        setSelectedRole('');
        setShowPasswordPopup(false);
        alert('User role updated successfully');
      } else {
        const errorData = await response.json();
        console.error('Failed to update user role:', errorData);
        alert(errorData.error || 'Failed to update user role');
      }
    } catch (err) {
      console.error('Error updating user role:', err);
      alert('Error updating user role');
    }
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
              <h3>Manage Role for {selectedUser.firstName} {selectedUser.lastName}</h3>
              <p>Current Role: {selectedUser.role}</p>
              <p>Current Clinic: {selectedUser.clinic}</p>
              <div className="role-select-container">
                <label>Select New Role:</label>
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="styled-select"
                >
                  <option value="">Select a role</option>
                  <option value="patient">Patient</option>
                  <option value="admin">Admin</option>
                  <option value="doctor">Doctor</option>
                </select>
              </div>
              {selectedRole !== 'patient' && (
                <div className="clinic-select-container">
                  <label>Select Clinic:</label>
                  <select
                    value={selectedClinic}
                    onChange={(e) => setSelectedClinic(e.target.value)}
                    className="styled-select"
                  >
                    <option value="">Select a clinic</option>
                    {clinics.map((clinic) => (
                      <>
                        <option key={`${clinic._id}-1`} value={clinic.nameOne}>
                          {clinic.nameOne}
                        </option>
                        <option key={`${clinic._id}-2`} value={clinic.nameTwo}>
                          {clinic.nameTwo}
                        </option>
                      </>
                    ))}
                  </select>
                </div>
              )}
              <p className="clinic-info">
                Note: {selectedRole === 'patient' ? 'Patient will be assigned to both clinics' : 
                      'User will be assigned to selected clinic'}
              </p>
              <input
                type="password"
                placeholder="Enter your password to confirm"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="PasswordInput styled-input"
              />
              <div className="ButtonContainer">
                <button 
                  onClick={handleRoleChange} 
                  className="PIButton"
                  disabled={(!selectedClinic && selectedRole !== 'patient') || !selectedRole || !password}
                >
                  Confirm Role Change
                </button>
                <button 
                  onClick={() => {
                    setShowPasswordPopup(false);
                    setPassword('');
                    setSelectedClinic('');
                    setSelectedRole('');
                  }} 
                  className="CancelButton"
                >
                  Cancel
                </button>
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
                  <tr key={user._id}>
                    <td>{user.firstName}</td>
                    <td>{user.lastName}</td>
                    <td>{user.email}</td>
                    <td>{user.phoneNumber}</td>
                    <td>{user.role}</td>
                    <td>{user.clinic}</td>
                    <td>
                      <button 
                        className="PIButton" 
                        onClick={() => handleAction(user._id, user)}
                      >
                        Manage Role
                      </button>
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

export default SuperApproveToAdmin;