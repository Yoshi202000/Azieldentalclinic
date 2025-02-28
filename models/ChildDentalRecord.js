import mongoose from 'mongoose';

// Define schema for individual teeth
const toothSchema = new mongoose.Schema({
    status: { type: String, default: "" }, // Example: "cleaned", "removed", "decayed"
    notes: { type: String, default: "" }   // Additional details about the tooth
});

// Schema for Child Dental Chart (Teeth A-T)
const childDentalChartSchema = new mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true },
    date: { type: Date, default: Date.now },
    teeth: {
        A: toothSchema, B: toothSchema, C: toothSchema, D: toothSchema, E: toothSchema,
        F: toothSchema, G: toothSchema, H: toothSchema, I: toothSchema, J: toothSchema,
        K: toothSchema, L: toothSchema, M: toothSchema, N: toothSchema, O: toothSchema,
        P: toothSchema, Q: toothSchema, R: toothSchema, S: toothSchema, T: toothSchema
    }
});

// Create and export model
const ChildDentalChart = mongoose.model('ChildDentalChart', childDentalChartSchema);
export default ChildDentalChart;
