// hooks/useRoleAccess.js
import Cookies from "js-cookie";

export const useRoleAccess = () => {
  const userRole = Cookies.get("role")?.toLowerCase();

  const hasAccess = (allowedRoles) => {
    return allowedRoles.includes(userRole);
  };

  const redirectToHome = () => {
    window.location.href = "/SALU-PORTAL-FYP/";
  };

  return { hasAccess, redirectToHome, userRole };
};
