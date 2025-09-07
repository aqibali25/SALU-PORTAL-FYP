import "./App.css";
import Home from "./components/Home/Home";
import Navbar from "./components/navbar/Navbar";
import { Routes, Route } from "react-router-dom";
import AddUser from "./components/AddUser/AddUser";
import Profile from "./components/profile/Profile";
import Settings from "./components/settings/Settings";

function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/SALU-PORTAL-FYP/" element={<Home />} />
        <Route path="/SALU-PORTAL-FYP/profile" element={<Profile />} />
        <Route path="/SALU-PORTAL-FYP/adduser" element={<AddUser />} />
        <Route path="/SALU-PORTAL-FYP/Settings" element={<Settings />} />
      </Routes>
    </>
  );
}

export default App;
