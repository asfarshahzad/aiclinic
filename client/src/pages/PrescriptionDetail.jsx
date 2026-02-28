import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../utils/api";

export default function PrescriptionDetail() {
  const { id } = useParams();
  const [prescription, setPrescription] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get(`/prescriptions/${id}`)
      .then((r) => setPrescription(r.data))
      .catch(() => setPrescription(null))
      .finally(() => setLoading(false));
  }, [id]);

  const downloadPdf = () => {
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

  if (loading) return <div className="text-teal-600">Loading...</div>;
  if (!prescription)
    return <div className="text-slate-600">Prescription not found</div>;

  return (
    <div>
      <div className="flex justify-between items-start mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Prescription</h1>
        <button
          onClick={downloadPdf}
          className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
        >
          Download PDF
        </button>
      </div>

      <div className="bg-white rounded-lg shadow p-6 space-y-4">
        <p>
          <span className="text-slate-500">Date:</span>{" "}
          {new Date(prescription.createdAt).toLocaleDateString()}
        </p>
        <p>
          <span className="text-slate-500">Doctor:</span> Dr.{" "}
          {prescription.doctorId?.name}
        </p>
        {prescription.diagnosis && (
          <p>
            <span className="text-slate-500">Diagnosis:</span>{" "}
            {prescription.diagnosis}
          </p>
        )}

        <div>
          <h3 className="font-medium text-slate-800 mb-2">Medicines</h3>
          <ul className="space-y-2">
            {prescription.medicines?.map((m, i) => (
              <li key={i} className="py-2 border-b border-slate-100">
                <p className="font-medium">{m.name}</p>
                <p className="text-sm text-slate-600">
                  {m.dosage} • {m.frequency} • {m.duration}
                </p>
              </li>
            ))}
          </ul>
        </div>

        {prescription.instructions && (
          <p>
            <span className="text-slate-500">Instructions:</span>{" "}
            {prescription.instructions}
          </p>
        )}

        {prescription.aiExplanation && (
          <div className="mt-6 p-4 bg-teal-50 rounded-lg">
            <h3 className="font-medium text-teal-800 mb-2">
              AI Explanation (Pro)
            </h3>
            <p className="text-slate-700 whitespace-pre-wrap">
              {prescription.aiExplanation}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
