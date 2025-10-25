import { useEffect, useState } from "react";
import Image from "../../assets/Exams-bro 1.png";
import AOS from "aos";
import "aos/dist/aos.css";
import { LuUser, LuLock } from "react-icons/lu";

const Login = () => {
  const [showLoginForm, setShowLoginForm] = useState(false);

  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  useEffect(() => {
    document.title = "SALU Portal | Login";
    AOS.init({
      duration: 1300,
      once: true,
      easing: "ease-in-out",
    });

    const timer = setTimeout(() => {
      setShowLoginForm(true);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ✅ Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form Data:", formData);
    if (formData.username === "admin" && formData.password === "1234") {
      document.cookie = "isLoggedIn=true; path=/; max-age=86400";

      window.location.href = "/SALU-PORTAL-FYP/";
    } else {
      alert("Invalid username or password!");
    }
  };

  return (
    <>
      {!showLoginForm ? (
        // ---------------- INTRO SECTION ----------------
        <div className="flex flex-col md:flex-row justify-evenly items-center gap-10 w-full h-[calc(100vh-96px)] bg-white dark:bg-gray-900 p-6 overflow-hidden">
          {/* Left Section */}
          <div
            className="flex flex-col justify-center items-center md:w-1/2 w-full"
            data-aos="fade-right"
          >
            <h1
              className="font-bold text-center font-[Radio_Canada_Big] text-[#faa21c]
                         text-[3rem] sm:text-[5rem] md:text-[7rem] lg:text-[8rem]"
              data-aos="fade-down"
            >
              LOGIN
            </h1>
            <h1
              className="text-center font-[Playwrite_US_Trad] text-[#faa21c] mt-[-1rem] sm:mt-[-2rem] md:mt-[-3rem]
                         text-[3rem] sm:text-[5rem] md:text-[7rem] lg:text-[8rem]
                         drop-shadow-[2px_4px_6px_rgba(0,0,0,0.2)]"
              data-aos="fade-up"
            >
              Portal
            </h1>
          </div>

          {/* Right Section */}
          <div
            className="hidden md:flex justify-center items-center w-1/2 h-full overflow-hidden p-6"
            data-aos="fade-left"
          >
            <img
              className="w-[85%] max-w-[500px] object-contain"
              src={Image}
              alt="Portal Illustration"
            />
          </div>
        </div>
      ) : (
        // ---------------- LOGIN FORM SECTION ----------------
        <form
          onSubmit={handleSubmit}
          className="flex flex-col justify-center items-center gap-6 w-full h-[calc(100vh-96px)] 
                      dark:bg-gray-900 !px-8 !-z-50"
          data-aos="zoom-in"
        >
          <h1 className="font-bold text-center text-3xl sm:text-4xl text-gray-600 dark:text-gray-200">
            Welcome Back
          </h1>

          {/* Username */}
          <div className="relative flex justify-center items-center w-full sm:w-[80%] md:w-[60%] lg:w-[40%]">
            <LuUser className="absolute left-4 text-gray-400 text-2xl pointer-events-none" />
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Email or Username"
              className="w-full !pl-12
            [@media(max-width:768px)]:!w-full
            min-w-0
            !px-2 !py-1
            border-2 border-[#a5a5a5] outline-none
            bg-[#f9f9f9] text-[#2a2a2a]
            dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100
            disabled:opacity-60 disabled:cursor-not-allowed"
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
              className="w-full !pl-12
            [@media(max-width:768px)]:!w-full
            min-w-0
            !px-2 !py-1
            border-2 border-[#a5a5a5] outline-none
            bg-[#f9f9f9] text-[#2a2a2a]
            dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100
            disabled:opacity-60 disabled:cursor-not-allowed"
              required
            />
          </div>

          {/* Login Button */}
          <button
            type="submit"
            className="cursor-pointer relative overflow-hidden !px-[50px] !py-[5px] border-2 border-[#e5b300] text-white text-[0.8rem] font-medium bg-transparent transition-all duration-300 ease-linear
                       before:content-[''] before:absolute before:inset-x-0 before:bottom-0 before:h-full before:bg-[#e5b300] before:transition-all before:duration-300 before:ease-linear hover:before:h-0 disabled:opacity-60"
          >
            <span className="relative z-10">Login</span>
          </button>
        </form>
      )}
    </>
  );
};

export default Login;
