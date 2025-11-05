import { useEffect, useMemo, useState } from "react";
import Cookies from "js-cookie";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import Background from "../../assets/Background.png";
import CnicInput from "../CNICInput";
import InputContainer from "../InputContainer";
import BackButton from "../BackButton";

const AddUser = ({ Title }) => {
  const rolesArray = [
    "Office Secretary",
    "Assistant",
    "Clerk",
    "Peon",
    "Supervisor",
    "Admin",
    "HR Officer",
    "Accountant",
    "IT Support",
    "Librarian",
    "Teacher",
    "HOD",
  ];

  const [cnic, setCnic] = useState("");
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();

  const editingUser = useMemo(
    () => location.state?.user ?? null,
    [location.state]
  );

  const [form, setForm] = useState({
    username: "",
    userEmail: "",
    userPassword: "",
    userConfirmPassword: "",
    userRole: "",
  });
  const [submitting, setSubmitting] = useState(false);

  // ✅ If editing, prefill the form
  useEffect(() => {
    const initData = async () => {
      try {
        setLoading(true);

        if (editingUser) {
          // Normalize role (capitalize each word to match rolesArray)
          const normalizeRole = (role = "") =>
            role
              .toLowerCase()
              .split(" ")
              .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
              .join(" ");

          setForm((f) => ({
            ...f,
            username: editingUser.username ?? "",
            userEmail: editingUser.email ?? "",
            userRole: normalizeRole(editingUser.role ?? ""),
          }));

          if (editingUser.cnic) setCnic(editingUser.cnic);
        }
      } finally {
        setLoading(false);
      }
    };

    initData();
  }, [editingUser]);

  const onChange = (key) => (e) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  // ✅ CNIC formatting
  const formatCNIC = (digitsOnly) => {
    const a = digitsOnly.slice(0, 5);
    const b = digitsOnly.slice(5, 12);
    const c = digitsOnly.slice(12, 13);
    return [a, b, c].filter(Boolean).join("-");
  };

  const handleCnicChange = (valOrEvent) => {
    const raw =
      typeof valOrEvent === "string"
        ? valOrEvent
        : valOrEvent?.target?.value ?? "";
    const digits = raw.replace(/\D/g, "").slice(0, 13);
    setCnic(formatCNIC(digits));
  };

  // ✅ Submit Handler (Axios)
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!cnic) return alert("CNIC is required.");
    if (!/^\d{5}-\d{7}-\d$/.test(cnic))
      return alert("CNIC must be in the format 12345-1234567-1.");
    if (form.userPassword !== form.userConfirmPassword)
      return alert("Passwords do not match.");

    try {
      setSubmitting(true);
      const token = localStorage.getItem("token");
      const API = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

      const payload = {
        cnic,
        username: form.username.trim(),
        email: form.userEmail.trim(),
        role: form.userRole,
        password: form.userPassword || undefined, // optional for updates
      };

      await axios.post(`${API}/api/users/upsert`, payload, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        withCredentials: true,
      });

      alert(
        Title === "Update User"
          ? "User updated successfully!"
          : "User added successfully!"
      );
      navigate("/SALU-PORTAL-FYP/ListUsers");
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Error saving user");
    } finally {
      setSubmitting(false);
    }
  };

  // ✅ Loading Spinner
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-90px)] bg-white dark:bg-gray-900">
        <div className="w-16 h-16 border-4 border-yellow-400 border-dashed rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div
      className="sm:!px-[40px] md:!px-[80px] !px-5 !py-[20px] min-h-[calc(100vh-90px)] w-[100%] bg-white dark:bg-gray-900"
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
          <BackButton
            url={Title === "Update User" ? "/SALU-PORTAL-FYP/ListUsers" : null}
          />
          <h1 className="text-2xl sm:text-3xl md:text-4xl py-3 font-bold text-gray-900 dark:text-white">
            {Title}
          </h1>
        </div>

        <hr className="border-t-[3px] border-gray-900 dark:border-white mb-4" />

        <div className="flex flex-col justify-center items-center gap-5 min-h-[60vh] w-full !p-5 bg-white dark:bg-gray-900 rounded-md">
          <InputContainer
            placeholder="Enter Username"
            title="User Name"
            htmlFor="name"
            inputType="text"
            required
            value={form.username}
            onChange={onChange("username")}
          />

          <InputContainer
            placeholder="Enter User Email Address"
            title="User Email"
            htmlFor="userEmail"
            inputType="email"
            required
            value={form.userEmail}
            onChange={onChange("userEmail")}
          />

          <div className="flex w-full max-w-[800px] items-start md:items-center justify-start flex-col md:flex-row gap-[8px] md:gap-5 [@media(max-width:550px)]:gap-[5px]">
            <label
              htmlFor="cnic"
              className="w-auto md:w-1/4 text-start md:text-right text-gray-900 dark:text-white"
            >
              <span className="text-[#ff0000] mr-1">*</span>
              CNIC:
            </label>
            <CnicInput
              id="cnic"
              value={cnic}
              onChange={handleCnicChange}
              width="35%"
              placeholder="XXXXX-XXXXXXX-X"
            />
          </div>

          <InputContainer
            placeholder={
              Title === "Update User"
                ? "Change Password (optional)"
                : "Enter Password"
            }
            title="User Password"
            htmlFor="userPassword"
            inputType="password"
            required={Title !== "Update User"}
            value={form.userPassword}
            onChange={onChange("userPassword")}
          />

          <InputContainer
            placeholder={
              Title === "Update User"
                ? "Confirm Password (optional)"
                : "Enter Confirm Password"
            }
            title="User Confirm Password"
            htmlFor="userConfirmPassword"
            inputType="password"
            required={Title !== "Update User"}
            value={form.userConfirmPassword}
            onChange={onChange("userConfirmPassword")}
          />

          <div className="flex w-full max-w-[800px] items-start md:items-center justify-start flex-col md:flex-row gap-[8px] md:gap-5 [@media(max-width:550px)]:gap-[5px]">
            <label
              htmlFor="userRole"
              className="w-auto md:w-1/4 text-start md:text-right text-gray-900 dark:text-white"
            >
              <span className="text-[#ff0000] mr-1">*</span>
              User Role:
            </label>
            <select
              id="userRole"
              required
              value={form.userRole}
              onChange={onChange("userRole")}
              className="w-[40%] [@media(max-width:768px)]:!w-full min-w-0 !px-2 !py-1 border-2 border-[#a5a5a5] outline-none bg-[#f9f9f9] text-[#2a2a2a] dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
            >
              <option value="" disabled>
                [Select an Option]
              </option>
              {rolesArray.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
          </div>

          <div className="w-full flex justify-end mt-4">
            <button
              type="submit"
              disabled={submitting}
              className="cursor-pointer relative overflow-hidden !px-[15px] !py-[5px] border-2 border-[#e5b300] text-white text-[0.8rem] font-medium bg-transparent transition-all duration-300 ease-linear
                         before:content-[''] before:absolute before:inset-x-0 before:bottom-0 before:h-full before:bg-[#e5b300] before:transition-all before:duration-300 before:ease-linear hover:before:h-0 disabled:opacity-60"
            >
              <span className="relative z-10">
                {submitting ? "Saving..." : "Save & Proceed"}
              </span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AddUser;
