import mongoose from 'mongoose';

// Define the schema for user data
const userSchema = new mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phoneNumber: { type: String, required: true },
    dob: { type: Date }, // Add dob field here
    password: { type: String, required: true },
    emailVerified: { type: Boolean, default: false },
}, { timestamps: true });


// Create a model for the 'UserInformation' collection
const User = mongoose.model('userinformations', userSchema);

export default User;
