import express, { json } from 'express';
import Clinic from '../models/clinicSchema.js';
import multer from 'multer';
import mongoose from 'mongoose';
import path from 'path';

import fs from 'fs'; // For synchronous file operations

const uploadDir = path.join(process.cwd(), 'src', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const app = express();

app.use('/uploads', express.static(path.join(process.cwd(), 'src', 'uploads')));

const router = express.Router();

// Multer configuration for handling image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    if (file.fieldname === 'responsiveBg') {
      cb(null, 'responsiveBg.png');
    } else if (file.fieldname === 'clinicLogo') {
        cb(null, 'clinicLogo.png');
    } else {
      const match = file.fieldname.match(/service_image_(\d+)/);
      const index = match ? parseInt(match[1], 10) : 'unknown';
      cb(null, `services${index}.png`);
    }
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 3 * 1024 * 1024 }, // Limit to 3MB
});


// Fetches clinic data from the database.
// If a clinic document is found, its services array is processed to convert image buffers to Base64 strings
// for easier frontend consumption.
// Responds with the clinic data or an error message if the fetch fails.
router.get('/clinic', async (req, res) => {
  try {
    const clinic = await Clinic.findOne();
    if (clinic) {
      clinic.services = clinic.services.map(service => ({
        ...service.toObject(),
        //image: service.image ? `${req.protocol}://${req.get('host')}${service.image}` : null, // Full image URL
        image: service.image ? `${service.image}` : null, 
      }));
    }
    console.log('Fetched clinic data:', clinic);
    res.json({
      nameOne: clinic?.nameOne || null,
      nameTwo: clinic?.nameTwo || null,
      description: clinic?.description || null,
      address: clinic?.address || null,
      addressTwo: clinic?.addressTwo || null,
      clinicCatchLine: clinic?.clinicCatchLine || null,
      clinicHeader: clinic?.clinicHeader || null,
      loginMessage: clinic?.loginMessage || null,
      loginDescription: clinic?.loginDescription || null,
      welcomeMessage: clinic?.welcomeMessage || null,
      signupMessage: clinic?.signupMessage || null,
      signupDescription: clinic?.signupDescription || null,
      services: clinic?.services || [],
    });
  } catch (err) {
    console.error('Error fetching clinic data:', err);
    res.status(500).json({ message: err.message });
  }
});


// Updates or creates clinic data in the database.
// Parses form data to update clinic fields and services, including uploaded images stored in memory.
// Services are rebuilt entirely from the provided form data in the request body.
// If a clinic does not exist, a new document is created.
// Responds with a success message or an error message if the update fails.
router.put('/clinic', upload.any(), async (req, res) => {
  console.log('Files uploaded:', req.files);
  console.log('Request body:', req.body); // Log the request body for debugging

  try {
    let clinic = await Clinic.findOne();

    if (!clinic) {
      clinic = new Clinic();
    }

    // Update clinic fields from request body
    clinic.nameOne = req.body.nameOne || clinic.nameOne;
    clinic.nameTwo = req.body.nameTwo || clinic.nameTwo;
    clinic.description = req.body.description || clinic.description;
    clinic.address = req.body.address || clinic.address;
    clinic.addressTwo = req.body.addressTwo || clinic.addressTwo;
    clinic.clinicCatchLine = req.body.clinicCatchLine || clinic.clinicCatchLine;
    clinic.clinicHeader = req.body.clinicHeader || clinic.clinicHeader;
    clinic.loginMessage = req.body.loginMessage || clinic.loginMessage;
    clinic.loginDescription = req.body.loginDescription || clinic.loginDescription;
    clinic.welcomeMessage = req.body.welcomeMessage || clinic.welcomeMessage;
    clinic.signupMessage = req.body.signupMessage || clinic.signupMessage;
    clinic.signupDescription = req.body.signupDescription || clinic.signupDescription;

    // Handle clinicLogo image
    const clinicLogoImage = req.files.find(file => file.fieldname === 'clinicLogo');
    if (clinicLogoImage) {
      const clinicLogoPath = path.join(uploadDir, 'clinicLogo.png');
      try {
        await fs.unlink(clinicLogoPath); // Delete existing logo if it exists
        console.log(`Replaced existing ClinicLogo image: ${clinicLogoPath}`);
      } catch (err) {
        if (err.code !== 'ENOENT') {
          console.error(`Error deleting ClinicLogo files: ${clinicLogoPath}`);
        }
      }
      clinic.clinicLogo = fs.readFileSync(clinicLogoImage.path); // Save as Buffer
    }

    // Handle responsiveBg image
    const responsiveBgImage = req.files.find(file => file.fieldname === 'responsiveBg');
    if (responsiveBgImage) {
      const responsiveBgPath = path.join(uploadDir, 'responsiveBg.png');
      try {
        await fs.unlink(responsiveBgPath); // Delete existing background if it exists
        console.log(`Replaced existing responsiveBg image: ${responsiveBgPath}`);
      } catch (err) {
        if (err.code !== 'ENOENT') {
          console.error(`Error deleting responsiveBg file: ${responsiveBgPath}`, err);
        }
      }
      clinic.responsiveBg = fs.readFileSync(responsiveBgImage.path); // Save as Buffer
    }

    // Handle services
    clinic.services = []; // Reset services array
    for (let i = 0; req.body[`service_name_${i}`]; i++) {
      const serviceImage = req.files.find(file => file.fieldname === `service_image_${i}`);
      const filename = `services${i}.png`;
      const filePath = path.join(uploadDir, filename);

      // Replace the existing file if it exists
      if (serviceImage) {
        try {
          await fs.unlink(filePath); // Delete the existing file
          console.log(`Replaced existing image: ${filePath}`);
        } catch (err) {
          if (err.code !== 'ENOENT') {
            console.error(`Error deleting file: ${filePath}`, err);
          }
        }
      }

      // Add service to the array
      clinic.services.push({
        name: req.body[`service_name_${i}`],
        description: req.body[`service_description_${i}`],
        image: `/uploads/${filename}`, // Save the relative path
        clinic: req.body[`service_clinic_${i}`] || 'both',
      });
    }

    await clinic.save();
    res.status(200).json({ message: 'Clinic data updated successfully!' });
  } catch (error) {
    console.error('Error updating clinic:', error);
    res.status(500).json({ message: error.message || 'Server error, please try again later.' });
  }
});

// Removes a specific service from the `services` array of the clinic document by its ID.
// Validates the `serviceId` to ensure it is a valid MongoDB ObjectId.
// Uses `$pull` to remove the matching service from the `services` array in the clinic document.
// Responds with a success message, the updated clinic document, or an error message if the service or clinic is not found.
router.delete('/clinic/service/:serviceId', async (req, res) => {
  const { serviceId } = req.params;

  // Validate `serviceId`
  if (!mongoose.Types.ObjectId.isValid(serviceId)) {
    return res.status(400).json({ message: 'Invalid service ID format' });
  }

  try {
    // Find the clinic and remove the service with the matching `serviceId` from the `services` array
    const clinic = await Clinic.findOneAndUpdate(
      { 'services._id': serviceId }, // Match the service ID within the services array
      { $pull: { services: { _id: serviceId } } }, // Pull the service from the array
      { new: true } // Return the updated document
    );

    if (!clinic) {
      return res.status(404).json({ message: 'Service or clinic not found' });
    }

    console.log(`Service with ID ${serviceId} removed successfully.`);
    return res.status(200).json({ message: 'Service removed successfully', clinic });
  } catch (error) {
    console.error('Error while removing service:', error);
    return res.status(500).json({ message: 'Server error, please try again later' });
  }
});

export default router;
