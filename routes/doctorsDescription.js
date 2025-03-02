import express from "express";
import User from "../models/User.js";
import { authenticateUser } from "./middleware/authMiddleware.js";

const router = express.Router();

// Make sure express can handle JSON
router.use(express.json());
router.put('/update-doctor-information', authenticateUser, async (req, res) => {
    const { doctorInformation } = req.body;
    const userId = req.userId;
  
    try {
      // 1. Ensure user exists and is a doctor
      const user = await User.findById(userId);
      if (!user) return res.status(404).json({ message: 'User not found' });
      if (user.role !== 'doctor') {
        return res.status(403).json({ message: 'Only doctors can update this information' });
      }
  
      // 2. Clear all existing services
      user.services = [];
      await user.save();  // Now the user doc in MongoDB has zero services
  
      // 3. Add the new services + greeting/description
      user.doctorGreeting = doctorInformation.doctorGreeting;
      user.doctorDescription = doctorInformation.doctorDescription;
      user.services = doctorInformation.services.map(s => ({ name: s }));
  
      // 4. Save again with new data
      const updatedUser = await user.save();
  
      return res.status(200).json({
        message: 'Doctor information updated successfully',
        user: updatedUser
      });
    } catch (error) {
      console.error('Error updating doctor information:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
    
  });
  
  

export default router;
