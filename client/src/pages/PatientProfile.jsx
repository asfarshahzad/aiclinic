import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../utils/api';
import MedicalHistoryTimeline from '../components/MedicalHistoryTimeline';
import { useAuth } from '../context/AuthContext';

export default function PatientProfile() {
  const { id } = useParams();
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [riskFlags, setRiskFlags] = useState([]);
  const [loading, setLoading] = useState(true);

  const basePath = user?.role === 'doctor' ? '/doctor' : user?.role === 'admin' ? '/admin' : user?.role === 'patient' ? '/patient' : '/receptionist';

  useEffect(() => {
    api.get(`/patients/${id}/history`)
      .then(r => setData(r.data))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (user?.subscriptionPlan === 'pro' && (user?.role === 'doctor' || user?.role === 'admin' || user?.role === 'receptionist')) {
      api.get(`/ai/risk-flags/${id}`).then(r => setRiskFlags(r.data)).catch(() => setRiskFlags([]));
    }
  }, [id, user]);

  if (loading || !data) return <div className="text-teal-600">Loading...</div>;

  return (
    <div>
      <div className="flex justify-between items-start mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Patient Profile</h1>
        {(user?.role === 'receptionist' || user?.role === 'admin') && (
          <Link to={`${basePath}/patients/${id}/edit`} className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700">
            Edit Patient
          </Link>
        )}
      </div>

      {riskFlags.length > 0 && (
        <div className="mb-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <p className="font-medium text-amber-800">Risk Flags (Pro)</p>
          <ul className="list-disc list-inside text-amber-700 text-sm">
            {riskFlags.map((f, i) => <li key={i}>{f.message}</li>)}
          </ul>
        </div>
      )}

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="font-semibold text-slate-800 mb-4">Details</h2>
        <dl className="grid grid-cols-2 gap-4">
          <div><dt className="text-slate-500 text-sm">Name</dt><dd className="font-medium">{data.patient?.name}</dd></div>
          <div><dt className="text-slate-500 text-sm">Age</dt><dd>{data.patient?.age}</dd></div>
          <div><dt className="text-slate-500 text-sm">Gender</dt><dd className="capitalize">{data.patient?.gender}</dd></div>
          <div><dt className="text-slate-500 text-sm">Contact</dt><dd>{data.patient?.contact || '-'}</dd></div>
        </dl>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="font-semibold text-slate-800 mb-4">Medical History Timeline</h2>
        <MedicalHistoryTimeline timeline={data.timeline} />
      </div>

      {user?.role === 'doctor' && (
        <div className="mt-6 flex gap-4">
          <Link to={`/doctor/prescriptions/new?patientId=${id}`} className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700">
            Add Prescription
          </Link>
          {user?.subscriptionPlan === 'pro' && (
            <Link to={`/doctor/symptom-check?patientId=${id}`} className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700">
              AI Symptom Checker
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
