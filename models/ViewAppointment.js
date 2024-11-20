import mongoose from 'mongoose';

const appointmentSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: true 
  },
  appointmentType: {
    type: String,
    required: true
  },
  appointmentDate: {
    type: String, // Could be Date if you prefer
    required: true
  },
  appointmentTime: {
    type: String, // Could be Date for precise time
    required: true
  },
  appointmentTimeFrom: {
    type: String, // Optional field for start time
  },
  appointmentTimeTo: {
    type: String, // Optional field for end time
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
    type: String, // Could be Date for DOB if needed
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
    enum: ['pending', 'Cancelled', 'Completed', 'Not Show', 'Rebooked']
  }
});

// Model creation or retrieval
const ViewAppointment = mongoose.models.appointments || mongoose.model('appointments', appointmentSchema);

export default ViewAppointment; // Export the model using ES module syntax
