import { useState } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { LuMail, LuArrowLeft } from "react-icons/lu";
import FormImage from "../../assets/login-illustration.png";

const pageVariants = {
  initial: { opacity: 0, x: 40 },
  animate: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  },
  exit: {
    opacity: 0,
    x: -40,
    transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] },
  },
};

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const navigate = useNavigate();

  const validateForm = () => {
    const errors = {};

    if (!email.trim()) {
      errors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = "Please enter a valid email address";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    const value = e.target.value;
    setEmail(value);

    if (formErrors.email) {
      setFormErrors((prev) => ({
        ...prev,
        email: "",
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fix the form errors before submitting.");
      return;
    }

    try {
      setLoading(true);
      const loadingToast = toast.loading("Sending reset link...");

      const response = await axios.post(
        "http://localhost:5000/api/auth/forgot-password",
        { email }
      );

      toast.update(loadingToast, {
        render: response.data.message,
        type: "success",
        isLoading: false,
        autoClose: 5000,
        closeButton: true,
      });

      setEmailSent(true);
    } catch (error) {
      let errorMessage = "Unable to connect to the server.";

      if (error.response) {
        if (error.response.status === 404) {
          errorMessage = "No account found with this email address";
        } else if (error.response.status === 500) {
          errorMessage = "Server error. Please try again later.";
        } else if (error.response.data && error.response.data.message) {
          errorMessage = error.response.data.message;
        } else {
          errorMessage = "Failed to send reset link. Please try again.";
        }
      } else if (error.request) {
        errorMessage =
          "Unable to connect to server. Please check your internet connection.";
      }

      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleBackToLogin = () => {
    navigate("/SALU-PORTAL-FYP/login");
  };

  return (
    <>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />

      <div className="flex md:h-[calc(100vh-96px)] h-[calc(100vh-64px)]  bg-white dark:bg-gray-900">
        {/* Left Section - Form */}
        <motion.div
          className="flex flex-col md:flex-row justify-evenly items-center gap-10 w-full h-full bg-white dark:bg-gray-900 !p-6 overflow-hidden"
          variants={pageVariants}
          initial="initial"
          animate="animate"
          exit="exit"
        >
          {/* Form Content */}
          <div className="w-full max-w-md">
            {" "}
            {/* Back Button - Keeping original text-only style */}
            <div className="w-full max-w-md !mb-4 sm:!mb-6">
              <button
                onClick={handleBackToLogin}
                className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white transition-colors text-sm sm:text-base cursor-pointer"
              >
                <LuArrowLeft className="text-lg" />
                <span>Back to Login</span>
              </button>
            </div>
            <motion.h1
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="font-bold text-2xl sm:!text-3xl lg:!text-4xl text-gray-600 dark:text-gray-200 !mb-2 text-center lg:text-left"
            >
              Forgot Password?
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="text-gray-500 dark:text-gray-400 !mb-6 sm:!mb-8 text-sm sm:text-base text-center lg:text-left"
            >
              {emailSent
                ? "Check your email for the reset link"
                : "Enter your email to reset your password"}
            </motion.p>
            {!emailSent ? (
              <motion.form
                onSubmit={handleSubmit}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.6 }}
                className="!space-y-4 sm:!space-y-6"
              >
                {/* Email Input */}
                <div className="relative">
                  <LuMail className="absolute !left-3 sm:!left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg sm:text-xl pointer-events-none" />
                  <input
                    type="email"
                    name="email"
                    value={email}
                    onChange={handleChange}
                    placeholder="Enter your email address"
                    className={`w-full !py-2 !pl-10 sm:!pl-12 !pr-3 sm:!pr-4 border-2 outline-none bg-[#f9f9f9] text-[#2a2a2a]
                             dark:bg-gray-800 dark:text-gray-100 text-sm sm:text-base
                             ${
                               formErrors.email
                                 ? "!border-red-500 dark:!border-red-400"
                                 : "border-[#a5a5a5] dark:border-gray-600 focus:!border-[#e5b300]"
                             }`}
                    required
                  />
                  {formErrors.email && (
                    <span className="absolute !-bottom-5 sm:!-bottom-6 !left-0 text-red-500 text-xs sm:text-sm font-medium">
                      {formErrors.email}
                    </span>
                  )}
                </div>

                {/* Submit Button */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={loading}
                  className="w-full cursor-pointer relative overflow-hidden !py-2 border-2 border-[#e5b300] text-white text-sm sm:text-base font-medium bg-transparent transition-all duration-300 ease-linear
                         before:content-[''] before:absolute before:inset-x-0 before:bottom-0 before:h-full before:bg-[#e5b300] before:transition-all before:duration-300 before:ease-linear hover:before:h-0 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <span className="relative z-10">
                    {loading ? "Sending..." : "Send Reset Link"}
                  </span>
                </motion.button>
              </motion.form>
            ) : (
              // Success Message
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.6 }}
                className="flex flex-col justify-center items-center text-center !space-y-4 sm:!space-y-6"
              >
                <div className="!w-12 sm:!w-16 !h-12 sm:!h-16 mx-auto bg-green-100 dark:bg-green-900 flex items-center justify-center">
                  <LuMail className="text-xl sm:text-2xl text-green-600 dark:text-green-400" />
                </div>

                <div>
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-700 dark:text-gray-200 !mb-2">
                    Check Your Email
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 text-sm sm:text-base">
                    Reset link sent to:
                    <br />
                    <strong className="text-gray-700 dark:text-gray-200 break-all">
                      {email}
                    </strong>
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setEmailSent(false)}
                    className="flex-1 cursor-pointer relative overflow-hidden !py-2 border-2 border-[#e5b300] text-white text-sm sm:text-base font-medium bg-transparent transition-all duration-300 ease-linear
                           before:content-[''] before:absolute before:inset-x-0 before:bottom-0 before:h-0 before:bg-[#e5b300] before:transition-all before:duration-300 before:ease-linear hover:before:h-full"
                  >
                    <span className="relative z-10">Try Another Email</span>
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleBackToLogin}
                    className="flex-1 cursor-pointer relative overflow-hidden !py-2 border-2 border-[#e5b300] text-white text-sm sm:text-base font-medium bg-transparent transition-all duration-300 ease-linear
                           before:content-[''] before:absolute before:inset-x-0 before:bottom-0 before:h-full before:bg-[#e5b300] before:transition-all before:duration-300 before:ease-linear hover:before:h-0"
                  >
                    <span className="relative z-10">Back to Login</span>
                  </motion.button>
                </div>
              </motion.div>
            )}
            {/* Additional Help */}
            {!emailSent && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.6 }}
                className="!mt-6 sm:!mt-8 text-center"
              >
                <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm">
                  Remember your password?{" "}
                  <Link
                    to="/SALU-PORTAL-FYP/login"
                    className="text-[#e5b300] hover:underline font-medium"
                  >
                    Back to Login
                  </Link>
                </p>
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Right Section - Illustration */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="hidden md:flex justify-center items-center w-[60%] h-full !p-6"
        >
          <motion.img
            src={FormImage}
            alt="Password Recovery"
            className="w-[100%] object-contain"
            animate={{ y: [16, -6, 16] }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        </motion.div>
      </div>
    </>
  );
}
