import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

export default function PatientForm() {
  const { id } = useParams();
  const isEdit = !!id;
  const { user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', age: '', gender: 'male', contact: '', address: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const basePath = user?.role === 'admin' ? '/admin' : '/receptionist';

  useEffect(() => {
    if (isEdit) {
      api.get(`/patients/${id}`).then(r => {
        const d = r.data;
        setForm({ name: d.name, age: d.age, gender: d.gender, contact: d.contact || '', address: d.address || '' });
      }).catch(() => setError('Patient not found'));
    }
  }, [id, isEdit]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isEdit) {
        await api.put(`/patients/${id}`, form);
      } else {
        await api.post('/patients', form);
      }
      navigate(`${basePath}/patients`);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800 mb-6">{isEdit ? 'Edit Patient' : 'Add Patient'}</h1>

      <form onSubmit={handleSubmit} className="max-w-md space-y-4">
        {error && <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm">{error}</div>}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
          <input
            type="text"
            value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Age</label>
          <input
            type="number"
            min={1}
            max={150}
            value={form.age}
            onChange={e => setForm(f => ({ ...f, age: e.target.value }))}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Gender</label>
          <select
            value={form.gender}
            onChange={e => setForm(f => ({ ...f, gender: e.target.value }))}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg"
          >
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Contact</label>
          <input
            type="text"
            value={form.contact}
            onChange={e => setForm(f => ({ ...f, contact: e.target.value }))}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Address</label>
          <input
            type="text"
            value={form.address}
            onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg"
          />
        </div>
        <div className="flex gap-2">
          <button type="submit" disabled={loading} className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50">
            {loading ? 'Saving...' : 'Save'}
          </button>
          <button type="button" onClick={() => navigate(`${basePath}/patients`)} className="px-4 py-2 bg-slate-200 text-slate-800 rounded-lg hover:bg-slate-300">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
