import mongoose from 'mongoose';

// Define the schema for user data
const userSchema = new mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true }, // Unique email
    phoneNumber: { type: String, required: true },
    password: { type: String, required: true }, // Store hashed password
}, { timestamps: true }); // Automatically adds createdAt and updatedAt fields

// Create a model for the 'UserInformation' collection
const User = mongoose.model('UserInformation', userSchema);

export default User;
