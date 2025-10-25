import "./App.css";
import Home from "./components/Home/Home";
import Navbar from "./components/navbar/Navbar";
import { Routes, Route, useLocation, useNavigate } from "react-router-dom";
import AddUser from "./components/AddUser/AddUser";
import Profile from "./components/profile/Profile";
import Settings from "./components/settings/Settings";
import ListUsers from "./components/ListUsers/ListUsers";
import Admissions from "./components/Admissions/Admissions";
import FormsByStatus from "./components/Admissions/FormsByStatus";
import { ReviewForm } from "./components/Admissions/ReviewForm";
import Login from "./components/Login/Login";
import Cookies from "js-cookie";
import { useEffect } from "react";
import SubjectAllocation from "./components/SubAlocation/SubjectAllocation";
import AssigningSubject from "./components/SubAlocation/AssigningSubject";
import Attendance from "./components/Attendance/Attendance";
import MarkAttendances from "./components/Attendance/MarkAttendance";

function App() {
  const isLoggedIn = Cookies.get("isLoggedIn") === "true";
  const location = useLocation();
  const navigate = useNavigate();

  // ✅ Set page title and redirect if not logged in (except login page)
  useEffect(() => {
    if (!isLoggedIn && location.pathname !== "/SALU-PORTAL-FYP/login") {
      navigate("/SALU-PORTAL-FYP/login");
    }
  }, [isLoggedIn, location, navigate]);

  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/SALU-PORTAL-FYP/login" element={<Login />} />
        {isLoggedIn && (
          <>
            <Route path="/SALU-PORTAL-FYP/" element={<Home />} />
            <Route path="/SALU-PORTAL-FYP/profile" element={<Profile />} />
            <Route
              path="/SALU-PORTAL-FYP/adduser"
              element={<AddUser Title="Add User" />}
            />
            <Route path="/SALU-PORTAL-FYP/ListUsers" element={<ListUsers />} />
            <Route
              path="/SALU-PORTAL-FYP/UpdateUser"
              element={<AddUser Title="Update User" />}
            />
            <Route
              path="/SALU-PORTAL-FYP/Admissions"
              element={<Admissions />}
            />
            <Route
              path="/SALU-PORTAL-FYP/Admissions/RecivedForms"
              element={<FormsByStatus />}
            />
            <Route
              path="/SALU-PORTAL-FYP/Admissions/RecivedForms/ReviewForm"
              element={<ReviewForm />}
            />
            <Route
              path="/SALU-PORTAL-FYP/Admissions/ApprovedForms"
              element={<FormsByStatus status="Approved" />}
            />
            <Route
              path="/SALU-PORTAL-FYP/Admissions/PendingForms"
              element={<FormsByStatus status="Pending" />}
            />
            <Route
              path="/SALU-PORTAL-FYP/Admissions/RevertForms"
              element={<FormsByStatus status="Revert" />}
            />
            <Route
              path="/SALU-PORTAL-FYP/Admissions/TrashForms"
              element={<FormsByStatus status="Trash" />}
            />

            <Route path="/SALU-PORTAL-FYP/Settings" element={<Settings />} />
            <Route
              path="/SALU-PORTAL-FYP/SubjectAllocation"
              element={<SubjectAllocation />}
            />
            <Route
              path="/SALU-PORTAL-FYP/SubjectAllocation/:subjectId"
              element={<AssigningSubject />}
            />
            <Route
              path="/SALU-PORTAL-FYP/Attendance"
              element={<Attendance />}
            />
            <Route
              path="/SALU-PORTAL-FYP/Attendance/:subjectId"
              element={<MarkAttendances />}
            />
          </>
        )}
      </Routes>
    </>
  );
}

export default App;
