import express from 'express';
import Appointment from '../models/Appointment.js';

const router = express.Router();

router.put('/updateAppointment/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { appointmentType, appointmentDate, appointmentTimeFrom } = req.body;

    // Fetch the current appointment
    const currentAppointment = await Appointment.findById(id);

    if (!currentAppointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // Check if the date or time has changed
    const isRebooked = 
      currentAppointment.appointmentDate !== appointmentDate ||
      currentAppointment.appointmentTimeFrom !== appointmentTimeFrom;

    const updatedAppointment = await Appointment.findByIdAndUpdate(
      id,
      { 
        appointmentType, 
        appointmentDate, 
        appointmentTimeFrom,
        // Set status to 'Rebooked' if date or time has changed
        appointmentStatus: isRebooked ? 'Rebooked' : currentAppointment.appointmentStatus
      },
      { new: true }
    );

    res.json(updatedAppointment);
  } catch (error) {
    console.error('Error updating appointment:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
