import mongoose from 'mongoose';

// Define the schema for the 'Test' collection
const testSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  dob: { type: Date, required: true },
});

const Test = mongoose.model('Test', testSchema);

export default Test;
