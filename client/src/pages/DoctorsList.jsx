import { useEffect, useState } from 'react';
import api from '../utils/api';

export default function DoctorsList() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/users/doctors')
      .then(r => setDoctors(r.data))
      .catch(() => setDoctors([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-teal-600">Loading...</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Doctors</h1>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Name</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Email</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Specialization</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {doctors.map(d => (
              <tr key={d._id} className="hover:bg-slate-50">
                <td className="px-4 py-3 font-medium">{d.name}</td>
                <td className="px-4 py-3">{d.email}</td>
                <td className="px-4 py-3">{d.specialization || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {doctors.length === 0 && <p className="p-8 text-center text-slate-500">No doctors</p>}
      </div>
    </div>
  );
}
