import { useEffect, useState } from 'react';
import api from '../utils/api';

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/users')
      .then(r => setUsers(r.data))
      .catch(() => setUsers([]))
      .finally(() => setLoading(false));
  }, []);

  const updatePlan = async (userId, plan) => {
    try {
      const { data } = await api.patch(`/users/${userId}/subscription`, { subscriptionPlan: plan });
      setUsers(prev => prev.map(u => u._id === userId ? data : u));
    } catch (e) {}
  };

  if (loading) return <div className="text-teal-600">Loading...</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800 mb-6">User Management</h1>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Name</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Email</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Role</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Plan</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {users.map(u => (
              <tr key={u._id} className="hover:bg-slate-50">
                <td className="px-4 py-3 font-medium">{u.name}</td>
                <td className="px-4 py-3">{u.email}</td>
                <td className="px-4 py-3 capitalize">{u.role}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded text-xs ${u.subscriptionPlan === 'pro' ? 'bg-teal-100 text-teal-800' : 'bg-slate-100 text-slate-800'}`}>
                    {u.subscriptionPlan}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  {u.subscriptionPlan === 'free' ? (
                    <button onClick={() => updatePlan(u._id, 'pro')} className="text-teal-600 hover:underline text-sm">Upgrade to Pro</button>
                  ) : (
                    <button onClick={() => updatePlan(u._id, 'free')} className="text-slate-600 hover:underline text-sm">Downgrade</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
