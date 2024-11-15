import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config(); // Loads environment variables from .env file

// Middleware to authenticate user using JWT token
export const authenticateUser = (req, res, next) => {
    try {
        // Get the token from the Authorization header
        const authHeader = req.headers.authorization;
        const token = authHeader && authHeader.split(' ')[1]; // Extract the token after "Bearer "

        // Check if token exists
        if (!token) {
            return res.status(401).json({ message: 'Access denied. No token provided.' });
        }

        // Verify the token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.userId = decoded.userId; // Attach the userId from token payload to the request object

        // Proceed to the next middleware or route handler
        next();
    } catch (error) {
        console.error('Token verification failed:', error);
        return res.status(403).json({ message: 'Invalid or expired token.' });
    }
};
