import express from 'express';
import User from '../models/User.js';
import { authenticateUser } from './middleware/authMiddleware.js';

const router = express.Router();

// Route to update health record questions, protected by authentication middleware
router.put('/update-health-record', authenticateUser, async (req, res) => {
    const { questions } = req.body;
    const userId = req.userId; // Get userId from the token, set by the middleware

    try {
        // Validate request
        if (!questions) {
            return res.status(400).json({ message: 'Questions data is required' });
        }

        // Update the user's health questions in the database
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            {
                questionOne: questions.questionOne,
                questionTwo: questions.questionTwo,
                questionThree: questions.questionThree,
                questionFour: questions.questionFour,
                questionFive: questions.questionFive,
                questionSix: questions.questionSix,
                questionSeven: questions.questionSeven,
                questionEight: questions.questionEight,
                questionNine: questions.questionNine,
                questionTen: questions.questionTen,
            },
            { new: true } // Return the updated document
        );

        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({ message: 'Health record updated successfully', user: updatedUser });
    } catch (error) {
        console.error('Error updating health record:', error);
        res.status(500).json({ message: 'An error occurred while updating the health record' });
    }
});

// Route to update discount ID, protected by authentication middleware
router.put('/update-discount-id', authenticateUser, async (req, res) => {
    console.log("route hit update-discount-id");
    const { discountId, userId } = req.body; // Get userId from request body
    // Not using req.userId from token anymore
    console.log("discountId", discountId);
    console.log("userId", userId);

    try {
        // Validate request
        if (!discountId || !userId) {
            return res.status(400).json({ message: 'Discount ID and User ID are required' });
        }
        // Update the patient's discount ID using the userId from request body
        const updatedUser = await User.findByIdAndUpdate(
            userId, // Using userId from request body (patient's ID) instead of token
            { discountId: discountId },
            { new: true }
        );
        console.log("updatedUserkjhgkjhgk", updatedUser);
        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({ 
            message: 'Discount ID updated successfully', 
            user: updatedUser 
        });
    } catch (error) {
        console.error('Error updating discount ID:', error);
        res.status(500).json({ 
            message: 'An error occurred while updating the discount ID',
            error: error.message 
        });
    }
});

export default router;
