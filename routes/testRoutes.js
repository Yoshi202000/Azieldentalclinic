import express from 'express';
import Test from '../models/test.js'; // Import the Test model

const router = express.Router();

// Route to add a new entry to the 'Test' collection
router.post('/add-test', async (req, res) => {
  try {
    const { firstName, lastName, email, phoneNumber, dob } = req.body;

    // Create a new Test document
    const newTest = new Test({
      firstName,
      lastName,
      email,
      phoneNumber,
      dob,
    });

    // Save the document to the database
    await newTest.save();

    res.status(201).json({ message: 'Test entry created successfully' });
  } catch (error) {
    console.error('Error creating test entry:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
