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

export default router;
