import express from 'express';
import jwt from 'jsonwebtoken';
import Message from '../models/Message.js';

const router = express.Router();

const authenticateToken = (req, res, next) => {
  const token = req.headers['authorization'] || req.headers['Authorization'];

  if (!token) {
    console.log("Token not provided");
    return res.status(401).json({ message: 'No token provided' });
  }

  const tokenValue = token.startsWith("Bearer ") ? token.slice(7) : token;
  jwt.verify(tokenValue, 'your_jwt_secret', (err, user) => {
    if (err) {
      console.log("Token verification failed:", err.message);
      return res.status(403).json({ message: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

// Send a message
router.post('/messages', authenticateToken, async (req, res) => {
  try {
    const { receiverId, content } = req.body;
    const senderId = req.user.email;

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
    const conversationId = [senderId, receiverId].sort().join('_');

    const messages = await Message.find({ conversationId }).sort({ sentAt: 1 });
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
        readAt: null,
      },
      {
        readAt: new Date(),
      }
    );

    res.status(200).json({ message: 'Messages marked as read' });
  } catch (error) {
    res.status(500).json({ message: 'Error marking messages as read: ' + error.message });
  }
});

// Get unread message count for the logged-in user
router.get('/messages/unread', authenticateToken, async (req, res) => {
  try {
    const unreadMessages = await Message.find({ readAt: null , receiverId: req.user.email });
    res.status(200).json(unreadMessages); // Ensure you're sending a JSON response with status 200
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch usersInformation' });
  }
});

export default router;
