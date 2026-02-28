import express from 'express';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import User from '../models/User.js';
import Patient from '../models/Patient.js';
import { auth, role } from '../middleware/auth.js';

const router = express.Router();

router.post('/register',
  body('name').trim().notEmpty(),
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('role').isIn(['admin', 'doctor', 'receptionist', 'patient']),
  async (req, res) => {
    try {
      const err = validationResult(req);
      if (!err.isEmpty()) return res.status(400).json({ error: err.array()[0].msg });

      const { name, email, password, role } = req.body;
      const existing = await User.findOne({ email });
      if (existing) return res.status(400).json({ error: 'Email already registered.' });

      const user = await User.create({ name, email, password, role });
      if (role === 'patient') {
        await Patient.create({ name, age: 0, gender: 'other', createdBy: user._id, userId: user._id });
      }
      const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
      res.status(201).json({
        token,
        user: { id: user._id, name: user.name, email: user.email, role: user.role, subscriptionPlan: user.subscriptionPlan }
      });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  }
);

router.post('/login',
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty(),
  async (req, res) => {
    try {
      const err = validationResult(req);
      if (!err.isEmpty()) return res.status(400).json({ error: err.array()[0].msg });

      const user = await User.findOne({ email: req.body.email }).select('+password');
      if (!user) return res.status(401).json({ error: 'Invalid credentials.' });

      const ok = await user.comparePassword(req.body.password);
      if (!ok) return res.status(401).json({ error: 'Invalid credentials.' });

      const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
      res.json({
        token,
        user: { id: user._id, name: user.name, email: user.email, role: user.role, subscriptionPlan: user.subscriptionPlan }
      });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  }
);

router.get('/me', auth, (req, res) => {
  res.json({ user: req.user });
});

export default router;
