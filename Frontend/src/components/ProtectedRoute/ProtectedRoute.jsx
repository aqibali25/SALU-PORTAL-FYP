// components/ProtectedRoute/ProtectedRoute.jsx
import { Navigate } from "react-router-dom";
import Cookies from "js-cookie";

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const userRole = Cookies.get("role")?.toLowerCase(); // Convert to lowercase
  const isLoggedIn = Cookies.get("isLoggedIn") === "true";

  // Convert allowed roles to lowercase for comparison
  const normalizedAllowedRoles = allowedRoles.map((role) => role.toLowerCase());

  if (!isLoggedIn) {
    return <Navigate to="/SALU-PORTAL-FYP/login" replace />;
  }

  if (allowedRoles.length > 0 && !normalizedAllowedRoles.includes(userRole)) {
    return <Navigate to="/SALU-PORTAL-FYP/" replace />;
  }

  return children;
};

export default ProtectedRoute;
