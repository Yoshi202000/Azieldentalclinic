import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Box, TextField, Button, Typography, Paper, Grid, Dialog, Select, MenuItem, FormControl, InputLabel, Chip } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const UpdateFee = ({ selectedAppointment, onClose }) => {
  const [appointments, setAppointments] = useState([]);
  const [fee, setFee] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [services, setServices] = useState([]);
  const [selectedFee, setSelectedFee] = useState(null);
  const [medicines, setMedicines] = useState([]);
  const [selectedMedicines, setSelectedMedicines] = useState([]);
  const [selectedMedicineFees, setSelectedMedicineFees] = useState([]);
  const [totalFee, setTotalFee] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [discountType, setDiscountType] = useState(null);
  const [openSuccessDialog, setOpenSuccessDialog] = useState(false);
  const [discountId, setDiscountId] = useState('');
  const [showDiscountIdField, setShowDiscountIdField] = useState(false);
  const [discountIdError, setDiscountIdError] = useState('');
  const navigate = useNavigate();

  // Fetch services with fees
  const fetchServices = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/clinic`);
      if (response.data && response.data.services) {
        setServices(response.data.services);
      }
    } catch (error) {
      console.error('Error fetching services:', error);
      setError('Failed to fetch services');
    }
  };

  // Fetch medicines
  const fetchMedicines = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/clinic`);
      if (response.data && response.data.medicines) {
        setMedicines(response.data.medicines);
      }
    } catch (error) {
      console.error('Error fetching medicines:', error);
      setError('Failed to fetch medicines');
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
    fetchMedicines();
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

  // Fetch user's discount ID and apply discount if exists
  useEffect(() => {
    const fetchUserDiscountId = async () => {
      if (selectedAppointment?.userId) {
        try {
          const token = localStorage.getItem('token');
          const response = await axios.get(
            `${import.meta.env.VITE_BACKEND_URL}/UserInformation/${selectedAppointment.userId}`,
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
          calculateTotalFee(selectedMedicines, selectedFee?.amount || 0);
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
        `${import.meta.env.VITE_BACKEND_URL}/appointmentFee/update-fee/${selectedAppointment._id}`,
        { 
          fee: parseFloat(fee),
          discountType: discountType,
          discountAmount: discount ? (totalFee * 0.20) : 0
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data) {
        setOpenSuccessDialog(true); // Show success dialog
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
  const calculateTotalFee = (selectedMeds, serviceFee = 0) => {
    const medicineFees = selectedMeds.reduce((sum, medicine) => 
      sum + (parseFloat(medicine.medicineAmount) || 0), 0
    );

    // Calculate discountable amount for medicines
    const discountableMedicineFees = selectedMeds
      .filter(medicine => medicine.isDiscountable || medicine.discountApplicable)
      .reduce((sum, medicine) => sum + (parseFloat(medicine.medicineAmount) || 0), 0);

    const nonDiscountableMedicineFees = medicineFees - discountableMedicineFees;

    // Always make service fee discountable
    const discountableServiceFee = parseFloat(serviceFee) || 0;
    const nonDiscountableServiceFee = 0;

    const discountableSubtotal = discountableMedicineFees + discountableServiceFee;
    // Only apply discount if there's a discount ID
    const discountAmount = discountId ? (discountableSubtotal * (discount || 0)) : 0;

    const total = (discountableSubtotal - discountAmount) + nonDiscountableMedicineFees + nonDiscountableServiceFee;
    setTotalFee(total);
    setFee(total.toString());
  };

  // Update medicine selection handler to allow duplicates
  const handleMedicineSelection = (event) => {
    const selectedMedicine = event.target.value[event.target.value.length - 1];
    if (selectedMedicine) {
      // Add a unique identifier to the medicine instance
      const medicineWithId = {
        ...selectedMedicine,
        instanceId: Date.now(), // Add unique instance ID
        isDiscountable: selectedMedicine.discountApplicable // Map discountApplicable to isDiscountable for UI consistency
      };
      const updatedMedicines = [...selectedMedicines, medicineWithId];
      setSelectedMedicines(updatedMedicines);
      calculateTotalFee(updatedMedicines, selectedFee?.amount || 0);
    }
  };

  // Update remove medicine handler to use instanceId
  const handleRemoveMedicine = (medicineToRemove) => {
    const updatedMedicines = selectedMedicines.filter(
      medicine => medicine.instanceId !== medicineToRemove.instanceId
    );
    setSelectedMedicines(updatedMedicines);
    calculateTotalFee(updatedMedicines, selectedFee?.amount || 0);
  };

  // Update service fee selection handler to properly handle discountability
  const handleFeeSelection = (selectedFee) => {
    // Make sure to set the discountApplicable property correctly
    setSelectedFee({
      ...selectedFee,
      discountApplicable: true // Force all service fees to be discountable
    });
    calculateTotalFee(selectedMedicines, selectedFee.amount);
  };

  // Handle discount selection
  const handleDiscount = (type) => {
    if (discountType === type) {
      // Remove discount if same button is clicked
      setDiscount(0);
      setDiscountType(null);
      setShowDiscountIdField(false);
      setDiscountId('');
      setDiscountIdError('');
    } else {
      // Show discount ID field when selecting a discount type
      setDiscountType(type);
      setShowDiscountIdField(true);
      // Only apply discount if there's an existing discount ID
      if (discountId) {
        setDiscount(0.20);
      }
    }
    calculateTotalFee(selectedMedicines, selectedFee?.amount || 0);
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
      if (newDiscountId) {
        setDiscount(0.20);
      } else {
        setDiscount(0);
      }
      calculateTotalFee(selectedMedicines, selectedFee?.amount || 0);
    } catch (error) {
      console.error('Error updating discount ID:', error);
      setDiscountIdError(error.response?.data?.message || 'Invalid discount ID');
      setDiscount(0);
      calculateTotalFee(selectedMedicines, selectedFee?.amount || 0);
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
              <Typography>
                Service: {selectedAppointment.appointmentType}
              </Typography>
              <Typography>
                Status: {selectedAppointment.appointmentStatus}
              </Typography>
              <Typography>
                Current Fee: ₱{selectedAppointment.fee || 'Not set'}
              </Typography>
            </Paper>
          )}

          {/* Service Fee Selection */}
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Select Service Fee</InputLabel>
            <Select
              value={selectedFee || ''}
              onChange={(e) => handleFeeSelection(e.target.value)}
              label="Select Service Fee"
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
                .find(service => service.name === selectedAppointment.appointmentType)
                ?.fees.map((fee, index) => (
                  <MenuItem key={index} value={fee}>
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

          {/* Total Fee Display with Discountable Information */}
          <Paper sx={{ p: 2, mb: 2, bgcolor: 'primary.light', color: 'primary.contrastText' }}>
            <Typography variant="h6">
              Subtotal: ₱{selectedMedicines.reduce((sum, medicine) => 
                sum + (parseFloat(medicine.medicineAmount) || 0), 0) + (parseFloat(selectedFee?.amount) || 0)}
            </Typography>
            
            {discount > 0 && (
              <>
                <Typography variant="body2" sx={{ mt: 1 }}>
                  Discountable Items:
                </Typography>
                {selectedMedicines
                  .filter(medicine => medicine.isDiscountable || medicine.discountApplicable)
                  .map((medicine, index) => (
                    <Typography key={`${medicine.instanceId}-disc`} variant="body2" sx={{ ml: 2 }}>
                      {medicine.medicineName}: ₱{medicine.medicineAmount}
                    </Typography>
                  ))}
                {selectedFee?.discountApplicable && (
                  <Typography variant="body2" sx={{ ml: 2 }}>
                    Service Fee: ₱{selectedFee.amount}
                  </Typography>
                )}
                <Typography variant="body2" color="error" sx={{ mt: 1 }}>
                  {discountType} Discount (20%): -₱{(
                    (selectedMedicines
                      .filter(medicine => medicine.isDiscountable || medicine.discountApplicable)
                      .reduce((sum, medicine) => sum + (parseFloat(medicine.medicineAmount) || 0), 0) +
                    (selectedFee?.discountApplicable ? (parseFloat(selectedFee?.amount) || 0) : 0)) * 0.20
                  ).toFixed(2)}
                </Typography>
              </>
            )}

            <Typography variant="body2" sx={{ mt: 1 }}>
              Non-Discountable Items:
            </Typography>
            {selectedMedicines
              .filter(medicine => !(medicine.isDiscountable || medicine.discountApplicable))
              .map((medicine, index) => (
                <Typography key={`${medicine.instanceId}-non-disc`} variant="body2" sx={{ ml: 2 }}>
                  {medicine.medicineName}: ₱{medicine.medicineAmount}
                </Typography>
              ))}
            {selectedFee && !selectedFee.discountApplicable && (
              <Typography variant="body2" sx={{ ml: 2 }}>
                Service Fee: ₱{selectedFee.amount}
              </Typography>
            )}

            <Typography variant="h6" sx={{ mt: 2, fontWeight: 'bold' }}>
              Total Fee: ₱{totalFee.toFixed(2)}
            </Typography>
          </Paper>

          {/* Medicine Selection with Discountable Information */}
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Select Medicines</InputLabel>
            <p>{}</p>
            <Select
              multiple
              value={selectedMedicines}
              onChange={handleMedicineSelection}
              label="Select Medicines"
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selected.map((medicine) => (
                    <Chip
                      key={medicine.instanceId}
                      label={`${medicine.medicineName} - ₱${medicine.medicineAmount} ${!(medicine.isDiscountable || medicine.discountApplicable) ? '(Non-Discountable)' : ''}`}
                      onDelete={() => handleRemoveMedicine(medicine)}
                      onMouseDown={(event) => {
                        event.stopPropagation();
                      }}
                    />
                  ))}
                </Box>
              )}
            >
              {medicines.map((medicine) => (
                <MenuItem key={medicine._id} value={medicine}>
                  {medicine.medicineName} - ₱{medicine.medicineAmount}
                  {!(medicine.discountApplicable) && (
                    <Typography variant="caption" color="error" sx={{ ml: 1 }}>
                      (Non-Discountable)
                    </Typography>
                  )}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

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
