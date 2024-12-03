import mongoose from 'mongoose';

const serviceSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  image: { type: Buffer, contentType: String },
});

const clinicSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  services: [serviceSchema],
});

export default mongoose.model('Clinic', clinicSchema);
