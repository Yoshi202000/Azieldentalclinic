import express from 'express';
import User from '../models/User.js';
import jwt from 'jsonwebtoken';

const router = express.Router();

// Get all user information (for admin use)
router.get('/UserInformation', async (req, res) => {
  try {
    // Fetch all users
    const users = await User.find().select('-password -emailVerified -services'); // Exclude sensitive information
    res.status(200).json(users);
  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).json({ error: 'Failed to fetch users' });
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

// Get detailed user information by userId (protected, requires authentication)
router.get('/userInformation/:userId', async (req, res) => {
  try {
    // Verify token
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Authorization token is required.' });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      console.error('JWT verification error:', err);
      return res.status(401).json({ message: 'Invalid or expired token' });
    }

    // Check if the user has permission (admin/superadmin or requesting their own info)
    const requestedUserId = req.params.userId;
    const requestingUserId = decoded.id || decoded.userId;
    const userRole = decoded.role;

    if (requestingUserId !== requestedUserId && userRole !== 'admin' && userRole !== 'superadmin' && userRole !== 'doctor') {
      return res.status(403).json({ message: 'You do not have permission to access this information.' });
    }

    // Fetch user information
    const user = await User.findById(requestedUserId).select('-password');
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Return user information
    res.status(200).json({
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phoneNumber: user.phoneNumber,
      dob: user.dob,
      role: user.role,
      clinic: user.clinic,
      discountId: user.discountId,
      emailVerified: user.emailVerified,
      // Include health record questions for patients
      ...(user.role === 'patient' && {
        questionOne: user.questionOne,
        questionTwo: user.questionTwo,
        questionThree: user.questionThree,
        questionFour: user.questionFour,
        questionFive: user.questionFive,
        questionSix: user.questionSix,
        questionSeven: user.questionSeven,
        questionEight: user.questionEight,
        questionNine: user.questionNine,
        questionTen: user.questionTen
      })
    });
  } catch (err) {
    console.error('Error fetching detailed user information:', err);
    res.status(500).json({ error: 'Failed to fetch user information' });
  }
});

export default router;
