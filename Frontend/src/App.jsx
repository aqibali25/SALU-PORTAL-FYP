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
import AddTestMarks from "./components/Admissions/AddTestMarks";
import SelectedInMaritList from "./components/Admissions/SelectedInMaritList";
import Marking from "./components/Examinations/Marking";
import ShowStudentsForMarking from "./components/Examinations/ShowStudentsForMarking";
import EnterStdMarks from "./components/Examinations/EnterStdMarks";
import Subjects from "./components/Subjects/Subjects";
import AddSubject from "./components/Subjects/AddSubject";
import ViewSubject from "./components/Subjects/ViewSubject";

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
              path="/SALU-PORTAL-FYP/UpdateUser/:userCnic"
              element={<AddUser Title="Update User" />}
            />

            <Route
              path="/SALU-PORTAL-FYP/Admissions"
              element={<Admissions />}
            />
            <Route
              path="/SALU-PORTAL-FYP/Admissions/RecivedForms/ReviewForm"
              element={<ReviewForm />}
            />
            <Route
              path="/SALU-PORTAL-FYP/Admissions/ApprovedForms"
              element={<FormsByStatus heading="Approved" />}
            />
            <Route
              path="/SALU-PORTAL-FYP/Admissions/PendingForms"
              element={<FormsByStatus heading="Pending" />}
            />
            <Route
              path="/SALU-PORTAL-FYP/Admissions/RevertForms"
              element={<FormsByStatus heading="Revert" />}
            />
            <Route
              path="/SALU-PORTAL-FYP/Admissions/TrashForms"
              element={<FormsByStatus heading="Trash" />}
            />
            <Route
              path="/SALU-PORTAL-FYP/Admissions/AppearedInTest"
              element={<FormsByStatus heading="Appeared In Test" />}
            />
            <Route
              path="/SALU-PORTAL-FYP/Admissions/AppearedInTest/AddTestMarks"
              element={<AddTestMarks />}
            />
            <Route
              path="/SALU-PORTAL-FYP/Admissions/PassedCandidates"
              element={<FormsByStatus heading="Passed Candidates" />}
            />
            <Route
              path="/SALU-PORTAL-FYP/Admissions/PassedCandidates/SelectedInMaritList"
              element={<SelectedInMaritList />}
            />
            <Route
              path="/SALU-PORTAL-FYP/Admissions/SelectedCandidates"
              element={<FormsByStatus heading="Selected Candidates" />}
            />
            <Route
              path="/SALU-PORTAL-FYP/Admissions/EnrolledCandidates"
              element={<FormsByStatus heading="Enrolled Candidates" />}
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
            <Route path="/SALU-PORTAL-FYP/EnterMarks" element={<Marking />} />

            {/* ✅ Updated Route */}
            <Route
              path="/SALU-PORTAL-FYP/EnterMarks/Subject/:subjectId"
              element={<ShowStudentsForMarking />}
            />
            <Route
              path="/SALU-PORTAL-FYP/EnterMarks/Subject/:subjectId/EnterStdMarks"
              element={<EnterStdMarks />}
            />
            <Route path="/SALU-PORTAL-FYP/Subjects" element={<Subjects />} />
            <Route
              path="/SALU-PORTAL-FYP/Subjects/AddSubject"
              element={<AddSubject Title="Add Subject" />}
            />

            <Route
              path="/SALU-PORTAL-FYP/Subjects/UpdateSubject/:subjectId"
              element={<AddSubject Title="Update Subject" />}
            />

            <Route
              path="/SALU-PORTAL-FYP/Subjects/ViewSubject"
              element={<ViewSubject />}
            />
          </>
        )}
      </Routes>
    </>
  );
}

export default App;
