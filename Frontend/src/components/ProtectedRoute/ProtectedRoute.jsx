// Frontend/components/ProtectedRoute/ProtectedRoute.jsx
import { Navigate } from "react-router-dom";
import Cookies from "js-cookie";

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const userRole = Cookies.get("role")?.toLowerCase();
  const isLoggedIn = Cookies.get("isLoggedIn") === "true";
  const token = localStorage.getItem("token");

  // Check if user has valid authentication
  if (!token || !isLoggedIn) {
    return <Navigate to="/SALU-PORTAL-FYP/login" replace />;
  }

  // Check role-based access
  if (allowedRoles.length > 0) {
    const normalizedAllowedRoles = allowedRoles.map((role) =>
      role.toLowerCase()
    );
    if (!normalizedAllowedRoles.includes(userRole)) {
      return <Navigate to="/SALU-PORTAL-FYP/" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;
