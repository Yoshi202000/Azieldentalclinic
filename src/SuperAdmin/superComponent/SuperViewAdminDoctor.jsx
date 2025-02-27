import React, { useEffect, useState } from 'react';
import '../../admin/dashboard/Dashboard.css';
import '../../pages/Appointment/Appointment.css';

const SuperViewAdminDoctor = () => {
  const [users, setUsers] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null); // State for selected doctor
  const [availableServices, setAvailableServices] = useState([]); // List of available services
  const [selectedServices, setSelectedServices] = useState([]); // Selected services
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState(''); // State for search term

  // Fetch users and available services
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

  const fetchAvailableServices = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/services`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setAvailableServices(data);
    } catch (err) {
      console.error('Error fetching services:', err);
      setError(err.message);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchAvailableServices();
  }, []);

  const handleServiceSelection = (service) => {
    setSelectedServices((prevServices) =>
      prevServices.includes(service)
        ? prevServices.filter((s) => s !== service) // Remove if already selected
        : [...prevServices, service] // Add if not selected
    );
  };

  const handleAddService = async () => {
    if (!selectedDoctor || selectedServices.length === 0) {
      alert('Please select a doctor and at least one service.');
      return;
    }

    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/UserInformation/${selectedDoctor._id}/addService`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ services: selectedServices }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      alert('Services added successfully.');
      setSelectedServices([]); // Clear selected services
      fetchUsers(); // Refresh user data
    } catch (err) {
      console.error('Error adding services:', err);
      alert('Failed to add services. Please try again.');
    }
  };

  const filteredUsers = users.filter(
    (user) =>
      (user.role === 'doctor' || user.role === 'admin') &&
      `${user.firstName} ${user.lastName}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="PIContainer">
      <h1 className="PITitle">Doctors and Admins Information</h1>
      {error ? (
        <p className="PIError">Error fetching data: {error}</p>
      ) : (
        <>
          <input
            type="text"
            placeholder="Search by name"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="SearchInput"
          />
          <table className="AdminAppointmentTable">
            <thead>
              <tr>
                <th>First Name</th>
                <th>Last Name</th>
                <th>Email</th>
                <th>Phone Number</th>
                <th>User Role</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr
                  key={user._id}
                  onClick={() => setSelectedDoctor(user)}
                  className={selectedDoctor?._id === user._id ? 'SelectedRow' : ''}
                >
                  <td>{user.firstName}</td>
                  <td>{user.lastName}</td>
                  <td>{user.email}</td>
                  <td>{user.phoneNumber}</td>
                  <td>{user.role}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <h2 className="PITitle">Assign Services to Doctor</h2>
          <p>
            Selected Doctor: {selectedDoctor ? `${selectedDoctor.firstName} ${selectedDoctor.lastName}` : 'None'}
          </p>
          <div className="ServiceSelection">
            {availableServices.map((service) => (
              <label key={service} className="ServiceCheckbox">
                <input
                  type="checkbox"
                  checked={selectedServices.includes(service)}
                  onChange={() => handleServiceSelection(service)}
                />
                {service}
              </label>
            ))}
          </div>
          <button onClick={handleAddService} disabled={!selectedDoctor || selectedServices.length === 0}>
            Add Services
          </button>
        </>
      )}
    </div>
  );
};

export default SuperViewAdminDoctor;
