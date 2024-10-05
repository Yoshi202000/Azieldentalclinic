// userInformation.js (Backend route)
import express from 'express';
import User from '../models/UserInformation.js';

const router = express.Router();

// Get all users
router.get('/UserInformation', async (req, res) => {
  try {
    const users = await User.find({});
    res.status(200).json(users); // Ensure you're sending a JSON response with status 200
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch usersInformation' });
  }
});


export default router;
