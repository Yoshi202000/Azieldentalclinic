import mongoose from 'mongoose';

// Define the schema for user data
const userSchema = new mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phoneNumber: { type: String, required: true },
    dob: { type: Date },
    password: { type: String, required: true },
    emailVerified: { type: Boolean, default: false },
    role: { type: String, default: 'patient' },
    clinic: { type: String, default: 'both' },
    termscondition: {type: Boolean, default: false},
    discountId: { type: String, default: null, required: false},

    // User health record commonly asked before dental operation
    questionOne: { type: Boolean, default: null },
    questionTwo: { type: Boolean, default: null },
    questionThree: { type: Boolean, default: null },
    questionFour: { type: Boolean, default: null },
    questionFive: { type: Boolean, default: null },
    questionSix: { type: Boolean, default: null },
    questionSeven: { type: Boolean, default: null },
    questionEight: { type: Boolean, default: null },
    questionNine: { type: Boolean, default: null },
    questionTen: { type: Boolean, default: null },

    // Doctors' greetings and descriptions
    doctorGreeting: { type: String, default: '' },
    doctorDescription: { type: String, default: '' },

    // Array of services
    services: [
        {
            serviceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Clinic.services' },
            name: { type: String, required: true },
            description: { type: String },
            fee: { type: Number },
            isActive: { type: Boolean, default: true }
        }
    ],
}, { timestamps: true });

// Create a model for the 'UserInformation' collection
const User = mongoose.model('userinformations', userSchema);

export default User;
