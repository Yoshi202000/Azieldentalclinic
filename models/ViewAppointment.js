import mongoose from 'mongoose';

const appointmentSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: true 
  },
  appointmentType: {
    type: [String], 
    required: true
  },
  appointmentDate: {
    type: String,
    required: true
  },
  appointmentTime: {
    type: String, 
    required: true
  },
  appointmentTimeFrom: {
    type: [String], 
  },
  appointmentTimeTo: {
    type: String,
  },
  patientFirstName: {
    type: String,
    required: true
  },
  patientLastName: {
    type: String,
    required: true
  },
  patientEmail: {
    type: String,
    required: true
  },
  patientPhone: {
    type: String,
    required: true
  },
  patientDOB: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  appointmentStatus: {
    type: String,
    default: 'pending',
    enum: ['pending', 'Cancelled', 'Completed', 'No Show', 'Rebooked']
  },
  bookedDoctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor',
    required: true
  },
});

// Model creation or retrieval
const ViewAppointment = mongoose.models.appointments || mongoose.model('appointments', appointmentSchema);

export default ViewAppointment; // Export the model using ES module syntax
