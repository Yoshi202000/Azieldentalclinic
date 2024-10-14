import express from 'express';
import User from '../models/User.js';
import jwt from 'jsonwebtoken';

const router = express.Router();

router.put('/updateAccount', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1]; // Handle 'Bearer <token>' format
    if (!token) {
      return res.status(401).json({ message: 'Authorization token is required.' });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(401).json({ message: 'Invalid or expired token' });
    }

    const userId = decoded.id;
    const { firstName, lastName, email, phoneNumber, dob } = req.body;

    const result = await User.updateOne(
      { _id: userId },
      { $set: { firstName, lastName, email, phoneNumber, dob } }
    );

    if (result.modifiedCount === 0) {
      return res.status(404).json({ message: 'User not found or no changes made.' });
    }

    res.status(200).json({ message: 'Profile updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error updating profile', error });
  }
});


export default router;
