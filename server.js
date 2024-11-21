import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import fs from 'fs'; // Import file system to read SSL certificate files
import https from 'https'; // Import HTTPS module
import { WebSocketServer } from 'ws'; // Import WebSocket server

// Import routes
import signupRoutes from './routes/signup.js';
import loginRoutes from './routes/login.js';
import verifyTokenRoutes from './routes/verifyToken.js';
import appointmentRoutes from './routes/appointment.js';
import logoutRoutes from './routes/logout.js';
import ForgotRoutes from './routes/Forgotpass.js';
import userInformationRoutes from './routes/userInformation.js';
import ViewAppointmentRoutes from './routes/viewAppointment.js';
import updateAccountRoutes from './routes/updateAccount.js';
import updateAppointmentRoutes from './routes/updateAppointment.js';
import feedbackRoutes from './routes/feedback.js';
import viewFeedbackRoutes from './routes/viewFeedback.js';
import notificationRoutes from './routes/notificationRoutes.js';
import messageRoutes from './routes/message.js';
import updateUserRoutes from './routes/updateUserRole.js';
import unreadRoutes from './routes/unread.js';
import healthRecordRoutes from './routes/healthRecord.js';

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// CORS configuration
const allowedOrigins = [
    'https://azieldentalclinic.xyz',
    'http://localhost:5173',
    'http://213.190.4.136:5173',
    'http://213.190.4.136:5174',
];

app.use(cors({
    origin: function (origin, callback) {
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true
}));

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('Connected to MongoDB server'))
    .catch(err => console.error('Error connecting to MongoDB', err));

// Routes
app.use('/api', signupRoutes);
app.use(loginRoutes);
app.use('/', verifyTokenRoutes);
app.use(appointmentRoutes);
app.use(logoutRoutes);
app.use(ForgotRoutes);
app.use(userInformationRoutes);
app.use(ViewAppointmentRoutes);
app.use('/api', updateAccountRoutes);
app.use('/api', updateAppointmentRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/feedback', viewFeedbackRoutes);
app.use('/api', notificationRoutes);
app.use('/api', messageRoutes);
app.use('/api', updateUserRoutes);
app.use('/api', unreadRoutes);
app.use('/api', healthRecordRoutes);

// Load SSL certificates for HTTPS
const server = https.createServer({
    key: fs.readFileSync('/path/to/ssl-key.pem'),
    cert: fs.readFileSync('/path/to/ssl-cert.pem')
}, app);

// WebSocket Server
const wss = new WebSocketServer({ server });

// Handle WebSocket connections
wss.on('connection', (ws) => {
    console.log('New client connected');

    ws.on('message', (message) => {
        console.log(`Received: ${message}`);
    });

    ws.on('close', () => {
        console.log('Client disconnected');
    });
});

// Start HTTPS server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Server is running securely on port ${PORT}`);
});
