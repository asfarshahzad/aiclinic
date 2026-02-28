import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

export default function AppointmentForm() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [form, setForm] = useState({ patientId: '', doctorId: '', date: '', notes: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const basePath = user?.role === 'admin' ? '/admin' : user?.role === 'patient' ? '/patient' : '/receptionist';

  useEffect(() => {
    const patientsUrl = user?.role === 'patient' ? '/patients/me' : '/patients';
    api.get(patientsUrl).then(r => setPatients(r.data)).catch(() => {});
    api.get('/users/doctors').then(r => setDoctors(r.data)).catch(() => {});
  }, [user?.role]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const date = new Date(form.date);
      await api.post('/appointments', { ...form, date });
      navigate(`${basePath}/appointments`);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to book');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Book Appointment</h1>

      <form onSubmit={handleSubmit} className="max-w-md space-y-4">
        {error && <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm">{error}</div>}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Patient</label>
          <select
            value={form.patientId}
            onChange={e => setForm(f => ({ ...f, patientId: e.target.value }))}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg"
            required
          >
            <option value="">Select patient</option>
            {patients.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Doctor</label>
          <select
            value={form.doctorId}
            onChange={e => setForm(f => ({ ...f, doctorId: e.target.value }))}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg"
            required
          >
            <option value="">Select doctor</option>
            {doctors.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Date & Time</label>
          <input
            type="datetime-local"
            value={form.date}
            onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Notes</label>
          <input
            type="text"
            value={form.notes}
            onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg"
          />
        </div>
        <div className="flex gap-2">
          <button type="submit" disabled={loading} className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50">
            {loading ? 'Booking...' : 'Book'}
          </button>
          <button type="button" onClick={() => navigate(`${basePath}/appointments`)} className="px-4 py-2 bg-slate-200 rounded-lg">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
