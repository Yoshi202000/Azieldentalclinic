import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Box, TextField, Button, Typography, Paper, Grid } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const UpdateFee = () => {
  const [appointments, setAppointments] = useState([]);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [fee, setFee] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Please log in to continue.');
      navigate('/login');
      return;
    }

    fetchAppointments(token);
  }, [navigate]);

  const fetchAppointments = async (token) => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/ViewAppointment`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      setAppointments(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching appointments:', error);
      setError('Failed to fetch appointments');
      setLoading(false);
      
      if (error.response && error.response.status === 401) {
        alert('Session expired or invalid. Please log in again.');
        navigate('/login');
      }
    }
  };

  // Handle appointment selection
  const handleAppointmentClick = (appointment) => {
    setSelectedAppointment(appointment);
    setFee(appointment.fee || '');
  };

  // Handle fee update
  const handleUpdateFee = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Please log in to continue.');
      navigate('/login');
      return;
    }

    try {
      const response = await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/update-fee/${selectedAppointment._id}`,
        { fee: parseFloat(fee) },
        { 
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          } 
        }
      );

      if (response.data) {
        // Update the appointments list with the new fee
        setAppointments(appointments.map(apt => 
          apt._id === selectedAppointment._id ? { ...apt, fee } : apt
        ));
        
        setMessage('Fee updated successfully');
        setTimeout(() => setMessage(''), 3000); // Clear message after 3 seconds
      }
    } catch (error) {
      console.error('Error updating fee:', error);
      if (error.response && error.response.status === 401) {
        alert('Session expired or invalid. Please log in again.');
        navigate('/login');
        return;
      }
      setMessage(error.response?.data?.message || 'Error updating fee');
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Update Appointment Fee
      </Typography>

      {message && (
        <Typography 
          color={message.includes('Error') ? 'error' : 'success'} 
          mb={2}
          sx={{ backgroundColor: message.includes('Error') ? '#ffebee' : '#e8f5e9', 
               padding: 2, 
               borderRadius: 1 }}
        >
          {message}
        </Typography>
      )}

      <Grid container spacing={3}>
        {/* Appointments List */}
        <Grid item xs={12} md={8}>
          <Typography variant="h6" gutterBottom>
            Appointments
          </Typography>
          {appointments.length === 0 ? (
            <Typography>No appointments found.</Typography>
          ) : (
            appointments.map((appointment) => (
              <Paper
                key={appointment._id}
                sx={{
                  p: 2,
                  mb: 2,
                  cursor: 'pointer',
                  bgcolor: selectedAppointment?._id === appointment._id ? '#f0f0f0' : 'white',
                  '&:hover': {
                    bgcolor: '#f5f5f5'
                  }
                }}
                onClick={() => handleAppointmentClick(appointment)}
              >
                <Typography>
                  Patient: {appointment.patientFirstName} {appointment.patientLastName}
                </Typography>
                <Typography>
                  Date: {new Date(appointment.appointmentDate).toLocaleDateString()}
                </Typography>
                <Typography>
                  Time: {appointment.appointmentTimeFrom}
                </Typography>
                <Typography>
                  Type: {appointment.appointmentType}
                </Typography>
                <Typography>
                  Status: {appointment.appointmentStatus}
                </Typography>
                <Typography>
                  Current Fee: ${appointment.fee || 'Not set'}
                </Typography>
              </Paper>
            ))
          )}
        </Grid>

        {/* Fee Update Form */}
        <Grid item xs={12} md={4}>
          {selectedAppointment && (
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Selected Appointment
              </Typography>
              <Typography>
                Patient: {selectedAppointment.patientFirstName} {selectedAppointment.patientLastName}
              </Typography>
              <Typography mb={2}>
                Date: {new Date(selectedAppointment.appointmentDate).toLocaleDateString()}
              </Typography>
              
              <TextField
                fullWidth
                label="Fee Amount"
                type="number"
                value={fee}
                onChange={(e) => setFee(e.target.value)}
                sx={{ mb: 2 }}
                InputProps={{
                  startAdornment: <Typography>$</Typography>
                }}
              />
              
              <Button
                variant="contained"
                onClick={handleUpdateFee}
                disabled={!fee}
                fullWidth
                sx={{
                  bgcolor: 'primary.main',
                  '&:hover': {
                    bgcolor: 'primary.dark',
                  }
                }}
              >
                Update Fee
              </Button>
            </Paper>
          )}
        </Grid>
      </Grid>
    </Box>
  );
};

export default UpdateFee;
