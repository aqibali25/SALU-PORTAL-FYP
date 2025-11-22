// Frontend/hooks/useAuth.js
import { useState, useEffect } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";

export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const clearAuthData = () => {
    // Clear localStorage
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    sessionStorage.clear();

    // Clear cookies
    Cookies.remove("isLoggedIn");
    Cookies.remove("role");
    Cookies.remove("username");
    Cookies.remove("user");

    // Clear all domain cookies
    document.cookie.split(";").forEach((c) => {
      document.cookie = c
        .replace(/^ +/, "")
        .replace(/=.*/, "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/");
    });

    setIsAuthenticated(false);
  };

  const checkAuth = async () => {
    const token = localStorage.getItem("token");
    const isLoggedInCookie = Cookies.get("isLoggedIn") === "true";

    if (!token || !isLoggedInCookie) {
      clearAuthData();
      setLoading(false);
      return false;
    }

    try {
      const API = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
      await axios.get(`${API}/api/users/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setIsAuthenticated(true);
      return true;
    } catch (error) {
      if (error.response?.status === 401) {
        clearAuthData();
        if (!window.location.pathname.includes("/login")) {
          navigate("/SALU-PORTAL-FYP/login", { replace: true });
        }
      }
      return false;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  return {
    isAuthenticated,
    loading,
    checkAuth,
    clearAuthData,
    setIsAuthenticated,
  };
};
