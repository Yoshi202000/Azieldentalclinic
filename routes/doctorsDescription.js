import express from "express";
import User from '../models/User.js';
import { authenticateUser } from "./middleware/authMiddleware.js";

const router = express.Router();

// Update the route path
router.put('/update-doctor-information', authenticateUser, async (req, res) => {
    console.log('Route hit!'); // Debug log
    console.log('Request body:', req.body); // Debug log
    console.log('User ID from token:', req.userId); // Debug log
    
    const { doctorInformation } = req.body;
    const userId = req.userId;

    try {
        // Update doctor information including the new services
        const updateUser = await User.findByIdAndUpdate(
            userId,
            {
                $set: {
                    doctorGreeting: doctorInformation.doctorGreeting,
                    doctorDescription: doctorInformation.doctorDescription,
                    services: doctorInformation.services.map(service => ({ name: service }))
                }
            },
            { new: true } // Return the updated document
        );

        console.log('Updated user:', updateUser); // Debug log

        if (!updateUser) {
            return res.status(404).json({ message: 'User not found or failed to update.' });
        }

        res.status(200).json({
            message: 'Doctor Information Updated successfully',
            user: updateUser
        });
    } catch (error) {
        console.error('Error updating doctor information:', error);
        res.status(500).json({ message: 'An error occurred while updating the doctor information.' });
    }
});

export default router;
