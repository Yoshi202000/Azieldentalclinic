import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import User from '../models/User.js'; // Your User model

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
        return res.status(400).json({ message: 'All fields are required' });
    }

    // Validate phone number
    if (!/09\d{9}/.test(phoneNumber)) {
        return res.status(400).json({ message: 'Phone number must start with 09 and have 11 digits' });
    }

    // Validate password strength
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{7,}/.test(password)) {
        return res.status(400).json({ message: 'Password must have at least 7 characters, including one uppercase letter, one lowercase letter, and one number' });
    }

    // Validate email format
    if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email)) {
        return res.status(400).json({ message: 'Invalid email format' });
    }

    try {
        // Check if email already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
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
            emailVerified: false, // Add a field to track if the email is verified
        });

        await newUser.save();

        // Create a JWT token for email verification
        const token = jwt.sign({ email }, 'yourSecretKey', { expiresIn: '1h' });

        // Verification email content
        const verificationLink = `http://localhost:5000/verify-email?token=${token}`;

        // Send verification email
        await transporter.sendMail({
            from: 'your-email@gmail.com',
            to: newUser.email,
            subject: 'Verify your email',
            text: `Click this link to verify your email: ${verificationLink}`,
        });

        res.status(201).json({ message: 'User registered. Please check your email for verification.' });
    } catch (error) {
        console.error('Error registering user:', error);
        res.status(500).json({ message: 'An error occurred while registering the user' });
    }
});

// Email verification route
// Email verification route
router.get('/verify-email', async (req, res) => {
    const token = req.query.token;

    try {
        const decoded = jwt.verify(token, 'yourSecretKey');
        const email = decoded.email;

        // Find the user by email and update the emailVerified field
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (user.emailVerified) {
            return res.status(400).json({ message: 'Email already verified.' });
        }

        user.emailVerified = true;
        await user.save();

        res.status(200).json({ message: 'Email verified successfully. You can now log in.' });
    } catch (error) {
        console.error('Email verification failed:', error);
        res.status(400).json({ message: 'Invalid or expired token.' });
    }
});


export default router;
