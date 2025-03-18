import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import dotenv from 'dotenv';

dotenv.config(); // Make sure this is at the top of your file.

const router = express.Router();

// Generate token function  
const generateToken = (user) => {
    const expiresIn = '1d'; // Set the token expiration time
    const expirationTime = Date.now() + (24 * 60 * 60 * 1000); // Expiration time in milliseconds (1 day)

    const token = jwt.sign(
      {
        userId: user._id, 
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phoneNumber: user.phoneNumber,
        role: user.role,
        clinic: user.clinic,
        doctorGreeting: user.doctorGreeting, // Updated here
        doctorDescription: user.doctorDescription, // Updated here
        services: user.services, 
        termscondition: user.termscondition,
        doctorImage: user.doctorImage
      },
      process.env.JWT_SECRET,
      { expiresIn }
    );

    console.log('Generated JWT token:', token);
    return { token, expirationTime };
};

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
        
        if (!user.emailVerified ) { //add this when deploy || !user.termscondition
            return res.status(400).json({ message: 'Please verify your email before logging in.' });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        // Use the generateToken function to create JWT
        const { token, expirationTime } = generateToken(user);
        
        // Set the token as an HTTP-only cookie
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'Strict',
            maxAge: 1 * 24 * 60 * 60 * 1000 // 1 day in milliseconds
        });

        // Send the token and expiration time in the response
        res.status(200).json({ 
            message: 'Login successful', 
            user: { 
                userId: user._id, 
                role: user.role,
                clinic: user.clinic,
                firstName: user.firstName,
                lastName: user.lastName,
                services: user.services,
                doctorGreeting: user.doctorGreeting, 
                doctorDescription: user.doctorDescription,
                doctorImage: user.doctorImage
                // emailVerified: user.emailVerified,
            },
            token: token, // Include the token in the response
            expirationTime: expirationTime // Include expiration time
        });        
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'An error occurred during login' });
    }
});


export default router;
