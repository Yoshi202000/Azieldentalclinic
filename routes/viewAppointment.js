import express from 'express';
const router = express.Router();
import ViewAppointment from '../models/ViewAppointment.js'; // Correct path and extension

// Route to get all appointments
router.get('/ViewAppointment', async (req, res) => {
  try {
    const appointments = await ViewAppointment.find({});
    res.status(200).json(appointments);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch appointments' });
  }
});

export default router; // Export the router using ES module syntax
