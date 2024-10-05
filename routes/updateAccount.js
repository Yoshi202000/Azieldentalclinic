import express from 'express';
import User from '../models/User.js'; // Ensure the correct path to your User model
import jwt from 'jsonwebtoken'; // Assuming you're using JWT for token handling

const router = express.Router();


router.put('/updateAccount', async (req, res) => {
  try {
    const token = req.headers.authorization;
    if (!token) {
      return res.status(401).json({ message: 'Authorization token is required.' });
    }

    // Decode the token to extract the userId
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // Use your JWT secret key
    const userId = decoded.id;

    const { firstName, lastName, email, phoneNumber, dob } = req.body;

    // Update the user in the database
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { firstName, lastName, email, phoneNumber, dob },
      { new: true } // Return updated user data
    );

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found.' });
    }

    res.status(200).json({ message: 'Profile updated successfully', user: updatedUser });
  } catch (error) {
    res.status(500).json({ message: 'Error updating profile', error });
  }
});


export default router;
