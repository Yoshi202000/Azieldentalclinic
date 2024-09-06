import mongoose from 'mongoose';

// Define the schema for appointment data
const appointmentSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'UserInformation', required: true }, // Reference to the user
    appointmentType: { type: String, required: true },
    appointmentDate: { type: String, required: true },
    appointmentTime: { type: String, required: true },
    patientFirstName: { type: String, required: true },
    patientLastName: { type: String, required: true },
    patientEmail: { type: String, required: true },
    patientPhone: { type: String, required: true },
    patientDOB: { type: String, required: true },
}, { timestamps: true }); // Adds createdAt and updatedAt fields

// Create and export the Appointment model
const Appointment = mongoose.model('Appointment', appointmentSchema);

export default Appointment;
