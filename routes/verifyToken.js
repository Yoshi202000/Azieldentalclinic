import jwt from 'jsonwebtoken';
import express from 'express';

const router = express.Router();

// Verify token
router.get('/verify-token', (req, res) => {
    // Try to get token from cookies first
    let token = req.cookies.token;
    
    // If no token in cookies, try to get it from Authorization header
    if (!token) {
        const authHeader = req.headers.authorization || req.headers.Authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            token = authHeader.substring(7);
        }
    }
    
    if (!token) {
        console.log('No token provided in cookies or headers');
        return res.status(401).json({ message: 'No token provided' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Format the DOB if it exists
        const formattedDOB = decoded.dob ? new Date(decoded.dob).toISOString().split('T')[0] : null;
        
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
                dob: formattedDOB,
                doctorImage: decoded.doctorImage
            },
            token
        });
    } catch (err) {
        console.log('Token verification failed:', err.message);
        return res.status(401).json({ message: 'Invalid token' });
    }
});

// Edit user details
router.put('/api/edit-user', async (req, res) => {
    // Try to get token from cookies first
    let token = req.cookies.token;
    
    // If no token in cookies, try to get it from Authorization header
    if (!token) {
        const authHeader = req.headers.authorization || req.headers.Authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            token = authHeader.substring(7);
        }
    }
    
    if (!token) {
        console.log('No token provided in cookies or headers');
        return res.status(401).json({ message: 'No token provided' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const { firstName, lastName, phoneNumber, greetings, description, services, dob } = req.body;

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
                dob,
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
                dob: updatedUser.dob,
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
                dob: updatedUser.dob,
            },
            token: newToken,
        });
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({ message: 'An error occurred while updating user information.' });
    }
});

export default router;
