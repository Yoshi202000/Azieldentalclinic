import express from 'express';
import User from '../models/UserInformation.js';

const router = express.Router();

// Get all users
router.get('/UserInformation', async (req, res) => {
  try {
    const users = await User.find({});
    res.status(200).json(users); 
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch user information' });
  }
});

router.put('/api/UserInformation/:doctorId/addService', async (req, res) => {
  try {
    const { doctorId } = req.params;
    const { services } = req.body;

    if (!doctorId || !services || !Array.isArray(services)) {
      return res.status(400).json({ error: 'Invalid request. Ensure doctorId and services are provided as an array.' });
    }

    const doctor = await User.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({ error: 'Doctor not found.' });
    }

    doctor.services = [...new Set([...doctor.services, ...services])]; // Ensure no duplicate services
    await doctor.save();

    res.status(200).json({ message: 'Services added successfully.', services: doctor.services });
  } catch (error) {
    console.error('Error adding services:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.get('/clinic/:clinicId/services', async (req, res) => {
  console.log("clinicId", req.params.clinicId);
  try {
    const { clinicId } = req.params;
    const clinic = await Clinic.findById(clinicId); // Replace with actual DB schema
    if (!clinic) {
      return res.status(404).json({ error: 'Clinic not found' });
    }
    res.status(200).json(clinic.services); // Assuming `services` is a field in the `Clinic` schema
  } catch (err) {
    console.error('Error fetching clinic services:', err);
    res.status(500).json({ error: 'Failed to fetch clinic services' });
  }
});

// Get user information by userId
router.get('/UserInformation/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.status(200).json({
      discountId: user.discountId,
      firstName: user.firstName,
      lastName: user.lastName
    });
  } catch (err) {
    console.error('Error fetching user information:', err);
    res.status(500).json({ error: 'Failed to fetch user information' });
  }
});

export default router;
