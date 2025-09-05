import Logo from "../../assets/logo.png";
import { Link } from "react-router-dom";
import { HiOutlineHome } from "react-icons/hi";
import { FiSettings } from "react-icons/fi";
import Profile from "../../assets/Profile.png";
import ThemeToggle from "./ThemeToggle";

const Navbar = () => {
  return (
    <div
      className="m-0 flex h-[90px] w-full !pl-4 items-center justify-between overflow-hidden bg-gray-100 dark:bg-gray-800 shadow-[0px_7px_13px_-2px_rgba(0,0,0,0.44)]

"
    >
      {/* Left: Logo + Text */}
      <div className="flex h-full min-w-[500px] w-full items-center gap-2">
        <img
          src={Logo}
          alt="Logo"
          className="ml-2 mr-2 h-18 w-18 rounded-full"
        />

        <Link
          to="/SALU-PORTAL-FYP/"
          className="no-underline flex flex-col items-center justify-center text-black dark:text-white"
        >
          <h1 className="text-center text-[1.4rem] font-semibold uppercase  dark:text-gray-200">
            SHAH ABDUL LATIF UNIVERSITY
          </h1>

          <h2 className="text-center text-[1.4rem] font-semibold uppercase  dark:text-gray-300">
            GHOTKI CAMPUS
          </h2>
        </Link>
      </div>

      {/* Right: Gradient Icons Section */}
      <div className="relative h-[100px] min-w-[300px] w-[60%] overflow-hidden bg-gray-100 dark:bg-gray-800">
        <div
          className="
            absolute inset-0 flex items-center justify-end gap-5 !pr-5 text-2xl text-white
            bg-gradient-to-r from-[#cbb4d4] to-[#d9a7c7]
            [clip-path:polygon(28%_0,100%_0,100%_100%,0%_100%)]
          "
        >
          {/* Theme toggle shouldn't be wrapped in a Link */}
          <div>
            <ThemeToggle />
          </div>

          <Link
            to="/SALU-PORTAL-FYP/"
            className="grid h-10 w-10 place-items-center rounded-full bg-white text-gray-900 ring-1 ring-white/40 transition hover:ring-white/60"
            aria-label="Home"
          >
            <HiOutlineHome className="h-6 w-6" />
          </Link>

          <Link
            to="/SALU-PORTAL-FYP/Sittings"
            className="grid h-10 w-10 place-items-center rounded-full bg-white text-gray-900 ring-1 ring-white/40 transition hover:ring-white/60"
            aria-label="Settings"
          >
            <FiSettings className="h-6 w-6" />
          </Link>

          <Link
            to="/SALU-PORTAL-FYP/Profile"
            className="h-10 w-10 overflow-hidden rounded-full ring-1 ring-white/40 transition hover:ring-white/60"
            aria-label="Profile"
          >
            <img
              className="h-full w-full rounded-full object-cover"
              src={Profile}
              alt="Profile"
            />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
