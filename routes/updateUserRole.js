import express from 'express';
import User from '../models/User.js'; // Assuming you have a User model for MongoDB

const router = express.Router();

// Route to update user role
router.put('/updateUserRole/:userId', async (req, res) => {
  const { userId } = req.params;
  const { newRole, loggedInUserClinic } = req.body;

  try {
    // Find the user by ID
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Validate the new role
    if (!['admin', 'doctor', 'patient'].includes(newRole)) {
      return res.status(400).json({ error: 'Invalid role specified' });
    }

    // Update the user's role and clinic based on the new role
    user.role = newRole;
    
    // Set clinic based on role
    if (newRole === 'admin') {
      user.clinic = loggedInUserClinic; // Admin gets the same clinic as the logged-in user
    } else if (newRole === 'doctor') {
      user.clinic = loggedInUserClinic; // Doctor gets the same clinic as the logged-in user
    } else {
      user.clinic = 'both'; // Patient gets 'both' clinics
    }

    // Save the updated user
    await user.save();

    res.status(200).json({ 
      message: `User role updated to ${newRole} successfully`, 
      user 
    });
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

// Route for super admin to update user role and clinic
router.put('/superAdminUpdateRole/:userId', async (req, res) => {
  const { userId } = req.params;
  const { newRole, selectedClinic } = req.body;

  try {
    // Find the user by ID
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Validate the new role
    if (!['admin', 'doctor', 'patient'].includes(newRole)) {
      return res.status(400).json({ error: 'Invalid role specified' });
    }

    // Update the user's role
    user.role = newRole;
    
    // Set clinic based on role and selection
    user.clinic = newRole === 'patient' ? 'both' : selectedClinic;

    // Save the updated user
    await user.save();

    res.status(200).json({ 
      message: `User role updated to ${newRole} successfully`, 
      user 
    });
  } catch (error) {
    console.error('Error updating user role:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;