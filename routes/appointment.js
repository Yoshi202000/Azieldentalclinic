import express from 'express';
import jwt from 'jsonwebtoken';
import Appointment from '../models/Appointment.js'; // Assuming your Appointment model is in the models folder
import AdminNotification from '../models/AdminNotification.js';
import PatientNotification from '../models/PatientNotification.js';
import nodemailer from 'nodemailer';




const router = express.Router();

const transporter = nodemailer.createTransport({
  service: 'Gmail', // or another email service
  auth: {
    user: process.env.EMAIL_USER, // Your email
    pass: process.env.EMAIL_PASS, // Your email password or app password
  },
});

const authenticateToken = (req, res, next) => {
  //const token = req.cookies.authToken; // Read token from cookies
  const tokenHeaderKey = 'authorization';

  const token = req.headers[tokenHeaderKey];


  if (!token) {
      return res.status(401).json({ message: 'No token provided' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: 'Invalid token' });
      req.user = user;
      next();
  });
};

// Fetch appointments for the authenticated user
router.get('/appointments', authenticateToken, async (req, res) => {
    try {
      const appointments = await Appointment.find({ userId: req.user.userId });
      res.status(200).json({ appointments });
    } catch (error) {
      res.status(500).json({ message: 'Error fetching appointments' });
    }
  });
  

// Appointment booking route
router.post('/appointments', authenticateToken, async (req, res) => {
  const { 
    patientFirstName, 
    patientLastName, 
    patientEmail, 
    patientPhone, 
    patientDOB, 
    appointmentDate, 
    appointmentTimeFrom, 
    appointmentType, 
    bookedClinic 
  } = req.body;

  

  try {
    const newAppointment = new Appointment({
      patientFirstName,
      patientLastName,
      patientEmail,
      patientPhone,
      patientDOB,
      appointmentDate,
      appointmentTimeFrom,
      bookedClinic,
      appointmentType,
      userId: req.user.userId,
      userEmail: req.user.email,
      appointmentStatus: 'pending',
      fee: null,
    });

    const savedAppointment = await newAppointment.save();

    const adminNotification = new AdminNotification({
      appointmentId: savedAppointment._id,
      userEmail: req.user.email,
      message: `New appointment booked by ${patientFirstName} ${patientLastName} (${req.user.email}) for ${appointmentDate} at ${appointmentTimeFrom} at ${bookedClinic}.`,
    });
    await adminNotification.save();

    const patientNotification = new PatientNotification({
      userId: req.user.userId,
      userEmail: req.user.email,
      appointmentId: savedAppointment._id,
      message: `Your appointment for ${appointmentType} on ${appointmentDate} at ${appointmentTimeFrom} at ${bookedClinic} has been booked successfully.`,
    });
    await patientNotification.save();

    // if (appointmentType === 'Braces & Orthodontics') {
    //   const emailDetails = {
    //     to: patientEmail,
    //     subject: 'Appointment Confirmation: Braces & Orthodontics',
    //     text: `Dear ${patientFirstName} ${patientLastName}, your appointment for Braces & Orthodontics on ${appointmentDate} at ${appointmentTimeFrom} has been booked successfully.`,
    //   };

    //   // Schedule the email to be sent in 5 minutes (300,000 ms)
    //   const fiveMinuteDelay = 5 * 60 * 1000; // 5 minutes in milliseconds
    //   await emailQueue.add(emailDetails, { delay: fiveMinuteDelay });

    //   console.log('Email scheduled for:', patientEmail);
    // }

    res.status(201).json({ message: 'Appointment booked and email scheduled successfully!' });
  } catch (error) {
    res.status(500).json({ message: 'Error booking appointment: ' + error.message });
  }
});

// Add this new route to fetch all booked appointments
router.get('/booked-appointments', async (req, res) => {
  try {
    const bookedAppointments = await Appointment.find({}, 'appointmentDate appointmentTimeFrom');
    res.status(200).json({ bookedAppointments });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching booked appointments' });
  }
});


export default router;
