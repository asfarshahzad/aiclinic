import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

export default function PatientList() {
  const { user } = useAuth();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/patients')
      .then(r => setPatients(r.data))
      .catch(() => setPatients([]))
      .finally(() => setLoading(false));
  }, []);

  const basePath = user?.role === 'doctor' ? '/doctor' : user?.role === 'admin' ? '/admin' : user?.role === 'patient' ? '/patient' : '/receptionist';

  if (loading) return <div className="text-teal-600">Loading...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Patients</h1>
        {(user?.role === 'receptionist' || user?.role === 'admin') && (
          <Link to={`${basePath}/patients/new`} className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700">
            Add Patient
          </Link>
        )}
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Name</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Age</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Gender</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Contact</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {patients.map(p => (
              <tr key={p._id} className="hover:bg-slate-50">
                <td className="px-4 py-3 font-medium text-slate-800">{p.name}</td>
                <td className="px-4 py-3 text-slate-600">{p.age}</td>
                <td className="px-4 py-3 text-slate-600 capitalize">{p.gender}</td>
                <td className="px-4 py-3 text-slate-600">{p.contact || '-'}</td>
                <td className="px-4 py-3 text-right">
                  <Link to={`${basePath}/patients/${p._id}`} className="text-teal-600 hover:underline mr-2">View</Link>
                  {(user?.role === 'receptionist' || user?.role === 'admin') && (
                    <Link to={`${basePath}/patients/${p._id}/edit`} className="text-slate-600 hover:underline">Edit</Link>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {patients.length === 0 && (
          <p className="p-8 text-center text-slate-500">No patients found</p>
        )}
      </div>
    </div>
  );
}
