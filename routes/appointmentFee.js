import express from 'express';
import jwt from 'jsonwebtoken';
import Appointment from '../models/Appointment.js';

const router = express.Router();

// Authentication middleware (same as in appointment.js)
const authenticateToken = (req, res, next) => {
  const tokenHeaderKey = 'authorization';
  const token = req.headers[tokenHeaderKey];

  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: 'Invalid token' });
    req.user = user;
    next();
  });
};

// Route to update appointment fee
router.put('/update-fee/:appointmentId', authenticateToken, async (req, res) => {
  const { appointmentId } = req.params;
  const { fee } = req.body;

  try {
    const appointment = await Appointment.findById(appointmentId);

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    appointment.fee = fee;
    const updatedAppointment = await appointment.save();

    res.status(200).json({
      message: 'Appointment fee updated successfully',
      appointment: updatedAppointment
    });
  } catch (error) {
    res.status(500).json({ message: 'Error updating appointment fee: ' + error.message });
  }
});

export default router;
