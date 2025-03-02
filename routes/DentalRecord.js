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

        // Try to find the record in both adult and child collections
        let adultRecord = await AdultDentalChart.findOne({ email });
        let childRecord = await ChildDentalChart.findOne({ email });

        if (!adultRecord && !childRecord) {
            return res.status(404).json({ message: 'No dental record found for this email' });
        }

        res.status(200).json({
            message: 'Dental record fetched successfully',
            adultDentalChart: adultRecord || null,
            childDentalChart: childRecord || null,
        });
    } catch (error) {
        console.error('Error fetching dental chart:', error);
        res.status(500).json({ message: 'An error occurred while fetching the dental chart' });
    }
});

export default router;
