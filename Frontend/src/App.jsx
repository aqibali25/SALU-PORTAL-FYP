import "./App.css";
import Home from "./components/Home/Home";
import Navbar from "./components/navbar/Navbar";
import { Routes, Route } from "react-router-dom";
import AddUser from "./components/AddUser/AddUser";
import Profile from "./components/profile/Profile";
import Settings from "./components/settings/Settings";
import ListUsers from "./components/ListUsers/ListUsers";
import Admissions from "./components/Admissions/Admissions";
import ReceivedForms from "./components/Admissions/RecivedForms";
import { ReviewForm } from "./components/Admissions/ReviewForm";
import FormsByStatus from "./components/Admissions/FormsByStatus";

function App() {
  return (
    <>
      <Navbar />
      <Routes>
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
        <Route path="/SALU-PORTAL-FYP/Admissions" element={<Admissions />} />
        <Route
          path="SALU-PORTAL-FYP/Admissions/RecivedForms"
          element={<ReceivedForms />}
        />{" "}
        <Route
          path="SALU-PORTAL-FYP/Admissions/RecivedForms/ReviewForm"
          element={<ReviewForm />}
        />
        <Route
          path="SALU-PORTAL-FYP/Admissions/ApprovedForms"
          element={<ReceivedForms status={"Approved"} />}
        />
        <Route
          path="SALU-PORTAL-FYP/Admissions/PendingForms"
          element={<ReceivedForms status={"Pending"} />}
        />
        <Route
          path="SALU-PORTAL-FYP/Admissions/RevertForms"
          element={<ReceivedForms status={"Revert"} />}
        />
        <Route
          path="SALU-PORTAL-FYP/Admissions/TrashForms"
          element={<ReceivedForms status={"Trash"} />}
        />
        <Route path="/SALU-PORTAL-FYP/Settings" element={<Settings />} />
      </Routes>
    </>
  );
}

export default App;
