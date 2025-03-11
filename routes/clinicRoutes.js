import express from 'express';
import Clinic from '../models/clinicSchema.js';
import multer from 'multer';
import mongoose from 'mongoose';
import path from 'path';
import { promises as fs } from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const uploadDir = path.join(__dirname, '..', 'src', 'uploads');

// Create uploads directory if it doesn't exist
try {
  await fs.access(uploadDir);
} catch (error) {
  if (error.code === 'ENOENT') {
    await fs.mkdir(uploadDir, { recursive: true });
  }
}

const router = express.Router();

// Serve static files from uploads directory
router.use('/uploads', express.static(uploadDir));

// Multer configuration for handling image uploads
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    try {
      await fs.access(uploadDir);
      cb(null, uploadDir);
    } catch (error) {
      if (error.code === 'ENOENT') {
        await fs.mkdir(uploadDir, { recursive: true });
      }
      cb(null, uploadDir);
    }
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || '.png';
    if (file.fieldname === 'responsiveBg') {
      cb(null, 'responsiveBg' + ext);
    } else if (file.fieldname === 'gcashQR') {
      cb(null, 'gcashQR' + ext);
    } else if (file.fieldname === 'mainImg') {
      cb(null, 'mainImg' + ext);
    } else if (file.fieldname === 'clinicLogo') {
      cb(null, 'clinicLogo' + ext);
    } else if (file.fieldname.startsWith('service_image_')) {
      const index = parseInt(file.fieldname.split('_').pop()) + 1;
      const serviceNumber = index.toString().padStart(2, '0');
      cb(null, `Service${serviceNumber}${ext}`);
    } else {
      const timestamp = Date.now();
      cb(null, `${file.fieldname}_${timestamp}${ext}`);
    }
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Limit to 5MB
});

// Helper function to safely delete a file if it exists
async function safeDeleteFile(filePath) {
  try {
    await fs.access(filePath);
    await fs.unlink(filePath);
    console.log(`Deleted file: ${filePath}`);
  } catch (error) {
    if (error.code !== 'ENOENT') {
      console.error(`Error deleting file: ${filePath}`, error);
    }
  }
}

// Fetches clinic data from the database.
// If a clinic document is found, its services array is processed to convert image buffers to Base64 strings
// for easier frontend consumption.
// Responds with the clinic data or an error message if the fetch fails.
router.get('/clinic', async (req, res) => {
  try {
    console.log('Fetching clinic data...');
    const clinic = await Clinic.findOne();
    console.log('Raw clinic data:', clinic);
    
    if (clinic) {
      clinic.services = clinic.services.map(service => ({
        ...service.toObject(),
        image: service.image ? `${service.image}` : null,
      }));
      console.log('Processed services:', clinic.services);
    } else {
      console.log('No clinic found in database');
    }
    
    const response = {
      nameOne: clinic?.nameOne || null,
      nameTwo: clinic?.nameTwo || null,
      description: clinic?.description || null,
      address: clinic?.address || null,
      addressTwo: clinic?.addressTwo || null,
      nameOnePhone: clinic?.nameOnePhone || null,
      nameTwoPhone: clinic?.nameTwoPhone || null,
      termsAndConditions: clinic?.termsAndConditions || null,
      clinicCatchLine: clinic?.clinicCatchLine || null,
      clinicHeader: clinic?.clinicHeader || null,
      loginMessage: clinic?.loginMessage || null,
      loginDescription: clinic?.loginDescription || null,
      welcomeMessage: clinic?.welcomeMessage || null,
      signupMessage: clinic?.signupMessage || null,
      signupDescription: clinic?.signupDescription || null,
      services: clinic?.services || [],
      questionOne: clinic?.questionOne || null,
      questionTwo: clinic?.questionTwo || null,
      questionThree: clinic?.questionThree || null,
      questionFour: clinic?.questionFour || null,
      questionFive: clinic?.questionFive || null,
      questionSix: clinic?.questionSix || null,
      questionSeven: clinic?.questionSeven || null,
      questionEight: clinic?.questionEight || null,
      questionNine: clinic?.questionNine || null,
      questionTen: clinic?.questionTen || null,
    };
    
    console.log('Sending response:', response);
    res.json(response);
  } catch (err) {
    console.error('Error fetching clinic data:', err);
    res.status(500).json({ message: err.message });
  }
});

// Helper function to validate service data
const validateService = (service) => {
  const errors = [];
  if (!service.name || service.name.trim().length === 0) {
    errors.push('Service name is required');
  }
  if (!service.description || service.description.trim().length === 0) {
    errors.push('Service description is required');
  }
  if (typeof service.fee !== 'number' || service.fee < 0) {
    errors.push('Service fee must be a non-negative number');
  }
  if (!['both', 'clinicOne', 'clinicTwo'].includes(service.clinic)) {
    errors.push('Invalid clinic selection');
  }
  return errors;
};

// Helper function to clean up old service images
async function cleanupServiceImages(oldServices, newServices) {
  try {
    const oldImages = oldServices.map(s => s.image).filter(Boolean);
    const newImages = newServices.map(s => s.image).filter(Boolean);
    
    for (const oldImage of oldImages) {
      if (!newImages.includes(oldImage)) {
        const imageName = oldImage.split('/').pop();
        const imagePath = path.join(uploadDir, imageName);
        await safeDeleteFile(imagePath);
        console.log(`Cleaned up unused image: ${imagePath}`);
      }
    }
  } catch (error) {
    console.error('Error cleaning up service images:', error);
  }
}

// Updates or creates clinic data in the database.
// Parses form data to update clinic fields and services, including uploaded images stored in memory.
// Services are rebuilt entirely from the provided form data in the request body.
// If a clinic does not exist, a new document is created.
// Responds with a success message or an error message if the update fails.
router.put('/clinic', upload.any(), async (req, res) => {
  console.log('Files uploaded:', req.files);
  console.log('Request body:', req.body);

  try {
    let clinic = await Clinic.findOne();
    if (!clinic) {
      clinic = new Clinic();
    }

    // Store old services for cleanup
    const oldServices = [...clinic.services];

    // Update clinic fields from request body
    clinic.nameOne = req.body.nameOne || clinic.nameOne;
    clinic.nameTwo = req.body.nameTwo || clinic.nameTwo;
    clinic.description = req.body.description || clinic.description;
    clinic.address = req.body.address || clinic.address;
    clinic.addressTwo = req.body.addressTwo || clinic.addressTwo;
    clinic.clinicCatchLine = req.body.clinicCatchLine || clinic.clinicCatchLine;
    clinic.nameOnePhone = req.body.nameOnePhone || clinic.nameOnePhone;
    clinic.nameTwoPhone = req.body.nameTwoPhone || clinic.nameTwoPhone;
    clinic.termsAndConditions = req.body.termsAndConditions || clinic.termsAndConditions;
    clinic.clinicHeader = req.body.clinicHeader || clinic.clinicHeader;
    clinic.loginMessage = req.body.loginMessage || clinic.loginMessage;
    clinic.loginDescription = req.body.loginDescription || clinic.loginDescription;
    clinic.welcomeMessage = req.body.welcomeMessage || clinic.welcomeMessage;
    clinic.signupMessage = req.body.signupMessage || clinic.signupMessage;
    clinic.signupDescription = req.body.signupDescription || clinic.signupDescription;
    clinic.questionOne = req.body.questionOne || clinic.questionOne;
    clinic.questionTwo = req.body.questionTwo || clinic.questionTwo;
    clinic.questionThree = req.body.questionThree || clinic.questionThree;
    clinic.questionFour = req.body.questionFour || clinic.questionFour;
    clinic.questionFive = req.body.questionFive || clinic.questionFive;
    clinic.questionSix = req.body.questionSix || clinic.questionSix;
    clinic.questionSeven = req.body.questionSeven || clinic.questionSeven;
    clinic.questionEight = req.body.questionEight || clinic.questionEight;
    clinic.questionNine = req.body.questionNine || clinic.questionNine;
    clinic.questionTen = req.body.questionTen || clinic.questionTen;

    // Handle image uploads with validation
    const imageFields = ['clinicLogo', 'gcashQR', 'responsiveBg', 'mainImg'];
    for (const field of imageFields) {
      const image = req.files.find(file => file.fieldname === field);
      if (image) {
        if (!image.mimetype.startsWith('image/')) {
          return res.status(400).json({ message: `Invalid file type for ${field}` });
        }
        clinic[field] = `/uploads/${image.filename}`;
      }
    }

    // Process services with validation
    const newServices = [];
    const errors = [];
    let index = 0;

    while (req.body[`service_name_${index}`] !== undefined) {
      const serviceData = {
        name: req.body[`service_name_${index}`],
        description: req.body[`service_description_${index}`],
        clinic: req.body[`service_clinic_${index}`] || 'both',
        fee: parseFloat(req.body[`service_fee_${index}`]) || 0
      };

      // Handle service image
      const serviceImage = req.files.find(file => file.fieldname === `service_image_${index}`);
      if (serviceImage) {
        if (!serviceImage.mimetype.startsWith('image/')) {
          errors.push(`Invalid file type for service ${index + 1} image`);
          index++;
          continue;
        }
        serviceData.image = `/uploads/${serviceImage.filename}`;
      } else if (req.body[`service_image_${index}`]) {
        serviceData.image = req.body[`service_image_${index}`];
      }

      // Validate service data
      const serviceErrors = validateService(serviceData);
      if (serviceErrors.length > 0) {
        errors.push(`Service ${index + 1}: ${serviceErrors.join(', ')}`);
      } else {
        newServices.push(serviceData);
      }

      index++;
    }

    if (errors.length > 0) {
      // Clean up any uploaded files if there are validation errors
      for (const file of req.files) {
        await safeDeleteFile(path.join(uploadDir, file.filename));
      }
      return res.status(400).json({ message: 'Validation errors', errors });
    }

    // Update services and clean up old images
    clinic.services = newServices;
    await cleanupServiceImages(oldServices, newServices);

    await clinic.save();
    res.status(200).json({ 
      message: 'Clinic data updated successfully!',
      servicesCount: newServices.length
    });
  } catch (error) {
    // Clean up any uploaded files on error
    if (req.files) {
      for (const file of req.files) {
        await safeDeleteFile(path.join(uploadDir, file.filename));
      }
    }
    console.error('Error updating clinic:', error);
    res.status(500).json({ 
      message: 'Server error while updating clinic data',
      error: error.message 
    });
  }
});

// Removes a specific service from the `services` array of the clinic document by its ID.
// Validates the `serviceId` to ensure it is a valid MongoDB ObjectId.
// Uses `$pull` to remove the matching service from the `services` array in the clinic document.
// Responds with a success message, the updated clinic document, or an error message if the service or clinic is not found.
router.delete('/clinic/service/:serviceId', async (req, res) => {
  const { serviceId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(serviceId)) {
    return res.status(400).json({ message: 'Invalid service ID format' });
  }

  try {
    const clinic = await Clinic.findOne();
    if (!clinic) {
      return res.status(404).json({ message: 'Clinic not found' });
    }

    const serviceToDelete = clinic.services.find(
      service => service._id.toString() === serviceId
    );

    if (!serviceToDelete) {
      return res.status(404).json({ message: 'Service not found in clinic services' });
    }

    // Handle image deletion with enhanced error handling
    if (serviceToDelete.image) {
      try {
        const imageName = serviceToDelete.image.split('/').pop();
        const imagePath = path.join(uploadDir, imageName);
        await safeDeleteFile(imagePath);
        console.log(`Service image deleted: ${imagePath}`);
      } catch (imageError) {
        console.error('Error deleting service image:', imageError);
        // Continue with service deletion even if image deletion fails
      }
    }

    // Remove the service and maintain proper ordering
    clinic.services = clinic.services.filter(
      service => service._id.toString() !== serviceId
    );

    // Save changes
    await clinic.save();

    return res.status(200).json({
      message: 'Service removed successfully',
      deletedService: serviceToDelete,
      remainingServices: clinic.services.length
    });
  } catch (error) {
    console.error('Error while removing service:', error);
    return res.status(500).json({
      message: 'Server error while removing service',
      error: error.message
    });
  }
});

export default router;
