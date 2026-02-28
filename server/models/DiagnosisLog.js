import mongoose from 'mongoose';

const diagnosisLogSchema = new mongoose.Schema({
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  symptoms: { type: String, required: true },
  age: { type: Number },
  gender: { type: String },
  history: { type: String, default: '' },
  aiResponse: { type: mongoose.Schema.Types.Mixed }, // JSON: conditions, riskLevel, suggestedTests
  riskLevel: { type: String, enum: ['low', 'medium', 'high', ''], default: '' },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('DiagnosisLog', diagnosisLogSchema);
