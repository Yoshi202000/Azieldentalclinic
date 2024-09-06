import express from 'express';
import jwt from 'jsonwebtoken';
import Appointment from '../models/AppTime.js'; // Adjust the path as needed

const router = express.Router();

// Middleware to authenticate tokens
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ message: 'No token provided' });

    const token = authHeader.split(' ')[1];
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ message: 'Invalid token' });
        req.user = user;
        next();
    });
};

// Route to get available appointments
router.get('/', async (req, res) => {
    try {
        const appointments = await Appointment.find({});
        res.json(appointments);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching appointments' });
    }
});

// Route to book an appointment
router.post('/book', authenticateToken, async (req, res) => {
    const { appointmentDate, appointmentTime, appointmentType, patientDOB } = req.body;

    if (!appointmentDate || !appointmentTime || !appointmentType || !patientDOB) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    try {
        const appointment = await Appointment.findOne({ appointmentDate });
        
        if (!appointment) {
            return res.status(404).json({ message: 'Appointment date not found' });
        }

        if (appointment[appointmentTime]) {
            return res.status(400).json({ message: 'Appointment slot is already booked' });
        }

        appointment[appointmentTime] = 'Booked'; // Mark the slot as booked
        await appointment.save();

        // Optionally, save more details about the booking
        // (e.g., creating a new model for booking details)

        res.status(201).json({ message: 'Appointment booked successfully' });
    } catch (error) {
        console.error('Error booking appointment:', error);
        res.status(500).json({ message: 'Error booking appointment' });
    }
});

export default router;
