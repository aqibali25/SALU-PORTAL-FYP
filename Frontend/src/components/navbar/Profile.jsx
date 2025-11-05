import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCog, faSignOutAlt, faUser } from "@fortawesome/free-solid-svg-icons";

const Profile = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const isLoggedIn = Cookies.get("isLoggedIn") === "true";

  // Toggle dropdown
  const toggleMenu = () => setMenuOpen(!menuOpen);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };

    if (menuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen]);

  // Logout
  const handleLogout = () => {
    Cookies.remove("isLoggedIn");
    navigate("/SALU-PORTAL-FYP/login");
  };

  return (
    <div
      ref={dropdownRef}
      className="relative flex justify-end items-center gap-3 cursor-pointer text-right z-[9999]"
    >
      {/* Profile Image */}
      <div
        className="w-[50px] h-[50px] rounded-full overflow-hidden border border-gray-300"
        onClick={toggleMenu}
      >
        <img
          src="https://www.w3schools.com/howto/img_avatar.png"
          alt="User Avatar"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Dropdown */}
      {isLoggedIn ? (
        <div
          className={`absolute right-0 top-[80px] w-[250px] bg-[#f5f5f5] rounded-md shadow-lg transition-all duration-300 ease-in-out ${
            menuOpen
              ? "opacity-100 translate-y-0 visible"
              : "opacity-0 -translate-y-3 invisible"
          }`}
        >
          {/* Dropdown arrow */}
          <div className="absolute top-[-10px] right-[14px] w-[20px] h-[20px] bg-[#f5f5f5] rotate-45 z-0" />

          {/* Menu Items */}
          <div className="flex flex-col bg-[#f5f5f5] !m-0 !p-0 z-[100]">
            <Link
              to="/SALU-PORTAL-FYP/Profile"
              className="flex items-center gap-5 text-[1.1rem] text-black no-underline hover:text-white z-10 md:hover:bg-gradient-to-r md:hover:from-[#D5D5D5] md:hover:to-[#CA4DFF] transition-all duration-500 !px-[20px] !py-[15px]"
              onClick={() => setMenuOpen(false)}
            >
              <FontAwesomeIcon icon={faUser} />
              Profile
            </Link>
            <Link
              to="/SALU-PORTAL-FYP/Settings"
              className="flex items-center gap-5 text-[1.1rem] text-black no-underline hover:text-white z-10 md:hover:bg-gradient-to-r md:hover:from-[#D5D5D5] md:hover:to-[#CA4DFF] transition-all duration-500 !px-[20px] !py-[15px]"
              onClick={() => setMenuOpen(false)}
            >
              <FontAwesomeIcon icon={faCog} />
              Settings
            </Link>

            <button
              onClick={handleLogout}
              className="flex items-center gap-5 text-[1.1rem] text-black w-full text-left hover:text-white md:hover:bg-gradient-to-r md:hover:from-[#D5D5D5] md:hover:to-[#CA4DFF] transition-all duration-500 !px-[20px] !py-[15px]"
            >
              <FontAwesomeIcon icon={faSignOutAlt} />
              Log Out
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default Profile;
