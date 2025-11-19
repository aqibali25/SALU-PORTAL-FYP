import { useEffect, useState, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import Background from "../../assets/Background.png";
import InputContainer from "../InputContainer";
import BackButton from "../BackButton";
import { useDepartments } from "../../Hooks/HomeCards";

const AddSubject = ({ Title }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const editingSubject = useMemo(
    () => location.state?.subject ?? null,
    [location.state]
  );
  const {
    departmentsArray,
    loading: departmentsLoading,
    error: departmentsError,
  } = useDepartments();

  // Get user department with safe parsing
  const userString = localStorage.getItem("user");
  const user = userString ? JSON.parse(userString) : null;
  const userDepartment = user?.department || "";

  // Check if user is from one of the specific departments (not Super Admin)
  const isSpecificDepartment = [
    "Computer Science",
    "Business Administration",
    "English Linguistics and Literature",
  ].includes(userDepartment);
  const isSuperAdmin = userDepartment === "Super Admin";

  const [form, setForm] = useState({
    subjectId: "",
    subjectName: "",
    subjectType: "",
    department: isSpecificDepartment
      ? userDepartment
      : isSuperAdmin
      ? ""
      : userDepartment,
    creditHours: "",
  });

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const initData = async () => {
      try {
        setLoading(true);
        if (editingSubject) {
          setForm({
            subjectId: editingSubject.subjectId || "",
            subjectName: editingSubject.subjectName || "",
            subjectType: editingSubject.subjectType || "",
            department: editingSubject.department || "",
            creditHours: editingSubject.creditHours || "",
          });
        } else if (isSpecificDepartment || (!isSuperAdmin && userDepartment)) {
          // Auto-set department for specific department users when adding new subject
          setForm((prev) => ({
            ...prev,
            department: userDepartment,
          }));
        }
      } finally {
        setLoading(false);
      }
    };
    initData();
  }, [editingSubject, isSpecificDepartment, isSuperAdmin, userDepartment]);

  const onChange = (key) => (e) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);

      const token = localStorage.getItem("token");
      const API = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

      const payload = {
        ...form,
      };

      Title === "Add Subject"
        ? (payload.subjectName = `${form.subjectName}${
            form.subjectType ? " - " + form.subjectType : ""
          }`)
        : null;

      if (Title === "Add Subject") delete payload.subjectId;

      await axios.post(`${API}/api/subjects/upsert`, payload, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        withCredentials: true,
      });

      console.log("Final Payload:", payload);

      toast.success(
        editingSubject
          ? "Subject updated successfully!"
          : "Subject added successfully!",
        { position: "top-right" }
      );

      setTimeout(() => {
        navigate("/SALU-PORTAL-FYP/Subjects");
      }, 1200);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "❌ Error saving subject", {
        position: "top-right",
      });
    } finally {
      setSubmitting(false);
    }
  };

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
            url={
              Title === "Update Subject"
                ? "/SALU-PORTAL-FYP/Subjects/ViewSubject"
                : "/SALU-PORTAL-FYP/Subjects"
            }
          />
          <h1 className="text-2xl sm:text-3xl md:text-4xl py-3 font-bold text-gray-900 dark:text-white">
            {Title}
          </h1>
        </div>

        <hr className="border-t-[3px] border-gray-900 dark:border-white mb-4" />

        <div className="flex flex-col justify-center items-center gap-5 min-h-[60vh] w-full !p-5 bg-white dark:bg-gray-900 rounded-md">
          {Title !== "Add Subject" && (
            <>
              {/* Subject ID */}
              <InputContainer
                placeholder="Enter Subject ID"
                title="Subject ID"
                htmlFor="subjectId"
                inputType="text"
                required
                value={form.subjectId}
                onChange={onChange("subjectId")}
                disabled
              />
            </>
          )}

          {/* Subject Name */}
          <InputContainer
            placeholder="Enter Subject Name"
            title="Subject Name"
            htmlFor="subjectName"
            inputType="text"
            required
            value={form.subjectName}
            onChange={onChange("subjectName")}
          />

          {/* Subject Type */}
          <div className="flex w-full max-w-[800px] items-start md:items-center justify-start flex-col md:flex-row gap-[8px] md:gap-5 [@media(max-width:550px)]:gap-[5px]">
            <label
              htmlFor="subjectType"
              className="w-auto md:w-1/4 text-start md:text-right text-gray-900 dark:text-white"
            >
              <span className="text-[#ff0000] mr-1">*</span>
              Subject Type:
            </label>
            <select
              id="subjectType"
              className="w-[40%] [@media(max-width:768px)]:!w-full min-w-0 !px-2 !py-1 border-2 border-[#a5a5a5] outline-none bg-[#f9f9f9] text-[#2a2a2a] dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
              required
              value={form.subjectType}
              onChange={onChange("subjectType")}
            >
              <option value="" disabled>
                Select Subject Type
              </option>
              <option value="Theory">Theory</option>
              <option value="Practical">Practical</option>
            </select>
          </div>

          {/* Department */}
          <div className="flex w-full max-w-[800px] items-start md:items-center justify-start flex-col md:flex-row gap-[8px] md:gap-5 [@media(max-width:550px)]:gap-[5px]">
            <label
              htmlFor="department"
              className="w-auto md:w-1/4 text-start md:text-right text-gray-900 dark:text-white"
            >
              <span className="text-[#ff0000] mr-1">*</span>
              Department:
            </label>
            <select
              id="department"
              className="w-[40%] [@media(max-width:768px)]:!w-full min-w-0 !px-2 !py-1 border-2 border-[#a5a5a5] outline-none bg-[#f9f9f9] text-[#2a2a2a] dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
              required
              value={form.department}
              onChange={onChange("department")}
              disabled={isSpecificDepartment} // Disable only for specific departments
            >
              <option value="" disabled>
                Select Department
              </option>
              {departmentsArray.map((dept, index) => (
                <option key={index} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>

          {/* Credit Hours */}
          <InputContainer
            placeholder="Enter Credit Hours (1-9)"
            title="Credit Hours"
            htmlFor="creditHours"
            inputType="number"
            required
            value={form.creditHours}
            onChange={(e) => {
              const val = e.target.value;
              // Only allow single-digit number
              if (/^\d?$/.test(val)) {
                onChange("creditHours")(e);
              }
            }}
            min={0}
            max={9}
          />

          {/* Submit Button */}
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

export default AddSubject;
