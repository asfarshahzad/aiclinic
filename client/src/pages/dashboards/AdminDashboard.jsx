import { useEffect, useState } from 'react';
import api from '../../utils/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/analytics/admin')
      .then(r => setStats(r.data))
      .catch(() => setStats(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-teal-600">Loading...</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Admin Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-teal-500">
          <p className="text-slate-500 text-sm">Total Patients</p>
          <p className="text-2xl font-bold text-teal-700">{stats?.totalPatients ?? 0}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-cyan-500">
          <p className="text-slate-500 text-sm">Total Doctors</p>
          <p className="text-2xl font-bold text-cyan-700">{stats?.totalDoctors ?? 0}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-emerald-500">
          <p className="text-slate-500 text-sm">Monthly Appointments</p>
          <p className="text-2xl font-bold text-emerald-700">{stats?.monthlyAppointments ?? 0}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-amber-500">
          <p className="text-slate-500 text-sm">Revenue (simulated)</p>
          <p className="text-2xl font-bold text-amber-700">Rs {stats?.revenue?.toLocaleString() ?? 0}</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="font-semibold text-slate-800 mb-4">Appointments by Month</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats?.appointmentsByMonth || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="appointments" fill="#0d9488" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="font-semibold text-slate-800 mb-4">Most Common Diagnosis</h2>
          <ul className="space-y-2">
            {(stats?.mostCommonDiagnosis || []).map((d, i) => (
              <li key={i} className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-700">{d.name}</span>
                <span className="font-medium text-teal-600">{d.count}</span>
              </li>
            ))}
            {(!stats?.mostCommonDiagnosis?.length) && <li className="text-slate-500">No data yet</li>}
          </ul>
        </div>
      </div>
    </div>
  );
}
