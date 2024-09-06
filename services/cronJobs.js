// services/cronJobs.js
import cron from 'node-cron';
import { generateAndSaveAvailableAppointments } from '../routes/appTime.js'; // Adjust path as needed

// Schedule the job to run every day at noon
cron.schedule('0 12 * * *', () => {
    console.log('Running daily appointment update...');
    generateAndSaveAvailableAppointments();
});
