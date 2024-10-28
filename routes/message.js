import express from 'express';
import jwt from 'jsonwebtoken';
import Message from '../models/Message.js';

const router = express.Router();

const authenticateToken = (req, res, next) => {
  const tokenHeaderKey = 'authorization';
  const token = req.headers[tokenHeaderKey];

  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  jwt.verify(token, 'your_jwt_secret', (err, user) => {
    if (err) return res.status(403).json({ message: 'Invalid token' });
    req.user = user;
    next();
  });
};

// Send a message
router.post('/messages', authenticateToken, async (req, res) => {
  try {
    const { receiverId, content } = req.body;
    const senderId = req.user.email;

    // Create conversation ID by combining sender and receiver emails (sorted alphabetically)
    const conversationId = [senderId, receiverId].sort().join('_');

    const newMessage = new Message({
      conversationId,
      senderId,
      receiverId,
      content,
      sentAt: new Date(),
    });

    await newMessage.save();
    res.status(201).json(newMessage);
  } catch (error) {
    res.status(500).json({ message: 'Error sending message: ' + error.message });
  }
});

// Get messages for a conversation
router.get('/messages/:receiverId', authenticateToken, async (req, res) => {
  try {
    const senderId = req.user.email;
    const { receiverId } = req.params;
    
    // Create conversation ID (sorted alphabetically)
    const conversationId = [senderId, receiverId].sort().join('_');

    const messages = await Message.find({ conversationId })
      .sort({ sentAt: 1 });
    
    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching messages: ' + error.message });
  }
});

// Mark messages as read
router.put('/messages/read/:senderId', authenticateToken, async (req, res) => {
  try {
    const receiverId = req.user.email;
    const { senderId } = req.params;
    
    const conversationId = [senderId, receiverId].sort().join('_');

    await Message.updateMany(
      {
        conversationId,
        receiverId,
        readAt: null
      },
      {
        readAt: new Date()
      }
    );

    res.status(200).json({ message: 'Messages marked as read' });
  } catch (error) {
    res.status(500).json({ message: 'Error marking messages as read: ' + error.message });
  }
});

export default router;
