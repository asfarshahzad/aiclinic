import express from 'express';
import { body, validationResult } from 'express-validator';
import Patient from '../models/Patient.js';
import Appointment from '../models/Appointment.js';
import Prescription from '../models/Prescription.js';
import DiagnosisLog from '../models/DiagnosisLog.js';
import { auth, role } from '../middleware/auth.js';

const router = express.Router();

router.get('/me', auth, role('patient'), async (req, res) => {
  try {
    const patients = await Patient.find({ userId: req.user._id }).lean();
    res.json(patients);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.get('/', auth, role('admin', 'receptionist', 'doctor', 'patient'), async (req, res) => {
  try {
    if (req.user.role === 'patient') {
      const patients = await Patient.find({ userId: req.user._id }).sort({ createdAt: -1 }).lean();
      return res.json(patients);
    }
    const patients = await Patient.find()
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 })
      .lean();
    res.json(patients);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.get('/:id', auth, role('admin', 'receptionist', 'doctor', 'patient'), async (req, res) => {
  try {
    const p = await Patient.findById(req.params.id).populate('createdBy', 'name').lean();
    if (!p) return res.status(404).json({ error: 'Patient not found.' });
    if (req.user.role === 'patient' && p.userId?.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Access denied.' });
    }
    res.json(p);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.get('/:id/history', auth, role('admin', 'receptionist', 'doctor', 'patient'), async (req, res) => {
  try {
    const p = await Patient.findById(req.params.id).lean();
    if (!p) return res.status(404).json({ error: 'Patient not found.' });
    if (req.user.role === 'patient' && p.userId?.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Access denied.' });
    }

    const [appointments, prescriptions, diagnoses] = await Promise.all([
      Appointment.find({ patientId: req.params.id }).populate('doctorId', 'name').sort({ date: -1 }).lean(),
      Prescription.find({ patientId: req.params.id }).populate('doctorId', 'name').sort({ createdAt: -1 }).lean(),
      DiagnosisLog.find({ patientId: req.params.id }).populate('doctorId', 'name').sort({ createdAt: -1 }).lean()
    ]);

    const timeline = [
      ...appointments.map(a => ({ type: 'appointment', data: a, date: a.date })),
      ...prescriptions.map(pr => ({ type: 'prescription', data: pr, date: pr.createdAt })),
      ...diagnoses.map(d => ({ type: 'diagnosis', data: d, date: d.createdAt }))
    ].sort((a, b) => new Date(b.date) - new Date(a.date));

    res.json({ patient: p, timeline });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.post('/',
  auth,
  role('admin', 'receptionist'),
  body('name').trim().notEmpty(),
  body('age').isInt({ min: 1, max: 150 }),
  body('gender').isIn(['male', 'female', 'other']),
  async (req, res) => {
    try {
      const err = validationResult(req);
      if (!err.isEmpty()) return res.status(400).json({ error: err.array()[0].msg });

      const User = (await import('../models/User.js')).default;
      const hasPro = await User.exists({ role: 'admin', subscriptionPlan: 'pro' });
      if (!hasPro) {
        const count = await Patient.countDocuments();
        if (count >= 50) return res.status(403).json({ error: 'Free plan limit: max 50 patients. Upgrade to Pro.' });
      }

      const patient = await Patient.create({
        ...req.body,
        createdBy: req.user._id
      });
      res.status(201).json(patient);
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  }
);

router.put('/:id',
  auth,
  role('admin', 'receptionist'),
  body('name').optional().trim().notEmpty(),
  body('age').optional().isInt({ min: 1, max: 150 }),
  body('gender').optional().isIn(['male', 'female', 'other']),
  async (req, res) => {
    try {
      const p = await Patient.findByIdAndUpdate(req.params.id, req.body, { new: true });
      if (!p) return res.status(404).json({ error: 'Patient not found.' });
      res.json(p);
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  }
);

router.delete('/:id', auth, role('admin'), async (req, res) => {
  try {
    const p = await Patient.findByIdAndDelete(req.params.id);
    if (!p) return res.status(404).json({ error: 'Patient not found.' });
    res.json({ message: 'Deleted' });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

export default router;
