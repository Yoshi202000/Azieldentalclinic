import mongoose from 'mongoose';

// Define the schema for user data
const userSchema = new mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    id: { type: String, required: true, unique: true }, // Unique ID for user
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true }, // Unique email
    phoneNumber: { type: String, required: true },
    password: { type: String, required: true }, // Store hashed password
    emailVerified: { type: Boolean, default: false },
    discountId: {
        type: String,
        default: null,
        required: false
    },
    dob: { type: String, required: true },
    role: { type: String, default: 'patient' },
    doctorImage: { type: String }, // Add this field for doctor images
    
}, { timestamps: true }); // Automatically adds createdAt and updatedAt fields

// Check if the model has already been compiled to avoid OverwriteModelError
const User = mongoose.models.UserInformation || mongoose.model('UserInformation', userSchema);

export default User;
