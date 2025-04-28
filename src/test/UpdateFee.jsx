import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Box, TextField, Button, Typography, Paper, Grid, Dialog, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const UpdateFee = ({ selectedAppointment, onClose }) => {
  const [appointments, setAppointments] = useState([]);
  const [fee, setFee] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [services, setServices] = useState([]);
  const [selectedFee, setSelectedFee] = useState(null);
  const [totalFee, setTotalFee] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [discountType, setDiscountType] = useState(null);
  const [openSuccessDialog, setOpenSuccessDialog] = useState(false);
  const [discountId, setDiscountId] = useState('');
  const [showDiscountIdField, setShowDiscountIdField] = useState(false);
  const [discountIdError, setDiscountIdError] = useState('');
  const [serviceFees, setServiceFees] = useState([]);
  const navigate = useNavigate();

  // Fetch services with fees
  const fetchServices = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/clinic`);
      if (response.data && response.data.services) {
        setServices(response.data.services);
      }
    } catch (error) {
      console.error('Error fetching services:', error);
      setError('Failed to fetch services');
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Please log in to continue.');
      navigate('/login');
      return;
    }

    fetchAppointments(token);
    fetchServices();
  }, [navigate]);

  const fetchAppointments = async (token) => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/ViewAppointment`, {
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

  // Fetch user's discount ID and apply discount if exists
  useEffect(() => {
    const fetchUserDiscountId = async () => {
      if (selectedAppointment?.userId) {
        try {
          const token = localStorage.getItem('token');
          const response = await axios.get(
            `${import.meta.env.VITE_BACKEND_URL}/api/UserInformation/${selectedAppointment.userId}`,
            {
              headers: {
                Authorization: `Bearer ${token}`
              }
            }
          );
          
          if (response.data.discountId) {
            setDiscountId(response.data.discountId);
            setDiscount(0.20); // Apply discount if ID exists
            setShowDiscountIdField(true);
            // Determine discount type from the ID format or prefix if possible
            if (response.data.discountId.startsWith('PWD')) {
              setDiscountType('PWD');
            } else if (response.data.discountId.startsWith('SC')) {
              setDiscountType('Senior');
            }
          } else {
            setDiscount(0); // No discount if no ID
            setDiscountType(null);
          }
          // Recalculate total fee after setting discount
          calculateTotalFee(serviceFees);
        } catch (error) {
          console.error('Error fetching user discount ID:', error);
          setDiscount(0);
          setDiscountType(null);
        }
      }
    };

    fetchUserDiscountId();
  }, [selectedAppointment]);

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
        `${import.meta.env.VITE_BACKEND_URL}/api/update-fee/${selectedAppointment._id}`,
        { 
          fee: parseFloat(fee),
          discountType: discountType,
          discountAmount: discount ? (totalFee * 0.20) : 0,
          serviceFees: serviceFees.map((fee, index) => ({
            serviceType: selectedAppointment.appointmentType[index],
            amount: fee?.amount || 0,
            feeType: fee?.feeType || '',
            description: fee?.description || ''
          }))
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data) {
        setOpenSuccessDialog(true);
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

  // Handle success dialog close
  const handleSuccessClose = () => {
    setOpenSuccessDialog(false);
    onClose(); // Close the UpdateFee dialog
  };

  // Calculate total fee with discount
  const calculateTotalFee = (fees = serviceFees) => {
    // Calculate total service fees from all selected services
    const totalServices = fees.reduce((sum, fee) => 
      sum + (parseFloat(fee?.amount) || 0), 0
    );

    // Calculate discountable amounts
    const discountableServiceFees = fees
      .filter(fee => fee?.discountApplicable)
      .reduce((sum, fee) => sum + (parseFloat(fee?.amount) || 0), 0);

    // Calculate non-discountable amounts
    const nonDiscountableServiceFees = totalServices - discountableServiceFees;

    // Calculate total discountable amount
    const discountableSubtotal = discountableServiceFees;

    // Calculate discount amount only if discount ID exists and discount is set
    const discountAmount = (discountId && discount) ? (discountableSubtotal * discount) : 0;

    // Calculate final total
    const total = (discountableSubtotal - discountAmount) + nonDiscountableServiceFees;
    
    setTotalFee(total);
    setFee(total.toString());
  };

  // Update service fee selection handler to properly handle discountability
  const handleFeeSelection = (selectedFee, index) => {
    // Create a new array with the same length as the appointment types
    let updatedFees = [...serviceFees];
    
    // Ensure the array has entries for all appointment types
    if (selectedAppointment?.appointmentType && selectedAppointment.appointmentType.length > updatedFees.length) {
      updatedFees = Array(selectedAppointment.appointmentType.length).fill(null).map((_, i) => updatedFees[i] || null);
    }
    
    // Update the specific index with the new fee
    updatedFees[index] = {
      ...selectedFee,
      discountApplicable: selectedFee.discountApplicable ?? true
    };
    
    // Calculate total immediately with the updated fees before setting state
    calculateTotalFee(updatedFees);
    
    // Now update the state
    setServiceFees(updatedFees);
  };

  // Handle discount selection
  const handleDiscount = (type) => {
    let newDiscount = 0;
    let newDiscountType = null;
    let newShowDiscountIdField = false;
    let newDiscountId = discountId;
    let newDiscountIdError = '';

    if (discountType !== type) {
      // Apply new discount type
      newDiscountType = type;
      newShowDiscountIdField = true;
      // Only apply discount if there's an existing discount ID
      if (discountId) {
        newDiscount = 0.20;
      }
    } else {
      // Remove discount if same button is clicked
      newDiscountId = '';
    }

    // Update state
    setDiscount(newDiscount);
    setDiscountType(newDiscountType);
    setShowDiscountIdField(newShowDiscountIdField);
    setDiscountId(newDiscountId);
    setDiscountIdError(newDiscountIdError);
    
    // Recalculate with new discount values
    // Save current discount values
    const oldDiscount = discount;
    const oldDiscountId = discountId;
    
    // Temporarily set the new values for calculation
    const tempDiscountAmount = newDiscount;
    const tempDiscountId = newDiscountId;
    
    // Calculate with the new values
    const totalServices = serviceFees.reduce((sum, fee) => 
      sum + (parseFloat(fee?.amount) || 0), 0
    );

    const discountableServiceFees = serviceFees
      .filter(fee => fee?.discountApplicable)
      .reduce((sum, fee) => sum + (parseFloat(fee?.amount) || 0), 0);

    const nonDiscountableServiceFees = totalServices - discountableServiceFees;
    const discountableSubtotal = discountableServiceFees;
    const discountAmount = (tempDiscountId && tempDiscountAmount) ? (discountableSubtotal * tempDiscountAmount) : 0;
    const total = (discountableSubtotal - discountAmount) + nonDiscountableServiceFees;
    
    setTotalFee(total);
    setFee(total.toString());
  };

  // Handle discount ID change and update
  const handleDiscountIdChange = async (e) => {
    const newDiscountId = e.target.value;
    setDiscountId(newDiscountId);
    setDiscountIdError('');

    try {
      const token = localStorage.getItem('token');
      
      // Update the discount ID for the patient
      await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/api/update-discount-id`,
        { 
          discountId: newDiscountId,
          userId: selectedAppointment.userId
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      // Apply or remove discount based on whether ID exists
      const newDiscount = newDiscountId ? 0.20 : 0;
      setDiscount(newDiscount);
      
      // Recalculate with new discount values directly
      const totalServices = serviceFees.reduce((sum, fee) => 
        sum + (parseFloat(fee?.amount) || 0), 0
      );

      const discountableServiceFees = serviceFees
        .filter(fee => fee?.discountApplicable)
        .reduce((sum, fee) => sum + (parseFloat(fee?.amount) || 0), 0);

      const nonDiscountableServiceFees = totalServices - discountableServiceFees;
      const discountableSubtotal = discountableServiceFees;
      const discountAmount = (newDiscountId && newDiscount) ? (discountableSubtotal * newDiscount) : 0;
      const total = (discountableSubtotal - discountAmount) + nonDiscountableServiceFees;
      
      setTotalFee(total);
      setFee(total.toString());
    } catch (error) {
      console.error('Error updating discount ID:', error);
      setDiscountIdError(error.response?.data?.message || 'Invalid discount ID');
      setDiscount(0);
      
      // Recalculate with no discount
      const totalServices = serviceFees.reduce((sum, fee) => 
        sum + (parseFloat(fee?.amount) || 0), 0
      );
      setTotalFee(totalServices);
      setFee(totalServices.toString());
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <>
      <Dialog open={true} onClose={onClose} maxWidth="md" fullWidth>
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

          {/* Display selected appointment details */}
          {selectedAppointment && (
            <Paper sx={{ p: 2, mb: 2 }}>
              <Typography variant="h6" gutterBottom>
                Selected Appointment
              </Typography>
              <p>{selectedAppointment.userId}</p>
              <Typography>
                Patient: {selectedAppointment.patientFirstName} {selectedAppointment.patientLastName}
              </Typography>
              <Typography>
                Date: {new Date(selectedAppointment.appointmentDate).toLocaleDateString()}
              </Typography>
              <Typography>
                Time: {selectedAppointment.appointmentTimeFrom}
              </Typography>
              
              {/* Service Types Display */}
              <Box sx={{ my: 2 }}>
                <Typography variant="subtitle1" fontWeight="bold">
                  Service Types:
                </Typography>
                {selectedAppointment.appointmentType.map((type, index) => (
                  <Typography key={index} sx={{ ml: 2 }}>
                    • {type}
                  </Typography>
                ))}
              </Box>

              <Typography>
                Status: {selectedAppointment.appointmentStatus}
              </Typography>
              <Typography>
                Current Fee: ₱{selectedAppointment.fee || 'Not set'}
              </Typography>
            </Paper>
          )}

          {/* Service Fee Selection */}
          {selectedAppointment?.appointmentType.map((type, index) => (
            <FormControl key={index} fullWidth sx={{ mb: 2 }}>
              <InputLabel>{`Select Service Fee for ${type}`}</InputLabel>
              <Select
                value={serviceFees[index] || ''}
                onChange={(e) => handleFeeSelection(e.target.value, index)}
                label={`Select Service Fee for ${type}`}
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    {selected.feeType} - ₱{selected.amount} ({selected.description})
                    {selected.discountApplicable && (
                      <Typography variant="caption" color="success.main" sx={{ ml: 1 }}>
                        (Discountable)
                      </Typography>
                    )}
                  </Box>
                )}
              >
                {services
                  .find(service => service.name === type)
                  ?.fees.map((fee, feeIndex) => (
                    <MenuItem key={feeIndex} value={fee}>
                      {fee.feeType} - ₱{fee.amount} ({fee.description})
                      {fee.discountApplicable && (
                        <Typography variant="caption" color="success.main" sx={{ ml: 1 }}>
                          (Discountable)
                        </Typography>
                      )}
                    </MenuItem>
                  ))}
              </Select>
            </FormControl>
          ))}

          {/* Total Fee Display with Discountable Information */}
          <Paper sx={{ p: 2, mb: 2, bgcolor: 'primary.light', color: 'primary.contrastText' }}>
            <Typography variant="h6">
              Subtotal: ₱{(
                serviceFees.reduce((sum, fee) => 
                  sum + (parseFloat(fee?.amount) || 0), 0
                )
              ).toFixed(2)}
            </Typography>
            
            {discount > 0 && discountId && (
              <>
                <Typography variant="body2" sx={{ mt: 1 }}>
                  Discountable Items:
                </Typography>
                {serviceFees.map((fee, index) => (
                  fee?.discountApplicable && (
                    <Typography key={`service-fee-${index}`} variant="body2" sx={{ ml: 2 }}>
                      Service Fee ({selectedAppointment.appointmentType[index]}): ₱{fee.amount}
                    </Typography>
                  )
                ))}
                <Typography variant="body2" color="error" sx={{ mt: 1 }}>
                  {discountType} Discount (20%): -₱{(
                    serviceFees
                      .filter(fee => fee?.discountApplicable)
                      .reduce((sum, fee) => sum + (parseFloat(fee?.amount) || 0), 0) * 0.20
                  ).toFixed(2)}
                </Typography>
              </>
            )}

            <Typography variant="body2" sx={{ mt: 1 }}>
              Non-Discountable Items:
            </Typography>
            {serviceFees.map((fee, index) => (
              !fee?.discountApplicable && fee && (
                <Typography key={`service-fee-non-disc-${index}`} variant="body2" sx={{ ml: 2 }}>
                  Service Fee ({selectedAppointment.appointmentType[index]}): ₱{fee.amount}
                </Typography>
              )
            ))}

            <Typography variant="h6" sx={{ mt: 2, fontWeight: 'bold' }}>
              Total Fee: ₱{totalFee.toFixed(2)}
            </Typography>
          </Paper>

          {/* Discount Buttons and ID Field */}
          <Box sx={{ mb: 2 }}>
            <Typography variant="h6" gutterBottom>
              Apply Discount
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
              <Button
                variant={discountType === 'PWD' ? 'contained' : 'outlined'}
                onClick={() => handleDiscount('PWD')}
                sx={{
                  bgcolor: discountType === 'PWD' ? 'primary.main' : 'transparent',
                  color: discountType === 'PWD' ? 'primary.contrastText' : 'primary.main',
                  '&:hover': {
                    bgcolor: discountType === 'PWD' ? 'primary.dark' : 'primary.light',
                  }
                }}
              >
                PWD Discount (20%)
              </Button>
              <Button
                variant={discountType === 'Senior' ? 'contained' : 'outlined'}
                onClick={() => handleDiscount('Senior')}
                sx={{
                  bgcolor: discountType === 'Senior' ? 'primary.main' : 'transparent',
                  color: discountType === 'Senior' ? 'primary.contrastText' : 'primary.main',
                  '&:hover': {
                    bgcolor: discountType === 'Senior' ? 'primary.dark' : 'primary.light',
                  }
                }}
              >
                Senior Citizen Discount (20%)
              </Button>
            </Box>

            {/* Discount ID Field */}
            {showDiscountIdField && (
              <Box sx={{ mt: 2 }}>
                <TextField
                  fullWidth
                  label={`${discountType} ID Number`}
                  value={discountId}
                  onChange={handleDiscountIdChange}
                  error={!!discountIdError}
                  helperText={discountIdError || `Please enter valid ${discountType} ID`}
                  sx={{ mb: 2 }}
                />
              </Box>
            )}
          </Box>

          {/* Fee Update Form */}
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Paper sx={{ p: 2 }}>
                <TextField
                  fullWidth
                  label="Total Fee Amount"
                  type="number"
                  value={fee}
                  sx={{ mb: 2 }}
                  InputProps={{
                    startAdornment: <Typography>₱</Typography>,
                    readOnly: true
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
            </Grid>
          </Grid>
        </Box>
      </Dialog>

      {/* Success Message Dialog */}
      <Dialog
        open={openSuccessDialog}
        onClose={handleSuccessClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <Box sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h6" id="alert-dialog-title" sx={{ mb: 2 }}>
            Success!
          </Typography>
          <Typography id="alert-dialog-description" sx={{ mb: 3 }}>
            Fee has been successfully updated.
          </Typography>
          <Button
            variant="contained"
            onClick={handleSuccessClose}
            autoFocus
            sx={{
              bgcolor: 'primary.main',
              '&:hover': {
                bgcolor: 'primary.dark',
              }
            }}
          >
            OK
          </Button>
        </Box>
      </Dialog>
    </>
  );
};

export default UpdateFee;
