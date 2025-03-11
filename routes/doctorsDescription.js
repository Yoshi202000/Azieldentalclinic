import express from "express";
import User from "../models/User.js";
import { authenticateUser } from "./middleware/authMiddleware.js";
import Clinic from '../models/clinicSchema.js';
import jwt from 'jsonwebtoken';

const router = express.Router();

// Make sure express can handle JSON
router.use(express.json());

// Helper function to generate new token
const generateNewToken = (user) => {
  return jwt.sign(
    {
      userId: user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      phoneNumber: user.phoneNumber,
      role: user.role,
      clinic: user.clinic,
      doctorGreeting: user.doctorGreeting,
      doctorDescription: user.doctorDescription,
      services: user.services
    },
    process.env.JWT_SECRET,
    { expiresIn: '1d' }
  );
};

// Get doctor's services
router.get('/doctor-services/:doctorId', async (req, res) => {
  try {
    const doctor = await User.findById(req.params.doctorId);
    if (!doctor || doctor.role !== 'doctor') {
      return res.status(404).json({ message: 'Doctor not found' });
    }
    res.status(200).json({ services: doctor.services });
  } catch (error) {
    console.error('Error fetching doctor services:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update doctor's services
router.put('/doctor-services/:doctorId', authenticateUser, async (req, res) => {
  try {
    const { services } = req.body;
    const doctor = await User.findById(req.params.doctorId);
    
    if (!doctor || doctor.role !== 'doctor') {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    // Verify if the user is an admin or the doctor themselves
    if (req.user.role !== 'admin' && req.user._id.toString() !== req.params.doctorId) {
      return res.status(403).json({ message: 'Unauthorized to update services' });
    }

    // Get all clinic services for validation
    const clinic = await Clinic.findOne();
    const clinicServices = clinic?.services || [];

    // Validate and format the services
    const validatedServices = services.map(service => {
      const clinicService = clinicServices.find(cs => cs._id.toString() === service.serviceId);
      if (!clinicService) {
        throw new Error(`Invalid service ID: ${service.serviceId}`);
      }
      return {
        serviceId: clinicService._id,
        name: clinicService.name,
        description: clinicService.description,
        fee: clinicService.fee,
        isActive: service.isActive ?? true
      };
    });

    doctor.services = validatedServices;
    await doctor.save();

    // Generate new token with updated services
    const newToken = generateNewToken(doctor);

    // Set the new token as an HTTP-only cookie
    res.cookie('token', newToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Strict',
      maxAge: 24 * 60 * 60 * 1000 // 1 day
    });

    res.status(200).json({
      message: 'Doctor services updated successfully',
      services: doctor.services,
      token: newToken // Include the new token in the response
    });
  } catch (error) {
    console.error('Error updating doctor services:', error);
    res.status(500).json({ message: error.message || 'Internal server error' });
  }
});

// Update doctor information including greeting and description
router.put('/update-doctor-information', authenticateUser, async (req, res) => {
    const { doctorInformation } = req.body;
    const userId = req.userId;
  
    try {
      // 1. Ensure user exists and is a doctor
      const user = await User.findById(userId);
      if (!user) return res.status(404).json({ message: 'User not found' });
      if (user.role !== 'doctor') {
        return res.status(403).json({ message: 'Only doctors can update this information' });
      }
  
      // 2. Update doctor information
      user.doctorGreeting = doctorInformation.doctorGreeting;
      user.doctorDescription = doctorInformation.doctorDescription;
      
      // 3. Handle services update if provided
      if (doctorInformation.services && Array.isArray(doctorInformation.services)) {
        const clinic = await Clinic.findOne();
        const clinicServices = clinic?.services || [];
        
        const validatedServices = doctorInformation.services
          .map(serviceName => {
            const clinicService = clinicServices.find(cs => cs.name === serviceName);
            if (clinicService) {
              return {
                serviceId: clinicService._id,
                name: clinicService.name,
                description: clinicService.description,
                fee: clinicService.fee,
                isActive: true
              };
            }
            return null;
          })
          .filter(service => service !== null);
        
        user.services = validatedServices;
      }
  
      // 4. Save the updates
      const updatedUser = await user.save();
  
      // Generate new token with updated information
      const newToken = generateNewToken(updatedUser);

      // Set the new token as an HTTP-only cookie
      res.cookie('token', newToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'Strict',
        maxAge: 24 * 60 * 60 * 1000 // 1 day
      });
  
      return res.status(200).json({
        message: 'Doctor information updated successfully',
        user: updatedUser,
        token: newToken // Include the new token in the response
      });
    } catch (error) {
      console.error('Error updating doctor information:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
});

export default router;
