import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

export default function PrescriptionForm() {
  const [searchParams] = useSearchParams();
  const patientIdParam = searchParams.get('patientId');
  const { user } = useAuth();
  const navigate = useNavigate();
  const [patients, setPatients] = useState([]);
  const [form, setForm] = useState({
    patientId: patientIdParam || '',
    diagnosis: '',
    medicines: [{ name: '', dosage: '', frequency: '', duration: '' }],
    instructions: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get('/patients').then(r => setPatients(r.data)).catch(() => {});
    if (patientIdParam) setForm(f => ({ ...f, patientId: patientIdParam }));
  }, [patientIdParam]);

  const addMedicine = () => setForm(f => ({ ...f, medicines: [...f.medicines, { name: '', dosage: '', frequency: '', duration: '' }] }));
  const updateMedicine = (i, field, val) => {
    setForm(f => ({
      ...f,
      medicines: f.medicines.map((m, j) => j === i ? { ...m, [field]: val } : m)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.medicines.some(m => !m.name || !m.dosage || !m.frequency || !m.duration)) {
      setError('Fill all medicine fields');
      return;
    }
    setLoading(true);
    try {
      await api.post('/prescriptions', form);
      navigate('/doctor/prescriptions');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Add Prescription</h1>

      <form onSubmit={handleSubmit} className="max-w-2xl space-y-4">
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
          <label className="block text-sm font-medium text-slate-700 mb-1">Diagnosis</label>
          <input
            type="text"
            value={form.diagnosis}
            onChange={e => setForm(f => ({ ...f, diagnosis: e.target.value }))}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg"
          />
        </div>
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="block text-sm font-medium text-slate-700">Medicines</label>
            <button type="button" onClick={addMedicine} className="text-sm text-teal-600 hover:underline">+ Add</button>
          </div>
          {form.medicines.map((m, i) => (
            <div key={i} className="grid grid-cols-4 gap-2 mb-2 p-2 bg-slate-50 rounded">
              <input placeholder="Name" value={m.name} onChange={e => updateMedicine(i, 'name', e.target.value)} className="px-2 py-1 border rounded" />
              <input placeholder="Dosage" value={m.dosage} onChange={e => updateMedicine(i, 'dosage', e.target.value)} className="px-2 py-1 border rounded" />
              <input placeholder="Frequency" value={m.frequency} onChange={e => updateMedicine(i, 'frequency', e.target.value)} className="px-2 py-1 border rounded" />
              <input placeholder="Duration" value={m.duration} onChange={e => updateMedicine(i, 'duration', e.target.value)} className="px-2 py-1 border rounded" />
            </div>
          ))}
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Instructions</label>
          <textarea value={form.instructions} onChange={e => setForm(f => ({ ...f, instructions: e.target.value }))} className="w-full px-3 py-2 border border-slate-300 rounded-lg" rows={2} />
        </div>
        <div className="flex gap-2">
          <button type="submit" disabled={loading} className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50">Save</button>
          <button type="button" onClick={() => navigate('/doctor/prescriptions')} className="px-4 py-2 bg-slate-200 rounded-lg">Cancel</button>
        </div>
      </form>
    </div>
  );
}
