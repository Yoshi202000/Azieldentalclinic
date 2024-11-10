import express from 'express';
import User from '../models/User.js'; // Assuming you have a User model for MongoDB

const router = express.Router();

// Route to update user role to admin and set clinic to the same as logged-in user's clinic
router.put('/updateUserRole/:userId', async (req, res) => {
  const { userId } = req.params;
  const loggedInUserClinic = req.body.loggedInUserClinic;

  try {
    // Find the user by ID
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Update the user's role to 'admin' and set the clinic to the same as logged-in user's clinic
    user.role = 'admin';
    user.clinic = loggedInUserClinic;

    // Save the updated user
    await user.save();

    res.status(200).json({ message: 'User role updated to admin successfully', user });
  } catch (error) {
    console.error('Error updating user role:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Route to update user role back from admin to patient and set clinic to 'both'
router.put('/revertUserRole/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
    // Find the user by ID
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Update the user's role to 'patient' and set the clinic to 'both'
    user.role = 'patient';
    user.clinic = 'both';

    // Save the updated user
    await user.save();

    res.status(200).json({ message: 'User role reverted to patient successfully', user });
  } catch (error) {
    console.error('Error reverting user role:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;