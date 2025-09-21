import Logo from "../../assets/logo.png";
import { Link } from "react-router-dom";
import { HiOutlineHome } from "react-icons/hi";
import { FiSettings } from "react-icons/fi";
import Profile from "../../assets/Profile.png";
import ThemeToggle from "./ThemeToggle";

const Navbar = () => {
  return (
    <div
      className="
        m-0 flex w-full items-center justify-between
        bg-gray-100 dark:bg-gray-800
        shadow-[0px_7px_13px_-2px_rgba(0,0,0,0.44)]
        h-16 sm:h-20 lg:h-24

      [@media(max-width:767px)]:!px-10

        /* When screen is md (>=768px) and above, override it */
        md:px-3 md:sm:px-4
      "
    >
      {/* LEFT: Logo + Text (Shrinks first) */}
      <Link
        to="/SALU-PORTAL-FYP/"
        className="flex items-center gap-2 sm:gap-3 min-w-0 flex-shrink md:!pl-10 "
      >
        {/* Logo */}
        <img
          src={Logo}
          alt="Logo"
          className="ml-1 sm:ml-2 mr-2 rounded-full
                     h-10 w-10 sm:h-12 sm:w-12 md:h-14 md:w-14 lg:h-16 lg:w-16"
        />

        {/* University Text - hidden on very small screens */}
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

      {/* RIGHT: Action Icons (ALWAYS visible, doesn't shrink) */}
      <div
        className="
          relative h-full flex-none
          w-auto overflow-visible
          md:w-[50%]
        "
      >
        <div
          className="
            absolute inset-0 flex items-center gap-2 sm:gap-3 md:gap-5
            justify-end md:!pr-5
            /* Background behavior */
            bg-white md:bg-gradient-to-r md:from-[#D5D5D5] md:to-[#CA4DFF]
            md:[clip-path:polygon(28%_0,100%_0,100%_100%,0%_100%)]
            text-gray-900 md:text-white
          "
        >
          {/* Theme Toggle */}
          <div className="scale-90 sm:scale-100">
            <ThemeToggle />
          </div>

          {/* Home */}
          <Link
            to="/SALU-PORTAL-FYP/"
            className="
              grid h-8 w-8 place-items-center rounded-full
              bg-white text-gray-900 ring-1 ring-black/10 md:ring-white/40
              transition hover:ring-black/20 md:hover:ring-white/60
              shrink-0
            "
            aria-label="Home"
          >
            <HiOutlineHome className="h-5 w-5" />
          </Link>

          {/* Settings */}
          <Link
            to="/SALU-PORTAL-FYP/Settings"
            className="
              grid h-8 w-8 place-items-center rounded-full
              bg-white text-gray-900 ring-1 ring-black/10 md:ring-white/40
              transition hover:ring-black/20 md:hover:ring-white/60
              shrink-0
            "
            aria-label="Settings"
          >
            <FiSettings className="h-5 w-5" />
          </Link>

          {/* Profile */}
          <Link
            to="/SALU-PORTAL-FYP/Profile"
            className="
              h-8 w-8 overflow-hidden rounded-full
              ring-1 ring-black/10 md:ring-white/40
              transition hover:ring-black/20 md:hover:ring-white/60
              shrink-0
            "
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
