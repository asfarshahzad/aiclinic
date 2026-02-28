import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AdminDashboard from "./pages/dashboards/AdminDashboard";
import DoctorDashboard from "./pages/dashboards/DoctorDashboard";
import ReceptionistDashboard from "./pages/dashboards/ReceptionistDashboard";
import PatientDashboard from "./pages/dashboards/PatientDashboard";
import PatientList from "./pages/PatientList";
import PatientForm from "./pages/PatientForm";
import PatientProfile from "./pages/PatientProfile";
import AppointmentList from "./pages/AppointmentList";
import AppointmentForm from "./pages/AppointmentForm";
import PrescriptionList from "./pages/PrescriptionList";
import PrescriptionForm from "./pages/PrescriptionForm";
import PrescriptionDetail from "./pages/PrescriptionDetail";
import SymptomChecker from "./pages/SymptomChecker";
import UserManagement from "./pages/UserManagement";
import AdminAnalytics from "./pages/AdminAnalytics";
import DoctorsList from "./pages/DoctorsList";
import PublicRoute from "./components/PublicRoute";

function RedirectToDashboard() {
  const { user, loading } = useAuth();
  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  if (!user) return <Navigate to="/login" replace />;
  const path =
    {
      admin: "/admin",
      doctor: "/doctor",
      receptionist: "/receptionist",
      patient: "/patient",
    }[user.role] || "/login";
  return <Navigate to={path} replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route
            path="/login"
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            }
          />
          <Route
            path="/register"
            element={
              <PublicRoute>
                <Register />
              </PublicRoute>
            }
          />
          <Route path="/" element={<RedirectToDashboard />} />

          <Route
            path="/admin"
            element={
              <ProtectedRoute roles={["admin"]}>
                <Layout>
                  <AdminDashboard />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/patients"
            element={
              <ProtectedRoute roles={["admin"]}>
                <Layout>
                  <PatientList />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/patients/new"
            element={
              <ProtectedRoute roles={["admin"]}>
                <Layout>
                  <PatientForm />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/patients/:id"
            element={
              <ProtectedRoute roles={["admin"]}>
                <Layout>
                  <PatientProfile />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/patients/:id/edit"
            element={
              <ProtectedRoute roles={["admin"]}>
                <Layout>
                  <PatientForm />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/appointments"
            element={
              <ProtectedRoute roles={["admin"]}>
                <Layout>
                  <AppointmentList />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/appointments/new"
            element={
              <ProtectedRoute roles={["admin"]}>
                <Layout>
                  <AppointmentForm />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute roles={["admin"]}>
                <Layout>
                  <UserManagement />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/analytics"
            element={
              <ProtectedRoute roles={["admin"]}>
                <Layout>
                  <AdminAnalytics />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/doctors"
            element={
              <ProtectedRoute roles={["admin"]}>
                <Layout>
                  <DoctorsList />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/doctor"
            element={
              <ProtectedRoute roles={["doctor"]}>
                <Layout>
                  <DoctorDashboard />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/doctor/patients"
            element={
              <ProtectedRoute roles={["doctor"]}>
                <Layout>
                  <PatientList />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/doctor/patients/:id"
            element={
              <ProtectedRoute roles={["doctor"]}>
                <Layout>
                  <PatientProfile />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/doctor/appointments"
            element={
              <ProtectedRoute roles={["doctor"]}>
                <Layout>
                  <AppointmentList />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/doctor/prescriptions"
            element={
              <ProtectedRoute roles={["doctor"]}>
                <Layout>
                  <PrescriptionList />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/doctor/prescriptions/new"
            element={
              <ProtectedRoute roles={["doctor"]}>
                <Layout>
                  <PrescriptionForm />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/doctor/symptom-check"
            element={
              <ProtectedRoute roles={["doctor"]}>
                <Layout>
                  <SymptomChecker />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/receptionist"
            element={
              <ProtectedRoute roles={["receptionist"]}>
                <Layout>
                  <ReceptionistDashboard />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/receptionist/patients"
            element={
              <ProtectedRoute roles={["receptionist"]}>
                <Layout>
                  <PatientList />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/receptionist/patients/new"
            element={
              <ProtectedRoute roles={["receptionist"]}>
                <Layout>
                  <PatientForm />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/receptionist/patients/:id"
            element={
              <ProtectedRoute roles={["receptionist"]}>
                <Layout>
                  <PatientProfile />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/receptionist/patients/:id/edit"
            element={
              <ProtectedRoute roles={["receptionist"]}>
                <Layout>
                  <PatientForm />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/receptionist/appointments"
            element={
              <ProtectedRoute roles={["receptionist"]}>
                <Layout>
                  <AppointmentList />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/receptionist/appointments/new"
            element={
              <ProtectedRoute roles={["receptionist"]}>
                <Layout>
                  <AppointmentForm />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/patient"
            element={
              <ProtectedRoute roles={["patient"]}>
                <Layout>
                  <PatientDashboard />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/patient/appointments"
            element={
              <ProtectedRoute roles={["patient"]}>
                <Layout>
                  <AppointmentList />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/patient/appointments/new"
            element={
              <ProtectedRoute roles={["patient"]}>
                <Layout>
                  <AppointmentForm />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/patient/prescriptions"
            element={
              <ProtectedRoute roles={["patient"]}>
                <Layout>
                  <PrescriptionList />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/patient/prescriptions/:id"
            element={
              <ProtectedRoute roles={["patient"]}>
                <Layout>
                  <PrescriptionDetail />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/patient/patients"
            element={
              <ProtectedRoute roles={["patient"]}>
                <Layout>
                  <PatientList />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/patient/patients/:id"
            element={
              <ProtectedRoute roles={["patient"]}>
                <Layout>
                  <PatientProfile />
                </Layout>
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
