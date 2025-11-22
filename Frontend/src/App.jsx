// App.jsx
import Home from "./components/Home/Home";
import Navbar from "./components/navbar/Navbar";
import { Routes, Route, useLocation, useNavigate } from "react-router-dom";
import AddUser from "./components/AddUser/AddUser";
import Profile from "./components/profile/Profile";
import Settings from "./components/settings/Settings";
import ListUsers from "./components/ListUsers/ListUsers";
import Admissions from "./components/Admissions/Admissions";
import FormsByStatus from "./components/Admissions/FormsByStatus";
import ReviewForm from "./components/Admissions/ReviewForm";
import Login from "./components/Login/Login";
import Cookies from "js-cookie";
import { useEffect, useState } from "react";
import SubjectAllocation from "./components/SubAlocation/SubjectAllocation";
import AssigningSubject from "./components/SubAlocation/AssigningSubject";
import TakeAttendance from "./components/Attendance/TakeAttendance";
import MarkAttendances from "./components/Attendance/MarkAttendance";
import AddTestMarks from "./components/Admissions/AddTestMarks";
import SelectedInMaritList from "./components/Admissions/SelectedInMeritList";
import Marking from "./components/Examinations/Marking";
import ShowStudentsForMarking from "./components/Examinations/ShowStudentsForMarking";
import EnterStdMarks from "./components/Examinations/EnterStdMarks";
import Subjects from "./components/Subjects/Subjects";
import AddSubject from "./components/Subjects/AddSubject";
import ViewSubject from "./components/Subjects/ViewSubject";
import ProtectedRoute from "./components/ProtectedRoute/ProtectedRoute";
import { cards } from "./Hooks/HomeCards";

// ✅ Toastify Import
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Fees from "./components/Fees/Fees";
import Departments from "./components/Departments/Departments";
import AddDepartments from "./components/Departments/AddDepartments";
import ViewDepartments from "./components/Departments/ViewDepartments";
import AddFees from "./components/Fees/AddFees";
import ViewFees from "./components/Fees/ViewFees";
import EnrolledStudents from "./components/EnrolledStudents/EnrolledStudents";
import Attendance from "./components/Attendance/Attendance";
import ViewAttendance from "./components/Attendance/ViewAttendance";
import StudentAttendance from "./components/Attendance/StudentAttendance";
import UpdateStudentAttendance from "./components/Attendance/UpdateStudentAttendance";
import Library from "./components/Library/Library";
import AddBook from "./components/Library/AddBook";
import TotalBooks from "./components/Library/TotalBooks";
import IssuedBooks from "./components/Library/IssuedBooks";
import IssueBook from "./components/Library/IssueBook";
import AdmissionSchedule from "./components/AdmissionSchedule/AdmissionSchedule";
import AddAdmissionSchedule from "./components/AdmissionSchedule/AddAdmissionSchedule";
import ViewAdmissionSchedules from "./components/AdmissionSchedule/ViewAdmissionSchedules";
import axios from "axios";

// Helper function to get roles for a specific route
const getRolesForRoute = (routePath) => {
  const cleanPath = routePath.replace("/SALU-PORTAL-FYP/", "").replace("/", "");
  const card = cards.find(
    (c) => c.link.toLowerCase() === cleanPath.toLowerCase()
  );
  return card ? card.roles : [];
};

// ✅ Enhanced authentication check with backend verification
const checkAuthentication = async () => {
  const token = localStorage.getItem("token");
  const isLoggedInCookie = Cookies.get("isLoggedIn") === "true";

  // If no token but cookie says logged in, clear the invalid state
  if (!token && isLoggedInCookie) {
    clearAuthData();
    return false;
  }

  // If both exist, verify with backend
  if (token && isLoggedInCookie) {
    try {
      const API = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
      await axios.get(`${API}/api/users/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return true;
    } catch (error) {
      if (error.response?.status === 401) {
        clearAuthData();
        return false;
      }
      // For network errors, assume authenticated (will fail on actual API calls)
      return true;
    }
  }

  return false;
};

// ✅ Clear all authentication data
const clearAuthData = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  sessionStorage.clear();

  Cookies.remove("isLoggedIn");
  Cookies.remove("role");
  Cookies.remove("username");
  Cookies.remove("user");

  // Clear all cookies aggressively
  document.cookie.split(";").forEach((c) => {
    document.cookie = c
      .replace(/^ +/, "")
      .replace(/=.*/, "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/");
  });
};

function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    const verifyAuth = async () => {
      const authenticated = await checkAuthentication();
      setIsAuthenticated(authenticated);
      setAuthChecked(true);

      const isLoginPage = location.pathname === "/SALU-PORTAL-FYP/login";

      if (!authenticated && !isLoginPage) {
        navigate("/SALU-PORTAL-FYP/login", { replace: true });
      }

      if (authenticated && isLoginPage) {
        navigate("/SALU-PORTAL-FYP/", { replace: true });
      }
    };

    verifyAuth();
  }, [location.pathname, navigate]);

  // ✅ Add axios interceptor to handle token expiration globally
  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          clearAuthData();
          setIsAuthenticated(false);
          if (!window.location.pathname.includes("/login")) {
            navigate("/SALU-PORTAL-FYP/login", { replace: true });
          }
        }
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, [navigate]);

  const theme = localStorage.getItem("theme");

  if (!authChecked) {
    return (
      <div
        className={`flex justify-center items-center min-h-[calc(100vh)] ${
          theme === "dark" ? "bg-gray-900" : "bg-white"
        }`}
      >
        <div className="w-16 h-16 border-4 border-yellow-400 border-dashed rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <>
      {/* ✅ Toast Container */}
      <ToastContainer position="top-center" autoClose={2000} />

      {/* ✅ Navbar is always visible - both on login page and authenticated pages */}
      <Navbar />

      <Routes>
        <Route path="/SALU-PORTAL-FYP/login" element={<Login />} />

        {isAuthenticated ? (
          <>
            <Route path="/SALU-PORTAL-FYP/" element={<Home />} />
            <Route path="/SALU-PORTAL-FYP/profile" element={<Profile />} />
            <Route path="/SALU-PORTAL-FYP/Settings" element={<Settings />} />

            {/* Dynamically protected routes using card roles */}
            <Route
              path="/SALU-PORTAL-FYP/adduser"
              element={
                <ProtectedRoute allowedRoles={getRolesForRoute("adduser")}>
                  <AddUser Title="Add User" />
                </ProtectedRoute>
              }
            />
            <Route
              path="/SALU-PORTAL-FYP/ListUsers"
              element={
                <ProtectedRoute allowedRoles={getRolesForRoute("listusers")}>
                  <ListUsers />
                </ProtectedRoute>
              }
            />
            <Route
              path="/SALU-PORTAL-FYP/UpdateUser/:userCnic"
              element={
                <ProtectedRoute allowedRoles={getRolesForRoute("adduser")}>
                  <AddUser Title="Update User" />
                </ProtectedRoute>
              }
            />

            <Route
              path="/SALU-PORTAL-FYP/AdmissionSchedule"
              element={
                <ProtectedRoute
                  allowedRoles={getRolesForRoute("admissionsschedule")}
                >
                  <AdmissionSchedule />
                </ProtectedRoute>
              }
            />
            <Route
              path="/SALU-PORTAL-FYP/AdmissionSchedule/AddAdmissionSchedule"
              element={
                <ProtectedRoute
                  allowedRoles={getRolesForRoute("admissionsschedule")}
                >
                  <AddAdmissionSchedule Title="Add Admissions Schedule" />
                </ProtectedRoute>
              }
            />
            <Route
              path="/SALU-PORTAL-FYP/AdmissionSchedule/UpdateAdmissionSchedule"
              element={
                <ProtectedRoute
                  allowedRoles={getRolesForRoute("admissionsschedule")}
                >
                  <AddAdmissionSchedule Title="Update Admissions Schedule" />
                </ProtectedRoute>
              }
            />
            <Route
              path="/SALU-PORTAL-FYP/AdmissionSchedule/ViewAdmissionSchedules"
              element={
                <ProtectedRoute
                  allowedRoles={getRolesForRoute("admissionsschedule")}
                >
                  <ViewAdmissionSchedules />
                </ProtectedRoute>
              }
            />

            <Route
              path="/SALU-PORTAL-FYP/Admissions"
              element={
                <ProtectedRoute allowedRoles={getRolesForRoute("admissions")}>
                  <Admissions />
                </ProtectedRoute>
              }
            />
            <Route
              path="/SALU-PORTAL-FYP/Admissions/Pending/ReviewForm"
              element={
                <ProtectedRoute allowedRoles={getRolesForRoute("admissions")}>
                  <ReviewForm />
                </ProtectedRoute>
              }
            />
            <Route
              path="/SALU-PORTAL-FYP/Admissions/ApprovedForms"
              element={
                <ProtectedRoute allowedRoles={getRolesForRoute("admissions")}>
                  <FormsByStatus heading="Approved" />
                </ProtectedRoute>
              }
            />
            <Route
              path="/SALU-PORTAL-FYP/Admissions/PendingForms"
              element={
                <ProtectedRoute allowedRoles={getRolesForRoute("admissions")}>
                  <FormsByStatus heading="Pending" />
                </ProtectedRoute>
              }
            />
            <Route
              path="/SALU-PORTAL-FYP/Admissions/RevertForms"
              element={
                <ProtectedRoute allowedRoles={getRolesForRoute("admissions")}>
                  <FormsByStatus heading="Revert" />
                </ProtectedRoute>
              }
            />
            <Route
              path="/SALU-PORTAL-FYP/Admissions/TrashForms"
              element={
                <ProtectedRoute allowedRoles={getRolesForRoute("admissions")}>
                  <FormsByStatus heading="Trash" />
                </ProtectedRoute>
              }
            />
            <Route
              path="/SALU-PORTAL-FYP/Admissions/AppearedInTest"
              element={
                <ProtectedRoute allowedRoles={getRolesForRoute("admissions")}>
                  <FormsByStatus heading="Appeared In Test" />
                </ProtectedRoute>
              }
            />
            <Route
              path="/SALU-PORTAL-FYP/Admissions/AppearedInTest/AddTestMarks"
              element={
                <ProtectedRoute allowedRoles={getRolesForRoute("admissions")}>
                  <AddTestMarks />
                </ProtectedRoute>
              }
            />
            <Route
              path="/SALU-PORTAL-FYP/Admissions/PassedCandidates"
              element={
                <ProtectedRoute allowedRoles={getRolesForRoute("admissions")}>
                  <FormsByStatus heading="Passed Candidates" />
                </ProtectedRoute>
              }
            />
            <Route
              path="/SALU-PORTAL-FYP/Admissions/PassedCandidates/SelectedInMeritList"
              element={
                <ProtectedRoute allowedRoles={getRolesForRoute("admissions")}>
                  <SelectedInMaritList />
                </ProtectedRoute>
              }
            />
            <Route
              path="/SALU-PORTAL-FYP/Admissions/SelectedCandidates"
              element={
                <ProtectedRoute allowedRoles={getRolesForRoute("admissions")}>
                  <FormsByStatus heading="Selected Candidates" />
                </ProtectedRoute>
              }
            />
            <Route
              path="/SALU-PORTAL-FYP/Admissions/EnrolledCandidates"
              element={
                <ProtectedRoute allowedRoles={getRolesForRoute("admissions")}>
                  <FormsByStatus heading="Enrolled Candidates" />
                </ProtectedRoute>
              }
            />
            <Route
              path="/SALU-PORTAL-FYP/EnrolledStudents"
              element={
                <ProtectedRoute
                  allowedRoles={getRolesForRoute("enrolledstudents")}
                >
                  <EnrolledStudents />
                </ProtectedRoute>
              }
            />

            <Route
              path="/SALU-PORTAL-FYP/SubjectAllocation"
              element={
                <ProtectedRoute
                  allowedRoles={getRolesForRoute("subjectallocation")}
                >
                  <SubjectAllocation />
                </ProtectedRoute>
              }
            />
            <Route
              path="/SALU-PORTAL-FYP/SubjectAllocation/:subjectId"
              element={
                <ProtectedRoute
                  allowedRoles={getRolesForRoute("subjectallocation")}
                >
                  <AssigningSubject />
                </ProtectedRoute>
              }
            />
            <Route
              path="/SALU-PORTAL-FYP/Subjects"
              element={
                <ProtectedRoute allowedRoles={getRolesForRoute("subjects")}>
                  <Subjects />
                </ProtectedRoute>
              }
            />
            <Route
              path="/SALU-PORTAL-FYP/Subjects/AddSubject"
              element={
                <ProtectedRoute allowedRoles={getRolesForRoute("subjects")}>
                  <AddSubject Title="Add Subject" />
                </ProtectedRoute>
              }
            />
            <Route
              path="/SALU-PORTAL-FYP/Subjects/UpdateSubject/:subjectId"
              element={
                <ProtectedRoute allowedRoles={getRolesForRoute("subjects")}>
                  <AddSubject Title="Update Subject" />
                </ProtectedRoute>
              }
            />
            <Route
              path="/SALU-PORTAL-FYP/Subjects/ViewSubject"
              element={
                <ProtectedRoute allowedRoles={getRolesForRoute("subjects")}>
                  <ViewSubject />
                </ProtectedRoute>
              }
            />

            <Route
              path="/SALU-PORTAL-FYP/Attendance"
              element={
                <ProtectedRoute allowedRoles={getRolesForRoute("attendance")}>
                  <Attendance />
                </ProtectedRoute>
              }
            />
            <Route
              path="/SALU-PORTAL-FYP/Attendance/TakeAttendance"
              element={
                <ProtectedRoute allowedRoles={getRolesForRoute("attendance")}>
                  <TakeAttendance title="Take Attendance" />
                </ProtectedRoute>
              }
            />
            <Route
              path="/SALU-PORTAL-FYP/Attendance/TakeAttendance/:subjectId"
              element={
                <ProtectedRoute allowedRoles={getRolesForRoute("attendance")}>
                  <MarkAttendances />
                </ProtectedRoute>
              }
            />
            <Route
              path="/SALU-PORTAL-FYP/Attendance/ViewAttendance"
              element={
                <ProtectedRoute allowedRoles={getRolesForRoute("attendance")}>
                  <TakeAttendance title="View Attendance" />
                </ProtectedRoute>
              }
            />
            <Route
              path="/SALU-PORTAL-FYP/Attendance/ViewAttendance/:subjectId"
              element={
                <ProtectedRoute allowedRoles={getRolesForRoute("attendance")}>
                  <ViewAttendance />
                </ProtectedRoute>
              }
            />
            <Route
              path="/SALU-PORTAL-FYP/Attendance/ViewAttendance/:subjectId/:roll_no"
              element={
                <ProtectedRoute allowedRoles={getRolesForRoute("attendance")}>
                  <StudentAttendance />
                </ProtectedRoute>
              }
            />
            <Route
              path="/SALU-PORTAL-FYP/Attendance/ViewAttendance/:subjectId/:roll_no/UpdateAttendance/"
              element={
                <ProtectedRoute allowedRoles={getRolesForRoute("attendance")}>
                  <UpdateStudentAttendance />
                </ProtectedRoute>
              }
            />
            <Route
              path="/SALU-PORTAL-FYP/EnterMarks"
              element={
                <ProtectedRoute allowedRoles={getRolesForRoute("entermarks")}>
                  <Marking />
                </ProtectedRoute>
              }
            />
            <Route
              path="/SALU-PORTAL-FYP/EnterMarks/Subject/:subjectId"
              element={
                <ProtectedRoute allowedRoles={getRolesForRoute("entermarks")}>
                  <ShowStudentsForMarking />
                </ProtectedRoute>
              }
            />
            <Route
              path="/SALU-PORTAL-FYP/EnterMarks/Subject/:subjectId/EnterStdMarks"
              element={
                <ProtectedRoute allowedRoles={getRolesForRoute("entermarks")}>
                  <EnterStdMarks />
                </ProtectedRoute>
              }
            />

            <Route
              path="/SALU-PORTAL-FYP/Fees"
              element={
                <ProtectedRoute allowedRoles={getRolesForRoute("fees")}>
                  <Fees />
                </ProtectedRoute>
              }
            />
            <Route
              path="/SALU-PORTAL-FYP/Fees/AddFees"
              element={
                <ProtectedRoute allowedRoles={getRolesForRoute("fees")}>
                  <AddFees Title="Add Fees" />
                </ProtectedRoute>
              }
            />
            <Route
              path="/SALU-PORTAL-FYP/Fees/UpdateFees/:feeId"
              element={
                <ProtectedRoute allowedRoles={getRolesForRoute("fees")}>
                  <AddFees Title="Update Fees" />
                </ProtectedRoute>
              }
            />
            <Route
              path="/SALU-PORTAL-FYP/Fees/ViewFees"
              element={
                <ProtectedRoute allowedRoles={getRolesForRoute("fees")}>
                  <ViewFees />
                </ProtectedRoute>
              }
            />
            <Route
              path="/SALU-PORTAL-FYP/Departments"
              element={
                <ProtectedRoute allowedRoles={getRolesForRoute("departments")}>
                  <Departments />
                </ProtectedRoute>
              }
            />
            <Route
              path="/SALU-PORTAL-FYP/Departments/AddDepartment"
              element={
                <ProtectedRoute allowedRoles={getRolesForRoute("departments")}>
                  <AddDepartments Title={"Add Department"} />
                </ProtectedRoute>
              }
            />
            <Route
              path="/SALU-PORTAL-FYP/Departments/UpdateDepartment/:departmentId"
              element={
                <ProtectedRoute allowedRoles={getRolesForRoute("departments")}>
                  <AddDepartments Title={"Update Department"} />
                </ProtectedRoute>
              }
            />
            <Route
              path="/SALU-PORTAL-FYP/Departments/ViewDepartments"
              element={
                <ProtectedRoute allowedRoles={getRolesForRoute("departments")}>
                  <ViewDepartments />
                </ProtectedRoute>
              }
            />
            <Route
              path="/SALU-PORTAL-FYP/Library"
              element={
                <ProtectedRoute allowedRoles={getRolesForRoute("library")}>
                  <Library />
                </ProtectedRoute>
              }
            />
            <Route
              path="/SALU-PORTAL-FYP/Library/AddBook"
              element={
                <ProtectedRoute allowedRoles={getRolesForRoute("library")}>
                  <AddBook Title="Add Book" />
                </ProtectedRoute>
              }
            />
            <Route
              path="/SALU-PORTAL-FYP/Library/UpdateBook/:bookId"
              element={
                <ProtectedRoute allowedRoles={getRolesForRoute("library")}>
                  <AddBook Title="Update Book" />
                </ProtectedRoute>
              }
            />
            <Route
              path="/SALU-PORTAL-FYP/Library/TotalBooks"
              element={
                <ProtectedRoute allowedRoles={getRolesForRoute("library")}>
                  <TotalBooks />
                </ProtectedRoute>
              }
            />
            <Route
              path="/SALU-PORTAL-FYP/Library/IssueBook"
              element={
                <ProtectedRoute allowedRoles={getRolesForRoute("library")}>
                  <IssueBook />
                </ProtectedRoute>
              }
            />
            <Route
              path="/SALU-PORTAL-FYP/Library/IssuedBooks"
              element={
                <ProtectedRoute allowedRoles={getRolesForRoute("library")}>
                  <IssuedBooks title="Issued Books" />
                </ProtectedRoute>
              }
            />
            <Route
              path="/SALU-PORTAL-FYP/Library/OverdueBooks"
              element={
                <ProtectedRoute allowedRoles={getRolesForRoute("library")}>
                  <IssuedBooks title="Overdue Books" />
                </ProtectedRoute>
              }
            />
          </>
        ) : (
          // Redirect all other routes to login if not authenticated
          <Route path="*" element={<Login />} />
        )}
      </Routes>
    </>
  );
}

export default App;
