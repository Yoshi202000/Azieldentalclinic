import mongoose from 'mongoose';

// Define schema for individual teeth
const toothSchema = new mongoose.Schema({
    status: { type: String, default: "" }, // Example: "cleaned", "removed", "decayed"
    notes: { type: String, default: "" }   // Additional details about the tooth
});

// Schema for Adult Dental Chart (Teeth 1-32)
const adultDentalChartSchema = new mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true },
    date: { type: Date, default: Date.now },
    teeth: {
        1: toothSchema, 2: toothSchema, 3: toothSchema, 4: toothSchema, 5: toothSchema, 
        6: toothSchema, 7: toothSchema, 8: toothSchema, 9: toothSchema, 10: toothSchema,
        11: toothSchema, 12: toothSchema, 13: toothSchema, 14: toothSchema, 15: toothSchema,
        16: toothSchema, 17: toothSchema, 18: toothSchema, 19: toothSchema, 20: toothSchema,
        21: toothSchema, 22: toothSchema, 23: toothSchema, 24: toothSchema, 25: toothSchema,
        26: toothSchema, 27: toothSchema, 28: toothSchema, 29: toothSchema, 30: toothSchema,
        31: toothSchema, 32: toothSchema
    }
});

// Create and export model
const AdultDentalChart = mongoose.model('AdultDentalChart', adultDentalChartSchema);
export default AdultDentalChart;
