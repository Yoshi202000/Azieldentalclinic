import express from "express";
import nodemailer from 'nodemailer';
import MonthlyReminder from '../models/MonthlyReminder.js';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();
let reminderCheckInitialized = false;

// Nodemailer setup
const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Send email
async function sendReminderEmail(reminder) {
  try {
    const {
      monthlyPatientFirstName,
      monthlyPatientLastName,
      monthlyPatientEmail,
      monthlyReminderDate,
      monthlyAppointmentType,
      monthlyBookedClinic
    } = reminder;

    const appointmentTypes = Array.isArray(monthlyAppointmentType)
      ? monthlyAppointmentType.join(', ')
      : monthlyAppointmentType;

    const formattedDate = new Date(monthlyReminderDate).toLocaleDateString();

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: monthlyPatientEmail,
      subject: 'Monthly Appointment Reminder',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; padding: 20px;">
          <h2 style="color: #4285f4; text-align: center;">Monthly Appointment Reminder</h2>
          <p>Dear ${monthlyPatientFirstName} ${monthlyPatientLastName},</p>
          <p>This is a friendly reminder that it's been a month since your last appointment for <strong>${appointmentTypes}</strong> at <strong>${monthlyBookedClinic}</strong>.</p>
          <div style="background-color: #f5f5f5; padding: 15px; margin: 20px 0;">
            <p><strong>Previous Appointment Date:</strong> ${formattedDate}</p>
            <p><strong>Services:</strong> ${appointmentTypes}</p>
            <p><strong>Clinic:</strong> ${monthlyBookedClinic}</p>
          </div>
          <p>To schedule your next appointment, please visit our website or call our office.</p>
          <p style="margin-top: 30px;">Thank you for choosing our services!</p>
          <p>Best regards,<br>The Healthcare Team</p>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`Reminder sent to ${monthlyPatientEmail} | Message ID: ${info.messageId}`);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
}

// Check and send today's reminders
async function checkAndSendReminders() {
    try {
      const now = new Date();
  
      const startOfDayUTC = new Date(Date.UTC(
        now.getUTCFullYear(),
        now.getUTCMonth(),
        now.getUTCDate()
      ));
  
      const endOfDayUTC = new Date(startOfDayUTC);
      endOfDayUTC.setUTCDate(endOfDayUTC.getUTCDate() + 1);
  
      // Convert start UTC to YYYY-MM-DD string to match your stored format
      const dateString = startOfDayUTC.toISOString().split('T')[0];
  
      const reminders = await MonthlyReminder.find({
        $or: [
          // For proper Date type fields
          {
            monthlyReminderDate: {
              $gte: startOfDayUTC,
              $lt: endOfDayUTC
            }
          },
          // For string-type fields (like "2025-04-24")
          {
            monthlyReminderDate: dateString
          }
        ]
      });
  
      console.log(`[${new Date().toISOString()}] Looking for reminders for ${dateString}`);
      console.log(`Found ${reminders.length} reminders.`);
  
      for (const reminder of reminders) {
        await sendReminderEmail(reminder);
      }
    } catch (err) {
      console.error('Reminder check failed:', err);
    }
  }
  
  
// Daily scheduler at specific time
function scheduleDailyCheck(hour = 9, minute = 0) {
  if (reminderCheckInitialized) return;

  console.log('Initializing reminder scheduler...');
  checkAndSendReminders(); // Run immediately

  setInterval(() => {
    const now = new Date();
    if (now.getHours() === hour && now.getMinutes() === minute) {
      console.log(`Scheduled reminder check at ${hour}:${minute}`);
      checkAndSendReminders();
    }
  }, 60 * 1000);

  reminderCheckInitialized = true;
}

scheduleDailyCheck(9, 0); // ⏰ Change to your preferred reminder time

// 🔧 One-time fix: Convert string to Date in DB
router.get("/convert-reminder-dates", async (req, res) => {
  try {
    const result = await MonthlyReminder.updateMany(
      { monthlyReminderDate: { $type: "string" } },
      [
        {
          $set: {
            monthlyReminderDate: { $toDate: "$monthlyReminderDate" }
          }
        }
      ]
    );

    res.status(200).json({
      message: "Converted string dates to Date objects",
      modifiedCount: result.modifiedCount
    });
  } catch (error) {
    res.status(500).json({ message: "Conversion failed", error: error.message });
  }
});

// 🔄 Manual trigger
router.get("/send-reminders", async (req, res) => {
  try {
    await checkAndSendReminders();
    res.status(200).json({ message: "Reminders sent manually." });
  } catch (error) {
    res.status(500).json({ message: "Manual reminder check failed.", error: error.message });
  }
});

// 📋 All reminders
router.get("/all", async (req, res) => {
  try {
    const reminders = await MonthlyReminder.find().sort({ createdAt: -1 });
    res.status(200).json(reminders);
  } catch (error) {
    res.status(500).json({ message: "Error fetching all reminders", error: error.message });
  }
});

router.get("/date/:date", async (req, res) => {
    try {
      const { date } = req.params;
  
      const targetDate = new Date(date);
      const nextDay = new Date(targetDate);
      nextDay.setDate(nextDay.getDate() + 1);
  
      const isoString = new Date(date).toISOString().split('T')[0];
  
      const reminders = await MonthlyReminder.find({
        $or: [
          {
            monthlyReminderDate: {
              $gte: targetDate,
              $lt: nextDay
            }
          },
          {
            monthlyReminderDate: isoString
          }
        ]
      });
  
      res.status(200).json(reminders);
    } catch (error) {
      res.status(500).json({ message: "Error fetching reminders by date", error: error.message });
    }
  });
  
  

export default router;
