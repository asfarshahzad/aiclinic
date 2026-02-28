import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

export default function SymptomChecker() {
  const [searchParams] = useSearchParams();
  const patientId = searchParams.get('patientId');
  const { user } = useAuth();
  const [form, setForm] = useState({ patientId: patientId || '', symptoms: '', age: '', gender: 'male', history: '' });
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [patients, setPatients] = useState([]);

  useEffect(() => {
    api.get('/patients').then(r => setPatients(r.data)).catch(() => {});
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setResult(null);
    setLoading(true);
    try {
      const { data } = await api.post('/ai/symptom-check', form);
      setResult(data.data);
    } catch (err) {
      setError(err.response?.data?.error || 'AI unavailable');
    } finally {
      setLoading(false);
    }
  };

  if (user?.subscriptionPlan !== 'pro') {
    return (
      <div className="p-4 bg-amber-50 text-amber-800 rounded-lg">
        AI Symptom Checker requires Pro subscription.
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800 mb-6">AI Symptom Checker</h1>

      <form onSubmit={handleSubmit} className="max-w-md space-y-4 mb-6">
        {error && <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm">{error}</div>}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Patient</label>
          <select
            value={form.patientId}
            onChange={e => setForm(f => ({ ...f, patientId: e.target.value }))}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg"
            required
          >
            <option value="">Select</option>
            {patients.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Symptoms</label>
          <textarea value={form.symptoms} onChange={e => setForm(f => ({ ...f, symptoms: e.target.value }))} className="w-full px-3 py-2 border rounded-lg" rows={3} required />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Age</label>
            <input type="number" min={1} max={150} value={form.age} onChange={e => setForm(f => ({ ...f, age: e.target.value }))} className="w-full px-3 py-2 border rounded-lg" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Gender</label>
            <select value={form.gender} onChange={e => setForm(f => ({ ...f, gender: e.target.value }))} className="w-full px-3 py-2 border rounded-lg">
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Medical History</label>
          <textarea value={form.history} onChange={e => setForm(f => ({ ...f, history: e.target.value }))} className="w-full px-3 py-2 border rounded-lg" rows={2} />
        </div>
        <button type="submit" disabled={loading} className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 disabled:opacity-50">
          {loading ? 'Analyzing...' : 'Analyze'}
        </button>
      </form>

      {result && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="font-semibold text-slate-800 mb-4">AI Analysis</h2>
          <p className="text-sm text-slate-500 mb-2">Risk Level: <span className={`font-medium ${result.riskLevel === 'high' ? 'text-red-600' : result.riskLevel === 'medium' ? 'text-amber-600' : 'text-green-600'}`}>{result.riskLevel}</span></p>
          {result.summary && <p className="text-slate-700 mb-4">{result.summary}</p>}
          {result.possibleConditions?.length > 0 && (
            <div className="mb-4">
              <p className="font-medium text-slate-700 mb-2">Possible Conditions</p>
              <ul className="list-disc list-inside">{result.possibleConditions.map((c, i) => <li key={i}>{c}</li>)}</ul>
            </div>
          )}
          {result.suggestedTests?.length > 0 && (
            <div>
              <p className="font-medium text-slate-700 mb-2">Suggested Tests</p>
              <ul className="list-disc list-inside">{result.suggestedTests.map((t, i) => <li key={i}>{t}</li>)}</ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
