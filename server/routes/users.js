import express from 'express';
import User from '../models/User.js';
import { auth, role } from '../middleware/auth.js';
import { body, validationResult } from 'express-validator';

const router = express.Router();

router.get('/doctors', auth, role('admin', 'receptionist'), async (req, res) => {
  try {
    const doctors = await User.find({ role: 'doctor' })
      .select('name email specialization')
      .lean();
    res.json(doctors);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.get('/', auth, role('admin'), async (req, res) => {
  try {
    const users = await User.find().select('-password').lean();
    res.json(users);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.patch('/:id/subscription',
  auth,
  role('admin'),
  body('subscriptionPlan').isIn(['free', 'pro']),
  async (req, res) => {
    try {
      const user = await User.findByIdAndUpdate(
        req.params.id,
        { subscriptionPlan: req.body.subscriptionPlan },
        { new: true }
      ).select('-password');
      if (!user) return res.status(404).json({ error: 'User not found.' });
      res.json(user);
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  }
);

export default router;
