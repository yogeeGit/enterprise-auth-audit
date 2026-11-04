import { Navigate, Outlet } from "react-router-dom";
import useAuth from "../hooks/useAuth";

function ProtectedRoute({ allowedRoles }) {
  const { isAuthenticated, user } = useAuth();


  // Check whether the user is logged in.
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Check whether the user's role is permitted.
  if (
    allowedRoles &&
    !allowedRoles.includes(user?.role)
  ) {
    return <Navigate to="/unauthorized" replace />;
  }

  // Allow access to the requested page.
  return <Outlet />;
}

export default ProtectedRoute;