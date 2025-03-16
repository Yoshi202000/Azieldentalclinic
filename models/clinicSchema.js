import mongoose from 'mongoose';

// Define the fee schema for services
const feeSchema = new mongoose.Schema({
  feeType: {
    type: String,
    required: true,
    default: 'Default' // Add default value
  },
  amount: {
    type: Number,
    required: true,
    default: 0
  },
  description: {
    type: String,
    default: ''
  }
});

// Define the medicine fee schema
const medicineSchema = new mongoose.Schema({
  medicineName: {
    type: String,
    required: true
  },
  medicineDescription: {
    type: String,
    required: true
  },
  medicineAmount: {
    type: Number,
    default: 0
  },
  fees: {
    type: [feeSchema],
    default: () => [{ // Add default fee
      feeType: 'Default',
      amount: 0,
      description: ''
    }]
  },
  discountApplicable: {
    type: Boolean,
    default: false
  },
});

// Define the service schema with fees array
const serviceSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  image: { type: String, default: null },
  clinic: { type: String, required: true, default: 'both' },
  fees: [feeSchema], // Array of fees
  duration: { type: String, required: false },
  servicesSlot: { type: Number, required: false }
});

const clinicSchema = new mongoose.Schema({
  nameOne: { type: String, required: true, default: null }, // Renamed from "name"
  nameTwo: { type: String, required: true, default: null }, // New field
  loginMessage: { type: String, required: true, default: null }, // New field
  description: { type: String, required: true, default: null },
  services: [serviceSchema], // Array of services
  medicines: {
    type: [medicineSchema],
    default: []
  },
  address: { type: String, required: true, default: null },
  addressTwo: { type: String, required: true, default: null }, // Additional address field
  responsiveBg: {type: Buffer, required: true, default: null },
  clinicLogo: {type: Buffer, required: true, default: null},
  gcashQR: {type: Buffer, default: null},
  mainImg: {type: Buffer, required: false, default: null },


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
  welcomeMessage: { type: String, required: true, default: null }, 
  signupMessage: { type: String, required: true, default: null }, 
  signupDescription: { type: String, required: true, default: null }, 

  // health record questionaire
  questionOne: { type: String, required: false, default: null },
  questionTwo: { type: String, required: false, default: null },
  questionThree: { type: String, required: false, default: null },
  questionFour: { type: String, required: false, default: null },
  questionFive: { type: String, required: false, default: null },
  questionSix: { type: String, required: false, default: null },
  questionSeven: { type: String, required: false, default: null },
  questionEight: { type: String, required: false, default: null },
  questionNine: { type: String, required: false, default: null },
  questionTen: { type: String, required: false, default: null },

});

export default mongoose.model('Clinic', clinicSchema);
