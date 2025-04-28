import express from 'express';
import AdultDentalChart from '../models/AdultDentalRecord.js';
import ChildDentalChart from '../models/ChildDentalRecord.js';
import { authenticateUser } from './middleware/authMiddleware.js';

const router = express.Router();

/**
 * Route to create a new dental chart for an adult or child
 * Protected by authentication middleware
 */
router.post('/add-dental-chart', authenticateUser, async (req, res) => {
    const { firstName, lastName, email, date, teeth, type } = req.body;
    const userId = req.userId; // Get userId from token, set by middleware

    try {
        // Validate request
        if (!firstName || !lastName || !email || !teeth || !type) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        // Check if type is either "adult" or "child"
        if (type !== 'adult' && type !== 'child') {
            return res.status(400).json({ message: 'Invalid type. Must be "adult" or "child".' });
        }

        let dentalChartModel = type === 'adult' ? AdultDentalChart : ChildDentalChart;

        // Create a new dental chart record (even if the same email exists)
        const newDentalChart = new dentalChartModel({
            firstName,
            lastName,
            email,
            date,
            teeth
        });

        await newDentalChart.save();
        res.status(201).json({ message: `${type} dental chart added successfully`, dentalChart: newDentalChart });
    } catch (error) {
        console.error('Error processing dental chart:', error);
        res.status(500).json({ message: 'An error occurred while processing the dental chart' });
    }
});

router.get('/get-dental-chart/:email', authenticateUser, async (req, res) => {
    const { email } = req.params;

    try {
        if (!email) {
            return res.status(400).json({ message: 'Email is required' });
        }

        // Get all records for the email from both collections
        let adultRecords = await AdultDentalChart.find({ email }).sort({ date: -1 });
        let childRecords = await ChildDentalChart.find({ email }).sort({ date: -1 });

        if (adultRecords.length === 0 && childRecords.length === 0) {
            return res.status(404).json({ message: 'No dental records found for this email' });
        }

        res.status(200).json({
            message: 'Dental records fetched successfully',
            adultDentalCharts: adultRecords || [],
            childDentalCharts: childRecords || [],
        });
    } catch (error) {
        console.error('Error fetching dental charts:', error);
        res.status(500).json({ message: 'An error occurred while fetching the dental charts' });
    }
});

export default router;
