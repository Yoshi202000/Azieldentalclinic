import express from 'express';
import jwt from 'jsonwebtoken';
import Appointment from '../models/Appointment.js'; // Assuming your Appointment model is in the models folder
import AdminNotification from '../models/AdminNotification.js';
import PatientNotification from '../models/PatientNotification.js';
import nodemailer from 'nodemailer';
import User from '../models/User.js'; // Assuming your User model is in the models folder
import MonthlyReminder from '../models/MonthlyReminder.js';

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

// fetch user information with a role of doctor from mongodb 
router.get('/doctor-info', async (req, res) => {
  try {
    const doctors = await User.find(
      { role: 'doctor' }, 
      'firstName lastName email services clinic doctorGreeting doctorDescription doctorImage'
    );
    res.status(200).json({ doctors });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching doctor information' });
  }
});

// Function to send email notification
const sendEmailNotification = async (patientEmail, patientFirstName, patientLastName, appointmentDate, appointmentTimeFrom, bookedClinic, appointmentType) => {
  const mailOptions = {
    from: process.env.EMAIL_USER, // Sender email
    to: patientEmail, // Recipient email
    subject: 'Appointment Confirmation',
    text: `Dear ${patientFirstName} ${patientLastName},\n\nYour appointment for ${appointmentType} on ${appointmentDate} at ${appointmentTimeFrom} at ${bookedClinic} has been booked successfully.\n\nThank you!`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Email sent successfully to:', patientEmail);
  } catch (error) {
    console.error('Error sending email:', error);
  }
};

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
    bookedClinic,
    doctor,
  } = req.body;
  
  try {
    // Convert appointmentTimeFrom and appointmentType to arrays if they're not already
    const timeFromArray = Array.isArray(appointmentTimeFrom) ? appointmentTimeFrom : [appointmentTimeFrom];
    const typeArray = Array.isArray(appointmentType) ? appointmentType : [appointmentType];

    // Create new appointment
    const newAppointment = new Appointment({
      patientFirstName,
      patientLastName,
      patientEmail,
      patientPhone,
      patientDOB,
      appointmentDate,
      appointmentTimeFrom: timeFromArray,
      appointmentType: typeArray,
      bookedClinic,
      userId: req.user.userId,
      userEmail: req.user.email,
      appointmentStatus: 'pending',
      fee: null,
      doctor,
    });

    const savedAppointment = await newAppointment.save();

    // Calculate the date for the monthly reminder (1 month after appointment date)
    const appointmentDateObj = new Date(appointmentDate);
    const reminderDateObj = new Date(appointmentDateObj);
    reminderDateObj.setMonth(appointmentDateObj.getMonth() + 1);
    const monthlyReminderDate = reminderDateObj.toISOString().split('T')[0]; // Format as YYYY-MM-DD
    
    // Create a monthly reminder entry
    const newMonthlyReminder = new MonthlyReminder({
      monthlyPatientFirstName: patientFirstName,
      monthlyPatientLastName: patientLastName,
      monthlyPatientEmail: patientEmail,
      monthlyReminderDate: monthlyReminderDate, // Use the date that's 1 month after appointment
      monthlyAppointmentType: typeArray,
      monthlyBookedClinic: bookedClinic,
      userId: req.user.userId,
      userEmail: req.user.email,
    });

    await newMonthlyReminder.save();

    // Format time display for notifications - join array elements with commas
    const timeDisplay = timeFromArray.join(', ');
    const typeDisplay = typeArray.join(', ');

    const adminNotification = new AdminNotification({
      appointmentId: savedAppointment._id,
      userEmail: req.user.email,
      message: `New appointment booked by ${patientFirstName} ${patientLastName} (${req.user.email}) for ${appointmentDate} at ${timeDisplay} at ${bookedClinic}.`,
    });
    await adminNotification.save();

    const patientNotification = new PatientNotification({
      userId: req.user.userId,
      userEmail: req.user.email,
      appointmentId: savedAppointment._id,
      message: `Your appointment for ${typeDisplay} on ${appointmentDate} at ${timeDisplay} at ${bookedClinic} has been booked successfully.`,
    });
    await patientNotification.save();

    // Send email notification to the user
    await sendEmailNotification(
      patientEmail, 
      patientFirstName, 
      patientLastName, 
      appointmentDate, 
      timeDisplay, 
      bookedClinic, 
      typeDisplay
    );

    res.status(201).json({ 
      message: 'Appointment booked and email notification sent successfully!',
      appointmentId: savedAppointment._id
    });
  } catch (error) {
    console.error('Error booking appointment:', error);
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
