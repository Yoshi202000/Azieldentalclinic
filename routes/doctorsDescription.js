import express from "express";
import User from "../models/User.js";
import { authenticateUser } from "./middleware/authMiddleware.js";
import Clinic from '../models/clinicSchema.js';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import path from 'path';
import { promises as fs } from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const uploadDir = path.join(__dirname, '..', 'src', 'uploads');

// Ensure upload directory exists
async function ensureUploadDir() {
  try {
    await fs.access(uploadDir);
  } catch (error) {
    if (error.code === 'ENOENT') {
      await fs.mkdir(uploadDir, { recursive: true });
    }
  }
}

await ensureUploadDir();

// Multer configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const now = new Date();
    const timestamp = now.toISOString().replace(/[:.]/g, '-');
    const ext = path.extname(file.originalname);
    cb(null, `doctor_${timestamp}${ext}`);
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

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
    const doctorId = req.params.doctorId;
    
    // Find the doctor
    const doctor = await User.findById(doctorId);
    if (!doctor || doctor.role !== 'doctor') {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    // Get the authenticated user from the token
    const authUser = await User.findById(req.userId);
    if (!authUser) {
      return res.status(401).json({ message: 'Authentication failed' });
    }

    // Verify if the user is an admin or the doctor themselves
    if (authUser.role !== 'admin' && authUser.role !== 'superAdmin' && authUser._id.toString() !== doctorId) {
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
        isActive: true
      };
    });

    // Update doctor's services
    doctor.services = validatedServices;
    await doctor.save();

    // Generate new token with updated information
    const newToken = generateNewToken(doctor);

    res.status(200).json({
      message: 'Services updated successfully',
      doctor: {
        _id: doctor._id,
        firstName: doctor.firstName,
        lastName: doctor.lastName,
        email: doctor.email,
        role: doctor.role,
        clinic: doctor.clinic,
        services: doctor.services
      },
      services: doctor.services,
      token: newToken
    });
  } catch (error) {
    console.error('Error updating doctor services:', error);
    res.status(500).json({ message: error.message || 'Internal server error' });
  }
});

// Update doctor information route
router.put('/update-doctor-information', authenticateUser, async (req, res) => {
  const { doctorInformation } = req.body;
  const userId = req.userId;

  console.log('Received update request:', {
    userId,
    doctorInformation,
    body: req.body
  });

  try {
    // 1. Ensure user exists and is a doctor
    const user = await User.findById(userId);
    if (!user) {
      console.log('User not found:', userId);
      return res.status(404).json({ message: 'User not found' });
    }
    if (user.role !== 'doctor') {
      console.log('Invalid role:', user.role);
      return res.status(403).json({ message: 'Only doctors can update this information' });
    }

    console.log('Found user:', {
      id: user._id,
      role: user.role,
      currentServices: user.services
    });

    // 2. Update doctor information
    user.doctorGreeting = doctorInformation.doctorGreeting;
    user.doctorDescription = doctorInformation.doctorDescription;
    user.dob = doctorInformation.dob;
    
    // 3. Handle services update if provided
    if (doctorInformation.services && Array.isArray(doctorInformation.services)) {
      const clinic = await Clinic.findOne();
      if (!clinic) {
        console.log('Clinic not found');
        return res.status(404).json({ message: 'Clinic not found' });
      }

      const clinicServices = clinic?.services || [];
      console.log('Available clinic services:', clinicServices);
      console.log('Requested services:', doctorInformation.services);
      
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
          console.log('Service not found:', serviceName);
          return null;
        })
        .filter(service => service !== null);
      
      console.log('Validated services:', validatedServices);
      user.services = validatedServices;
    }

    // 4. Save the updates
    const updatedUser = await user.save();
    console.log('User updated successfully:', {
      id: updatedUser._id,
      services: updatedUser.services
    });

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
      token: newToken
    });
  } catch (error) {
    console.error('Server error:', error);
    return res.status(500).json({ 
      message: 'Internal server error',
      error: error.message,
      stack: error.stack
    });
  }
});

// Upload doctor image route - separate middleware from route handler
router.post('/upload-doctor-image', upload.single('doctorImage'), async (req, res) => {
  try {
    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Get token from authorization header
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    // Verify token and get userId
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(401).json({ error: 'Invalid token' });
    }
    
    const userId = decoded.userId;
    console.log('User ID from token:', userId);
    console.log('File uploaded:', req.file.filename);

    // Update user with image path
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { doctorImage: `/uploads/${req.file.filename}` },
      { new: true }
    );

    if (!updatedUser) {
      // If update failed, try to delete the uploaded file
      try {
        await fs.unlink(path.join(uploadDir, req.file.filename));
      } catch (unlinkError) {
        console.error('Error deleting file after failed update:', unlinkError);
      }
      return res.status(404).json({ error: 'User not found' });
    }

    // Return success response
    res.status(200).json({ 
      message: 'Image uploaded successfully', 
      path: `/uploads/${req.file.filename}`
    });
  } catch (error) {
    // If an error occurred, try to delete the uploaded file
    if (req.file) {
      try {
        await fs.unlink(path.join(uploadDir, req.file.filename));
      } catch (unlinkError) {
        console.error('Error deleting file after error:', unlinkError);
      }
    }
    
    console.error('Error uploading doctor image:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

export default router;