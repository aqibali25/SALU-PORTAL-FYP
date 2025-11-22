import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import ProfilePic from "../../assets/Profile.png"; // Default profile image
import { faCog, faSignOutAlt, faUser } from "@fortawesome/free-solid-svg-icons";

const Profile = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [imageLoading, setImageLoading] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const isLoggedIn = Cookies.get("isLoggedIn") === "true";
  const API = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

  // Fetch profile image when logged in
  useEffect(() => {
    if (isLoggedIn) {
      fetchProfileImage();
    }
  }, [isLoggedIn]);

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

  // Fetch profile image from API
  const fetchProfileImage = async () => {
    try {
      setImageLoading(true);
      const token = localStorage.getItem("token");

      if (!token) {
        console.warn("No token found in localStorage");
        return;
      }

      const response = await axios.get(`${API}/api/users/profile-image`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        responseType: "blob",
        withCredentials: true,
      });

      // Create URL for the image blob
      const imageUrl = URL.createObjectURL(response.data);
      setProfileImage(imageUrl);
    } catch (err) {
      console.error("Error fetching profile image:", err);
      // If no profile image exists or error occurs, profileImage will remain null
    } finally {
      setImageLoading(false);
    }
  };

  // Logout
  const handleLogout = () => {
    // Clean up the object URL when logging out
    if (profileImage) {
      URL.revokeObjectURL(profileImage);
    }

    Cookies.remove("isLoggedIn");
    localStorage.removeItem("token"); // Also remove token on logout
    setProfileImage(null); // Reset profile image
    navigate("/SALU-PORTAL-FYP/login");
  };

  // Clean up the object URL when component unmounts
  useEffect(() => {
    return () => {
      if (profileImage) {
        URL.revokeObjectURL(profileImage);
      }
    };
  }, [profileImage]);

  // Determine which image to display
  const getProfileImage = () => {
    if (!isLoggedIn) {
      return "https://www.w3schools.com/howto/img_avatar.png";
    }

    // If logged in, use fetched profile image or default ProfilePic
    return profileImage || ProfilePic;
  };

  return (
    <div
      ref={dropdownRef}
      className="relative flex justify-end items-center gap-3 cursor-pointer text-right"
    >
      {/* Profile Image */}
      <div
        className="w-[50px] h-[50px] rounded-full overflow-hidden border border-gray-300"
        onClick={toggleMenu}
      >
        {imageLoading ? (
          <div className="w-full h-full bg-gray-300 flex items-center justify-center">
            <div className="w-4 h-4 border-2 border-yellow-400 border-dashed rounded-full animate-spin"></div>
          </div>
        ) : (
          <img
            src={getProfileImage()}
            alt="User Avatar"
            className="w-full h-full object-cover"
            onError={(e) => {
              // Fallback to default images if the fetched image fails to load
              if (isLoggedIn) {
                e.target.src = ProfilePic;
              } else {
                e.target.src = "https://www.w3schools.com/howto/img_avatar.png";
              }
            }}
          />
        )}
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
              className="flex items-center gap-5 text-[1.1rem] text-black w-full text-left hover:text-white md:hover:bg-gradient-to-r md:hover:from-[#D5D5D5] md:hover:to-[#CA4DFF] transition-all duration-500 !px-[20px] !py-[15px] cursor-pointer"
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
