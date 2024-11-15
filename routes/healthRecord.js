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
export default router;
