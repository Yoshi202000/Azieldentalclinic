import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../../admin/dashboard/Dashboard.css';
import '../../pages/Appointment/Appointment.css';

const SuperAdminSales = () => {
  const [appointments, setAppointments] = useState([]);
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [user, setUser] = useState(null); // New state for user info
  const [error, setError] = useState(null);
  const [typeFilter, setTypeFilter] = useState('All');
  const [dateFilter, setDateFilter] = useState('Daily');
  const [salesData, setSalesData] = useState([]);
  const [isAscending, setIsAscending] = useState(true); // New state for sorting order
  const [clinicServices, setClinicServices] = useState([]); // State for clinic services
  const [nameOne, setNameOne] = useState(''); // State for nameOne
  const [nameTwo, setNameTwo] = useState(''); // State for nameTwo
  const [selectedAppointmentType, setSelectedAppointmentType] = useState('All'); // State for selected appointment type
  const [selectedClinic, setSelectedClinic] = useState(''); // State for selected clinic
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
      const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/clinic`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.data && response.data.services) {
        setClinicServices(response.data.services); // Set clinic services

        // Assuming the response contains clinic names
        const { nameOne, nameTwo } = response.data; // Adjust this based on your actual response structure
        setNameOne(nameOne); // Set nameOne
        setNameTwo(nameTwo); // Set nameTwo
      } else {
        console.error('Failed to fetch clinic services');
      }
    } catch (error) {
      console.error('Error fetching clinic services:', error);
    }
  };

  // Function to fetch appointments from the backend and filter by user's clinic
  const fetchAppointments = async (token, clinic) => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/ViewAppointment`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Filter appointments by status 'Completed' only
      const filteredByStatus = response.data.filter(
        (app) => app.appointmentStatus === 'Completed'
      );

      setAppointments(filteredByStatus);
      filterAppointments('All', 'Daily', filteredByStatus);
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
    if (type === selectedAppointmentType) {
      // If the same type is clicked again, reset the filter
      setSelectedAppointmentType('All'); // Reset to 'All'
    } else {
      setSelectedAppointmentType(type); // Set selected appointment type
    }
    filterAppointments(type === 'All' ? 'All' : type, dateFilter); // Call filterAppointments with the selected type and current date filter
  };

  // Handle date filter change
  const handleDateFilterChange = (filter) => {
    setDateFilter(filter);
    filterAppointments(selectedAppointmentType, filter);
  };

  // Filter appointments based on type, date, and clinic
  const filterAppointments = (type, date, data = appointments) => {
    let filtered = data;

    // Apply appointment type filter
    if (type !== 'All') {
      filtered = filtered.filter(app => app.appointmentType === type);
    }

    // Apply clinic filter - check both bookedClinic and clinic fields
    if (selectedClinic) {
      filtered = filtered.filter(app => 
        app.bookedClinic === selectedClinic || 
        app.clinic === selectedClinic
      );
      console.log('Filtered by clinic:', {
        selectedClinic,
        filteredCount: filtered.length,
        appointments: filtered.map(app => ({
          id: app._id,
          bookedClinic: app.bookedClinic,
          clinic: app.clinic
        }))
      });
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
      setSalesData([]); // Reset sales data if no valid date filter
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

  // Handle clinic filter change with debug logging
  const handleClinicFilterChange = (clinic) => {
    console.log('Clinic filter changed:', {
      previousClinic: selectedClinic,
      newClinic: clinic,
      appointmentsCount: appointments.length,
      clinicAppointments: appointments.filter(app => 
        app.bookedClinic === clinic || 
        app.clinic === clinic
      ).length
    });

    if (clinic === selectedClinic) {
      setSelectedClinic(''); // Reset clinic filter
    } else {
      setSelectedClinic(clinic); // Set new clinic filter
    }
    filterAppointments(selectedAppointmentType, dateFilter); // Reapply filters
  };

  return (
    <div className="sales-summary-container">
      <h1 className="sales-summary-title">Gross Sales by Appointment Summary (Completed Only)</h1>

      {/* Type Filter */}
      <div className="filter-buttons">
        <h3>Filter by Appointment Type:</h3>
        <button 
          onClick={() => handleTypeFilterChange('All')} 
          className={selectedAppointmentType === 'All' ? 'active' : ''}
        >
          All
        </button>
        {clinicServices.map((service) => (
          <button 
            key={service._id} 
            onClick={() => handleTypeFilterChange(service.name)} 
            className={selectedAppointmentType === service.name ? 'active' : ''}
          >
            {service.name}
          </button>
        ))}
      </div>

      {/* Clinic Filter with updated display */}
      <div className="filter-buttons">
        <h3>Filter by Clinic:</h3>
        <button 
          onClick={() => handleClinicFilterChange(nameOne)} 
          type="button" class="btn btn-primary btn-sm"
          className={`clinic-filter-button ${selectedClinic === nameOne ? 'active' : ''}`}
        >
          {nameOne} ({appointments.filter(app => 
            app.bookedClinic === nameOne || 
            app.clinic === nameOne
          ).length} appointments)
        </button>
        <button 
          onClick={() => handleClinicFilterChange(nameTwo)} 
          className={`clinic-filter-button ${selectedClinic === nameTwo ? 'active' : ''}`}
        >
          {nameTwo} ({appointments.filter(app => 
            app.bookedClinic === nameTwo || 
            app.clinic === nameTwo
          ).length} appointments)
        </button>
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
              <p className="sales-summary-card-total">Total Gross Sales: ${day.totalSales.toFixed(2)}</p>
            </div>
          ))}
          {dateFilter === 'Weekly' && salesData.map((week, index) => (
            <div key={index} className="sales-summary-card">
              <h2 className="sales-summary-card-title">Week starting {week.week}</h2>
              <p className="sales-summary-card-total">Total Gross Sales: ${week.totalSales.toFixed(2)}</p>
            </div>
          ))}
          {dateFilter === 'Monthly' && salesData.map((month, index) => (
            <div key={index} className="sales-summary-card">
              <h2 className="sales-summary-card-title">{month.month}</h2>
              <p className="sales-summary-card-total">Total Gross Sales: ${month.totalSales.toFixed(2)}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SuperAdminSales;
