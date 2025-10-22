import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Components
import ProtectedRoute from "./components/ProtectedRoute";
import Navbar from "./components/Navbar";

// Pages
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";

// Admin Pages
import AdminDashboard from "./pages/admin/Dashboard";
import AdminDevices from "./pages/admin/Devices";
import AdminUsers from "./pages/admin/Users";
import AdminTriggers from "./pages/admin/Triggers";

// Responder Pages
import ResponderDashboard from "./pages/responder/Dashboard";
import ResponderAlerts from "./pages/responder/Alerts";
import ResponderHistory from "./pages/responder/History";

// End User Pages
import UserDashboard from "./pages/user/Dashboard";
import UserTrigger from "./pages/user/Trigger";
import UserHistory from "./pages/user/History";

// Other Pages
import Unauthorized from "./pages/Unauthorized";
import NotFound from "./pages/NotFound";

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen bg-gray-50">
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/unauthorized" element={<Unauthorized />} />

            {/* Admin Routes */}
            <Route
              path="/admin/*"
              element={
                <ProtectedRoute roles={["admin"]}>
                  <div className="min-h-screen bg-gray-50">
                    <Navbar />
                    <Routes>
                      <Route path="dashboard" element={<AdminDashboard />} />
                      <Route path="devices" element={<AdminDevices />} />
                      <Route path="users" element={<AdminUsers />} />
                      <Route path="triggers" element={<AdminTriggers />} />
                      <Route
                        path="*"
                        element={<Navigate to="/admin/dashboard" replace />}
                      />
                    </Routes>
                  </div>
                </ProtectedRoute>
              }
            />

            {/* Responder Routes */}
            <Route
              path="/responder/*"
              element={
                <ProtectedRoute roles={["responder"]}>
                  <div className="min-h-screen bg-gray-50">
                    <Navbar />
                    <Routes>
                      <Route
                        path="dashboard"
                        element={<ResponderDashboard />}
                      />
                      <Route path="alerts" element={<ResponderAlerts />} />
                      <Route path="history" element={<ResponderHistory />} />
                      <Route
                        path="*"
                        element={<Navigate to="/responder/dashboard" replace />}
                      />
                    </Routes>
                  </div>
                </ProtectedRoute>
              }
            />

            {/* End User Routes */}
            <Route
              path="/user/*"
              element={
                <ProtectedRoute roles={["enduser"]}>
                  <div className="min-h-screen bg-gray-50">
                    <Navbar />
                    <Routes>
                      <Route path="dashboard" element={<UserDashboard />} />
                      <Route path="trigger" element={<UserTrigger />} />
                      <Route path="history" element={<UserHistory />} />
                      <Route
                        path="*"
                        element={<Navigate to="/user/dashboard" replace />}
                      />
                    </Routes>
                  </div>
                </ProtectedRoute>
              }
            />

            {/* Root redirect based on role */}
            <Route path="/" element={<RoleBasedRedirect />} />

            {/* 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>

          <ToastContainer
            position="top-right"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
          />
        </div>
      </AuthProvider>
    </Router>
  );
};

// Helper component to redirect based on user role
const RoleBasedRedirect = () => {
  const user = JSON.parse(localStorage.getItem("user") || "null");

  if (!user) return <Navigate to="/login" replace />;

  if (user.role === "admin") return <Navigate to="/admin/dashboard" replace />;
  if (user.role === "responder")
    return <Navigate to="/responder/dashboard" replace />;
  if (user.role === "enduser") return <Navigate to="/user/dashboard" replace />;

  return <Navigate to="/login" replace />;
};

export default App;
