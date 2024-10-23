import express from 'express';
import Feedback from '../models/FeedBack.js';

const router = express.Router();

router.post('/submit', async (req, res) => {
  console.log('Feedback route hit');
  try {
    const { rating, name, email, feedback } = req.body;
    
    console.log('Received feedback:', { rating, name, email, feedback });

    const newFeedback = new Feedback({
      rating,
      name,
      email,
      feedback
    });

    const savedFeedback = await newFeedback.save();
    console.log('Feedback saved:', savedFeedback);

    res.status(201).json({ message: 'Feedback submitted successfully' });
  } catch (error) {
    console.error('Error submitting feedback:', error);
    res.status(500).json({ message: 'Error submitting feedback', error: error.message });
  }
});

export default router;
