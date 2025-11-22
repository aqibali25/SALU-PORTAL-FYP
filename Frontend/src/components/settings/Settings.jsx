// Frontend/components/settings/Settings.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import Cookies from "js-cookie";
import Background from "../../assets/Background.png";
import InputContainer from "../InputContainer";
import BackButton from "../BackButton";

const Settings = () => {
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const navigate = useNavigate();

  const [form, setForm] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    document.title = "SALU Portal | Settings";
  }, []);

  const onChange = (key) => (e) => {
    const value = e.target.value;
    setForm((f) => ({
      ...f,
      [key]: value,
    }));
  };

  // Clear all authentication data
  const clearAllAuthData = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    sessionStorage.clear();

    Cookies.remove("isLoggedIn");
    Cookies.remove("role");
    Cookies.remove("username");
    Cookies.remove("user");

    document.cookie.split(";").forEach((c) => {
      document.cookie = c
        .replace(/^ +/, "")
        .replace(/=.*/, "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/");
    });
  };

  // Handle file selection
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file (JPEG, PNG, etc.).");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size should be less than 5MB.");
      return;
    }

    setSelectedFile(file);
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
  };

  const handleCancelUpload = () => {
    setSelectedFile(null);
    setPreviewUrl("");
    const fileInput = document.getElementById("profilePicture");
    if (fileInput) fileInput.value = "";
  };

  const handleProfilePictureUpload = async () => {
    if (!selectedFile) {
      toast.error("Please select a profile picture first.");
      return;
    }

    try {
      setUploading(true);
      const token = localStorage.getItem("token");
      const API = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

      const formData = new FormData();
      formData.append("profilePicture", selectedFile);

      await axios.post(`${API}/api/users/upload-profile-picture`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
        withCredentials: true,
      });

      toast.success("Profile picture updated successfully!", {
        position: "top-right",
        autoClose: 2000,
      });

      setTimeout(() => {
        window.location.reload();
      }, 2500);

      setSelectedFile(null);
      setPreviewUrl("");
      const fileInput = document.getElementById("profilePicture");
      if (fileInput) fileInput.value = "";
    } catch (err) {
      console.error("Upload error:", err);

      if (err.response?.status === 401) {
        toast.error("Your session has expired. Please login again.", {
          position: "top-right",
        });
        clearAllAuthData();
        setTimeout(() => {
          window.location.href = "/SALU-PORTAL-FYP/login";
        }, 1500);
      } else {
        toast.error(
          err.response?.data?.message || "Error uploading profile picture",
          {
            position: "top-right",
          }
        );
      }
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.oldPassword) {
      toast.error("Old Password is required.");
      return;
    }

    if (!form.newPassword) {
      toast.error("New Password is required.");
      return;
    }

    if (form.newPassword !== form.confirmPassword) {
      toast.error("New Password and Confirm Password do not match.");
      return;
    }

    if (form.newPassword.length < 3) {
      toast.error("New Password must be at least 3 characters long.");
      return;
    }

    try {
      setSubmitting(true);
      const token = localStorage.getItem("token");
      const API = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

      const payload = {
        oldPassword: form.oldPassword,
        newPassword: form.newPassword,
      };

      const response = await axios.post(
        `${API}/api/users/change-password`,
        payload,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        }
      );

      if (response.data.logoutAll) {
        toast.success(
          "Password changed successfully! Logging out all devices...",
          {
            position: "top-right",
            autoClose: 3000,
          }
        );

        setTimeout(() => {
          clearAllAuthData();
          window.location.href = "/SALU-PORTAL-FYP/login";
        }, 2000);
      }
    } catch (err) {
      console.error(err);

      if (err.response?.status === 401) {
        toast.error("Your session has expired. Please login again.", {
          position: "top-right",
        });
        clearAllAuthData();
        setTimeout(() => {
          window.location.href = "/SALU-PORTAL-FYP/login";
        }, 1500);
      } else {
        toast.error(err.response?.data?.message || "Error changing password", {
          position: "top-right",
        });
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogoutAllDevices = async () => {
    if (!window.confirm("This will log you out from all devices. Continue?")) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const API = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

      const response = await axios.post(
        `${API}/api/auth/logout-all`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.logoutAll) {
        toast.success("Logged out from all devices successfully!", {
          position: "top-right",
          autoClose: 3000,
        });

        setTimeout(() => {
          clearAllAuthData();
          window.location.href = "/SALU-PORTAL-FYP/login";
        }, 2000);
      }
    } catch (err) {
      console.error(err);

      if (err.response?.status === 401) {
        toast.error("Your session has expired. Please login again.", {
          position: "top-right",
        });
        clearAllAuthData();
        window.location.href = "/SALU-PORTAL-FYP/login";
      } else {
        toast.error(
          err.response?.data?.message || "Error logging out all devices",
          {
            position: "top-right",
          }
        );
      }
    }
  };

  return (
    <div
      className="!p-[25px] md:!px-[80px] min-h-[calc(100vh-90px)] w-[100%] bg-white dark:bg-gray-900"
      style={{
        backgroundImage: `url(${Background})`,
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center",
      }}
    >
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-3 w-full min-h-[80vh] bg-[#D5BBE0] rounded-md !p-5"
      >
        <div className="flex justify-start items-center gap-3">
          <BackButton />
          <h1 className="text-2xl sm:text-3xl md:text-4xl py-3 font-bold text-gray-900 dark:text-white">
            Settings
          </h1>
        </div>

        <hr className="border-t-[3px] border-gray-900 dark:border-white mb-4" />

        <div className="flex flex-col justify-start items-center gap-5 min-h-[60vh] w-full !p-5 bg-white dark:bg-gray-900 rounded-md">
          {/* Password Change Section */}
          <div className="w-full max-w-[800px] !space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Change Password
            </h3>

            <div className="bg-yellow-50 border border-yellow-200 rounded-md !p-4 !mb-4">
              <p className="text-sm text-yellow-800">
                <strong>Note:</strong> Changing your password will log you out
                of all devices.
              </p>
            </div>

            <InputContainer
              placeholder="Enter Old Password"
              title="Old Password"
              htmlFor="oldPassword"
              inputType="password"
              required
              value={form.oldPassword}
              onChange={onChange("oldPassword")}
            />

            <InputContainer
              placeholder="Enter New Password"
              title="New Password"
              htmlFor="newPassword"
              inputType="password"
              required
              value={form.newPassword}
              onChange={onChange("newPassword")}
            />

            <InputContainer
              placeholder="Enter Confirm Password"
              title="Confirm Password"
              htmlFor="confirmPassword"
              inputType="password"
              required
              value={form.confirmPassword}
              onChange={onChange("confirmPassword")}
            />
          </div>

          <div className="w-full max-w-[800px] flex justify-end !mt-6">
            <button
              type="submit"
              disabled={submitting}
              className="cursor-pointer relative overflow-hidden !px-[15px] !py-[5px] border-2 border-[#e5b300] text-white hover:text-black hover:dark:text-white text-[0.8rem] font-medium bg-transparent transition-all duration-300 ease-linear
                         before:content-[''] before:absolute before:inset-x-0 before:bottom-0 before:h-full before:bg-[#e5b300] before:transition-all before:duration-300 before:ease-linear hover:before:h-0 disabled:opacity-60"
            >
              <span className="relative z-10">
                {submitting
                  ? "Changing Password..."
                  : "Change Password & Logout All Devices"}
              </span>
            </button>
          </div>

          {/* Logout All Devices Section */}
          <div className="w-full max-w-[800px] !space-y-4 !mt-8">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white !mb-4">
              Session Management
            </h3>

            <div className="bg-blue-50 border border-blue-200 rounded-md !p-4 !mb-4">
              <p className="text-sm text-blue-800">
                <strong>Secure Logout:</strong> Log out from all devices where
                you are currently logged in. This is useful if you logged in on
                a public or shared computer.
              </p>
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleLogoutAllDevices}
                className="cursor-pointer relative overflow-hidden !px-[15px] !py-[5px] border-2 border-red-600 text-white hover:text-black hover:dark:text-white text-[0.8rem] font-medium bg-transparent transition-all duration-300 ease-linear
                           before:content-[''] before:absolute before:inset-x-0 before:bottom-0 before:h-0 before:bg-red-600 before:transition-all before:duration-300 before:ease-linear hover:before:h-full"
              >
                <span className="relative z-10">Logout All Devices</span>
              </button>
            </div>
          </div>

          {/* Profile Picture Section */}
          <div className="w-full max-w-[800px] !space-y-4 !mt-8">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Change Profile Picture
            </h3>

            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 w-full">
              <div className="w-full lg:w-1/4">
                <label
                  htmlFor="profilePicture"
                  className="block text-gray-900 dark:text-white font-medium text-sm lg:text-base"
                >
                  Select Image:
                </label>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 lg:hidden">
                  JPEG, PNG, max 5MB
                </p>
              </div>

              <div className="w-full lg:w-3/4">
                <input
                  type="file"
                  id="profilePicture"
                  accept="image/*"
                  onChange={handleFileSelect}
                  disabled={uploading}
                  className="w-full !px-3 !py-2 border-2 border-[#a5a5a5] outline-none bg-[#f9f9f9] text-[#2a2a2a] dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 file:mr-4 file:py-1 file:px-3 file:border-0 file:bg-[#e5b300] file:text-white file:text-xs file:font-medium hover:file:bg-[#d4a300] transition-colors"
                />
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 hidden lg:block">
                  Select a profile picture (JPEG, PNG, max 5MB)
                </p>
              </div>
            </div>

            {selectedFile && (
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 !mt-6 !p-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 transition-all duration-300">
                <div className="flex-shrink-0 mx-auto sm:mx-0">
                  <img
                    src={previewUrl}
                    alt="Profile preview"
                    className="w-16 h-16 sm:w-18 sm:h-18 object-cover rounded-full border-2 border-gray-300 dark:border-gray-600"
                  />
                </div>

                <div className="flex-1 w-full min-w-0">
                  <div className="mb-3">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {selectedFile.name}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 !mt-1">
                      Size: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>

                  <p className="text-xs text-gray-600 dark:text-gray-400 !mb-3">
                    Click Upload to set as your profile picture or Cancel to
                    choose a different one.
                  </p>

                  <div className="flex justify-end gap-3 w-full">
                    <button
                      type="button"
                      onClick={handleProfilePictureUpload}
                      disabled={uploading}
                      className="cursor-pointer relative overflow-hidden !px-[15px] !py-[5px] border-2 border-green-600 text-white hover:text-black hover:dark:text-white text-[0.8rem] font-medium bg-transparent transition-all duration-300 ease-linear
                         before:content-[''] before:absolute before:inset-x-0 before:bottom-0 before:h-full before:bg-green-600 before:transition-all before:duration-300 before:ease-linear hover:before:h-0 disabled:opacity-60"
                    >
                      <span className="relative z-10">
                        {uploading ? "Uploading..." : "Upload"}
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={handleCancelUpload}
                      disabled={uploading}
                      className="cursor-pointer relative overflow-hidden !px-[15px] !py-[5px] border-2 border-red-600 text-white hover:text-black hover:dark:text-white text-[0.8rem] font-medium bg-transparent transition-all duration-300 ease-linear
                         before:content-[''] before:absolute before:inset-x-0 before:bottom-0 before:h-0 before:bg-red-600 before:transition-all before:duration-300 before:ease-linear hover:before:h-full disabled:opacity-60"
                    >
                      <span className="relative z-10">Cancel</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {!selectedFile && (
              <div className="!mt-6 !p-4 border border-dashed border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800">
                <div className="text-center">
                  <div className="mx-auto w-10 h-10 mb-2 text-gray-400 dark:text-gray-500">
                    <svg
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={1.5}
                      viewBox="0 0 24 24"
                      className="w-full h-full"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
                      />
                    </svg>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                    No image selected
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500">
                    Choose a profile picture above. Supported formats: JPEG,
                    PNG. Maximum size: 5MB.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </form>
    </div>
  );
};

export default Settings;
