import Bull from 'bull';
import nodemailer from 'nodemailer';

// Create a Bull queue
const emailQueue = new Bull('emailQueue', { redis: { host: '127.0.0.1', port: 6379 } });


// Nodemailer transporter setup
const transporter = nodemailer.createTransport({
  service: 'Gmail', // Use Gmail or your preferred email service
  auth: {
    user: process.env.EMAIL_USER, // Email username
    pass: process.env.EMAIL_PASS, // Email password or app password
  },
});

// Process jobs in the queue
emailQueue.process(async (job) => {
  const { to, subject, text } = job.data;

  const mailOptions = { from: process.env.EMAIL_USER, to, subject, text };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Email sent to: ${to}`);
  } catch (error) {
    console.error('Error sending email:', error);
  }
});

export default emailQueue;
