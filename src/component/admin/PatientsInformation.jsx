import React, { useEffect, useState } from 'react';
import '../../admin/dashboard/Dashboard.css';

const PatientsInformation = () => {
  const [users, setUsers] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [error, setError] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showAppointments, setShowAppointments] = useState(true);

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
  
  // New function to fetch appointments
  const fetchAppointments = async () => {
    try {
      const response = await fetch('http://localhost:5000/ViewAppointment');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setAppointments(data);
    } catch (err) {
      console.error('Error fetching appointments:', err);
      setError(err.message);
    }
  };
  
  useEffect(() => {
    fetchUsers();
    fetchAppointments();
  }, []);

  const handleUserClick = (user) => {
    setSelectedUser(user);
    setShowAppointments(true);
  };

  const toggleAppointments = () => {
    setShowAppointments(!showAppointments);
  };

  const filteredAppointments = selectedUser
    ? appointments.filter(
        (appointment) =>
          appointment.patientFirstName === selectedUser.firstName &&
          appointment.patientLastName === selectedUser.lastName
      )
    : [];

  return (
    <div className="PIContainer">
      <h1 className="PITitle">Patients Information</h1>
      {error ? (
        <p className="PIError">Error fetching data: {error}</p>
      ) : (
        <>
          <table className="PITable">
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
                <tr key={user._id} onClick={() => handleUserClick(user)}>
                  <td>{user.firstName}</td>
                  <td>{user.lastName}</td>
                  <td>{user.email}</td>
                  <td>{user.phoneNumber}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {selectedUser && showAppointments && (
            <>
              <div className="PIAppointmentsHeader">
                <h2 className="PIAppointmentsTitle">Appointments for {selectedUser.firstName} {selectedUser.lastName}</h2>
                <button className="PIButton" onClick={toggleAppointments}>
                  Hide Appointments
                </button>
              </div>
              {filteredAppointments.length > 0 ? (
                <table className="PIAppointmentsTable">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Time</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAppointments.map((appointment) => (
                      <tr key={appointment._id}>
                        <td>{appointment.appointmentDate}</td>
                        <td>{appointment.appointmentTimeFrom}</td>
                        <td>{appointment.appointmentStatus}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="PINoAppointments">No appointments found for this patient.</p>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
};

export default PatientsInformation;
