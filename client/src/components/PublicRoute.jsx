import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function PublicRoute({ children }) {
  const { user, loading, dashboardPath } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-teal-600">Loading...</div>
      </div>
    );
  }

  if (user) {
    return <Navigate to={dashboardPath()} replace />;
  }

  return children;
}
