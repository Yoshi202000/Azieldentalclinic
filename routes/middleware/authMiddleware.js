import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config(); // Loads environment variables from .env file

// Middleware to authenticate user using JWT token
export const authenticateUser = async (req, res, next) => {
    try {
        // Get token from header
        const authHeader = req.headers.authorization;
        console.log('Auth header:', authHeader); // Debug log

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ message: 'No token provided or invalid format' });
        }

        // Extract token (remove 'Bearer ' prefix)
        const token = authHeader.split(' ')[1];
        console.log('Extracted token:', token); // Debug log

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log('Decoded token:', decoded); // Debug log

        // Set user ID in request object
        req.userId = decoded.userId;
        console.log('Set userId:', req.userId); // Debug log

        next();
    } catch (error) {
        console.error('Authentication error:', error);
        return res.status(401).json({ message: 'Invalid or expired token' });
    }
};
