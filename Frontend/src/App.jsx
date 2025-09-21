import "./App.css";
import Home from "./components/Home/Home";
import Navbar from "./components/navbar/Navbar";
import { Routes, Route } from "react-router-dom";
import AddUser from "./components/AddUser/AddUser";
import Profile from "./components/profile/Profile";
import Settings from "./components/settings/Settings";
import ListUsers from "./components/ListUsers/ListUsers";
import ComputerOperator from "./components/ComputerOperator/ComputerOperator";

function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/Portal.Salu-Gc/" element={<Home />} />
        <Route path="/Portal.Salu-Gc/profile" element={<Profile />} />
        <Route
          path="/Portal.Salu-Gc/adduser"
          element={<AddUser Title="Add User" />}
        />
        <Route path="/Portal.Salu-Gc/ListUsers" element={<ListUsers />} />
        <Route
          path="/Portal.Salu-Gc/UpdateUser"
          element={<AddUser Title="Update User" />}
        />
        <Route
          path="/Portal.Salu-Gc/ComputerOperator"
          element={<ComputerOperator />}
        />
        <Route path="/Portal.Salu-Gc/Settings" element={<Settings />} />
      </Routes>
    </>
  );
}

export default App;
