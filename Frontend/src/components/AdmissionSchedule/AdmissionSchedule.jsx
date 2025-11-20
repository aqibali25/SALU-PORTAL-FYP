import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import Background from "../../assets/Background.png";
import InputContainer from "../InputContainer";
import BackButton from "../BackButton";

const AdmissionSchedule = ({ Title }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const editingSchedule = location.state?.schedule ?? null;

  const [form, setForm] = useState({
    start_date: "",
    end_date: "",
    program: "",
    course: "",
    shift: "Morning",
    remarks: "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(false);

  // Prefill form if editing
  useEffect(() => {
    if (editingSchedule) {
      setForm({
        start_date: editingSchedule.start_date || "",
        end_date: editingSchedule.end_date || "",
        program: editingSchedule.program || "",
        course: editingSchedule.course || "",
        shift: editingSchedule.shift || "Morning",
        remarks: editingSchedule.remarks || "",
      });
    }
  }, [editingSchedule]);

  const onChange = (key) => (e) => {
    const value = e.target.value;
    setForm((f) => ({
      ...f,
      [key]: value,
    }));
  };

  // Date validation
  const validateDates = () => {
    if (form.start_date && form.end_date) {
      const startDate = new Date(form.start_date);
      const endDate = new Date(form.end_date);

      if (endDate < startDate) {
        toast.error("End date cannot be before start date");
        return false;
      }
    }
    return true;
  };

  // Form validation
  const validateForm = () => {
    if (!form.start_date) {
      toast.error("Start date is required");
      return false;
    }
    if (!form.end_date) {
      toast.error("End date is required");
      return false;
    }
    if (!form.program.trim()) {
      toast.error("Program is required");
      return false;
    }
    if (!form.course.trim()) {
      toast.error("Course is required");
      return false;
    }
    if (!validateDates()) {
      return false;
    }
    return true;
  };

  // Submit Handler
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setSubmitting(true);
      const token = localStorage.getItem("token");
      const API = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

      const payload = {
        start_date: form.start_date,
        end_date: form.end_date,
        program: form.program.trim(),
        course: form.course.trim(),
        shift: form.shift,
        remarks: form.remarks.trim(),
        // Include ID if editing
        ...(editingSchedule && { id: editingSchedule.id }),
      };

      console.log("Submitting academic schedule:", payload);

      const endpoint = editingSchedule
        ? `${API}/api/academic-schedules/update`
        : `${API}/api/academic-schedules/create`;

      const method = editingSchedule ? "put" : "post";

      await axios[method](endpoint, payload, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        withCredentials: true,
      });

      // Success toast
      toast.success(
        editingSchedule
          ? "Academic schedule updated successfully!"
          : "Academic schedule added successfully!",
        {
          position: "top-right",
          autoClose: 2000,
        }
      );

      // Navigate after success
      setTimeout(() => {
        navigate("/SALU-PORTAL-FYP/AcademicScheduleList"); // You'll need to create this list component
      }, 2000);
    } catch (err) {
      console.error("Error saving academic schedule:", err);
      toast.error(
        err.response?.data?.message || "Error saving academic schedule",
        {
          position: "top-right",
        }
      );
    } finally {
      setSubmitting(false);
    }
  };

  // Loading Spinner
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-90px)] bg-white dark:bg-gray-900">
        <div className="w-16 h-16 border-4 border-purple-400 border-dashed rounded-full animate-spin"></div>
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
        className="flex flex-col gap-3 w-full min-h-[80vh] bg-[#E9D8FD] rounded-md !p-5" // Purple theme matching card
      >
        <div className="flex justify-start items-center gap-3">
          <BackButton
            url={
              editingSchedule ? "/SALU-PORTAL-FYP/AcademicScheduleList" : null
            }
          />
          <h1 className="text-2xl sm:text-3xl md:text-4xl py-3 font-bold text-gray-900 dark:text-white">
            {Title}
          </h1>
        </div>

        <hr className="border-t-[3px] border-gray-900 dark:border-white mb-4" />

        <div className="flex flex-col justify-center items-center gap-5 min-h-[60vh] w-full !p-5 bg-white dark:bg-gray-900 rounded-md">
          {/* Start Date */}
          <div className="flex w-full max-w-[800px] items-start md:items-center justify-start flex-col md:flex-row gap-[8px] md:gap-5 [@media(max-width:550px)]:gap-[5px]">
            <label
              htmlFor="start_date"
              className="w-auto md:w-1/4 text-start md:text-right text-gray-900 dark:text-white"
            >
              <span className="text-[#ff0000] mr-1">*</span>
              Start Date:
            </label>
            <input
              type="date"
              id="start_date"
              required
              value={form.start_date}
              onChange={onChange("start_date")}
              className="w-[40%] [@media(max-width:768px)]:!w-full min-w-0 !px-2 !py-1 border-2 border-[#a5a5a5] outline-none bg-[#f9f9f9] text-[#2a2a2a] dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
            />
          </div>

          {/* End Date */}
          <div className="flex w-full max-w-[800px] items-start md:items-center justify-start flex-col md:flex-row gap-[8px] md:gap-5 [@media(max-width:550px)]:gap-[5px]">
            <label
              htmlFor="end_date"
              className="w-auto md:w-1/4 text-start md:text-right text-gray-900 dark:text-white"
            >
              <span className="text-[#ff0000] mr-1">*</span>
              End Date:
            </label>
            <input
              type="date"
              id="end_date"
              required
              value={form.end_date}
              onChange={onChange("end_date")}
              className="w-[40%] [@media(max-width:768px)]:!w-full min-w-0 !px-2 !py-1 border-2 border-[#a5a5a5] outline-none bg-[#f9f9f9] text-[#2a2a2a] dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
            />
          </div>

          {/* Program */}
          <InputContainer
            placeholder="Enter Program Name"
            title="Program"
            htmlFor="program"
            inputType="text"
            required
            value={form.program}
            onChange={onChange("program")}
          />

          {/* Course */}
          <InputContainer
            placeholder="Enter Course Name"
            title="Course"
            htmlFor="course"
            inputType="text"
            required
            value={form.course}
            onChange={onChange("course")}
          />

          {/* Shift */}
          <div className="flex w-full max-w-[800px] items-start md:items-center justify-start flex-col md:flex-row gap-[8px] md:gap-5 [@media(max-width:550px)]:gap-[5px]">
            <label
              htmlFor="shift"
              className="w-auto md:w-1/4 text-start md:text-right text-gray-900 dark:text-white"
            >
              <span className="text-[#ff0000] mr-1">*</span>
              Shift:
            </label>
            <select
              id="shift"
              required
              value={form.shift}
              onChange={onChange("shift")}
              className="w-[40%] [@media(max-width:768px)]:!w-full min-w-0 !px-2 !py-1 border-2 border-[#a5a5a5] outline-none bg-[#f9f9f9] text-[#2a2a2a] dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
            >
              <option value="Morning">Morning</option>
              <option value="Evening">Evening</option>
              <option value="Weekend">Weekend</option>
            </select>
          </div>

          {/* Remarks */}
          <InputContainer
            placeholder="Enter Remarks (Optional)"
            title="Remarks"
            htmlFor="remarks"
            inputType="text"
            required={false}
            value={form.remarks}
            onChange={onChange("remarks")}
          />

          <div className="w-full flex justify-end mt-4">
            <button
              type="submit"
              disabled={submitting}
              className="cursor-pointer relative overflow-hidden !px-[15px] !py-[5px] border-2 border-yellow-500 text-white text-[0.8rem] font-medium bg-transparent transition-all duration-300 ease-linear
                         before:content-[''] before:absolute before:inset-x-0 before:bottom-0 before:h-full before:bg-yellow-500 before:transition-all before:duration-300 before:ease-linear hover:before:h-0 disabled:opacity-60"
            >
              <span className="relative z-10">
                {submitting
                  ? editingSchedule
                    ? "Updating..."
                    : "Saving..."
                  : editingSchedule
                  ? "Update Schedule"
                  : "Save Schedule"}
              </span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AdmissionSchedule;
