import mongoose from 'mongoose';

const serviceSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  image: { type: String, default: null },
  clinic: { type: String, required: true, default: 'both' }, // New field for specifying clinic
});

const clinicSchema = new mongoose.Schema({
  nameOne: { type: String, required: true, default: null }, // Renamed from "name"
  nameTwo: { type: String, required: true, default: null }, // New field
  description: { type: String, required: true, default: null },
  services: { type: [serviceSchema], required: true, default: [] },
  address: { type: String, required: true, default: null },
  addressTwo: { type: String, required: true, default: null }, // Additional address field
  responsiveBg: {type: Buffer, required: true, default: null },
  clinicLogo: {type: Buffer, required: true, default: null},

  nameOnePhone: { type: String, required: true, default: null },
  nameTwoPhone: { type: String, required: true, default: null }, // New field

  termsAndConditions: { type: String, required: true, default: null},

  // Additional fields based on new requirements
  clinicCatchLine: { type: String, required: true, default: null }, // Catch line for services page

  // Login page
  clinicHeader: { type: String, required: true, default: null }, // Header for login page
  loginMessage: { type: String, required: true, default: null }, // Login message for login page
  loginDescription: { type: String, required: true, default: null },

  // Signup page
  welcomeMessage: { type: String, required: true, default: null }, // Welcome message for signup page
  signupMessage: { type: String, required: true, default: null }, // Signup message for signup page
  signupDescription: { type: String, required: true, default: null }, // Signup description for signup page
});

export default mongoose.model('Clinic', clinicSchema);
