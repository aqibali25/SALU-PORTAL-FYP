import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import Background from "../../assets/Background.png";
import InputContainer from "../InputContainer";
import BackButton from "../BackButton";

const AdmissionSchedule = ({ Title }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { id } = useParams(); // Get schedule ID from URL params if editing

  const [form, setForm] = useState({
    start_date: "",
    end_date: "",
    admission_form_fee: "",
    admission_year: "",
    shift: "",
  });

  const [scheduleId, setScheduleId] = useState(""); // For displaying ID
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true); // Start with loading true
  const [isEditing, setIsEditing] = useState(false);

  // Fetch schedule data if editing
  useEffect(() => {
    const fetchScheduleData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        const API =
          import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

        // Check if we're editing from location state or URL params
        const scheduleFromState = location.state?.schedule;

        if (scheduleFromState) {
          // If schedule data is passed via location state
          setForm({
            start_date: scheduleFromState.start_date || "",
            end_date: scheduleFromState.end_date || "",
            admission_form_fee: scheduleFromState.admission_form_fee || "",
            admission_year: scheduleFromState.admission_year || "",
            shift: scheduleFromState.shift || "Morning",
          });
          setScheduleId(scheduleFromState.id || "");
          setIsEditing(true);
        } else if (id) {
          // If editing via URL parameter (id)
          const response = await axios.get(
            `${API}/api/admission-schedules/${id}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
              withCredentials: true,
            }
          );

          if (response.data.success) {
            const scheduleData = response.data.data;
            setForm({
              start_date: scheduleData.start_date || "",
              end_date: scheduleData.end_date || "",
              admission_form_fee: scheduleData.admission_form_fee || "",
              admission_year: scheduleData.admission_year || "",
              shift: scheduleData.shift || "Morning",
            });
            setScheduleId(scheduleData.id || id);
            setIsEditing(true);
          } else {
            toast.error("Failed to fetch schedule data");
            navigate("/SALU-PORTAL-FYP/AdmissionScheduleList");
          }
        } else {
          // If no ID and no location state, it's a new schedule
          setIsEditing(false);
          setScheduleId("");
        }
      } catch (err) {
        console.error("Error fetching admission schedule:", err);
        toast.error(
          err.response?.data?.message || "Error fetching admission schedule"
        );
        navigate("/SALU-PORTAL-FYP/AdmissionScheduleList");
      } finally {
        setLoading(false);
      }
    };

    fetchScheduleData();
  }, [id, location.state, navigate]);

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

  // Admission year validation (exactly 4 digits)
  const validateAdmissionYear = (year) => {
    const yearRegex = /^\d{4}$/;
    return yearRegex.test(year);
  };

  // Admission form fee validation (numbers only)
  const validateAdmissionFee = (fee) => {
    const feeRegex = /^\d+$/;
    return feeRegex.test(fee);
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
    if (!form.admission_form_fee.trim()) {
      toast.error("Admission form fee is required");
      return false;
    }
    if (!validateAdmissionFee(form.admission_form_fee)) {
      toast.error("Admission form fee must contain numbers only");
      return false;
    }
    if (!form.admission_year.trim()) {
      toast.error("Admission year is required");
      return false;
    }
    if (!validateAdmissionYear(form.admission_year)) {
      toast.error("Admission year must be exactly 4 digits like (2025)");
      return false;
    }
    if (!form.shift) {
      toast.error("Shift is required");
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
        admission_form_fee: form.admission_form_fee.trim(),
        admission_year: form.admission_year.trim(),
        shift: form.shift,
      };

      // Include ID if editing
      if (isEditing) {
        const editingId = id || location.state?.schedule?.id || scheduleId;
        if (editingId) {
          payload.id = editingId;
        }
      }

      console.log("Submitting admission schedule:", payload);

      const endpoint = isEditing
        ? `${API}/api/admission-schedules/update`
        : `${API}/api/admission-schedules/create`;

      const method = isEditing ? "put" : "post";

      await axios[method](endpoint, payload, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        withCredentials: true,
      });

      // Success toast
      toast.success(
        isEditing
          ? "Admission schedule updated successfully!"
          : "Admission schedule added successfully!",
        {
          position: "top-right",
          autoClose: 2000,
        }
      );

      // Navigate after success
      setTimeout(() => {
        navigate("/SALU-PORTAL-FYP/AdmissionScheduleList");
      }, 2000);
    } catch (err) {
      console.error("Error saving admission schedule:", err);
      toast.error(
        err.response?.data?.message || "Error saving admission schedule",
        {
          position: "top-right",
        }
      );
    } finally {
      setSubmitting(false);
    }
  };

  // Handle admission year input to allow only 4 digits
  const handleAdmissionYearChange = (e) => {
    const value = e.target.value;
    // Only allow numbers and limit to 4 digits
    if (value === "" || /^\d{0,4}$/.test(value)) {
      onChange("admission_year")(e);
    }
  };

  // Handle admission fee input to allow only numbers
  const handleAdmissionFeeChange = (e) => {
    const value = e.target.value;
    // Only allow numbers
    if (value === "" || /^\d+$/.test(value)) {
      onChange("admission_form_fee")(e);
    }
  };

  // Determine page title based on whether we're editing or adding
  const getPageTitle = () => {
    if (loading) return "Loading...";
    return isEditing ? "Update Admission Schedule" : "Add Admission Schedule";
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
        className="flex flex-col gap-3 w-full min-h-[80vh] bg-[#E9D8FD] rounded-md !p-5"
      >
        <div className="flex justify-start items-center gap-3">
          <BackButton url={"/SALU-PORTAL-FYP/AdmissionScheduleList"} />
          <h1 className="text-2xl sm:text-3xl md:text-4xl py-3 font-bold text-gray-900 dark:text-white">
            {getPageTitle()}
          </h1>
        </div>

        <hr className="border-t-[3px] border-gray-900 dark:border-white mb-4" />

        <div className="flex flex-col justify-center items-center gap-5 min-h-[60vh] w-full !p-5 bg-white dark:bg-gray-900 rounded-md">
          {/* Schedule ID (Only show when editing) */}
          {isEditing && (
            <div className="flex w-full max-w-[800px] items-start md:items-center justify-start flex-col md:flex-row gap-[8px] md:gap-5 [@media(max-width:550px)]:gap-[5px]">
              <label
                htmlFor="schedule_id"
                className="w-auto md:w-1/4 text-start md:text-right text-gray-900 dark:text-white"
              >
                Schedule ID:
              </label>
              <input
                type="text"
                id="schedule_id"
                disabled
                value={scheduleId}
                className="w-[40%] [@media(max-width:768px)]:!w-full min-w-0 !px-2 !py-1 border-2 border-[#a5a5a5] outline-none bg-gray-200 text-[#2a2a2a] dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 cursor-not-allowed"
                title="Schedule ID cannot be changed"
              />
            </div>
          )}

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

          {/* Admission Form Fee */}
          <div className="flex w-full max-w-[800px] items-start md:items-center justify-start flex-col md:flex-row gap-[8px] md:gap-5 [@media(max-width:550px)]:gap-[5px]">
            <label
              htmlFor="admission_form_fee"
              className="w-auto md:w-1/4 text-start md:text-right text-gray-900 dark:text-white"
            >
              <span className="text-[#ff0000] mr-1">*</span>
              Admission Form Fee:
            </label>
            <input
              type="text"
              id="admission_form_fee"
              required
              placeholder="Enter admission form fee"
              value={form.admission_form_fee}
              onChange={handleAdmissionFeeChange}
              className="w-[40%] [@media(max-width:768px)]:!w-full min-w-0 !px-2 !py-1 border-2 border-[#a5a5a5] outline-none bg-[#f9f9f9] text-[#2a2a2a] dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
            />
          </div>

          {/* Admission Year */}
          <div className="flex w-full max-w-[800px] items-start md:items-center justify-start flex-col md:flex-row gap-[8px] md:gap-5 [@media(max-width:550px)]:gap-[5px]">
            <label
              htmlFor="admission_year"
              className="w-auto md:w-1/4 text-start md:text-right text-gray-900 dark:text-white"
            >
              <span className="text-[#ff0000] mr-1">*</span>
              Admission Year:
            </label>
            <input
              type="text"
              id="admission_year"
              required
              placeholder="Enter admission year (4 digits)"
              maxLength="4"
              value={form.admission_year}
              onChange={handleAdmissionYearChange}
              className="w-[40%] [@media(max-width:768px)]:!w-full min-w-0 !px-2 !py-1 border-2 border-[#a5a5a5] outline-none bg-[#f9f9f9] text-[#2a2a2a] dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
            />
          </div>

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
              <option value="" disabled selected>
                Select Shift
              </option>
              <option value="Morning">Morning</option>
              <option value="Evening">Evening</option>
            </select>
          </div>

          <div className="w-full flex justify-end mt-4">
            <button
              type="submit"
              disabled={submitting}
              className="cursor-pointer relative overflow-hidden !px-[15px] !py-[5px] border-2 border-yellow-500 text-white text-[0.8rem] font-medium bg-transparent transition-all duration-300 ease-linear
                         before:content-[''] before:absolute before:inset-x-0 before:bottom-0 before:h-full before:bg-yellow-500 before:transition-all before:duration-300 before:ease-linear hover:before:h-0 disabled:opacity-60"
            >
              <span className="relative z-10">
                {submitting
                  ? isEditing
                    ? "Updating..."
                    : "Saving..."
                  : isEditing
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
