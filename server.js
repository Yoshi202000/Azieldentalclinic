import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';

// Import routes    
import signupRoutes from './routes/signup.js';
import loginRoutes from './routes/login.js';
import verifyTokenRoutes from './routes/verifyToken.js';
import appointmentRoutes from './routes/appointment.js';
import appTime from './routes/appointment.js'; 

const app = express();
dotenv.config();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const allowedOrigins = ['http://localhost:5173', 'http://localhost:5174'];
app.use(cors({
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
}));


// MongoDB connection
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('Error connecting to MongoDB', err));

// Routes
app.use(signupRoutes);
app.use(loginRoutes);
app.use(verifyTokenRoutes);
app.use(appointmentRoutes);
app.use(appTime);

// Start server
const PORT = process.env.PORT;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
