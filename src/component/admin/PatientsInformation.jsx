import React, { useEffect, useState } from 'react';
import '../../admin/dashboard/Dashboard.css';

const PatientsInformation = () => {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState(null);

  // Function to fetch users from the backend
  const fetchUsers = async () => {
    try {
      const response = await fetch('http://localhost:5000/UserInformation'); // Ensure the correct URL
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
  
  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div className="patients-info-container">
      <h1>Patients Information</h1>
      {error ? (
        <p>Error fetching users: {error}</p>
      ) : (
        <table className="patients-table">
          <thead>
            <tr>
              <th>First Name</th>
              <th>Last Name</th>
              <th>Email</th>
              <th>Phone Number</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user._id}>
                <td>{user.firstName}</td>
                <td>{user.lastName}</td>
                <td>{user.email}</td>
                <td>{user.phoneNumber}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default PatientsInformation;
