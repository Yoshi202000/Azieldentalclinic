import jwt from 'jsonwebtoken';
import express from 'express';

const router = express.Router();

// Verify token
router.get('/api/verify-token', (req, res) => {
    const token = req.cookies.token; // Read the token from cookies
    if (!token) {
        return res.status(401).json({ message: 'No token provided' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).json({ message: 'Invalid token' });
        }
    
        res.status(200).json({ 
            user: { 
                userId: decoded.userId,
                firstName: decoded.firstName, 
                lastName: decoded.lastName, 
                phoneNumber: decoded.phoneNumber, 
                email: decoded.email, 
                role: decoded.role, 
                clinic: decoded.clinic,
                greetings: decoded.doctorGreeting,
                description: decoded.doctorDescription,
                services: decoded.services,
                doctorImage: decoded.doctorImage
            },
            token
        });
    });
});

// Edit user details
router.put('/api/edit-user', async (req, res) => {
    const token = req.cookies.token; // Read the token from cookies
    if (!token) {
        return res.status(401).json({ message: 'No token provided' });
    }

    jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
        if (err) {
            return res.status(401).json({ message: 'Invalid token' });
        }

        const { firstName, lastName, phoneNumber, greetings, description, services } = req.body;

        try {
            // Find and update the user
            const updatedUser = await User.findByIdAndUpdate(
                decoded.userId, // Use the userId from the token
                {
                    userId: decoded.userId,
                    firstName,
                    lastName,
                    phoneNumber,
                    doctorGreeting: greetings,
                    doctorDescription: description,
                    services: services.map(service => ({ name: service })), // Ensure services format matches schema
                },
                { new: true } // Return the updated user
            );

            if (!updatedUser) {
                return res.status(404).json({ message: 'User not found' });
            }

            // Generate a new token with updated data
            const newToken = jwt.sign(
                {
                    userId: updatedUser._id,
                    email: updatedUser.email,
                    firstName: updatedUser.firstName,
                    lastName: updatedUser.lastName,
                    phoneNumber: updatedUser.phoneNumber,
                    role: updatedUser.role,
                    clinic: updatedUser.clinic,
                    doctorGreeting: updatedUser.doctorGreeting,
                    doctorDescription: updatedUser.doctorDescription,
                    services: updatedUser.services,
                },
                process.env.JWT_SECRET,
                { expiresIn: '1d' }
            );

            // Update the token in cookies
            res.cookie('token', newToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'Strict',
                maxAge: 1 * 24 * 60 * 60 * 1000, // 1 days in milliseconds
            });

            res.status(200).json({
                message: 'User updated successfully',
                user: {
                    userId: updatedUser._id,
                    firstName: updatedUser.firstName,
                    lastName: updatedUser.lastName,
                    phoneNumber: updatedUser.phoneNumber,
                    greetings: updatedUser.doctorGreeting,
                    description: updatedUser.doctorDescription,
                    services: updatedUser.services,
                },
                token: newToken,
            });
        } catch (error) {
            console.error('Error updating user:', error);
            res.status(500).json({ message: 'An error occurred while updating user information.' });
        }
    });
});

export default router;
