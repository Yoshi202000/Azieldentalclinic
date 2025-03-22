import mongoose from 'mongoose';

// Define the schema for monthly reminder data
const monthlyReminderSchema = new mongoose.Schema({
    monthlyPatientFirstName: { type: String, required: true },
    monthlyPatientLastName: { type: String, required: true },
    monthlyPatientEmail: { type: String, required: true },
    monthlyReminderDate: { type: String, required: true },
    monthlyAppointmentType: { type: [String], required: true },
    monthlyBookedClinic: { type: String, required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    userEmail: { type: String, required: true },
}, { timestamps: true });   

const MonthlyReminder = mongoose.model('MonthlyReminder', monthlyReminderSchema);

export default MonthlyReminder;
