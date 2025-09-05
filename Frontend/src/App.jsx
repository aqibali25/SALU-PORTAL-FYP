import "./App.css";
import Home from "./components/Home/Home";
import Navbar from "./components/navbar/Navbar";
import { Routes, Route } from "react-router-dom";
import AddUser from "./components/AddUser/AddUser";
import Profile from "./components/profile/Profile";
import Sittings from "./components/sittings/Sittings";

function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/SALU-PORTAL-FYP/" element={<Home />} />
        <Route path="/SALU-PORTAL-FYP/profile" element={<Profile />} />
        <Route path="/SALU-PORTAL-FYP/adduser" element={<AddUser />} />
        <Route path="/SALU-PORTAL-FYP/Sittings" element={<Sittings />} />
      </Routes>
    </>
  );
}

export default App;
