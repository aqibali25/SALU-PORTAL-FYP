import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import Background from "../../assets/Background.png";
import InputContainer from "../InputContainer";
import BackButton from "../BackButton";

const UpdateStudentAttendance = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Get attendance record data from navigation state
  const attendanceData = location.state;

  const [form, setForm] = useState({
    status: "",
  });

  // Status options
  const statusOptions = ["Present", "Absent", "Leave"];

  // Check if data exists
  useEffect(() => {
    if (!attendanceData) {
      toast.error("No attendance data found. Please go back and try again.", {
        position: "top-center",
      });
      navigate("/SALU-PORTAL-FYP/Attendance/ViewAttendance");
      return;
    }

    // Prefill the form with current data
    if (attendanceData.attendanceRecord) {
      setForm({
        status: attendanceData.attendanceRecord.status || "",
      });
      setLoading(false);
    }
  }, [attendanceData, navigate]);

  const onChange = (key) => (e) => {
    const value = e.target.value;
    setForm((f) => ({
      ...f,
      [key]: value,
    }));
  };

  // Format date for display
  const formatDisplayDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString + "T00:00:00+05:00");
    const day = date.getDate();
    const month = date.toLocaleString("default", { month: "short" });
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
  };

  // Submit Handler
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!form.status) {
      toast.error("Please select attendance status.", {
        position: "top-center",
      });
      return;
    }

    try {
      setSubmitting(true);
      const token = localStorage.getItem("token");
      const API = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

      const payload = {
        status: form.status,
        subject_name: attendanceData.subject?.name || "",
        roll_no: attendanceData.student?.rollNo || "",
        department: attendanceData.student?.department || "",
        attendance_date: attendanceData.attendanceRecord?.attendance_date || "",
      };

      console.log("Updating attendance with payload:", payload);

      // Use PUT request with attendance_id in URL and payload in body
      await axios.put(
        `${API}/api/attendance/${attendanceData.attendanceRecord.attendance_id}`,
        payload,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        }
      );

      // Reset submitting state immediately
      setSubmitting(false);

      // Show success toast
      toast.success("Attendance updated successfully!", {
        position: "top-center",
        autoClose: 2000,
      });

      // Navigate after a short delay to ensure toast is visible
      setTimeout(() => {
        navigate("/SALU-PORTAL-FYP/Attendance/ViewAttendance");
      }, 1500);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Error updating attendance", {
        position: "top-center",
      });
      setSubmitting(false);
    }
  };

  // Loading Spinner
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-90px)] bg-white dark:bg-gray-900">
        <div className="w-16 h-16 border-4 border-yellow-400 border-dashed rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!attendanceData) {
    return null;
  }

  const { student, subject, attendanceRecord } = attendanceData;

  return (
    <div
      className="sm:!px-[40px] md:!px-[80px] !px-5 !py-[20px] min-h-[calc(100vh-90px)] w-full bg-white dark:bg-gray-900"
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
        {/* Header with Back Button */}
        <div className="flex justify-start items-center gap-3">
          <BackButton
            url={`/SALU-PORTAL-FYP/Attendance/ViewAttendance/${subject?.id}/${student?.rollNo}`}
          />
          <h1 className="text-2xl sm:text-3xl md:text-4xl !py-3 font-bold text-gray-900 dark:text-white">
            Update Attendance
          </h1>
        </div>

        <hr className="border-t-[3px] border-gray-900 dark:border-white mb-4" />

        <div className="flex flex-col justify-center items-center gap-5 min-h-[60vh] w-full !p-5 bg-white dark:bg-gray-900 rounded-md">
          {/* Student Roll No - Disabled */}
          <InputContainer
            placeholder=""
            title="Student Roll No"
            htmlFor="rollNo"
            inputType="text"
            value={student?.rollNo || ""}
            disabled={true}
          />

          {/* Student Name - Disabled */}
          <InputContainer
            placeholder=""
            title="Student Name"
            htmlFor="studentName"
            inputType="text"
            value={student?.name || ""}
            disabled={true}
          />

          {/* Subject Name - Disabled */}
          <InputContainer
            placeholder=""
            title="Subject Name"
            htmlFor="subjectName"
            inputType="text"
            value={subject?.name || ""}
            disabled={true}
          />

          {/* Department - Disabled */}
          <InputContainer
            placeholder=""
            title="Department"
            htmlFor="department"
            inputType="text"
            value={student?.department || ""}
            disabled={true}
          />

          {/* Date - Disabled */}
          <InputContainer
            placeholder=""
            title="Date"
            htmlFor="attendanceDate"
            inputType="text"
            value={formatDisplayDate(attendanceRecord?.attendance_date) || ""}
            disabled={true}
          />

          {/* Status Dropdown - Similar to roles in AddUser component */}
          <div className="flex w-full max-w-[800px] items-start md:items-center justify-start flex-col md:flex-row gap-[8px] md:gap-5 [@media(max-width:550px)]:gap-[5px]">
            <label
              htmlFor="status"
              className="w-auto md:w-1/4 text-start md:text-right text-gray-900 dark:text-white"
            >
              <span className="text-[#ff0000] mr-1">*</span>
              Update Status:
            </label>
            <select
              id="status"
              required
              value={form.status}
              onChange={onChange("status")}
              className="w-[40%] [@media(max-width:768px)]:!w-full min-w-0 !px-2 !py-1 border-2 border-[#a5a5a5] outline-none bg-[#f9f9f9] text-[#2a2a2a] dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
            >
              <option value="" disabled>
                [Select Status]
              </option>
              {statusOptions.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>

          {/* Submit Button */}
          <div className="w-full flex justify-end mt-4">
            <button
              type="submit"
              disabled={submitting}
              className="cursor-pointer relative overflow-hidden !px-[15px] !py-[5px] border-2 border-[#e5b300] text-white text-[0.8rem] font-medium bg-transparent transition-all duration-300 ease-linear
                         before:content-[''] before:absolute before:inset-x-0 before:bottom-0 before:h-full before:bg-[#e5b300] before:transition-all before:duration-300 before:ease-linear hover:before:h-0 disabled:opacity-60"
            >
              <span className="relative z-10">
                {submitting ? "Updating..." : "Update Attendance"}
              </span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default UpdateStudentAttendance;
