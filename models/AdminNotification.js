import mongoose from 'mongoose';

const adminNotificationSchema = new mongoose.Schema({
    appointmentId: mongoose.Schema.Types.ObjectId,
    userEmail: String,
    message: String,
    timestamp: { type: Date, default: Date.now },
    isRead: { type: Boolean, default: false }
});

const AdminNotification = mongoose.model('AdminNotification', adminNotificationSchema);

export default AdminNotification;
