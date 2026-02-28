import { useEffect, useState } from 'react';
import api from '../../utils/api';
import { Link } from 'react-router-dom';

export default function ReceptionistDashboard() {
  const [todayAppointments, setTodayAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    api.get('/appointments')
      .then(r => {
        const all = r.data;
        const todayList = all.filter(a => new Date(a.date).toISOString().split('T')[0] === today && a.status !== 'cancelled');
        setTodayAppointments(todayList);
      })
      .catch(() => setTodayAppointments([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-teal-600">Loading...</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Receptionist Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Link to="/receptionist/patients" className="bg-white rounded-lg shadow p-4 border-l-4 border-teal-500 hover:shadow-md transition">
          <p className="text-slate-500 text-sm">Manage Patients</p>
          <p className="text-teal-600 font-medium">View & add patients</p>
        </Link>
        <Link to="/receptionist/appointments" className="bg-white rounded-lg shadow p-4 border-l-4 border-cyan-500 hover:shadow-md transition">
          <p className="text-slate-500 text-sm">Book Appointments</p>
          <p className="text-cyan-600 font-medium">Schedule visits</p>
        </Link>
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-emerald-500">
          <p className="text-slate-500 text-sm">Today's Schedule</p>
          <p className="text-2xl font-bold text-emerald-700">{todayAppointments.length}</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-4">
        <h2 className="font-semibold text-slate-800 mb-4">Today's Appointments</h2>
        {todayAppointments.length === 0 ? (
          <p className="text-slate-500">No appointments today</p>
        ) : (
          <ul className="divide-y">
            {todayAppointments.map(a => (
              <li key={a._id} className="py-3 flex justify-between items-center">
                <div>
                  <p className="font-medium text-slate-800">{a.patientId?.name}</p>
                  <p className="text-sm text-slate-500">{a.doctorId?.name} • {new Date(a.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                </div>
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  a.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                  a.status === 'completed' ? 'bg-slate-100 text-slate-800' : 'bg-amber-100 text-amber-800'
                }`}>
                  {a.status}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
