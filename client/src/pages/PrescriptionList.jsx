import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../utils/api";
import { useAuth } from "../context/AuthContext";

export default function PrescriptionList() {
  const { user } = useAuth();
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/prescriptions")
      .then((r) => setPrescriptions(r.data))
      .catch(() => setPrescriptions([]))
      .finally(() => setLoading(false));
  }, []);

  const downloadPdf = (id) => {
    const token = localStorage.getItem("token");
    fetch(
      `${import.meta.env.VITE_API_URL || "http://localhost:8000/api"}/prescriptions/${id}/pdf`,
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    )
      .then((r) => r.blob())
      .then((blob) => {
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = `prescription-${id}.pdf`;
        a.click();
      });
  };

  const basePath = user?.role === "doctor" ? "/doctor" : "/patient";

  if (loading) return <div className="text-teal-600">Loading...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Prescriptions</h1>
        {user?.role === "doctor" && (
          <Link
            to={`${basePath}/prescriptions/new`}
            className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
          >
            Add Prescription
          </Link>
        )}
      </div>

      <div className="space-y-4">
        {prescriptions.map((p) => (
          <div
            key={p._id}
            className="bg-white rounded-lg shadow p-4 flex justify-between items-center"
          >
            <div>
              <p className="font-medium text-slate-800">
                {p.patientId?.name || "N/A"}
              </p>
              <p className="text-sm text-slate-500">
                Dr. {p.doctorId?.name} •{" "}
                {new Date(p.createdAt).toLocaleDateString()}
              </p>
              {p.diagnosis && (
                <p className="text-sm text-slate-600 mt-1">
                  Diagnosis: {p.diagnosis}
                </p>
              )}
            </div>
            <div className="flex gap-2">
              {user?.role === "patient" && (
                <Link
                  to={`/patient/prescriptions/${p._id}`}
                  className="px-4 py-2 bg-slate-200 text-slate-800 rounded-lg hover:bg-slate-300 text-sm"
                >
                  View
                </Link>
              )}
              <button
                onClick={() => downloadPdf(p._id)}
                className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 text-sm"
              >
                Download PDF
              </button>
            </div>
          </div>
        ))}
        {prescriptions.length === 0 && (
          <p className="text-slate-500">No prescriptions</p>
        )}
      </div>
    </div>
  );
}
