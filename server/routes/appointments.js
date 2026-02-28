import express from 'express';
import { body, validationResult } from 'express-validator';
import Appointment from '../models/Appointment.js';
import Patient from '../models/Patient.js';
import { auth, role } from '../middleware/auth.js';

const router = express.Router();

router.get('/', auth, async (req, res) => {
  try {
    const q = {};
    if (req.user.role === 'doctor') q.doctorId = req.user._id;
    if (req.user.role === 'patient') {
      const patients = await Patient.find({ userId: req.user._id }).select('_id');
      q.patientId = { $in: patients.map(p => p._id) };
    }

    const appointments = await Appointment.find(q)
      .populate('patientId', 'name age gender contact')
      .populate('doctorId', 'name specialization')
      .sort({ date: 1 })
      .lean();
    res.json(appointments);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.get('/doctor/:doctorId', auth, role('admin', 'receptionist', 'doctor'), async (req, res) => {
  try {
    const { date } = req.query;
    const q = { doctorId: req.params.doctorId };
    if (date) {
      const d = new Date(date);
      d.setHours(0, 0, 0, 0);
      const end = new Date(d);
      end.setDate(end.getDate() + 1);
      q.date = { $gte: d, $lt: end };
    }
    const appointments = await Appointment.find(q)
      .populate('patientId', 'name age gender contact')
      .sort({ date: 1 })
      .lean();
    res.json(appointments);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.post('/',
  auth,
  role('admin', 'receptionist', 'patient'),
  body('patientId').isMongoId(),
  body('doctorId').isMongoId(),
  body('date').isISO8601(),
  async (req, res) => {
    try {
      const err = validationResult(req);
      if (!err.isEmpty()) return res.status(400).json({ error: err.array()[0].msg });

      if (req.user.role === 'patient') {
        const pat = await Patient.findOne({ userId: req.user._id, _id: req.body.patientId });
        if (!pat) return res.status(403).json({ error: 'You can only book for your own profile.' });
      }

      const apt = await Appointment.create({
        ...req.body,
        date: new Date(req.body.date),
        bookedBy: req.user._id
      });
      const populated = await apt.populate(['patientId', 'doctorId']);
      res.status(201).json(populated);
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  }
);

router.patch('/:id/status',
  auth,
  role('admin', 'receptionist', 'doctor'),
  body('status').isIn(['pending', 'confirmed', 'completed', 'cancelled']),
  async (req, res) => {
    try {
      const apt = await Appointment.findByIdAndUpdate(
        req.params.id,
        { status: req.body.status },
        { new: true }
      ).populate(['patientId', 'doctorId']);
      if (!apt) return res.status(404).json({ error: 'Appointment not found.' });
      res.json(apt);
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  }
);

router.delete('/:id', auth, role('admin', 'receptionist'), async (req, res) => {
  try {
    const apt = await Appointment.findByIdAndDelete(req.params.id);
    if (!apt) return res.status(404).json({ error: 'Appointment not found.' });
    res.json({ message: 'Cancelled' });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

export default router;
