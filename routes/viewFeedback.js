import express from 'express';
import Feedback from '../models/FeedBack.js';

const router = express.Router();

router.get('/view', async (req, res) => {
  try {
    const feedbacks = await Feedback.find().sort({ createdAt: -1 });
    res.status(200).json(feedbacks);
  } catch (error) {
    console.error('Error fetching feedbacks:', error);
    res.status(500).json({ message: 'Error fetching feedbacks', error: error.message });
  }
});

export default router;
