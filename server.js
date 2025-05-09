import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import cookieParser from 'cookie-parser'; // Import cookie-parser
import fs from 'fs'; // Import file system to read SSL certificate files
import https from 'https'; // Import HTTPS module
import { WebSocketServer } from 'ws'; // Import WebSocket server

// Import routes    
import signupRoutes from './routes/signup.js';
import loginRoutes from './routes/login.js';
import verifyTokenRoutes from './routes/verifyToken.js';
import appointmentRoutes from './routes/appointment.js';
import logoutRoutes from './routes/logout.js'; // Import logout route
import ForgotRoutes from './routes/Forgotpass.js';
import userInformationRoutes from './routes/userInformation.js';
import ViewAppointmentRoutes from './routes/viewAppointment.js';
import updateAccountRoutes from './routes/updateAccount.js';
import updateAppointmentRoutes from './routes/updateAppointment.js';
import feedbackRoutes from './routes/feedback.js'; // Add this line
import viewFeedbackRoutes from './routes/viewFeedback.js';
import notificationRoutes from './routes/notificationRoutes.js'; // Add this line
import messageRoutes from './routes/message.js';  // Add this line
import updateUserRoutes from './routes/updateUserRole.js';
import unreadRoutes from './routes/unread.js';
import healthRecordRoutes from './routes/healthRecord.js';
import updateDoctorInformationRoutes from './routes/doctorsDescription.js';
import doctorSchedule from './routes/manageSchedule.js';
import appointmentFee from './routes/appointmentFee.js';

import DentalChartForm from './routes/DentalRecord.js';

import clinicRoutes from './routes/clinicRoutes.js';

import doctorsDescriptionRoutes from './routes/doctorsDescription.js';

// test routes
import MonthlyReminder from './routes/monthlyReminder.js';
import editInformation from './routes/editInformation.js';

import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
dotenv.config();

app.use('/uploads', express.static(path.resolve(__dirname, '../src/uploads')));


// Middleware
app.use(express.json());
// app.use(express.urlencoded({ extended: true }));
app.use(cookieParser()); // Use cookie-parser middleware

// CORS configuration
const allowedOrigins = [
    'https://azieldentalclinic.xyz',
    'https://www.azieldentalclinic.xyz',
    'https://localhost:5173',
    'https://213.190.4.136:5173',
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:5000', 
    'http://localhost:3000',
];

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no 'origin' (e.g., mobile apps or Postman)
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            console.log('Blocked by CORS:', origin);
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    credentials: true, // Allow credentials (e.g., cookies) to be passed
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('Connected to MongoDB server'))
    .catch(err => console.error('Error connecting to MongoDB', err));

// Routes
app.use('/api', signupRoutes);
app.use('/api', loginRoutes);
app.use('/api', verifyTokenRoutes);
app.use('/api', appointmentRoutes);
app.use('/api',logoutRoutes);
app.use('/api',ForgotRoutes);
app.use('/api',userInformationRoutes);
app.use('/api',ViewAppointmentRoutes);
app.use('/api', updateAccountRoutes); 
app.use('/api', updateAppointmentRoutes);
app.use('/api/feedback', feedbackRoutes); 
app.use('/api/feedback', viewFeedbackRoutes);
app.use('/api', notificationRoutes); 
app.use('/api', messageRoutes);  
app.use('/api', updateUserRoutes);
app.use('/api', unreadRoutes);
app.use('/api', healthRecordRoutes);
app.use('/api', doctorSchedule);
app.use('/api', doctorsDescriptionRoutes); 
app.use('/api', appointmentFee);
app.use('/api', clinicRoutes);
app.use('/api', DentalChartForm);

app.use('/api', MonthlyReminder);
app.use('/api', editInformation);

// Load SSL certificates for HTTPS
// const server = https.createServer({
//     key: fs.readFileSync(process.env.SSL_KEY_PATH),
//     cert: fs.readFileSync(process.env.SSL_CERT_PATH)
// }, app);

// Create the WebSocket server AFTER the HTTPS server has been initialized
// const wss = new WebSocketServer({ server });


// Handle WebSocket connections

// wss.on('connection', (ws) => {
//     console.log('New client connected');

//     ws.on('message', (message) => {
//         console.log(`Received: ${message}`);
//     });

//     ws.on('close', () => {
//         console.log('Client disconnected');
//     }); });


const PORT = process.env.PORT || 5000; // Change from 443 to 5000
// server.listen(PORT, () => {
    app.listen(PORT, () => {

  console.log(`Server is running securely on port ${PORT}`);
});

