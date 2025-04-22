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

// GET route for fetching clinic data
router.get('/clinic', async (req, res) => {
  try {
    console.log('Fetching clinic data...');
    const clinic = await Clinic.findOne();
    console.log('Raw clinic data:', clinic);
    
    if (clinic) {
      // Process services
      clinic.services = clinic.services.map(service => ({
        ...service.toObject(),
        image: service.image ? `${service.image}` : null,
      }));
      console.log('Processed services:', clinic.services);

      // Process medicines
      if (!clinic.medicines) {
        clinic.medicines = [];
      }
      clinic.medicines = clinic.medicines.map(medicine => ({
        ...medicine.toObject(),
        fees: medicine.fees || []
      }));
      console.log('Processed medicines:', clinic.medicines);
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
      medicines: clinic?.medicines || [],
      faqs: clinic?.faqs || [],
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

    res.status(200).json(response);
  } catch (err) {
    console.error('Error fetching clinic data:', err);
    res.status(500).json({ message: err.message });
  }
});

// Update the validateService function to handle fee array
const validateService = (service) => {
  const errors = [];
  if (!service.name || service.name.trim().length === 0) {
    errors.push('Service name is required');
  }
  if (!service.description || service.description.trim().length === 0) {
    errors.push('Service description is required');
  }
  if (!Array.isArray(service.fees)) {
    errors.push('Fees must be an array');
  } else {
    service.fees.forEach((fee, index) => {
      if (!fee.feeType) {
        errors.push(`Fee type is required for fee ${index + 1}`);
      }
      if (typeof fee.amount !== 'number' || fee.amount < 0) {
        errors.push(`Fee amount must be a non-negative number for fee ${index + 1}`);
      }
    });
  }
  if (!['both', 'clinicOne', 'clinicTwo'].includes(service.clinic)) {
    errors.push('Invalid clinic selection');
  }  return errors;};

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

// Update validateMedicine function to handle empty fees
const validateMedicine = (medicine) => {
  const errors = [];
  if (!medicine.medicineName || medicine.medicineName.trim().length === 0) {
    errors.push('Medicine name is required');
  }
  if (!medicine.medicineDescription || medicine.medicineDescription.trim().length === 0) {
    errors.push('Medicine description is required');
  }
  if (medicine.fees && Array.isArray(medicine.fees)) {
    medicine.fees.forEach((fee, index) => {
      if (!fee.feeType) {
        errors.push(`Fee type is required for fee ${index + 1}`);
      }
      if (typeof fee.amount !== 'number' || fee.amount < 0) {
        errors.push(`Fee amount must be a non-negative number for fee ${index + 1}`);
      }
    });
  }
  return errors;
};

// Update the clinic PUT route to handle service fees
router.put('/clinic', upload.fields([
  { name: 'responsiveBg', maxCount: 1 },
  { name: 'mainImg', maxCount: 1 },
  { name: 'gcashQR', maxCount: 1 },
  { name: 'clinicLogo', maxCount: 1 },
  // Add dynamic fields for service images
  ...Array(50).fill().map((_, i) => ({ name: `service_image_${i}`, maxCount: 1 }))
]), async (req, res) => {
  try {
    console.log('Received clinic update request');
    
    // Find existing clinic or create new one
    let clinic = await Clinic.findOne();
    if (!clinic) {
      clinic = new Clinic();
    }
    
    // Update basic clinic info
    const basicFields = [
      'nameOne', 'nameTwo', 'description', 'address', 'addressTwo',
      'clinicCatchLine', 'clinicHeader', 'loginMessage', 'loginDescription',
      'welcomeMessage', 'signupMessage', 'signupDescription',
      'nameOnePhone', 'nameTwoPhone', 'termsAndConditions',
      'questionOne', 'questionTwo', 'questionThree', 'questionFour', 'questionFive',
      'questionSix', 'questionSeven', 'questionEight', 'questionNine', 'questionTen'
    ];
    
    basicFields.forEach(field => {
      if (req.body[field] !== undefined) {
        clinic[field] = req.body[field];
      }
    });
    
    // Handle main images
    if (req.files) {
      if (req.files.responsiveBg) {
        clinic.responsiveBg = `/uploads/${req.files.responsiveBg[0].filename}`;
      }
      if (req.files.mainImg) {
        clinic.mainImg = `/uploads/${req.files.mainImg[0].filename}`;
      }
      if (req.files.gcashQR) {
        clinic.gcashQR = `/uploads/${req.files.gcashQR[0].filename}`;
      }
      if (req.files.clinicLogo) {
        clinic.clinicLogo = `/uploads/${req.files.clinicLogo[0].filename}`;
      }
    }
    
    // Process services
    const servicesCount = parseInt(req.body.servicesCount) || 0;
    const updatedServices = [];
    
    for (let i = 0; i < servicesCount; i++) {
      const name = req.body[`service_name_${i}`];
      const description = req.body[`service_description_${i}`];
      const clinicType = req.body[`service_clinic_${i}`];
      const serviceId = req.body[`service_id_${i}`];
      
      // Find existing service or create new one
      let service;
      if (serviceId) {
        service = clinic.services.find(s => s._id.toString() === serviceId);
      }
      
      if (!service) {
        service = { 
          name, 
          description, 
          clinic: clinicType,
          fees: []
        };
      } else {
        service.name = name;
        service.description = description;
        service.clinic = clinicType;
      }
      
      // Handle service image
      if (req.files && req.files[`service_image_${i}`]) {
        // New image uploaded
        service.image = `/uploads/${req.files[`service_image_${i}`][0].filename}`;
      } else if (req.body[`service_image_remove_${i}`] === 'true') {
        // Image removed
        service.image = null;
      } else if (req.body[`service_image_path_${i}`]) {
        // Use existing image path
        service.image = req.body[`service_image_path_${i}`];
      }
      
      // Handle service fees
      const feesCount = parseInt(req.body[`service_fees_count_${i}`]) || 0;
      const fees = [];
      
      for (let j = 0; j < feesCount; j++) {
        const feeType = req.body[`service_fee_type_${i}_${j}`] || 'Default';
        const amount = parseFloat(req.body[`service_fee_amount_${i}_${j}`]) || 0;
        const description = req.body[`service_fee_description_${i}_${j}`] || '';
        
        fees.push({
          feeType,
          amount,
          description
        });
      }
      
      // Update service fees
      service.fees = fees.length > 0 ? fees : [{ feeType: 'Default', amount: 0, description: '' }];
      
      updatedServices.push(service);
    }
    
    // Update services array
    clinic.services = updatedServices;
    
    // Process medicines
    const medicinesCount = parseInt(req.body.medicinesCount) || 0;
    const updatedMedicines = [];
    
    for (let i = 0; i < medicinesCount; i++) {
      const medicineName = req.body[`medicine_name_${i}`];
      const medicineAmount = parseFloat(req.body[`medicine_amount_${i}`]) || 0;
      const medicineDescription = req.body[`medicine_description_${i}`] || '';
      const discountApplicable = req.body[`medicine_discount_${i}`] === 'true';
      
      // Handle medicine fees
      const feesCount = parseInt(req.body[`medicine_fees_count_${i}`]) || 0;
      const fees = [];
      
      for (let j = 0; j < feesCount; j++) {
        const feeType = req.body[`medicine_fee_type_${i}_${j}`] || 'Default';
        const amount = parseFloat(req.body[`medicine_fee_amount_${i}_${j}`]) || 0;
        const description = req.body[`medicine_fee_description_${i}_${j}`] || '';
        
        fees.push({
          feeType,
          amount,
          description
        });
      }
      
      updatedMedicines.push({
        medicineName,
        medicineAmount,
        medicineDescription,
        discountApplicable,
        fees: fees.length > 0 ? fees : [{ feeType: 'Default', amount: 0, description: '' }]
      });
    }
    
    // Update medicines array if medicines were provided
    if (medicinesCount > 0) {
      clinic.medicines = updatedMedicines;
    }
    
    // Process FAQs
    const faqsCount = parseInt(req.body.faqsCount) || 0;
    const updatedFaqs = [];
    
    for (let i = 0; i < faqsCount; i++) {
      const question = req.body[`faq_question_${i}`];
      const answer = req.body[`faq_answer_${i}`];
      const isActive = req.body[`faq_isActive_${i}`] === 'true';
      
      if (question && answer) {
        updatedFaqs.push({
          question,
          answer,
          isActive
        });
      }
    }
    
    // Update FAQs array if FAQs were provided
    if (faqsCount > 0) {
      clinic.faqs = updatedFaqs;
    }
    
    // Save updated clinic
    await clinic.save();
    
    console.log('Clinic updated successfully');
    res.status(200).json({ 
      message: 'Clinic updated successfully',
      clinic
    });
  } catch (error) {
    console.error('Error updating clinic:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
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

// Update the service image upload route to preserve the old image
router.post('/service-image/:serviceId', upload.single('serviceImage'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const serviceId = req.params.serviceId;
    console.log('Uploading image for service ID:', serviceId);
    console.log('File details:', req.file);
    
    // Find the clinic document
    const clinic = await Clinic.findOne();
    if (!clinic) {
      return res.status(404).json({ error: 'Clinic not found' });
    }

    // Find the service in the clinic's services array
    const serviceIndex = clinic.services.findIndex(
      service => service._id.toString() === serviceId
    );

    if (serviceIndex === -1) {
      console.log('Service not found. Available services:', clinic.services.map(s => s._id.toString()));
      return res.status(404).json({ error: 'Service not found' });
    }

    // Store the old image path before updating
    const oldImagePath = clinic.services[serviceIndex].image;
    
    // Update the service's image path
    const imagePath = `/uploads/${req.file.filename}`;
    clinic.services[serviceIndex].image = imagePath;

    // Save the updated clinic document
    await clinic.save();
    console.log('Service image updated successfully:', imagePath);

    // If save was successful and there was an old image, try to delete it
    // Only if it's not the default image and the path is different
    if (oldImagePath && 
        oldImagePath !== imagePath && 
        !oldImagePath.includes('default') && 
        fs.existsSync(path.join(__dirname, '..', oldImagePath.replace(/^\//, '')))) {
      try {
        await fs.unlink(path.join(__dirname, '..', oldImagePath.replace(/^\//, '')));
        console.log('Old image deleted:', oldImagePath);
      } catch (unlinkError) {
        console.error('Error deleting old image:', unlinkError);
        // Non-critical error, continue
      }
    }

    res.status(200).json({ 
      message: 'Service image uploaded successfully',
      path: imagePath
    });
  } catch (error) {
    console.error('Error uploading service image:', error);
    
    // Clean up the uploaded file if there was an error
    if (req.file) {
      try {
        await fs.unlink(path.join(__dirname, '..', 'uploads', req.file.filename));
      } catch (unlinkError) {
        console.error('Error deleting file after error:', unlinkError);
      }
    }
    
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

export default router;
