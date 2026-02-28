import mongoose from 'mongoose';

const medicineSchema = new mongoose.Schema({
  name: { type: String, required: true },
  dosage: { type: String, required: true },
  frequency: { type: String, required: true },
  duration: { type: String, required: true }
}, { _id: false });

const prescriptionSchema = new mongoose.Schema({
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  appointmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment' },
  medicines: [medicineSchema],
  instructions: { type: String, default: '' },
  diagnosis: { type: String, default: '' },
  aiExplanation: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Prescription', prescriptionSchema);
