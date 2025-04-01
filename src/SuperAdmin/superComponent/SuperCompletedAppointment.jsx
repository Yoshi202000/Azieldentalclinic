import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../../admin/dashboard/Dashboard.css';
import './ViewAppointment.css';
import '../../styles/CompletedAppointment.css';

const SuperCompletedAppointment = () => {
  const [appointments, setAppointments] = useState([]);
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('All');
  const [searchName, setSearchName] = useState('');
  const [searchEmail, setSearchEmail] = useState('');
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  });
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Please log in to continue.');
      navigate('/login');
      return;
    }

    fetchUserInfo(token);
  }, [navigate]);

  const fetchUserInfo = async (token) => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/verify-token`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        withCredentials: true,
      });

      const { clinic } = response.data.user;
      setUser({ clinic });
      fetchAppointments(token, clinic);
    } catch (error) {
      console.error('Error fetching user info:', error);
      setError('Failed to fetch user information');
      if (error.response && error.response.status === 401) {
        alert('Session expired or invalid. Please log in again.');
        navigate('/login');
      }
    }
  };

  const fetchAppointments = async (token) => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/ViewAppointment`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Filter appointments for completed, no show, and cancelled status
      const relevantAppointments = response.data.filter(
        (app) => ['Completed', 'No Show', 'Cancelled'].includes(app.appointmentStatus)
      );

      setAppointments(relevantAppointments);
      setFilteredAppointments(relevantAppointments);
    } catch (err) {
      console.error('Error fetching appointments:', err);
      setError(err.message);
    }
  };

  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
    applyFilters(newFilter, searchName, searchEmail, dateRange);
  };

  const applyFilters = () => {
    let filtered = [...appointments];

    // Status filter
    if (filter !== 'All') {
      filtered = filtered.filter((app) => app.appointmentStatus === filter);
    }

    // Name search filter
    if (searchName) {
      const searchTerm = searchName.toLowerCase();
      filtered = filtered.filter((app) => 
        app.patientFirstName?.toLowerCase().includes(searchTerm) ||
        app.patientLastName?.toLowerCase().includes(searchTerm)
      );
    }

    // Email search filter
    if (searchEmail) {
      const searchTerm = searchEmail.toLowerCase();
      filtered = filtered.filter((app) => 
        app.patientEmail?.toLowerCase().includes(searchTerm)
      );
    }

    // Date range filter
    if (dateRange.startDate && dateRange.endDate) {
      const start = new Date(dateRange.startDate);
      const end = new Date(dateRange.endDate);
      end.setHours(23, 59, 59);

      filtered = filtered.filter((app) => {
        const appDate = new Date(app.appointmentDate);
        return appDate >= start && appDate <= end;
      });
    }

    setFilteredAppointments(filtered);
  };

  useEffect(() => {
    applyFilters();
  }, [filter, searchName, searchEmail, dateRange, appointments]);

  const sortAppointments = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });

    const sortedAppointments = [...filteredAppointments].sort((a, b) => {
      if (key === 'date') {
        const dateA = new Date(a.appointmentDate);
        const dateB = new Date(b.appointmentDate);
        return direction === 'ascending' ? dateA - dateB : dateB - dateA;
      }
      if (key === 'time') {
        const timeA = a.appointmentTimeFrom;
        const timeB = b.appointmentTimeFrom;
        return direction === 'ascending' 
          ? timeA.localeCompare(timeB) 
          : timeB.localeCompare(timeA);
      }
      if (key === 'name') {
        const nameA = `${a.patientFirstName} ${a.patientLastName}`.toLowerCase();
        const nameB = `${b.patientFirstName} ${b.patientLastName}`.toLowerCase();
        return direction === 'ascending' 
          ? nameA.localeCompare(nameB) 
          : nameB.localeCompare(nameA);
      }
      if (key === 'email') {
        return direction === 'ascending'
          ? a.patientEmail.localeCompare(b.patientEmail)
          : b.patientEmail.localeCompare(a.patientEmail);
      }
      return 0;
    });

    setFilteredAppointments(sortedAppointments);
  };

  const SortIndicator = ({ columnKey }) => {
    if (sortConfig.key !== columnKey) return null;
    return (
      <span className="sort-indicator">
        {sortConfig.direction === 'ascending' ? ' ↑' : ' ↓'}
      </span>
    );
  };

  return (
    <div className="completed-appointments-container">
      <h1>Completed, No Show, and Cancelled Appointments</h1>
      
      <div className="filter-buttons">
        <button onClick={() => handleFilterChange('All')} className={filter === 'All' ? 'active' : ''}>All</button>
        <button onClick={() => handleFilterChange('Completed')} className={filter === 'Completed' ? 'active' : ''}>Completed</button>
        <button onClick={() => handleFilterChange('No Show')} className={filter === 'No Show' ? 'active' : ''}>No Show</button>
        <button onClick={() => handleFilterChange('Cancelled')} className={filter === 'Cancelled' ? 'active' : ''}>Cancelled</button>
      </div>

      <div className="search-filters">
        <div className="search-group">
          <input
            type="text"
            placeholder="Search by name..."
            value={searchName}
            onChange={(e) => setSearchName(e.target.value)}
            className="search-input"
          />
          <input
            type="text"
            placeholder="Search by email..."
            value={searchEmail}
            onChange={(e) => setSearchEmail(e.target.value)}
            className="search-input"
          />
        </div>
        <div className="date-filter">
          <input
            type="date"
            value={dateRange.startDate}
            onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
            className="date-input"
          />
          <span>to</span>
          <input
            type="date"
            value={dateRange.endDate}
            onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
            className="date-input"
          />
        </div>
      </div>

      {error ? (
        <p>Error: {error}</p>
      ) : filteredAppointments.length === 0 ? (
        <p>No appointments found for the selected filters.</p>
      ) : (
        <div className='table-responsive-container'>
          <div className='table-responsive'>
            <table className="AdminAppointmentTable">
              <thead>
                <tr>
                  <th onClick={() => sortAppointments('name')} style={{ cursor: 'pointer' }}>
                    Patient Name <SortIndicator columnKey="name" />
                  </th>
                  <th onClick={() => sortAppointments('email')} style={{ cursor: 'pointer' }}>
                    Email <SortIndicator columnKey="email" />
                  </th>
                  <th onClick={() => sortAppointments('date')} style={{ cursor: 'pointer' }}>
                    Date <SortIndicator columnKey="date" />
                  </th>
                  <th onClick={() => sortAppointments('time')} style={{ cursor: 'pointer' }}>
                    Time <SortIndicator columnKey="time" />
                  </th>
                  <th>Clinic</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredAppointments.map((appointment) => (
                  <tr key={appointment._id}>
                    <td>{`${appointment.patientFirstName} ${appointment.patientLastName}`}</td>
                    <td>{appointment.patientEmail}</td>
                    <td>{new Date(appointment.appointmentDate).toLocaleDateString()}</td>
                    <td>{appointment.appointmentTimeFrom}</td>
                    <td>{appointment.bookedClinic}</td>
                    <td>{appointment.appointmentStatus}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default SuperCompletedAppointment;
