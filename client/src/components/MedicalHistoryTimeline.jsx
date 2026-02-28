export default function MedicalHistoryTimeline({ timeline }) {
  if (!timeline?.length) return <p className="text-slate-500">No history yet</p>;

  return (
    <div className="space-y-4">
      {timeline.map((item, i) => (
        <div key={i} className="flex gap-4">
          <div className={`w-3 h-3 rounded-full mt-1.5 shrink-0 ${
            item.type === 'appointment' ? 'bg-teal-500' :
            item.type === 'prescription' ? 'bg-cyan-500' : 'bg-amber-500'
          }`} />
          <div className="flex-1 pb-4 border-b border-slate-100 last:border-0">
            <p className="text-xs text-slate-500">{new Date(item.date).toLocaleString()}</p>
            <p className="font-medium text-slate-800 capitalize">{item.type}</p>
            {item.type === 'appointment' && (
              <p className="text-sm text-slate-600">
                Dr. {item.data.doctorId?.name} • {item.data.status}
                {item.data.notes && ` • ${item.data.notes}`}
              </p>
            )}
            {item.type === 'prescription' && (
              <p className="text-sm text-slate-600">
                Dr. {item.data.doctorId?.name} • {item.data.medicines?.length || 0} medicine(s)
                {item.data.diagnosis && ` • ${item.data.diagnosis}`}
              </p>
            )}
            {item.type === 'diagnosis' && (
              <p className="text-sm text-slate-600">
                Dr. {item.data.doctorId?.name} • Risk: {item.data.riskLevel || 'N/A'}
                {item.data.symptoms && ` • ${item.data.symptoms}`}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
