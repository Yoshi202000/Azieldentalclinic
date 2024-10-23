import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const router = express.Router();

// Handle login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
    }

    try {
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }
        
        if (!user.emailVerified) {
            return res.status(400).json({ message: 'Please verify your email before logging in.' });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        const token = jwt.sign(
            { userId: user._id, firstName: user.firstName, lastName: user.lastName, phoneNumber: user.phoneNumber, email: user.email },
            process.env.JWT_SECRET || 'your_jwt_secret',
            { expiresIn: '30d' }
        );
        
        // Set the token in a cookie
        res.cookie('token', token, {
            httpOnly: true, // prevents JavaScript access to the cookie (for security)
            secure: process.env.NODE_ENV === 'production', // set true in production to ensure HTTPS
            sameSite: 'Strict', // to prevent CSRF attacks
            maxAge: 3600000 // 1 hour
        });

        res.status(200).json({ message: 'success' ,token});
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'An error occurred during login' });
    }
});

export default router;
