import express from 'express';
import bcrypt from 'bcryptjs';
import User from '../models/User.js'; // Assuming your User model is in the models folder

const router = express.Router();

// Handle signup
router.post('/signup', async (req, res) => {
    const { firstName, lastName, email, phoneNumber, password } = req.body;

    if (!firstName || !lastName || !email || !phoneNumber || !password) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    if (!/09\d{9}/.test(phoneNumber)) {
        return res.status(400).json({ message: 'Phone number must start with 09 and have 11 digits' });
    }

    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{7,}/.test(password)) {
        return res.status(400).json({ message: 'Password must have at least 7 characters, including one uppercase letter, one lowercase letter, and one number' });
    }

    if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email)) {
        return res.status(400).json({ message: 'Invalid email format' });
    }

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'Email already in use' });
        }

        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const newUser = new User({
            firstName,
            lastName,
            email,
            phoneNumber,
            password: hashedPassword,
        });

        await newUser.save();
        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        console.error('Error registering user:', error);
        res.status(500).json({ message: 'An error occurred while registering the user' });
    }
});

export default router;
