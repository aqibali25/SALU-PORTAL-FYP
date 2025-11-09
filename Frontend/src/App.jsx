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
import ReviewForm from "./components/Admissions/ReviewForm";
import Login from "./components/Login/Login";
import Cookies from "js-cookie";
import { useEffect } from "react";
import SubjectAllocation from "./components/SubAlocation/SubjectAllocation";
import AssigningSubject from "./components/SubAlocation/AssigningSubject";
import Attendance from "./components/Attendance/Attendance";
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
import AddFees from "./components/Fees/Addfees";
import ViewFees from "./components/Fees/ViewFees";

// Helper function to get roles for a specific route
const getRolesForRoute = (routePath) => {
  // Remove the base path and leading/trailing slashes
  const cleanPath = routePath.replace("/SALU-PORTAL-FYP/", "").replace("/", "");

  // Find the card that matches this route
  const card = cards.find(
    (c) => c.link.toLowerCase() === cleanPath.toLowerCase()
  );

  return card ? card.roles : [];
};

function App() {
  const isLoggedIn = Cookies.get("isLoggedIn") === "true";
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoggedIn && location.pathname !== "/SALU-PORTAL-FYP/login") {
      navigate("/SALU-PORTAL-FYP/login");
    }
  }, [isLoggedIn, location, navigate]);

  return (
    <>
      {/* ✅ Toast Container */}
      <ToastContainer position="top-center" autoClose={2000} />

      <Navbar />
      <Routes>
        <Route path="/SALU-PORTAL-FYP/login" element={<Login />} />
        {isLoggedIn && (
          <>
            <Route path="/SALU-PORTAL-FYP/" element={<Home />} />
            <Route path="/SALU-PORTAL-FYP/profile" element={<Profile />} />

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
              path="/SALU-PORTAL-FYP/Attendance/:subjectId"
              element={
                <ProtectedRoute allowedRoles={getRolesForRoute("attendance")}>
                  <MarkAttendances />
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

            <Route path="/SALU-PORTAL-FYP/Settings" element={<Settings />} />
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
              path="/SALU-PORTAL-FYP/Fees/UpdateFees"
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
                  <AddDepartments />
                </ProtectedRoute>
              }
            />
            <Route
              path="/SALU-PORTAL-FYP/Departments/UpdateDepartment/:departmentId"
              element={
                <ProtectedRoute allowedRoles={getRolesForRoute("departments")}>
                  <AddDepartments />
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
          </>
        )}
      </Routes>
    </>
  );
}

export default App;
