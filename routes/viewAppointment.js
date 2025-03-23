import express from 'express';
const router = express.Router();
import ViewAppointment from '../models/ViewAppointment.js'; // Correct path and extension

// Route to get all appointments
router.get('/ViewAppointment', async (req, res) => {
  try {
    const appointments = await ViewAppointment.find({});
    res.status(200).json(appointments);
    console.log("Fetched Appointments:", appointments);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch appointments' });
  }
});

// New route to update appointment status
router.post('/ViewAppointment/updateStatus', async (req, res) => {
  try {
    const { appointmentId, newStatus } = req.body;
    
    if (!appointmentId || !newStatus) {
      return res.status(400).json({ error: 'Appointment ID and new status are required' });
    }

    console.log(`Updating appointment ${appointmentId} to status: ${newStatus}`);

    const updatedAppointment = await ViewAppointment.findByIdAndUpdate(
      appointmentId,
      { $set: { appointmentStatus: newStatus } },
      { new: true, runValidators: true }
    );

    if (!updatedAppointment) {
      console.log(`Appointment not found: ${appointmentId}`);
      return res.status(404).json({ error: 'Appointment not found' });
    }

    console.log(`Appointment updated successfully:`, updatedAppointment);
    res.status(200).json(updatedAppointment);
  } catch (err) {
    console.error('Error updating appointment status:', err);
    res.status(500).json({ error: 'Failed to update appointment status', details: err.message });
  }
});

export default router; // Export the router using ES module syntax
