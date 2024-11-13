import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser'; // Import cookie-parser

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
import updateUserRoutes from './routes/updateUserRole.js'
import unreadRoutes from './routes/unread.js'

const app = express();
dotenv.config();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cookieParser()); // Use cookie-parser middleware

// CORS configuration
const allowedOrigins = ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175', 'http://localhost:5176'];
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
    .then(() => console.log('Connected to MongoDB server'))
    .catch(err => console.error('Error connecting to MongoDB', err));

    app.use(express.static(path.join(__dirname, 'public')));
// Routes
app.use('/api', signupRoutes);
app.use(loginRoutes);
app.use('/', verifyTokenRoutes);
app.use(appointmentRoutes);
app.use(logoutRoutes); // Add logout route
app.use(ForgotRoutes);
app.use(userInformationRoutes);
app.use(ViewAppointmentRoutes);
app.use('/api', updateAccountRoutes); // Mounting accountRoutes at the '/api' base path
app.use('/api', updateAppointmentRoutes);
app.use('/api/feedback', feedbackRoutes); // Add this line
app.use('/api/feedback', viewFeedbackRoutes);
app.use('/api', notificationRoutes); // Add this line
app.use('/api', messageRoutes);  // Add this line
app.use('/api', updateUserRoutes);
app.use('/api', unreadRoutes);

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});


// Start server
const PORT = process.env.PORT || 5000; 
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
