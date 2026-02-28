import express from 'express';
import { body, validationResult } from 'express-validator';
import DiagnosisLog from '../models/DiagnosisLog.js';
import Prescription from '../models/Prescription.js';
import Patient from '../models/Patient.js';
import { auth, role, requirePro } from '../middleware/auth.js';
import { getSymptomAnalysis, getRiskFlags } from '../services/ai.service.js';
import rateLimit from 'express-rate-limit';

const router = express.Router();
const aiLimiter = rateLimit({ windowMs: 60 * 1000, max: 20 });

router.post('/symptom-check',
  auth,
  role('doctor'),
  requirePro,
  aiLimiter,
  body('patientId').isMongoId(),
  body('symptoms').trim().notEmpty(),
  body('age').isInt({ min: 1, max: 150 }),
  body('gender').isIn(['male', 'female', 'other']),
  async (req, res) => {
    try {
      const err = validationResult(req);
      if (!err.isEmpty()) return res.status(400).json({ error: err.array()[0].msg });

      const { patientId, symptoms, age, gender, history } = req.body;
      const result = await getSymptomAnalysis({ symptoms, age, gender, history: history || '' });

      if (!result.success) {
        return res.status(503).json({ error: result.message });
      }

      const riskLevel = result.data?.riskLevel || 'low';
      const log = await DiagnosisLog.create({
        patientId,
        doctorId: req.user._id,
        symptoms,
        age,
        gender,
        history: history || '',
        aiResponse: result.data,
        riskLevel
      });
      res.json({ ...result, logId: log._id });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  }
);

router.get('/risk-flags/:patientId', auth, role('doctor', 'admin', 'receptionist'), requirePro, async (req, res) => {
  try {
    const result = await getRiskFlags(req.params.patientId, DiagnosisLog, Prescription);
    res.json(result.data || []);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

export default router;
