import express from 'express';
import User from '../models/User.js';
import jwt from 'jsonwebtoken';

const router = express.Router();

router.put('/updateAccount', async (req, res) => {
  console.log('Update account route accessed'); 
  try {
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

    const userId = decoded.id;
    const { firstName, lastName, email, phoneNumber, dob } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: { firstName, lastName, email, phoneNumber, dob } },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found.' });
    }

    res.status(200).json({ message: 'Profile updated successfully', user: updatedUser });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ message: 'An error occurred while updating the account.' });
  }
});

// Route for admin/superadmin to update a specific user by ID
router.put('/updateAccount/:userId', async (req, res) => {
  console.log('Update user account by ID route accessed');
  try {
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

    // Check if the user has admin or superadmin permissions
    if (decoded.role !== 'admin' && decoded.role !== 'superadmin') {
      return res.status(403).json({ message: 'You do not have permission to update this user.' });
    }

    const targetUserId = req.params.userId;
    const { firstName, lastName, phoneNumber, dob } = req.body;

    // Validate required fields
    if (!firstName || !lastName || !phoneNumber || !dob) {
      return res.status(400).json({ message: 'Missing required fields.' });
    }

    // Validate date format
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(dob)) {
      return res.status(400).json({ message: 'Invalid date format. Please use YYYY-MM-DD.' });
    }

    const updatedUser = await User.findByIdAndUpdate(
      targetUserId,
      { 
        $set: { 
          firstName, 
          lastName, 
          phoneNumber, 
          dob 
        } 
      },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found.' });
    }

    res.status(200).json({ 
      message: 'User profile updated successfully', 
      user: updatedUser 
    });
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({ message: 'An error occurred while updating the user account.' });
  }
});

export default router;
