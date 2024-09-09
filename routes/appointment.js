import express from 'express';
import jwt from 'jsonwebtoken';
import Appointment from '../models/Appointment.js'; // Assuming your Appointment model is in the models folder

const router = express.Router();

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ message: 'No token provided' });

    const token = authHeader.split(' ')[1];
    jwt.verify(token, 'your_jwt_secret', (err, user) => {
        if (err) return res.status(403).json({ message: 'Invalid token' });
        req.user = user;
        next();
    });
};

// Appointment booking route
router.post('/appointments', authenticateToken, async (req, res) => {
    const { appointmentType, appointmentDate, appointmentTimeFrom, appointmentTimeTo, patientDOB } = req.body;

    if (!appointmentType || !appointmentDate || !appointmentTimeFrom || !appointmentTimeTo || !patientDOB) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    try {
        const newAppointment = new Appointment({
            userId: req.user.userId,
            appointmentType,
            appointmentDate,
            appointmentTimeFrom,
            appointmentTimeTo,
            patientFirstName: req.user.firstName,
            patientLastName: req.user.lastName,
            patientEmail: req.user.email,
            patientPhone: req.user.phoneNumber,
            patientDOB
        });

        await newAppointment.save();
        res.status(201).json({ message: 'Appointment booked successfully' });
    } catch (error) {
        console.error('Error booking appointment:', error);
        res.status(500).json({ message: 'Error booking appointment' });
    }
});

export default router;
