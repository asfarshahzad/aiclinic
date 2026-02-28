import { useEffect, useState } from "react";
import api from "../../utils/api";
import { Link } from "react-router-dom";

export default function PatientDashboard() {
  const [appointments, setAppointments] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.get("/appointments"), api.get("/prescriptions")])
      .then(([a, p]) => {
        setAppointments(a.data);
        setPrescriptions(p.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const upcoming = appointments
    .filter((a) => new Date(a.date) >= new Date() && a.status !== "cancelled")
    .slice(0, 5);
  const recentRx = prescriptions.slice(0, 5);

  if (loading) return <div className="text-teal-600">Loading...</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800 mb-6">
        Patient Dashboard
      </h1>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="font-semibold text-slate-800 mb-4">
            Upcoming Appointments
          </h2>
          {upcoming.length === 0 ? (
            <p className="text-slate-500">No upcoming appointments</p>
          ) : (
            <ul className="space-y-3">
              {upcoming.map((a) => (
                <li
                  key={a._id}
                  className="py-2 border-b border-slate-100 last:border-0"
                >
                  <p className="font-medium">{a.doctorId?.name}</p>
                  <p className="text-sm text-slate-500">
                    {new Date(a.date).toLocaleString()}
                  </p>
                  <span className="text-xs px-2 py-0.5 rounded bg-amber-100 text-amber-800">
                    {a.status}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="font-semibold text-slate-800 mb-4">
            Recent Prescriptions
          </h2>
          {recentRx.length === 0 ? (
            <p className="text-slate-500">No prescriptions yet</p>
          ) : (
            <ul className="space-y-3">
              {recentRx.map((p) => (
                <li
                  key={p._id}
                  className="py-2 border-b border-slate-100 last:border-0 flex justify-between items-center"
                >
                  <div>
                    <p className="font-medium">{p.doctorId?.name}</p>
                    <p className="text-sm text-slate-500">
                      {new Date(p.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      const token = localStorage.getItem("token");
                      const url = `${import.meta.env.VITE_API_URL || "http://localhost:8000/api"}/prescriptions/${p._id}/pdf`;
                      fetch(url, {
                        headers: { Authorization: `Bearer ${token}` },
                      })
                        .then((r) => r.blob())
                        .then((blob) => {
                          const a = document.createElement("a");
                          a.href = URL.createObjectURL(blob);
                          a.download = `prescription-${p._id}.pdf`;
                          a.click();
                        });
                    }}
                    className="text-sm text-teal-600 hover:underline"
                  >
                    Download PDF
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="mt-6 flex gap-4">
        <Link
          to="/patient/appointments"
          className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
        >
          View All Appointments
        </Link>
        <Link
          to="/patient/prescriptions"
          className="px-4 py-2 bg-slate-200 text-slate-800 rounded-lg hover:bg-slate-300"
        >
          View All Prescriptions
        </Link>
      </div>
    </div>
  );
}
