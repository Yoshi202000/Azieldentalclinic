import express from 'express';
import Clinic from '../models/clinicSchema.js';
import multer from 'multer';

const router = express.Router();
const upload = multer(); // For handling multipart/form-data

// Get clinic data
router.get('/clinic', async (req, res) => {
  try {
    const clinic = await Clinic.findOne();
    if (clinic) {
      // Convert images to Base64 for frontend consumption
      clinic.services = clinic.services.map(service => {
        if (service.image) {
          service.image = service.image.toString('base64');
        }
        return service;
      });
    }
    console.log('Fetched clinic data:', clinic);
    res.json(clinic);
  } catch (err) {
    console.error('Error fetching clinic data:', err);
    res.status(500).json({ message: err.message });
  }
});

// Create or update clinic data
router.put('/clinic', upload.any(), async (req, res) => {
  try {
    console.log('Received PUT request with body:', req.body);
    console.log('Received files:', req.files);

    const { name, description } = req.body;

    // Initialize services array
    const services = [];

    // Iterate through req.body to reconstruct services
    const serviceKeys = Object.keys(req.body).filter(key => key.startsWith('service_name_'));
    serviceKeys.forEach((key) => {
      const index = key.split('_')[2]; // Extract the index from the key
      if (!services[index]) {
        services[index] = { name: '', description: '', image: null };
      }
      services[index].name = req.body[`service_name_${index}`];
      services[index].description = req.body[`service_description_${index}`];
    });

    // Attach images from req.files to the appropriate service
    req.files.forEach((file) => {
      const match = file.fieldname.match(/^service_image_(\d+)$/);
      if (match) {
        const index = parseInt(match[1], 10);
        if (!services[index]) {
          services[index] = { name: '', description: '', image: null };
        }
        services[index].image = file.buffer;
      }
    });

    console.log('Constructed services array:', services);

    // Update or create clinic data
    let clinic = await Clinic.findOne();
    if (clinic) {
      console.log('Updating existing clinic');
      clinic.name = name;
      clinic.description = description;
      clinic.services = services;

      // Explicitly mark `services` as modified
      clinic.markModified('services');
    } else {
      console.log('Creating new clinic');
      clinic = new Clinic({
        name,
        description,
        services,
      });
    }

    await clinic.save();
    console.log('Clinic data saved successfully');
    res.status(200).json({ message: 'Clinic data updated successfully!' });
  } catch (err) {
    console.error('Error updating clinic:', err);
    res.status(400).json({ message: err.message });
  }
});

// Remove a service by ID
router.delete('/clinic/service/:serviceId', async (req, res) => {
  const { serviceId } = req.params;
  console.log(`Received DELETE request for service ID: ${serviceId}`);

  try {
    let clinic = await Clinic.findOne();
    if (clinic) {
      clinic.services = clinic.services.filter(service => service._id.toString() !== serviceId);
      await clinic.save();
      console.log(`Service with ID ${serviceId} removed successfully`);
      res.status(200).json({ message: 'Service removed successfully!' });
    } else {
      console.error('Clinic not found');
      res.status(404).json({ message: 'Clinic not found' });
    }
  } catch (err) {
    console.error('Error removing service:', err);
    res.status(500).json({ message: err.message });
  }
});

export default router;
