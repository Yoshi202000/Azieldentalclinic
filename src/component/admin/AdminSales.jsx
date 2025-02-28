import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../../admin/dashboard/Dashboard.css';
import './ViewAppointment.css';

const AdminSales = () => {
  const [appointments, setAppointments] = useState([]);
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [user, setUser] = useState(null); // New state for user info
  const [error, setError] = useState(null);
  const [typeFilter, setTypeFilter] = useState('All');
  const [dateFilter, setDateFilter] = useState('Daily');
  const [salesData, setSalesData] = useState([]);
  const [isAscending, setIsAscending] = useState(true); // New state for sorting order
  const [clinicServices, setClinicServices] = useState([]); // State for clinic services
  const navigate = useNavigate();

  // Effect to fetch user info and appointments
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Please log in to continue.');
      navigate('/login');
      return;
    }

    fetchUserInfo(token);
    fetchClinicServices(token); // Fetch clinic services
  }, [navigate]);

  // Function to fetch user information
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

  // Function to fetch clinic services
  const fetchClinicServices = async (token) => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/clinic`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.data && response.data.services) {
        setClinicServices(response.data.services); // Set clinic services
      } else {
        console.error('Failed to fetch clinic services');
      }
    } catch (error) {
      console.error('Error fetching clinic services:', error);
    }
  };

  // Fetch appointments from the backend and filter by user's clinic
  const fetchAppointments = async (token, clinic) => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/ViewAppointment`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Filter appointments by clinic and only include appointments with status 'Completed'
      const filteredByClinicAndStatus = response.data.filter(
        (app) => app.bookedClinic === clinic && app.appointmentStatus === 'Completed'
      );

      setAppointments(filteredByClinicAndStatus);
      filterAppointments('All', 'Daily', filteredByClinicAndStatus);
    } catch (err) {
      console.error('Error fetching appointments:', err);
      setError(err.message);
    }
  };

  // Toggle sorting order and apply sort
  const toggleSortOrder = () => {
    setIsAscending(!isAscending);
    sortSalesData(salesData, !isAscending);
  };

  // Sort sales data by date based on ascending or descending order
  const sortSalesData = (data, ascending) => {
    const sortedData = [...data].sort((a, b) => {
      const dateA = new Date(a.date || a.week || a.month);
      const dateB = new Date(b.date || b.week || b.month);
      return ascending ? dateA - dateB : dateB - dateA;
    });
    setSalesData(sortedData);
  };

  // Handle type filter change
  const handleTypeFilterChange = (type) => {
    setTypeFilter(type);
    filterAppointments(type, dateFilter);
  };

  // Handle date filter change
  const handleDateFilterChange = (filter) => {
    setDateFilter(filter);
    filterAppointments(typeFilter, filter);
  };

  // Filter appointments based on type and date filters
  const filterAppointments = (type, date, data = appointments) => {
    let filtered = data;

    // Apply type filter
    if (type !== 'All') {
      filtered = filtered.filter(app => app.appointmentType === type);
    }

    // Apply date filter and group sales
    if (date === 'Daily') {
      const dailyData = groupByDate(filtered);
      sortSalesData(dailyData, isAscending);
    } else if (date === 'Weekly') {
      const weeklyData = groupByWeek(filtered);
      sortSalesData(weeklyData, isAscending);
    } else if (date === 'Monthly') {
      const monthlyData = groupByMonth(filtered);
      sortSalesData(monthlyData, isAscending);
    } else {
      setSalesData([]);
    }

    setFilteredAppointments(filtered);
  };

  // Group sales by each day for daily view
  const groupByDate = (appointments) => {
    const grouped = appointments.reduce((acc, appointment) => {
      const date = new Date(appointment.appointmentDate).toDateString();
      acc[date] = (acc[date] || 0) + parseFloat(appointment.fee || '0');
      return acc;
    }, {});

    return Object.keys(grouped).map(date => ({ date, totalSales: grouped[date] }));
  };

  // Group sales by each week
  const groupByWeek = (appointments) => {
    const grouped = appointments.reduce((acc, appointment) => {
      const date = new Date(appointment.appointmentDate);
      const startOfWeek = new Date(date.setDate(date.getDate() - date.getDay())).toDateString();
      acc[startOfWeek] = (acc[startOfWeek] || 0) + parseFloat(appointment.fee || '0');
      return acc;
    }, {});

    return Object.keys(grouped).map(week => ({
      week,
      totalSales: grouped[week]
    }));
  };

  // Group sales by each month
  const groupByMonth = (appointments) => {
    const grouped = appointments.reduce((acc, appointment) => {
      const date = new Date(appointment.appointmentDate);
      const month = date.toLocaleString('default', { month: 'long', year: 'numeric' });
      acc[month] = (acc[month] || 0) + parseFloat(appointment.fee || '0');
      return acc;
    }, {});

    return Object.keys(grouped).map(month => ({
      month,
      totalSales: grouped[month]
    }));
  };

  return (
    <div className="sales-summary-container">
      <h1 className="sales-summary-title">Sales by Appointment Summary (Completed Only)</h1>

      {/* Type Filter */}
      <div className="filter-buttons">
        <h3>Filter by Appointment Type:</h3>
        <button onClick={() => handleTypeFilterChange('All')} className={typeFilter === 'All' ? 'active' : ''}>All</button>
        {clinicServices.map((service) => (
  <button key={service._id} onClick={() => handleTypeFilterChange(service.name)} className={typeFilter === service.name ? 'active' : ''}>
    {service.name}
  </button>
))}
      </div>

      {/* Date Filter */}
      <div className="filter-buttons">
        <h3>Filter by Date:</h3>
        <button onClick={() => handleDateFilterChange('Daily')} className={dateFilter === 'Daily' ? 'active' : ''}>Daily</button>
        <button onClick={() => handleDateFilterChange('Weekly')} className={dateFilter === 'Weekly' ? 'active' : ''}>Weekly</button>
        <button onClick={() => handleDateFilterChange('Monthly')} className={dateFilter === 'Monthly' ? 'active' : ''}>Monthly</button>
      </div>

      {/* Sort Button */}
      <div className="sort-button-container">
        <button onClick={toggleSortOrder} className="sort-button">
          Sort by Date: {isAscending ? 'Ascending' : 'Descending'}
        </button>
      </div>

      {/* Display Sales Summary */}
      {error ? (
        <p className="sales-summary-error">Error: {error}</p>
      ) : salesData.length === 0 ? (
        <p className="sales-summary-no-data">No sales data available for the selected filters.</p>
      ) : (
        <div className="sales-summary-cards">
          {dateFilter === 'Daily' && salesData.map((day, index) => (
            <div key={index} className="sales-summary-card">
              <h2 className="sales-summary-card-title">{day.date}</h2>
              <p className="sales-summary-card-total">Total Sales: ₱{day.totalSales.toFixed(2)}</p>
            </div>
          ))}
          {dateFilter === 'Weekly' && salesData.map((week, index) => (
            <div key={index} className="sales-summary-card">
              <h2 className="sales-summary-card-title">Week starting {week.week}</h2>
              <p className="sales-summary-card-total">Total Sales: ₱{week.totalSales.toFixed(2)}</p>
            </div>
          ))}
          {dateFilter === 'Monthly' && salesData.map((month, index) => (
            <div key={index} className="sales-summary-card">
              <h2 className="sales-summary-card-title">{month.month}</h2>
              <p className="sales-summary-card-total">Total Sales: ₱{month.totalSales.toFixed(2)}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminSales;
