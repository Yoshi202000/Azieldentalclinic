import jwt from 'jsonwebtoken';
import express from 'express';

const router = express.Router();

// Verify token
router.get('/verify-token', (req, res) => {
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
                firstName: decoded.firstName, 
                lastName: decoded.lastName, 
                phoneNumber: decoded.phoneNumber, 
                email: decoded.email 
            },
            token
        });
    });
});

export default router;
