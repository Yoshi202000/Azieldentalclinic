import express from "express";
import moment from 'moment';
import { authenticateUser } from "./middleware/authMiddleware.js";
import Schedule from "../models/ManageSchedule.js";

import User from '../models/User.js'; // Ensure correct path to User model

const router = express.Router();

// Generate and add daily slots for a doctor
router.post('/schedule/generate', authenticateUser, async (req, res) => {
  try {
    const { doctor, date } = req.body;

    if (!doctor || !doctor.firstName || !doctor.lastName || !doctor.email || !doctor.clinic || !doctor.services) {
      return res.status(400).json({
        message: 'Doctor details are required and must include firstName, lastName, email, clinic, and services.',
      });
    }

    if (!date) {
      return res.status(400).json({ message: 'Date is required to generate slots.' });
    }

    // Generate and save slots
    await generateDailySlots(doctor, date);
    res.status(201).json({ message: 'Slots for the day have been successfully generated and saved.' });
  } catch (error) {
    console.error('Error generating slots:', error);
    res.status(500).json({ message: 'Error generating slots.', error });
  }
});



// Get all schedules
router.get('/schedules', authenticateUser, async (req, res) => {
  try {
    console.log("Authenticated User ID:", req.userId); // Debug log

    if (!req.userId) {
      return res.status(400).json({ message: 'Invalid user data. Please log in again.' });
    }

    // Fetch user details using userId
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    console.log("Fetching schedules for:", user.email);

    // Fetch schedules using the user's email
    const schedules = await Schedule.find({ email: user.email });

    if (!schedules || schedules.length === 0) {
      return res.status(404).json({ message: 'No schedules found for this user.' });
    }

    console.log("Schedules found:", schedules.length);
    res.status(200).json(schedules);
  } catch (error) {
    console.error('Error fetching schedules:', error);
    res.status(500).json({ message: 'Error fetching schedules.', error: error.message });
  }
});



// Update a specific slot's status
router.put('/schedule/:id/slot', async (req, res) => {
  try {
    const { timeFrom, timeTo, status } = req.body;

    if (!timeFrom || !timeTo || !status) {
      return res.status(400).json({ message: 'timeFrom, timeTo, and status are required for updating a slot.' });
    }

    const schedule = await Schedule.findById(req.params.id);
    if (!schedule) {
      return res.status(404).json({ message: 'Schedule not found.' });
    }

    const slot = schedule.slots.find((s) => s.timeFrom === timeFrom && s.timeTo === timeTo);
    if (!slot) {
      return res.status(404).json({ message: 'Slot not found.' });
    }

    slot.status = status;
    await schedule.save();

    res.status(200).json({ message: 'Slot status updated successfully.', schedule });
  } catch (error) {
    console.error('Error updating slot:', error);
    res.status(500).json({ message: 'Error updating slot.', error });
  }
});




// Delete a schedule (entire day)
router.delete('/schedule/:id', async (req, res) => {
  try {
    const deletedSchedule = await Schedule.findByIdAndDelete(req.params.id);

    if (!deletedSchedule) {
      return res.status(404).json({ message: 'Schedule not found.' });
    }

    res.status(200).json({ message: 'Schedule deleted successfully.' });
  } catch (error) {
    console.error('Error deleting schedule:', error);
    res.status(500).json({ message: 'Error deleting schedule.', error });
  }
});




// Create a new schedule (POST route)
router.post('/schedule', authenticateUser, async (req, res) => {
  try {
    const { firstName, lastName, email, clinic, services, date, slots } = req.body;

    // Validate the request body
    if (!firstName || !lastName || !email || !clinic || !Array.isArray(services) || !date || !Array.isArray(slots)) {
      return res.status(400).json({ message: 'All fields are required and slots must be an array.' });
    }

    // Create a new schedule
    const newSchedule = new Schedule({
      firstName,
      lastName,
      email,
      clinic,
      services,
      date,
      slots,
    });

    await newSchedule.save();
    res.status(201).json({ message: 'Schedule saved successfully.', schedule: newSchedule });
  } catch (error) {
    console.error('Error saving schedule:', error);
    res.status(500).json({ message: 'Failed to save schedule.', error: error.message });
  }
});



// Fetch slots for a specific date
router.get('/schedule/:date', async (req, res) => {
  try {
    const { date } = req.params;
    const schedule = await Schedule.findOne({ date });

    if (!schedule) {
      return res.status(404).json({ message: 'No schedule found for this date.' });
    }

    res.status(200).json(schedule.slots);
  } catch (error) {
    console.error('Error fetching slots:', error);
    res.status(500).json({ message: 'Failed to fetch slots.' });
  }
});



// Fetch all taken slots
router.get('/slots/taken', async (req, res) => {
  try {
    const schedules = await Schedule.find();
    const takenSlots = [];

    schedules.forEach(schedule => {
      schedule.slots.forEach(slot => {
        if (slot.status === 'Unavailable') { // Assuming 'Unavailable' means the slot is taken
          takenSlots.push({
            date: schedule.date,
            timeFrom: slot.timeFrom,
            timeTo: slot.timeTo,
            doctor: `${schedule.firstName} ${schedule.lastName}`,
            clinic: schedule.clinic,
          });
        }
      });
    });

    res.status(200).json(takenSlots);
  } catch (error) {
    console.error('Error fetching taken slots:', error);
    res.status(500).json({ message: 'Failed to fetch taken slots.' });
  }
});



// Bulk generate slots for multiple days
router.post('/schedule/bulk-generate', authenticateUser, async (req, res) => {
  console.log('Received schedule data:', req.body);
  try {
    const { schedule } = req.body;
    
    if (!Array.isArray(schedule) || schedule.length === 0) {
      return res.status(400).json({ message: 'Valid schedule data is required.' });
    }

    const today = moment().startOf('day');
    const maxDate = moment().add(60, 'days').endOf('day');

    for (const daySchedule of schedule) {
      const { date, slots } = daySchedule;
      
      if (!date || !Array.isArray(slots)) {
        return res.status(400).json({ message: 'Each schedule must have a date and slots array.' });
      }

      const scheduleDate = moment(date, 'YYYY-MM-DD', true);
      if (!scheduleDate.isValid() || scheduleDate.isBefore(today) || scheduleDate.isAfter(maxDate)) {
        return res.status(400).json({ message: `Date ${date} is invalid. Schedules can only be created for the next 60 days.` });
      }

      const newSchedule = new Schedule({
        date,
        slots,
        clinic: req.user.clinic,
        email: req.user.email,
        firstName: req.user.firstName,
        lastName: req.user.lastName,
      });

      await newSchedule.save();
    }

    res.status(201).json({ message: 'Schedules saved successfully for the next 60 days.' });
  } catch (error) {
    console.error('Error saving schedules:', error);
    res.status(500).json({ message: 'Failed to save schedules.', error: error.message });
  }
});



// Update schedule endpoint
router.put('/schedule/update', async (req, res) => {
  try {
    const { schedule } = req.body;
    if (!schedule || !Array.isArray(schedule)) {
      return res.status(400).json({ error: 'Valid schedule data is required' });
    }

    // Iterate over the schedule array and update each day's slots
    for (const day of schedule) {
      const { date, slots } = day;
      if (!date || !Array.isArray(slots)) {
        return res.status(400).json({ error: 'Each day must have a date and slots array' });
      }

      // Find the existing schedule for the date
      let existingSchedule = await Schedule.findOne({ date });

      if (existingSchedule) {
        // Update the slots for the existing schedule
        existingSchedule.slots = slots;
        await existingSchedule.save();
      } else {
        // If no existing schedule, create a new one
        const newSchedule = new Schedule({ date, slots });
        await newSchedule.save();
      }
    }

    res.status(200).json({ message: 'Schedule updated successfully' });
  } catch (error) {
    console.error('Error updating schedule:', error);
    res.status(500).json({ error: 'Failed to update schedule' });
  }
});



router.get('/user/schedules', authenticateUser, async (req, res) => {
  try {
    console.log('Authenticated user:', req.user); // Log user info
    const userEmail = req.user.email; // Assuming you have the user's email in the request object after authentication
    const schedules = await Schedule.find({ email: userEmail }); // Fetch schedules for the authenticated user
    res.status(200).json(schedules);
  } catch (error) {
    console.error('Error fetching user schedules:', error);
    res.status(500).json({ message: 'Error fetching user schedules.', error: error.message });
  }
});

// Update a specific schedule slot status
router.patch('/schedule/:id', authenticateUser, async (req, res) => {
  const { id } = req.params;
  const { slots } = req.body; // Expecting only the slots to be updated

  try {
    // Find the schedule by ID
    const schedule = await Schedule.findById(id);
    if (!schedule) {
      return res.status(404).json({ message: 'Schedule not found.' });
    }

    // Update only the slots if provided
    if (slots) {
      // Update the existing slots based on the provided data
      slots.forEach(updatedSlot => {
        const existingSlot = schedule.slots.find(slot => slot.timeFrom === updatedSlot.timeFrom && slot.timeTo === updatedSlot.timeTo);
        if (existingSlot) {
          existingSlot.status = updatedSlot.status; // Update the status of the existing slot
        }
      });
    }

    await schedule.save(); // Save the updated schedule
    res.status(200).json({ message: 'Schedule updated successfully.', schedule });
  } catch (error) {
    console.error('Error updating schedule:', error);
    res.status(500).json({ message: 'Failed to update schedule.', error: error.message });
  }
});


// Fetch all schedules
router.get('/all-schedules', async (req, res) => {
  try {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const startOfTomorrow = new Date(
      tomorrow.getFullYear(),
      tomorrow.getMonth(),
      tomorrow.getDate()
    );

    const schedules = await Schedule.find({
      date: { $gte: startOfTomorrow },
      slots: { $elemMatch: { status: "Available" } }
    });

    res.status(200).json(schedules);
  } catch (error) {
    console.error('Error fetching schedules:', error);
    res.status(500).json({ message: 'Failed to fetch schedules', error: error.message });
  }
});


// Update a specific slot for a schedule
router.patch('/schedule/:id/slot', async (req, res) => {
  try {
    const { timeFrom, timeTo, date, email } = req.body;
    console.log('Received request:', { timeFrom, timeTo, date, email });

    const schedule = await Schedule.findOne({ email: email });
    console.log('Found schedule:', schedule);
    
    if (!schedule) {
      return res.status(404).json({ message: 'Schedule not found' });
    }

    // Find the schedule entry for the given date
    const scheduleEntry = schedule.schedule.find(s => s.date === date);
    if (!scheduleEntry) {
      return res.status(404).json({ message: 'Date not found in schedule' });
    }

    // Find and update the specific time slot
    const slot = scheduleEntry.timeSlots.find(
      s => s.timeFrom === timeFrom && s.timeTo === timeTo
    );

    if (!slot) {
      return res.status(404).json({ message: 'Time slot not found' });
    }

    // Update the slot status
    slot.status = 'Unavailable';
    await schedule.save();

    return res.status(200).json({ message: 'Slot updated successfully' });
  } catch (error) {
    console.error('Error updating slot:', error);
    res.status(500).json({ message: error.message || 'Error updating slot' });
  }
});


// Update slot status
router.put('/update-slot-status', authenticateUser, async (req, res) => {
  const { scheduleId, slotId } = req.body;
  
  if (!scheduleId || !slotId) {
    return res.status(400).json({ message: 'scheduleId and slotId are required.' });
  }

  try {
    // Use arrayFilters to find the slot with the given slotId that is currently "Available"
    const updatedSchedule = await Schedule.findOneAndUpdate(
      { _id: scheduleId },
      { $set: { "slots.$[elem].status": "Unavailable" } },
      {
        new: true,
        arrayFilters: [
          { "elem._id": slotId, "elem.status": "Available" }
        ]
      }
    );

    if (!updatedSchedule) {
      return res.status(404).json({ message: 'Schedule or slot not found, or slot is already Unavailable.' });
    }

    res.status(200).json({
      message: 'Slot status updated successfully.',
      schedule: updatedSchedule
    });
  } catch (error) {
    console.error('Error updating slot status:', error);
    res.status(500).json({ message: 'Failed to update slot status', error: error.message });
  }
});




// Route to check slot status
router.get('/schedule/check-slot-status/:mainID/:slotID', async (req, res) => {
  const { mainID, slotID } = req.params;

  try {
    // Find the schedule by mainID
    const schedule = await Schedule.findById(mainID);
    if (!schedule) {
      return res.status(404).json({ message: 'Schedule not found.' });
    }

    // Find the slot by slotID
    const slot = schedule.slots.find(s => s._id.toString() === slotID);
    if (!slot) {
      return res.status(404).json({ message: 'Slot not found.' });
    }

    // Return the status of the slot
    res.status(200).json({ status: slot.status });
  } catch (error) {
    console.error('Error checking slot status:', error);
    res.status(500).json({ message: 'Error checking slot status.', error: error.message });
  }
});

// Route to update slot status to "Unavailable"
router.put('/schedule/update-slot-status/:mainID/:slotID', async (req, res) => {
  const { mainID, slotID } = req.params;

  try {
    // Find the schedule by mainID
    const schedule = await Schedule.findById(mainID);
    if (!schedule) {
      return res.status(404).json({ message: 'Schedule not found.' });
    }

    // Find the slot by slotID
    const slotIndex = schedule.slots.findIndex(s => s._id.toString() === slotID);
    if (slotIndex === -1) {
      return res.status(404).json({ message: 'Slot not found.' });
    }

    // Update the slot status to "Unavailable"
    schedule.slots[slotIndex].status = "Unavailable";

    // Save the updated schedule
    await schedule.save();

    res.status(200).json({ message: 'Slot status updated to Unavailable.', updatedSlot: schedule.slots[slotIndex] });
  } catch (error) {
    console.error('Error updating slot status:', error);
    res.status(500).json({ message: 'Error updating slot status.', error: error.message });
  }
});


export default router;
