import express from 'express';
import mongoose from 'mongoose';
import Appointment from '../models/Appointment.js';
import Patient from '../models/Patient.js';
import Prescription from '../models/Prescription.js';
import User from '../models/User.js';
import DiagnosisLog from '../models/DiagnosisLog.js';
import { auth, role, requirePro } from '../middleware/auth.js';

const router = express.Router();

router.get('/admin', auth, role('admin'), async (req, res) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [totalPatients, totalDoctors, appointmentsThisMonth, prescriptionsThisMonth, diagnosisLogs] = await Promise.all([
      Patient.countDocuments(),
      User.countDocuments({ role: 'doctor' }),
      Appointment.countDocuments({ date: { $gte: startOfMonth }, status: { $ne: 'cancelled' } }),
      Prescription.countDocuments({ createdAt: { $gte: startOfMonth } }),
      DiagnosisLog.find({ createdAt: { $gte: startOfMonth } }).select('aiResponse').lean()
    ]);

    const conditions = diagnosisLogs
      .flatMap(d => d.aiResponse?.possibleConditions || [])
      .filter(Boolean);
    const countMap = {};
    conditions.forEach(c => { countMap[c] = (countMap[c] || 0) + 1; });
    const mostCommon = Object.entries(countMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, count]) => ({ name, count }));

    const revenue = appointmentsThisMonth * 500;

    const last6Months = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const end = new Date(d.getFullYear(), d.getMonth() + 1, 0);
      const count = await Appointment.countDocuments({
        date: { $gte: d, $lte: end },
        status: { $ne: 'cancelled' }
      });
      last6Months.push({ month: d.toLocaleString('default', { month: 'short' }), appointments: count });
    }

    res.json({
      totalPatients,
      totalDoctors,
      monthlyAppointments: appointmentsThisMonth,
      revenue,
      mostCommonDiagnosis: mostCommon,
      appointmentsByMonth: last6Months
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.get('/doctor', auth, role('doctor'), async (req, res) => {
  try {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfDay = new Date(startOfDay);
    endOfDay.setDate(endOfDay.getDate() + 1);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [dailyAppointments, monthlyAppointments, prescriptionCount] = await Promise.all([
      Appointment.countDocuments({
        doctorId: req.user._id,
        date: { $gte: startOfDay, $lt: endOfDay },
        status: { $in: ['pending', 'confirmed'] }
      }),
      Appointment.countDocuments({
        doctorId: req.user._id,
        date: { $gte: startOfMonth },
        status: { $ne: 'cancelled' }
      }),
      Prescription.countDocuments({
        doctorId: req.user._id,
        createdAt: { $gte: startOfMonth }
      })
    ]);

    const last6Months = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const end = new Date(d.getFullYear(), d.getMonth() + 1, 0);
      const count = await Appointment.countDocuments({
        doctorId: req.user._id,
        date: { $gte: d, $lte: end },
        status: { $ne: 'cancelled' }
      });
      last6Months.push({ month: d.toLocaleString('default', { month: 'short' }), appointments: count });
    }

    res.json({
      dailyAppointments,
      monthlyAppointments,
      prescriptionCount,
      appointmentsByMonth: last6Months
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.get('/predictive', auth, role('admin'), requirePro, async (req, res) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const logs = await DiagnosisLog.find({ createdAt: { $gte: startOfMonth } })
      .select('aiResponse')
      .lean();
    const conditions = logs.flatMap(d => d.aiResponse?.possibleConditions || []);
    const countMap = {};
    conditions.forEach(c => { countMap[c] = (countMap[c] || 0) + 1; });
    const mostCommon = Object.entries(countMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    const last3Months = await Promise.all(
      [2, 1, 0].map(i => {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const end = new Date(d.getFullYear(), d.getMonth() + 1, 0);
        return Appointment.countDocuments({
          date: { $gte: d, $lte: end },
          status: { $ne: 'cancelled' }
        }).then(c => ({ month: d.toLocaleString('default', { month: 'short' }), count: c }));
      })
    );
    const avg = last3Months.reduce((s, x) => s + x.count, 0) / 3;
    const forecast = Math.round(avg * 1.1);

    res.json({
      mostCommonDiseaseThisMonth: mostCommon,
      patientLoadForecast: forecast
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

export default router;
