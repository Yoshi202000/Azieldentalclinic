import mongoose from 'mongoose';

const patientNotificationSchema = new mongoose.Schema({
    userId: mongoose.Schema.Types.ObjectId,
    userEmail: String,
    appointmentId: mongoose.Schema.Types.ObjectId,
    message: String,
    timestamp: { type: Date, default: Date.now },
    isRead: { type: Boolean, default: false }
});

const PatientNotification = mongoose.model('PatientNotification', patientNotificationSchema);

export default PatientNotification;
