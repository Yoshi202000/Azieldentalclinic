import express from 'express';
const router = express.Router();
import ViewAppointment from '../models/ViewAppointment.js'; // Correct path and extension

// Variable to track initialization
let statusCheckerInitialized = false;

// Function to check and update appointment statuses to "no show"
async function checkAndUpdateNoShowAppointments() {
  try {
    const currentDate = new Date();
    const threeDaysAgo = new Date(currentDate);
    threeDaysAgo.setDate(currentDate.getDate() - 3);
    
    // Format as YYYY-MM-DD for string comparison
    const threeDaysAgoFormatted = threeDaysAgo.toISOString().split('T')[0];
    
    console.log(`[${new Date().toISOString()}] Checking for appointments older than ${threeDaysAgoFormatted} to mark as no-show`);
    
    // First, let's get a count of pending/approved appointments older than 3 days
    const pendingAppointments = await ViewAppointment.find({
      appointmentDate: { $lt: threeDaysAgoFormatted },
      appointmentStatus: { $in: ['pending', 'Approved'] }
    });
    
    console.log(`Found ${pendingAppointments.length} old appointments with pending/Approved status`);
    
    // Find appointments that are older than 3 days and still have pending or Approved status
    // Note the capital A in "Approved" to match the enum in the schema
    const result = await ViewAppointment.updateMany(
      {
        appointmentDate: { $lt: threeDaysAgoFormatted },
        appointmentStatus: { $in: ['pending', 'Approved'] }
      },
      {
        $set: { appointmentStatus: 'no show' }
      }
    );

    console.log(`Updated ${result.modifiedCount} appointments to "no show" status`);
    
    // If we didn't update any, log some debug info about a few old appointments
    if (result.modifiedCount === 0 && pendingAppointments.length > 0) {
      console.log('Sample of appointments that should have been updated:');
      pendingAppointments.slice(0, 3).forEach(app => {
        console.log(`ID: ${app._id}, Date: ${app.appointmentDate}, Status: ${app.appointmentStatus}`);
      });
    }
  } catch (err) {
    console.error('Error updating appointment statuses:', err);
  }
}

// Schedule the status checker to run periodically
function scheduleStatusChecker(hour = 0, minute = 0) {
  if (statusCheckerInitialized) return;

  console.log('Initializing appointment status checker...');
  
  // Run immediately on startup
  checkAndUpdateNoShowAppointments();

  // Then run every hour
  setInterval(() => {
    checkAndUpdateNoShowAppointments();
  }, 60 * 60 * 1000); // Check every hour

  statusCheckerInitialized = true;
}

// Initialize the status checker when this module loads
scheduleStatusChecker();

// Route to get all appointments
router.get('/ViewAppointment', async (req, res) => {
  try {
    const appointments = await ViewAppointment.find({});
    res.status(200).json(appointments);
    console.log("Fetched Appointments:", appointments);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch appointments' });
  }
});

// New route to update appointment status
router.post('/ViewAppointment/updateStatus', async (req, res) => {
  try {
    const { appointmentId, newStatus } = req.body;
    
    if (!appointmentId || !newStatus) {
      return res.status(400).json({ error: 'Appointment ID and new status are required' });
    }

    console.log(`Updating appointment ${appointmentId} to status: ${newStatus}`);

    const updatedAppointment = await ViewAppointment.findByIdAndUpdate(
      appointmentId,
      { $set: { appointmentStatus: newStatus } },
      { new: true, runValidators: true }
    );

    if (!updatedAppointment) {
      console.log(`Appointment not found: ${appointmentId}`);
      return res.status(404).json({ error: 'Appointment not found' });
    }

    console.log(`Appointment updated successfully:`, updatedAppointment);
    res.status(200).json(updatedAppointment);
  } catch (err) {
    console.error('Error updating appointment status:', err);
    res.status(500).json({ error: 'Failed to update appointment status', details: err.message });
  }
});

// Manual trigger for status update (for testing)
router.get('/ViewAppointment/checkNoShow', async (req, res) => {
  try {
    await checkAndUpdateNoShowAppointments();
    res.status(200).json({ message: 'No-show check completed successfully' });
  } catch (err) {
    console.error('Error during manual no-show check:', err);
    res.status(500).json({ error: 'Failed to perform no-show check', details: err.message });
  }
});

export default router; // Export the router using ES module syntax
