import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

export default function AppointmentList() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/appointments')
      .then(r => setAppointments(r.data))
      .catch(() => setAppointments([]))
      .finally(() => setLoading(false));
  }, []);

  const updateStatus = async (id, status) => {
    try {
      const { data } = await api.patch(`/appointments/${id}/status`, { status });
      setAppointments(prev => prev.map(a => a._id === id ? data : a));
    } catch (e) {}
  };

  const basePath = user?.role === 'doctor' ? '/doctor' : user?.role === 'receptionist' ? '/receptionist' : '/patient';

  if (loading) return <div className="text-teal-600">Loading...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Appointments</h1>
        {(user?.role === 'receptionist' || user?.role === 'admin') && (
          <Link to={`${basePath}/appointments/new`} className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700">
            Book Appointment
          </Link>
        )}
        {user?.role === 'patient' && (
          <Link to="/patient/appointments/new" className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700">
            Book Appointment
          </Link>
        )}
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Patient</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Doctor</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Date & Time</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Status</th>
              {(user?.role === 'receptionist' || user?.role === 'doctor') && (
                <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 uppercase">Actions</th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {appointments.map(a => (
              <tr key={a._id} className="hover:bg-slate-50">
                <td className="px-4 py-3 font-medium">{a.patientId?.name}</td>
                <td className="px-4 py-3">{a.doctorId?.name}</td>
                <td className="px-4 py-3">{new Date(a.date).toLocaleString()}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    a.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                    a.status === 'completed' ? 'bg-slate-100 text-slate-800' :
                    a.status === 'cancelled' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'
                  }`}>{a.status}</span>
                </td>
                {(user?.role === 'receptionist' || user?.role === 'doctor') && a.status !== 'cancelled' && (
                  <td className="px-4 py-3 text-right">
                    {a.status === 'pending' && (
                      <button onClick={() => updateStatus(a._id, 'confirmed')} className="text-green-600 hover:underline mr-2">Confirm</button>
                    )}
                    {['pending', 'confirmed'].includes(a.status) && (
                      <button onClick={() => updateStatus(a._id, 'completed')} className="text-teal-600 hover:underline mr-2">Complete</button>
                    )}
                    <button onClick={() => updateStatus(a._id, 'cancelled')} className="text-red-600 hover:underline">Cancel</button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
        {appointments.length === 0 && <p className="p-8 text-center text-slate-500">No appointments</p>}
      </div>
    </div>
  );
}
