import express from "express";
import User from '../models/User.js';
import { authenticateUser } from "./middleware/authMiddleware.js";
import jwt from 'jsonwebtoken';

const router = express.Router();

// Clear doctor services
router.put('/clear-doctor-services', authenticateUser, async (req, res) => {
    const userId = req.userId;

    try {
        // Clear the services array for the user
        const updateUser = await User.findByIdAndUpdate(
            userId,
            { services: [] }, // Set services to an empty array
            { new: true } // Return the updated document
        );

        if (!updateUser) {
            return res.status(404).json({ message: 'User not found or failed to update.' });
        }

        res.status(200).json({
            message: 'Services cleared successfully.',
            user: updateUser,
        });
    } catch (error) {
        console.error('Error clearing doctor services:', error.message || error);
        res.status(500).json({ message: 'An error occurred while clearing the doctor services.' });
    }
});

// update doctor services
router.put('/update-doctor-services', authenticateUser, async (req, res) => {
    const userId = req.userId;
    const { newServices } = req.body; // Expecting `newServices` to contain the updated services

    try {
        // Step 1: Clear the services array for the user
        const clearServices = await User.findByIdAndUpdate(
            userId,
            { services: [] }, // Clear the services array
            { new: true } // Return the updated document
        );

        if (!clearServices) {
            return res.status(404).json({ message: 'User not found or failed to clear services.' });
        }

        // Step 2: Update with the new services
        clearServices.services = newServices; // Assign the new services
        await clearServices.save(); // Save the changes

        res.status(200).json({
            message: 'Services updated successfully.',
            user: clearServices,
        });
    } catch (error) {
        console.error('Error updating doctor services:', error.message || error);
        res.status(500).json({ message: 'An error occurred while updating the doctor services.' });
    }
});

// Update doctor information
router.put('/update-doctor-information', authenticateUser, async (req, res) => {
    const { doctorInformation } = req.body;
    const userId = req.userId;

    try {
        if (!doctorInformation || !doctorInformation.doctorGreeting || !doctorInformation.doctorDescription) {
            return res.status(400).json({ message: 'Doctor greeting, description, and services are required.' });
        }
        if (!Array.isArray(doctorInformation.services)) {
            return res.status(400).json({ message: 'Services must be an array.' });
        }

        // Update doctor information in the database
        const updateUser = await User.findByIdAndUpdate(
            userId,
            {
                doctorGreeting: doctorInformation.doctorGreeting,
                doctorDescription: doctorInformation.doctorDescription,
                services: doctorInformation.services.map(service => ({ name: service })),
            },
            { new: true } // Return the updated document
        );

        if (!updateUser) {
            return res.status(404).json({ message: 'User not found or failed to update.' });
        }

        // Fallback for JWT secrets
        const jwtSecret = process.env.JWT_SECRET || 'default_secret';
        const jwtRefreshSecret = process.env.JWT_REFRESH_SECRET || 'default_refresh_secret';

        // Generate a new access token
        const newAccessToken = jwt.sign(
            {
                userId: updateUser._id,
                email: updateUser.email,
                firstName: updateUser.firstName,
                lastName: updateUser.lastName,
                phoneNumber: updateUser.phoneNumber,
                role: updateUser.role,
                clinic: updateUser.clinic,
                doctorGreeting: updateUser.doctorGreeting,
                doctorDescription: updateUser.doctorDescription,
                services: updateUser.services,
            },
            jwtSecret,
            { expiresIn: '1d' } // Token validity
        );

        // Generate a new refresh token
        const newRefreshToken = jwt.sign(
            { userId: updateUser._id },
            jwtRefreshSecret,
            { expiresIn: '1d' } // Long-lived refresh token
        );

        // Set tokens in cookies
        res.cookie('token', newAccessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'Strict',
            maxAge: 15 * 60 * 1000, // 15 minutes
        });
        res.cookie('refreshToken', newRefreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'Strict',
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });

        // Return response
        res.status(200).json({
            message: 'Doctor Information Updated successfully',
            user: updateUser,
            accessToken: newAccessToken,
            refreshToken: newRefreshToken,
        });
    } catch (error) {
        console.error('Error updating doctor information:', error.message || error);
        res.status(500).json({ message: 'An error occurred while updating the doctor information.' });
    }
});

// Fetch doctor information
router.get('/view-doctor-information', async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const viewDoctor = await User.find({ role: 'doctor' })
            .skip((page - 1) * limit)
            .limit(parseInt(limit));
        res.status(200).json(viewDoctor);
    } catch (error) {
        console.error('Error fetching doctor information:', error.message || error);
        res.status(500).json({ message: 'Error fetching doctor information' });
    }
});

export default router;
