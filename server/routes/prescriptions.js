import express from 'express';
import { body, validationResult } from 'express-validator';
import Prescription from '../models/Prescription.js';
import Patient from '../models/Patient.js';
import User from '../models/User.js';
import { auth, role, requirePro } from '../middleware/auth.js';
import { generatePrescriptionPDF } from '../services/pdf.service.js';
import { getPrescriptionExplanation } from '../services/ai.service.js';

const router = express.Router();

router.get('/', auth, async (req, res) => {
  try {
    const q = {};
    if (req.user.role === 'doctor') q.doctorId = req.user._id;
    if (req.user.role === 'patient') {
      const patients = await Patient.find({ userId: req.user._id }).select('_id');
      q.patientId = { $in: patients.map(p => p._id) };
    }

    const prescriptions = await Prescription.find(q)
      .populate('patientId', 'name age gender contact')
      .populate('doctorId', 'name specialization')
      .sort({ createdAt: -1 })
      .lean();
    res.json(prescriptions);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.get('/patient/:patientId', auth, role('admin', 'doctor', 'receptionist', 'patient'), async (req, res) => {
  try {
    const pat = await Patient.findById(req.params.patientId);
    if (!pat) return res.status(404).json({ error: 'Patient not found.' });
    if (req.user.role === 'patient' && pat.userId?.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Access denied.' });
    }

    const prescriptions = await Prescription.find({ patientId: req.params.patientId })
      .populate('doctorId', 'name specialization')
      .sort({ createdAt: -1 })
      .lean();
    res.json(prescriptions);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const p = await Prescription.findById(req.params.id)
      .populate('patientId', 'name age gender contact')
      .populate('doctorId', 'name specialization')
      .lean();
    if (!p) return res.status(404).json({ error: 'Prescription not found.' });
    if (req.user.role === 'patient') {
      const pat = await Patient.findOne({ userId: req.user._id, _id: p.patientId?._id });
      if (!pat) return res.status(403).json({ error: 'Access denied.' });
    } else if (!['admin', 'doctor', 'receptionist'].includes(req.user.role)) {
      return res.status(403).json({ error: 'Access denied.' });
    }
    res.json(p);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.post('/',
  auth,
  role('doctor'),
  body('patientId').isMongoId(),
  body('medicines').isArray({ min: 1 }),
  body('medicines.*.name').notEmpty(),
  body('medicines.*.dosage').notEmpty(),
  body('medicines.*.frequency').notEmpty(),
  body('medicines.*.duration').notEmpty(),
  async (req, res) => {
    try {
      const err = validationResult(req);
      if (!err.isEmpty()) return res.status(400).json({ error: err.array()[0].msg });

      const payload = {
        patientId: req.body.patientId,
        doctorId: req.user._id,
        medicines: req.body.medicines,
        instructions: req.body.instructions || '',
        diagnosis: req.body.diagnosis || '',
        appointmentId: req.body.appointmentId
      };

      const prescription = await Prescription.create(payload);

      if (req.user.subscriptionPlan === 'pro') {
        const ai = await getPrescriptionExplanation(prescription.medicines, prescription.diagnosis);
        if (ai.success) {
          prescription.aiExplanation = ai.data;
          await prescription.save();
        }
      }

      const populated = await Prescription.findById(prescription._id)
        .populate('patientId', 'name age gender contact')
        .populate('doctorId', 'name specialization')
        .lean();
      res.status(201).json(populated);
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  }
);

router.get('/:id/pdf', auth, async (req, res) => {
  try {
    const prescription = await Prescription.findById(req.params.id)
      .populate('patientId')
      .populate('doctorId')
      .lean();
    if (!prescription) return res.status(404).json({ error: 'Prescription not found.' });

    if (req.user.role === 'patient') {
      const pat = await Patient.findOne({ userId: req.user._id, _id: prescription.patientId._id });
      if (!pat) return res.status(403).json({ error: 'Access denied.' });
    } else if (!['admin', 'doctor', 'receptionist'].includes(req.user.role)) {
      return res.status(403).json({ error: 'Access denied.' });
    }

    const pdf = await generatePrescriptionPDF(
      prescription,
      prescription.patientId,
      prescription.doctorId
    );
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=prescription-${req.params.id}.pdf`);
    res.send(pdf);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

export default router;
