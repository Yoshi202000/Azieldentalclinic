import mongoose from 'mongoose';

const appointmentSchema = new mongoose.Schema({
    appointmentDate: {
        type: String, // Storing the date as a string (format: YYYY-MM-DD)
        required: true
    },
    "0900": { type: String, default: "" },
    "0915": { type: String, default: "" },
    "0930": { type: String, default: "" },
    "1000": { type: String, default: "" },
    "1015": { type: String, default: "" },
    "1030": { type: String, default: "" },
    "1045": { type: String, default: "" },
    "1100": { type: String, default: "" },
    "1115": { type: String, default: "" },
    "1130": { type: String, default: "" },
    "1145": { type: String, default: "" },
    "1200": { type: String, default: "" },
    "1215": { type: String, default: "" },
    "1230": { type: String, default: "" },
    "1245": { type: String, default: "" },
    "1300": { type: String, default: "" },
    "1315": { type: String, default: "" },
    "1330": { type: String, default: "" },
    "1345": { type: String, default: "" },
    "1400": { type: String, default: "" },
    "1415": { type: String, default: "" },
    "1430": { type: String, default: "" },
    "1445": { type: String, default: "" },
    "1500": { type: String, default: "" },
    "1515": { type: String, default: "" },
    "1530": { type: String, default: "" },
    "1545": { type: String, default: "" },
    "1600": { type: String, default: "" },
    "1615": { type: String, default: "" },
    "1630": { type: String, default: "" },
    "1645": { type: String, default: "" },
    "1700": { type: String, default: "" },
    "1715": { type: String, default: "" },
    "1730": { type: String, default: "" },
    "1745": { type: String, default: "" },
    "1800": { type: String, default: "" }
});

export default mongoose.model('Appointment', appointmentSchema);
