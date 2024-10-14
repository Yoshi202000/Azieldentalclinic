import mongoose from 'mongoose';

// Define the schema for appointment data
const appointmentSchema = new mongoose.Schema({
    patientFirstName: { type: String, required: true },
    patientLastName: { type: String, required: true },
    patientEmail: { type: String, required: true },
    patientPhone: { type: String, required: true },
    patientDOB: { type: String, required: true },
    appointmentDate: { type: String, required: true },
    appointmentTimeFrom: { type: String, required: true },
    appointmentType: { type: String, required: true },
    appointmentStatus: { type: String, default: 'pending' },
}, { timestamps: true });

const Appointment = mongoose.model('Appointment', appointmentSchema);

export default Appointment;
