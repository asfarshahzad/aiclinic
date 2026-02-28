import mongoose from 'mongoose';

const patientSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  age: { type: Number, required: true },
  gender: { type: String, enum: ['male', 'female', 'other'], required: true },
  contact: { type: String, default: '' },
  address: { type: String, default: '' },
  bloodGroup: { type: String, default: '' },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // if patient has login
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Patient', patientSchema);
