import { useEffect, useState } from "react";
import { FiMoon, FiSun } from "react-icons/fi";

const ThemeToggle = () => {
  const [theme, setTheme] = useState("light");

  // Load saved theme or system preference
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");

    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.classList.toggle("dark", savedTheme === "dark");
    } else {
      const prefersDark = window.matchMedia(
        "(prefers-color-scheme: dark)"
      ).matches;
      const initialTheme = prefersDark ? "dark" : "light";

      setTheme(initialTheme);
      document.documentElement.classList.toggle("dark", prefersDark);
    }
  }, []);

  // Toggle handler
  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    document.documentElement.classList.toggle("dark", newTheme === "dark");
    localStorage.setItem("theme", newTheme);
  };

  return (
    <button
      onClick={toggleTheme}
      className="relative flex items-center w-[70px] h-[35px] !px-1 rounded-full cursor-pointer transition-colors duration-300"
      style={{ backgroundColor: "#374759", justifyContent: "space-around" }}
      aria-label="Toggle Dark Mode"
    >
      {/* Highlight Circle */}
      <span
        className={`absolute w-[28px] h-[28px] rounded-full bg-gray-100 transition-all duration-300`}
        style={{
          left: theme === "dark" ? "calc(100% - 35px)" : "5px",
          zIndex: 1,
        }}
      />

      {/* Icons */}
      <FiSun
        size={15}
        className={`z-10 transition-colors duration-300 ${
          theme === "dark" ? "text-gray-300" : "text-yellow-500"
        }`}
      />
      <FiMoon
        size={18}
        className={`z-10 transition-colors duration-300 ${
          theme === "dark" ? "text-blue-400" : "text-gray-500"
        }`}
      />
    </button>
  );
};

export default ThemeToggle;
