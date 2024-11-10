import express from 'express';
import mongoose from 'mongoose';

const router = express.Router();

// Define the schemas
const AdminNotificationSchema = new mongoose.Schema({
  message: String,
  createdAt: { type: Date, default: Date.now },
  isRead: { type: Boolean, default: false }
});

const PatientNotificationSchema = new mongoose.Schema({
  message: String,
  createdAt: { type: Date, default: Date.now },
  isRead: { type: Boolean, default: false }
});

// Check if models already exist, if not, create them
const AdminNotification = mongoose.models.AdminNotification || mongoose.model('AdminNotification', AdminNotificationSchema);
const PatientNotification = mongoose.models.PatientNotification || mongoose.model('PatientNotification', PatientNotificationSchema);

// Route to fetch admin notifications
router.get('/admin-notifications', async (req, res) => {
  try {
    const adminNotifications = await AdminNotification.find()
      .sort({ createdAt: -1 })
      .limit(50);
    res.json(adminNotifications);
  } catch (error) {
    console.error('Error fetching admin notifications:', error);
    res.status(500).json({ message: 'Error fetching admin notifications', error: error.message });
  }
});

// Route to fetch patient notifications
router.get('/patient-notifications', async (req, res) => {
  try {
    const patientNotifications = await PatientNotification.find()
      .sort({ createdAt: -1 })
      .limit(50);
    res.json(patientNotifications);
  } catch (error) {
    console.error('Error fetching patient notifications:', error);
    res.status(500).json({ message: 'Error fetching patient notifications', error: error.message });
  }
});

// Route to mark a notification as read
router.post('/mark-notification-read', async (req, res) => {
  const { notificationId, notificationType } = req.body;

  try {
    let notification;
    if (notificationType === 'admin') {
      notification = await AdminNotification.findByIdAndUpdate(
        notificationId,
        { isRead: true },
        { new: true }
      );
    } else if (notificationType === 'patient') {
      notification = await PatientNotification.findByIdAndUpdate(
        notificationId,
        { isRead: true },
        { new: true }
      );
    } else {
      return res.status(400).json({ message: 'Invalid notification type' });
    }

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    res.json({ message: 'Notification marked as read', notification });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ message: 'Error marking notification as read', error: error.message });
  }
});

// Route to delete a notification
router.delete('/delete-notification/:notificationId', async (req, res) => {
  const { notificationId } = req.params;

  try {
    // Attempt to delete from both collections
    let notification = await AdminNotification.findByIdAndDelete(notificationId);
    if (!notification) {
      notification = await PatientNotification.findByIdAndDelete(notificationId);
    }

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    res.json({ message: 'Notification deleted successfully' });
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({ message: 'Error deleting notification', error: error.message });
  }
});

export default router;
