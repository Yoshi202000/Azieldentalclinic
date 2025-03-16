import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import User from '../models/User.js'; // Your User model
import crypto from 'crypto';

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

router.post('/signup', async (req, res) => {
    const { firstName, lastName, email, phoneNumber, password, clinic = 'both', role = 'patient', services = [], termsCondition } = req.body;

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

    if (termsCondition === false){
        console.error('please agree to terms and condition to create an account');
        return res.status(400).json({ message: 'terms and condition not agreed'});
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

        // Create new user
        const newUser = new User({
            firstName,
            lastName,
            email,
            phoneNumber,
            password: hashedPassword,
            emailVerified: false,
            role,
            clinic,
            services,
            termscondition: true,
        });

        await newUser.save();
        console.log('User registered successfully:', newUser.email);

        // Create a JWT token for email verification
        const token = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: '1d' });

        // Verification email content
        const verificationLink = `${process.env.FRONTEND_URL}/api/verify-email?token=${token}`;

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
        }

        res.status(201).json({ message: 'User registered. Please check your email for verification.' });
    } catch (error) {
        console.error('Error registering user:', error);
        res.status(500).json({ message: 'An error occurred while registering the user' });
    }
});

// Email verification route
router.get('/verify-email', async (req, res) => {
    const token = req.query.token;
    if (!token) {
        console.error('Token is missing in the request');
        return res.status(400).send('<h1>Token is required</h1>');
    }

    try {
        // Verify the token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const email = decoded.email;
        console.log('Decoded email from token:', email); // Log decoded email

        // Find the user with the decoded email
        const user = await User.findOne({ email });
        if (!user) {
            console.error('Verification error: User not found for email:', email);
            return res.status(404).send('<h1>User not found</h1>');
        }

        // Check if email is already verified
        if (user.emailVerified) {
            console.error('Verification error: Email already verified');
            return res.redirect('https://azieldentalclinic.xyz/login?status=already-verified');
        }

        // Mark the user's email as verified
        user.emailVerified = true;
        await user.save();

        console.log('Email verified successfully for user:', email);
        // Redirect to the success page in the frontend with a success status
        res.redirect('https://azieldentalclinic.xyz/login?status=success');
    } catch (error) {
        console.error('Email verification failed:', error);
        // Redirect to the frontend with an error status
        res.redirect('https://azieldentalclinic.xyz/login?status=invalid-token');
    }
});

// Function to generate random password
const generateRandomPassword = () => {
    // Ensure at least one of each required character type
    const upperCase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowerCase = 'abcdefghijklmnopqrstuvwxyz';
    const numbers = '0123456789';

    let password = '';
    
    // Add one of each required character type
    password += upperCase[Math.floor(Math.random() * upperCase.length)];
    password += lowerCase[Math.floor(Math.random() * lowerCase.length)];
    password += numbers[Math.floor(Math.random() * numbers.length)];

    // Fill the rest with random characters
    const allChars = upperCase + lowerCase + numbers;
    for(let i = password.length; i < 9; i++) {
        password += allChars[Math.floor(Math.random() * allChars.length)];
    }

    // Shuffle the password
    return password.split('').sort(() => Math.random() - 0.5).join('');
};

// Admin signup route
router.post('/admin-signup', async (req, res) => {
    const { firstName, lastName, email, phoneNumber, clinic, role } = req.body;

    try {
        // Basic validation
        if (!firstName || !lastName || !email || !phoneNumber || !clinic || !role) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        // Check if email already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'Email already in use' });
        }

        // Generate random password
        const randomPassword = generateRandomPassword();
        
        // Hash the password
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(randomPassword, saltRounds);

        // Create new user with email verified
        const newUser = new User({
            firstName,
            lastName,
            email,
            phoneNumber,
            password: hashedPassword,
            clinic,
            role,
            emailVerified: true, // Set email as verified
            termscondition: true,
        });

        await newUser.save();

        // Generate password reset token
        const resetToken = jwt.sign(
            { email, type: 'password-reset' },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        // Create password reset link using the VITE_BACKEND_URL from .env
        const resetLink = `http://localhost:5173//change-password?token=${resetToken}`;

        // Send email with password and reset link
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Your Account Details',
            html: `
                <h1>Welcome to Aziel Dental Clinic</h1>
                <p>Your account has been created successfully.</p>
                <p>Here are your temporary login credentials:</p>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Temporary Password:</strong> ${randomPassword}</p>
                <p>For security reasons, please change your password immediately by clicking the link below:</p>
                <a href="${resetLink}" style="
                    background-color: #4CAF50;
                    border: none;
                    color: white;
                    padding: 15px 32px;
                    text-align: center;
                    text-decoration: none;
                    display: inline-block;
                    font-size: 16px;
                    margin: 4px 2px;
                    cursor: pointer;
                    border-radius: 4px;
                ">Change Your Password</a>
                <p>This link will expire in 24 hours.</p>
                <p>If you didn't request this account, please ignore this email.</p>
                <p>Best regards,<br>Aziel Dental Clinic Team</p>
            `
        });

        res.status(201).json({
            message: 'Account created successfully. Login credentials sent to email.'
        });

    } catch (error) {
        console.error('Error in admin signup:', error);
        res.status(500).json({
            message: 'An error occurred while creating the account'
        });
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
