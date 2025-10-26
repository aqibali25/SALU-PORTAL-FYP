import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import Image from "../../assets/splash-illustration.png";
import FormImage from "../../assets/login-illustration.png";
import { LuUser, LuLock } from "react-icons/lu";
import { Link, useNavigate } from "react-router-dom";

const pageVariants = {
  initial: { opacity: 0, x: 40 },
  animate: {
    opacity: 1,
    x: 0,
    transition: { duration: 2, ease: [0.22, 1, 0.36, 1] },
  },
  exit: {
    opacity: 0,
    x: -40,
    transition: { duration: 0, ease: [0.22, 1, 0.36, 1] },
  },
};

// 👇 Text animation variant (for each letter)
const letterVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: "easeOut" },
  },
};

export default function Login() {
  const [showLoginForm, setShowLoginForm] = useState(false);
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "SALU Portal | Login";
    const timer = setTimeout(() => setShowLoginForm(true), 2000);
    return () => clearTimeout(timer);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (!formData.username || !formData.password) {
      setErrorMsg("Please enter your username and password.");
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post(
        "http://localhost:5000/api/auth/login",
        {
          identifier: formData.username,
          password: formData.password,
        }
      );
      const data = response.data;

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      document.cookie = "isLoggedIn=true; path=/; max-age=86400";

      navigate("/SALU-PORTAL-FYP/");
    } catch (error) {
      if (error.response && error.response.data) {
        setErrorMsg(error.response.data.message || "Invalid credentials");
      } else {
        setErrorMsg("Unable to connect to the server.");
      }
    } finally {
      setLoading(false);
    }
  };

  // 👇 Helper to animate each letter individually
  const renderAnimatedText = (text, delay = 0) => (
    <motion.div
      initial="hidden"
      animate="visible"
      transition={{
        staggerChildren: 0.08,
        delayChildren: delay,
      }}
      className="flex justify-center"
    >
      {text.split("").map((char, index) => (
        <motion.span
          key={index}
          variants={letterVariants}
          className="inline-block"
        >
          {char === " " ? "\u00A0" : char}
        </motion.span>
      ))}
    </motion.div>
  );

  return (
    <AnimatePresence mode="wait">
      {!showLoginForm ? (
        // ---------------- INTRO SECTION ----------------
        <section
          key="intro"
          className="flex flex-col md:flex-row justify-evenly items-center gap-10 w-full h-[calc(100vh-96px)] bg-white dark:bg-gray-900 p-6 overflow-hidden"
          variants={pageVariants}
          initial="initial"
          animate="animate"
          exit="exit"
        >
          {/* Left Section */}
          <div className="flex flex-col justify-center items-center md:w-1/2 w-full">
            <div
              className="font-bold text-center font-[Radio_Canada_Big] text-[#faa21c]
                         text-[3rem] sm:text-[5rem] md:text-[7rem] lg:text-[8rem]"
            >
              {renderAnimatedText("LOGIN")}
            </div>

            <div
              className="text-center font-[Playwrite_US_Trad] text-[#faa21c] mt-[-1rem] sm:mt-[-2rem] md:mt-[-3rem]
                         text-[3rem] sm:text-[5rem] md:text-[7rem] lg:text-[8rem]
                         drop-shadow-[2px_4px_6px_rgba(0,0,0,0.2)]"
            >
              {renderAnimatedText("Portal", 0.6)}
            </div>
          </div>

          {/* Right Section - floating illustration */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="hidden md:flex justify-center items-center w-1/2 h-full overflow-hidden p-6"
          >
            <motion.img
              src={Image}
              alt="Portal Illustration"
              className="w-[85%] max-w-[500px] object-contain"
              animate={{ y: [16, -6, 16], rotate: [0, -1.2, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            />
          </motion.div>
        </section>
      ) : (
        // ---------------- LOGIN FORM SECTION ----------------
        <div className="flex h-[calc(100vh-96px)] bg-white dark:bg-gray-900">
          <motion.form
            key="form"
            onSubmit={handleSubmit}
            className="flex flex-col justify-center items-center gap-6 w-full h-[calc(100vh-96px)] dark:bg-gray-900 !px-8"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <motion.h1
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: 0.2,
                duration: 0.6,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="font-bold text-center text-3xl sm:text-4xl text-gray-600 dark:text-gray-200"
            >
              Welcome Back!
            </motion.h1>

            {/* Username */}
            <div className="relative flex justify-center items-center w-full sm:w-[80%] md:w-[60%] lg:w-[40%]">
              <LuUser className="absolute left-4 text-gray-400 text-2xl pointer-events-none" />
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="Email or Username"
                className="w-full !py-2 !pl-12 border-2 border-[#a5a5a5] outline-none bg-[#f9f9f9] text-[#2a2a2a]
                           dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
                required
              />
            </div>

            {/* Password */}
            <div className="relative flex justify-center items-center w-full sm:w-[80%] md:w-[60%] lg:w-[40%]">
              <LuLock className="absolute left-4 text-gray-400 text-2xl pointer-events-none" />
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Password"
                className="w-full !py-2 !pl-12 border-2 border-[#a5a5a5] outline-none bg-[#f9f9f9] text-[#2a2a2a]
                           dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
                required
              />
            </div>

            {/* Error message */}
            {errorMsg && (
              <p className="text-red-500 text-sm font-medium">{errorMsg}</p>
            )}

            <Link className="hover:underline dark:text-white">
              Forgot your password?
            </Link>

            {/* Login Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="submit"
              disabled={loading}
              className="cursor-pointer relative overflow-hidden !px-[50px] !py-[5px] border-2 border-[#e5b300] text-white text-[0.8rem] font-medium bg-transparent transition-all duration-300 ease-linear
                       before:content-[''] before:absolute before:inset-x-0 before:bottom-0 before:h-full before:bg-[#e5b300] before:transition-all before:duration-300 before:ease-linear hover:before:h-0 disabled:opacity-60"
            >
              <span className="relative z-10">
                {loading ? "Signing in..." : "Login"}
              </span>
            </motion.button>
          </motion.form>

          {/* Right Illustration */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="hidden md:flex justify-center items-center w-[60%] h-full !p-6"
          >
            <motion.img
              src={FormImage}
              alt="Portal Illustration"
              className="w-[100%] object-contain"
              animate={{ y: [16, -6, 16], rotate: [0, -1.2, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            />
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
