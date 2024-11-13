import express from 'express';
import Message from '../models/Message.js';

const router = express.Router();

// Get all messages
router.get('/messages', async (req, res) => {
  try {
    const messages = await Message.find({});
    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching messages: ' + error.message });
  }
});

export default router;
