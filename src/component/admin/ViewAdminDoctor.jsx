import React, { useEffect, useState } from 'react';
import '../../admin/dashboard/Dashboard.css';
import './ViewAppointment.css';
import axios from 'axios';

const ViewAdminDoctor = () => {
  const [users, setUsers] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [userRole, setUserRole] = useState(null);
  const [userId, setUserId] = useState(null);
  const [userClinic, setUserClinic] = useState(null);

  // Initial token check and user info fetch
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decodedToken = JSON.parse(atob(token.split('.')[1]));
        setUserRole(decodedToken.role);
        setUserId(decodedToken.userId);
        fetchUserInfo(token);
      } catch (error) {
        console.error('Error decoding token:', error);
        setError('Authentication error');
      }
    }
  }, []);

  const fetchUserInfo = async (token) => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/verify-token`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        withCredentials: true,
      });

      const { clinic } = response.data.user;
      setUserClinic(clinic);
    } catch (error) {
      console.error('Error fetching user info:', error);
      setError('Failed to fetch user information');
      if (error.response && error.response.status === 401) {
        alert('Session expired or invalid. Please log in again.');
      }
    }
  };

  // Fetch users with token
  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/UserInformation`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      setUsers(response.data);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError(err.message);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Filter users based on role, clinic, and search term
  const filteredUsers = users.filter(user => {
    const matchesSearch = `${user.firstName} ${user.lastName}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesRole = user.role === 'doctor' || user.role === 'admin';
    
    // Clinic filtering logic
    const matchesClinic = 
      user.clinic === userClinic; // Users from same clinic

    return matchesSearch && matchesRole && matchesClinic;
  });

  return (
    <div className="PIContainer">
      <h1 className="PITitle">Doctors and Admins Information</h1>
      {error ? (
        <p className="PIError">Error fetching data: {error}</p>
      ) : (
        <>
          <div className="search-header">
            <input
              type="text"
              placeholder="Search by name"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="SearchInput"
            />
            <div className="clinic-info">
              {userClinic && (
                <span className={`clinic-badge ${userClinic}`}>
                  Clinic: {userClinic.charAt(0).toUpperCase() + userClinic.slice(1)}
                </span>
              )}
            </div>
          </div>

          <table className="AdminAppointmentTable">
            <thead>
              <tr>
                <th>First Name</th>
                <th>Last Name</th>
                <th>Email</th>
                <th>Phone Number</th>
                <th>Clinic</th>
                <th>User Role</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr
                  key={user._id}
                  onClick={() => setSelectedDoctor(user)}
                  className={`${selectedDoctor?._id === user._id ? 'SelectedRow' : ''} ${user.clinic}-row`}
                >
                  <td>{user.firstName}</td>
                  <td>{user.lastName}</td>
                  <td>{user.email}</td>
                  <td>{user.phoneNumber}</td>
                  <td>
                    <span className={`clinic-tag ${user.clinic}`}>
                      {user.clinic.charAt(0).toUpperCase() + user.clinic.slice(1)}
                    </span>
                  </td>
                  <td>{user.role}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredUsers.length === 0 && (
            <div className="no-results">
              No doctors or admins found for your clinic
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ViewAdminDoctor;
