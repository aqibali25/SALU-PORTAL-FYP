import Logo from "../../assets/logo.png";
import { Link } from "react-router-dom";
import { HiOutlineHome } from "react-icons/hi";
import { FiSettings } from "react-icons/fi";
import ThemeToggle from "./ThemeToggle";
import Cookies from "js-cookie";
import Profile from "./Profile";
import { useEffect } from "react";
import axios from "axios";

const Navbar = () => {
  const isLoggedIn = Cookies.get("isLoggedIn") === "true";
  useEffect(() => {
    // Frontend call - no data needed
    const token = localStorage.getItem("token");
    const API = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
    axios
      .put(`${API}/api/admission-schedules/update-status`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {})
      .catch((error) => {
        console.error("Error updating status:", error);
      });
  }, []);
  //
  return (
    <div
      className="
        flex w-full items-center justify-between
        bg-gray-100 dark:bg-gray-800
        shadow-[0px_7px_13px_-2px_rgba(0,0,0,0.44)]
        h-16 sm:h-20 lg:h-24 relative
        [@media(max-width:767px)]:!px-10
        md:px-3 md:sm:px-4
      "
    >
      {/* LEFT: Logo + Text */}
      <Link
        to="/SALU-PORTAL-FYP/"
        className="flex items-center gap-2 sm:gap-3 flex-shrink md:!pl-10 h-[100%] w-[70%] bg-gray-100 dark:bg-gray-800 md:z-20"
        style={{ clipPath: "polygon(0 0, 100% 0, 70% 100%, 0% 100%)" }}
      >
        <img
          src={Logo}
          alt="Logo"
          className="ml-1 sm:ml-2 mr-2 rounded-full
                     h-10 w-10 sm:h-12 sm:w-12 md:h-14 md:w-14 lg:h-16 lg:w-16"
        />

        <div className="hidden [@media(min-width:520px)]:flex flex-col items-center justify-center text-black dark:text-white min-w-0">
          <h1
            className="
              truncate font-semibold uppercase leading-tight
              text-[0.72rem] xs:text-[0.8rem] sm:text-[1rem] md:text-[1.3rem] lg:text-[1.6rem]
              dark:text-gray-200
            "
          >
            SHAH ABDUL LATIF UNIVERSITY
          </h1>

          <h2
            className="
              truncate font-semibold uppercase leading-tight
              text-[0.72rem] xs:text-[0.8rem] sm:text-[1rem] md:text-[1.3rem] lg:text-[1.6rem]
              dark:text-gray-300
            "
          >
            GHOTKI CAMPUS
          </h2>
        </div>
      </Link>

      {/* RIGHT: Actions */}
      <div
        className="
          absolute right-0 top-0 h-full flex-none w-auto] md:w-[66%] flex items-center justify-end !pr-5
         md:bg-gradient-to-r md:from-[#D5D5D5] md:to-[#CA4DFF]
          text-gray-900 md:text-white gap-2 sm:gap-3 md:gap-5
          overflow-visible
        "
      >
        {/* Theme Toggle */}
        <div className="scale-90 sm:scale-100">
          <ThemeToggle />
        </div>

        {isLoggedIn && (
          <>
            {/* Home */}
            <Link
              to="/SALU-PORTAL-FYP/"
              className="grid h-8 w-8 place-items-center rounded-full
                bg-white text-gray-900 ring-1 ring-black/10 md:ring-white/40
                transition hover:ring-black/20 md:hover:ring-white/60
                shrink-0"
              aria-label="Home"
            >
              <HiOutlineHome className="h-5 w-5" />
            </Link>

            {/* Settings */}
            <Link
              to="/SALU-PORTAL-FYP/Settings"
              className="grid h-8 w-8 place-items-center rounded-full
                bg-white text-gray-900 ring-1 ring-black/10 md:ring-white/40
                transition hover:ring-black/20 md:hover:ring-white/60
                shrink-0"
              aria-label="Settings"
            >
              <FiSettings className="h-5 w-5" />
            </Link>
          </>
        )}

        {/* Profile Dropdown (inside clip area, but fixed-positioned menu) */}
        <Profile />
      </div>
    </div>
  );
};

export default Navbar;
