import express from 'express';
import User from '../models/User.js';
import jwt from 'jsonwebtoken';

const router = express.Router();

// Middleware to authenticate user
const authenticateUser = (req, res, next) => {
  // Get token from headers
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: 'Authorization token is required.' });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id || decoded.userId;
    req.userRole = decoded.role;
    next();
  } catch (err) {
    console.error('JWT verification error:', err);
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

// Middleware to check admin, superadmin, or superAdmin permissions (more flexible matching)
const isAdminUser = (req, res, next) => {
  const adminRoles = ['admin', 'superadmin', 'superAdmin'];
  if (!adminRoles.includes(req.userRole)) {
    return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
  }
  next();
};

// Route to get all patients (protected, admin only)
router.get('/patients', authenticateUser, isAdminUser, async (req, res) => {
  try {
    const patients = await User.find({ role: 'patient' }).select('-password');
    res.status(200).json({
      success: true,
      count: patients.length,
      patients
    });
  } catch (error) {
    console.error('Error fetching patients:', error);
    res.status(500).json({ message: 'An error occurred while fetching patients.' });
  }
});

// Route to get patient by ID (protected, admin only)
router.get('/patient/:userId', authenticateUser, isAdminUser, async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'Patient not found' });
    }
    
    if (user.role !== 'patient') {
      return res.status(400).json({ message: 'User is not a patient' });
    }
    
    res.status(200).json({
      success: true,
      patient: user
    });
  } catch (error) {
    console.error('Error fetching patient:', error);
    res.status(500).json({ message: 'An error occurred while fetching patient information.' });
  }
});

// Route to update patient information (protected, admin only)
router.put('/patient/:userId', authenticateUser, isAdminUser, async (req, res) => {
  try {
    const { userId } = req.params;
    const { firstName, lastName, phoneNumber, dob } = req.body;
    
    // Validate required fields
    if (!firstName || !lastName || !phoneNumber || !dob) {
      return res.status(400).json({ message: 'Missing required fields.' });
    }
    
    // Find the patient
    const patient = await User.findById(userId);
    
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }
    
    if (patient.role !== 'patient') {
      return res.status(400).json({ message: 'User is not a patient' });
    }
    
    // Update patient information
    patient.firstName = firstName;
    patient.lastName = lastName;
    patient.phoneNumber = phoneNumber;
    patient.dob = dob;
    
    await patient.save();
    
    res.status(200).json({
      success: true,
      message: 'Patient information updated successfully',
      patient: {
        _id: patient._id,
        firstName: patient.firstName,
        lastName: patient.lastName,
        email: patient.email,
        phoneNumber: patient.phoneNumber,
        dob: patient.dob,
        role: patient.role
      }
    });
  } catch (error) {
    console.error('Error updating patient:', error);
    res.status(500).json({ message: 'An error occurred while updating patient information.' });
  }
});

// Route to get user for editing (protected, admin/superadmin only)
router.get('/edit-patient/:userId', authenticateUser, isAdminUser, async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.status(200).json(user);
  } catch (error) {
    console.error('Error fetching user for editing:', error);
    res.status(500).json({ message: 'An error occurred while fetching user information.' });
  }
});

export default router;
