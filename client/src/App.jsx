
import {
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import AdminPage from "./pages/AdminPage";
import Unauthorized from "./pages/Unauthorized";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Routes accessible to both Admin and Operator */}
      <Route
        element={
          <ProtectedRoute allowedRoles={["Admin", "Operator"]} />
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />
      </Route>

      {/* Admin-only route */}
      <Route
        element={<ProtectedRoute allowedRoles={["Admin"]} />}
      >
        <Route path="/admin" element={<AdminPage />} />
      </Route>

      {/* Unauthorized page */}
      <Route path="/unauthorized" element={<Unauthorized />} />

      {/* Handle unknown routes */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;
