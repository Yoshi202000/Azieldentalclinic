import express from 'express';
import jwt from 'jsonwebtoken';
import Appointment from '../models/Appointment.js'; // Assuming your Appointment model is in the models folder

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
    const { patientFirstName, patientLastName, patientEmail, patientPhone, patientDOB, appointmentDate, appointmentTimeFrom, appointmentType } = req.body;
  
    try {
      const newAppointment = new Appointment({
        patientFirstName,
        patientLastName,
        patientEmail,
        patientPhone,
        patientDOB,
        appointmentDate,
        appointmentTimeFrom,
        appointmentType,
        userId: req.user.userId, 
        appointmentStatus: 'pending' 
      });
  
      await newAppointment.save();
      res.status(201).json({ message: 'Appointment booked successfully!' });
    } catch (error) {
      res.status(500).json({ message: 'Error booking appointment: ' + error.message });
    }
  });


export default router;
