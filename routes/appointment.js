import express from 'express';
import jwt from 'jsonwebtoken';
import Appointment from '../models/Appointment.js'; // Assuming your Appointment model is in the models folder
import AdminNotification from '../models/AdminNotification.js';
import PatientNotification from '../models/PatientNotification.js';

const router = express.Router();


const authenticateToken = (req, res, next) => {
  //const token = req.cookies.authToken; // Read token from cookies
  const tokenHeaderKey = 'authorization';

  const token = req.headers[tokenHeaderKey];

  //console.log(req);
  console.log(token);

  if (!token) {
      return res.status(401).json({ message: 'No token provided' });
  }

  jwt.verify(token, 'your_jwt_secret', (err, user) => {
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

  // Calculate fee based on appointment type
  let fee;
  if (appointmentType === 'Tooth Extractions') {
      fee = '1000';
  } else if (appointmentType === 'Dental Fillings') {
      fee = '1500';
  } else if (appointmentType === 'Braces & Orthodontics') {
      fee = '2000';
  } else {
      fee = '0'; // Default fee if appointmentType is not one of the specified types
  }

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
      userEmail: req.user.email, // Add this line to store the user's email
      appointmentStatus: 'pending',
      fee, // Include the calculated fee
    });

    const savedAppointment = await newAppointment.save();

    // Create admin notification
    const adminNotification = new AdminNotification({
      appointmentId: savedAppointment._id,
      userEmail: req.user.email, // Add this line to store the user's email
      message: `New appointment booked by ${patientFirstName} ${patientLastName} (${req.user.email}) for ${appointmentDate} at ${appointmentTimeFrom} for the clinic of ${bookedClinic}.`,
    });
    await adminNotification.save();

    // Create patient notification
    const patientNotification = new PatientNotification({
      userId: req.user.userId,
      userEmail: req.user.email, // Add this line to store the user's email
      appointmentId: savedAppointment._id,
      message: `Your appointment for ${appointmentType} on ${appointmentDate} at ${appointmentTimeFrom} for the clinic of ${bookedClinic} has been booked successfully.`,
    });
    await patientNotification.save();

    res.status(201).json({ message: 'Appointment booked successfully!' });
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
