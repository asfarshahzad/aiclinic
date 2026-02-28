import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const navByRole = {
  admin: [
    { to: '/admin', label: 'Dashboard' },
    { to: '/admin/patients', label: 'Patients' },
    { to: '/admin/doctors', label: 'Doctors' },
    { to: '/admin/users', label: 'Users' },
    { to: '/admin/analytics', label: 'Analytics' }
  ],
  doctor: [
    { to: '/doctor', label: 'Dashboard' },
    { to: '/doctor/appointments', label: 'Appointments' },
    { to: '/doctor/patients', label: 'Patients' },
    { to: '/doctor/prescriptions', label: 'Prescriptions' },
    { to: '/doctor/symptom-check', label: 'AI Symptom Checker' }
  ],
  receptionist: [
    { to: '/receptionist', label: 'Dashboard' },
    { to: '/receptionist/patients', label: 'Patients' },
    { to: '/receptionist/appointments', label: 'Appointments' }
  ],
  patient: [
    { to: '/patient', label: 'Dashboard' },
    { to: '/patient/patients', label: 'My Profile' },
    { to: '/patient/appointments', label: 'Appointments' },
    { to: '/patient/prescriptions', label: 'Prescriptions' }
  ]
};

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const nav = navByRole[user?.role] || [];

  return (
    <div className="min-h-screen flex bg-slate-50">
      <aside className="w-64 bg-teal-800 text-white flex flex-col shrink-0">
        <div className="p-4 border-b border-teal-700">
          <h1 className="text-xl font-bold">AI Clinic</h1>
          <p className="text-teal-300 text-sm capitalize">{user?.role}</p>
        </div>
        <nav className="flex-1 p-2">
          {nav.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              className={`block px-3 py-2 rounded mb-1 hover:bg-teal-700 ${location.pathname === to ? 'bg-teal-600' : ''}`}
            >
              {label}
            </Link>
          ))}
        </nav>
        <div className="p-2 border-t border-teal-700">
          <button
            onClick={handleLogout}
            className="w-full px-3 py-2 text-left rounded hover:bg-teal-700 text-white cursor-pointer"
          >
            Logout
          </button>
        </div>
      </aside>
      <main className="flex-1 overflow-auto p-6">
        {children}
      </main>
    </div>
  );
}
