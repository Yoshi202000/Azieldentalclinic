import express from 'express';
import bcrypt from 'bcrypt';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';  // Initialize dotenv to load environment variables
import User from '../models/User.js'; // Adjust the path if necessary


dotenv.config(); // Load environment variables from .env

const router = express.Router();

// Nodemailer email sending service
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER, // Use env vars for email and pass
    pass: process.env.EMAIL_PASS,
  },
});

// Store verification codes temporarily
const verificationCodes = new Map();


// Send verification code to the email
router.post('/api/send-code', async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });

  if (!user) {
    return res.status(400).json({ success: false, message: 'User not found' });
  }

  const code = Math.floor(1000 + Math.random() * 9000).toString(); // Generate 4-digit code
  console.log('Generated Code:', code);

  // Ensure email is always in lowercase
  const normalizedEmail = email.toLowerCase();
  verificationCodes.set(normalizedEmail, code); // Store the code using normalized email
  console.log('Stored Code for Email:', normalizedEmail, 'Code:', code); // Log both email and code

  // Send the email
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Password Reset Code',
    text: `Your password reset code is: ${code}`,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error('Error sending email:', error);
      return res.status(500).json({ success: false, message: 'Error sending email' });
    }
    console.log('Email sent:', info.response);
    res.json({ success: true });
  });
});

// Verify code
router.post('/api/verify-code', async (req, res) => {
  const { email, code } = req.body;
  const storedCode = verificationCodes.get(email.toLowerCase()); // Convert email to lowercase here

  if (!storedCode || storedCode !== code) {
    return res.status(400).json({ success: false, message: 'Invalid or expired code' });
  }

  // Remove the code after successful verification
  verificationCodes.delete(email.toLowerCase()); // Convert email to lowercase here as well

  res.json({ success: true });
});

  

// Change password
router.post('/api/change-password', async (req, res) => {
  const { email, newPassword, code } = req.body;

  const normalizedEmail = email.toLowerCase(); // Normalize email before looking it up
  console.log('Received email:', normalizedEmail); // Log the normalized email
  console.log('Entered code:', code);
  console.log({ email, newPassword, code: enteredCode });

 
 
  const storedCode = verificationCodes.get(normalizedEmail); 
  console.log('Stored code:', storedCode); // Log the stored code (this was undefined before)
if (!storedCode || storedCode !== code) {
  console.log('Codes do not match:', storedCode, code);
  console.log({ email, newPassword, code: enteredCode });
  return res.status(400).json({ success: false, message: 'Invalid code' });
}


try {
  const hashedPassword = await bcrypt.hash(newPassword, 10);
  await User.updateOne({ email: normalizedEmail }, { password: hashedPassword });
  verificationCodes.delete(normalizedEmail);
  res.json({ success: true });
} catch (error) {
  console.error('Error updating password:', error);
  res.status(500).json({ success: false, message: 'Error changing password' });
}


  verificationCodes.delete(normalizedEmail); // Ensure consistency in email case
  res.json({ success: true });
});


  
  

export default router;
