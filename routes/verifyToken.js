import jwt from 'jsonwebtoken';
import express from 'express';

const router = express.Router();

// Verify token
router.get('/verify-token', (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({ message: 'Authorization header missing' });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
        return res.status(401).json({ message: 'No token provided' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).json({ message: 'Invalid token' });
        }
    
        res.status(200).json({ 
            user: { 
                firstName: decoded.firstName, 
                lastName: decoded.lastName, 
                phoneNumber: decoded.phoneNumber, 
                email: decoded.email 
            } 
        });
    });
});

export default router;
