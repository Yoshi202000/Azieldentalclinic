import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import User from '../models/User.js'; // Your User model

dotenv.config(); // Load environment variables from .env

const router = express.Router();

// Configure Nodemailer transporter
const transporter = nodemailer.createTransport({
    service: 'Gmail', // You can use other services like SendGrid, Mailgun, etc.
    auth: {
        user: process.env.EMAIL_USER, // Use env vars for email and pass
        pass: process.env.EMAIL_PASS,// Your Gmail password or app-specific password
    },
});

// Handle signup
router.post('/signup', async (req, res) => {
    const { firstName, lastName, email, phoneNumber, password } = req.body;

    // Basic validation
    if (!firstName || !lastName || !email || !phoneNumber || !password) {
        console.error('Validation error: Missing required fields');
        return res.status(400).json({ message: 'All fields are required' });
    }

    // Validate phone number
    if (!/09\d{9}/.test(phoneNumber)) {
        console.error('Validation error: Invalid phone number format');
        return res.status(400).json({ message: 'Phone number must start with 09 and have 11 digits' });
    }

    // Validate password strength
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{7,}/.test(password)) {
        console.error('Validation error: Password does not meet strength requirements');
        return res.status(400).json({ message: 'Password must have at least 7 characters, including one uppercase letter, one lowercase letter, and one number' });
    }

    // Validate email format
    if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email)) {
        console.error('Validation error: Invalid email format');
        return res.status(400).json({ message: 'Invalid email format' });
    }

    try {
        // Check if email already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            console.error('Error: Email already in use');
            return res.status(400).json({ message: 'Email already in use' });
        }

        // Hash the password
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Create new user (email is not verified yet)
        const newUser = new User({
            firstName,
            lastName,
            email,
            phoneNumber,
            password: hashedPassword,
            emailVerified: false,
            role: 'patient', // Set the role to 'patient' for new signups
            clinic: 'both',
        });

        await newUser.save();
        console.log('User registered successfully:', newUser.email);

        // Create a JWT token for email verification
        const token = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: '30d' });

        // Verification email content
        const verificationLink = `http://213.190.4.136:5000/api/verify-email?token=${token}`;

        // Send verification email
        try {
            await transporter.sendMail({
                from: process.env.EMAIL_USER,
                to: email,
                subject: 'Verify your email',
                text: `Click this link to verify your email: ${verificationLink}`,
            });
            console.log('Verification email sent to:', newUser.email);
        } catch (emailError) {
            console.error('Failed to send verification email:', emailError);
            // Do not fail the registration if email sending fails
        }

        res.status(201).json({ message: 'User registered. Please check your email for verification.' });
    } catch (error) {
        console.error('Error registering user:', error);
        res.status(500).json({ message: 'An error occurred while registering the user' });
    }
});



// Add this route to handle sending verification code
router.post('/send-verification', async (req, res) => {
    const { email } = req.body;

    if (!email) {
        console.error('Validation error: Email is required');
        return res.status(400).json({ message: 'Email is required' });
    }
});


export default router;
