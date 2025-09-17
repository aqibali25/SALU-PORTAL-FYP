import { useEffect, useMemo, useState } from "react";
import Cookies from "js-cookie";
import { useLocation, useNavigate } from "react-router-dom";

import Background from "../../assets/Background.png";
import CnicInput from "../CNICInput";
import InputContainer from "../InputContainer";

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
  ];

  const [cnic, setCnic] = useState("");
  const location = useLocation();
  const navigate = useNavigate();

  // If navigating from ListUsers "Edit", we’ll have a user here
  const editingUser = useMemo(
    () => location.state?.user ?? null,
    [location.state]
  );

  // Local form state
  const [form, setForm] = useState({
    username: "",
    userEmail: "",
    userPassword: "",
    userConfirmPassword: "",
    userRole: "",
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setCnic(Cookies.get("cnic") ?? "");
  }, []);

  // Prefill if editing
  useEffect(() => {
    if (editingUser) {
      setForm((f) => ({
        ...f,
        username: editingUser.username ?? "",
        userEmail: editingUser.email ?? "",
        userRole: editingUser.role ?? "",
      }));
      // If your edit flow stores CNIC in state, prefer that over cookie:
      if (editingUser.cnic) setCnic(editingUser.cnic);
    }
  }, [editingUser]);

  const onChange = (key) => (e) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!cnic) {
      alert("CNIC is required.");
      return;
    }
    if (form.userPassword !== form.userConfirmPassword) {
      alert("Passwords do not match.");
      return;
    }

    try {
      setSubmitting(true);

      // Build payload; allow password to be optional on update
      const payload = {
        cnic, // unique key for upsert
        username: form.username.trim(),
        email: form.userEmail.trim(),
        role: form.userRole,
        password: form.userPassword || undefined, // backend should ignore if undefined on update
      };

      const res = await fetch("/api/users/upsert", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        credentials: "include",
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.message || "Failed to save user");
      }

      // success — route back to the list (or show a toast)
      navigate("/SALU-PORTAL-FYP/ListUsers");
    } catch (err) {
      console.error(err);
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

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
        <h1 className="text-2xl sm:text-3xl md:text-4xl py-3 font-bold text-gray-900 dark:text-white">
          {Title}
        </h1>

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
            <CnicInput id="cnic" value={cnic} readOnly width="70%" />
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
            required={Title !== "Update User"} // optional on update
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
            required={Title !== "Update User"} // optional on update
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
              value={form.userRole} // e.g. "Peon"
              onChange={onChange("userRole")}
              className="w-full md:w-auto [@media(max-width:768px)]:!w-full min-w-0 flex-1 !px-2 !py-1 border-2 border-[#a5a5a5] outline-none bg-[#f9f9f9] text-[#2a2a2a] dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
            >
              <option value="" disabled>
                [Select an Option]
              </option>
              {rolesArray.map((role) => (
                <option key={role} value={role}>
                  {" "}
                  {/* 👈 value is the exact role */}
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
