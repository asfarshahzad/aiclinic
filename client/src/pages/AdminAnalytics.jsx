import { useEffect, useState } from 'react';
import api from '../utils/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function AdminAnalytics() {
  const [stats, setStats] = useState(null);
  const [predictive, setPredictive] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/analytics/admin').then(r => setStats(r.data)).catch(() => {});
    api.get('/analytics/predictive').then(r => setPredictive(r.data)).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(false);
  }, [stats]);

  if (loading) return <div className="text-teal-600">Loading...</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Analytics</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow p-4"><p className="text-slate-500 text-sm">Total Patients</p><p className="text-2xl font-bold text-teal-700">{stats?.totalPatients ?? 0}</p></div>
        <div className="bg-white rounded-lg shadow p-4"><p className="text-slate-500 text-sm">Total Doctors</p><p className="text-2xl font-bold text-cyan-700">{stats?.totalDoctors ?? 0}</p></div>
        <div className="bg-white rounded-lg shadow p-4"><p className="text-slate-500 text-sm">Monthly Appointments</p><p className="text-2xl font-bold text-emerald-700">{stats?.monthlyAppointments ?? 0}</p></div>
        <div className="bg-white rounded-lg shadow p-4"><p className="text-slate-500 text-sm">Revenue (simulated)</p><p className="text-2xl font-bold text-amber-700">Rs {stats?.revenue?.toLocaleString() ?? 0}</p></div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="font-semibold text-slate-800 mb-4">Appointments by Month</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats?.appointmentsByMonth || []}>
                <CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="month" /><YAxis /><Tooltip /><Bar dataKey="appointments" fill="#0d9488" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="font-semibold text-slate-800 mb-4">Most Common Diagnosis</h2>
          <ul className="space-y-2">
            {(stats?.mostCommonDiagnosis || []).map((d, i) => (
              <li key={i} className="flex justify-between py-1 border-b"><span>{d.name}</span><span className="font-medium text-teal-600">{d.count}</span></li>
            ))}
          </ul>
        </div>
      </div>

      {predictive && (
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="font-semibold text-slate-800 mb-4">Predictive Analytics (Pro)</h2>
          <p className="text-slate-600 mb-2">Patient Load Forecast (next month): <strong>{predictive.patientLoadForecast}</strong></p>
          <p className="text-slate-600">Most common disease this month:</p>
          <ul className="list-disc list-inside mt-2">
            {(predictive.mostCommonDiseaseThisMonth || []).map(([name, count], i) => <li key={i}>{name}: {count}</li>)}
          </ul>
        </div>
      )}
    </div>
  );
}
