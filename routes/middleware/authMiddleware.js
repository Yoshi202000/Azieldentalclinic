import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config(); // Loads environment variables from .env file

// Middleware to authenticate user using JWT token
export const authenticateUser = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1]; // Extract token from header
    if (!token) {
        return res.status(401).json({ message: 'No token provided.' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(403).json({ message: 'Failed to authenticate token.' });
        }
        req.user = decoded; // Set the user information from the token
        next();
    });
};
