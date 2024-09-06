import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import signupRoutes from './routes/signup.js';
import loginRoutes from './routes/login.js';
import verifyTokenRoutes from './routes/verifyToken.js';
import appointmentRoutes from './routes/appointment.js'; 
import './services/cronJobs.js';  // Ensure cron jobs are scheduled correctly
import { generateAndSaveAvailableAppointments } from './routes/appTime.js';

dotenv.config();  // Load environment variables

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log('Connected to MongoDB');

        // Generate available appointments at server startup
        generateAndSaveAvailableAppointments(); // Ensure this runs after MongoDB connection
    })
    .catch(err => console.error('Error connecting to MongoDB', err));

// Routes
app.use('/signup', signupRoutes);               // Add route prefix
app.use('/login', loginRoutes);                 // Add route prefix
app.use('/verify-token', verifyTokenRoutes);    // Add route prefix
app.use('/appointments', appointmentRoutes);    // Add route prefix

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
