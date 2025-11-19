import { useEffect, useState } from "react";
import { useLocation, useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import Background from "../../assets/Background.png";
import BackButton from "../BackButton";
import InputContainer from "../InputContainer";

const AssigningSubject = () => {
  const { subjectId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  // Get user department
  const userString = localStorage.getItem("user");
  const user = userString ? JSON.parse(userString) : null;
  const userDepartment = user?.department || "";
  const isSuperAdmin = userDepartment === "Super Admin";

  // Extract the name from subjectId (remove trailing numbers if any)
  const subjectName = subjectId.replace(/-\d+$/, "");
  const subjectFromState = location.state?.subjectData;

  const [formData, setFormData] = useState({
    saId: "",
    subName: subjectName,
    teacherName: "",
    department: "",
    semester: "",
    creditHours: "",
    year: "",
  });

  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Semester options
  const semesterOptions = [
    "1st",
    "2nd",
    "3rd",
    "4th",
    "5th",
    "6th",
    "7th",
    "8th",
  ];

  // Generate year options from 1950 to current year
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from(
    { length: currentYear - 1950 + 1 },
    (_, index) => (currentYear - index).toString()
  );

  // Check if this is an update (already assigned) or create (new assignment)
  const isUpdate =
    subjectFromState && subjectFromState.teacherName !== "Yet to assign";
  const isNewAssignment = !isUpdate;

  // Initialize form data when subjectFromState changes
  useEffect(() => {
    if (subjectFromState) {
      setFormData({
        saId: subjectFromState.saId || "",
        subName: subjectFromState.subName || subjectName,
        teacherName: subjectFromState.teacherName || "",
        department: subjectFromState.department || "",
        semester:
          subjectFromState.semester === "N/A" || !subjectFromState.semester
            ? ""
            : subjectFromState.semester,
        creditHours: subjectFromState.creditHours || "",
        year:
          subjectFromState.year === "N/A" || !subjectFromState.year
            ? ""
            : subjectFromState.year,
      });
    }
  }, [subjectFromState, subjectName]);

  // Fetch teachers
  useEffect(() => {
    document.title = `SALU Portal | Subject Allocation ${subjectName}`;

    const fetchTeachers = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        const API =
          import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
        const res = await axios.get(`${API}/api/users`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        // Filter teachers based on department
        const teacherUsers = res.data.filter((user) => {
          const isTeacher =
            user.role?.toLowerCase() === "teacher" ||
            user.role?.toLowerCase() === "hod";
          if (isSuperAdmin) {
            return isTeacher; // Super Admin sees all teachers
          }
          return isTeacher && user.department === userDepartment;
        });

        setTeachers(["Yet to assign", ...teacherUsers.map((t) => t.username)]);
      } catch (err) {
        console.error("Error fetching teachers:", err);
        toast.error("Error loading teachers: " + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTeachers();
  }, [subjectName, isSuperAdmin, userDepartment]);

  // Handle form input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Show Toastify confirmation for reassign
  const showReassignConfirmation = () => {
    return new Promise((resolve) => {
      toast.info(
        <div className="text-center">
          <p className="font-semibold !mb-2">Reassign Subject?</p>
          <p className="text-sm !mb-4">
            Are you sure you want to reassign this subject to a different
            teacher?
          </p>
          <div className="flex gap-2 justify-center">
            <button
              onClick={() => {
                toast.dismiss();
                resolve(true);
              }}
              className="!px-4 !py-1 bg-green-500 text-white  hover:bg-green-600 transition-colors cursor-pointer"
            >
              Yes, Reassign
            </button>
            <button
              onClick={() => {
                toast.dismiss();
                resolve(false);
              }}
              className="!px-4 !py-1 bg-red-500 text-white  hover:bg-red-600 transition-colors cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </div>,
        {
          position: "top-center",
          autoClose: false,
          closeOnClick: false,
          draggable: false,
          closeButton: false,
          style: {
            minWidth: "300px",
          },
        }
      );
    });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Show confirmation only for reassign (update operations)
    if (isUpdate) {
      const confirmed = await showReassignConfirmation();
      if (!confirmed) {
        return; // User cancelled the reassign
      }
    }

    setSubmitting(true);

    try {
      const token = localStorage.getItem("token");
      const API = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

      // Convert numeric fields
      const creditHoursNum = Number(formData.creditHours);
      const yearNum = Number(formData.year);

      // Validate fields
      if (
        !formData.subName ||
        !formData.department ||
        !formData.semester ||
        !formData.year
      ) {
        toast.error("Please fill in all required fields.");
        setSubmitting(false);
        return;
      }

      if (isNaN(creditHoursNum) || creditHoursNum <= 0) {
        toast.error("Credit Hours must be a valid number.");
        setSubmitting(false);
        return;
      }

      if (isNaN(yearNum) || yearNum < 1950 || yearNum > currentYear) {
        toast.error(`Year must be between 1950 and ${currentYear}.`);
        setSubmitting(false);
        return;
      }

      // Prepare payload
      const payload = {
        subName: formData.subName,
        teacherName:
          formData.teacherName && formData.teacherName !== "Yet to assign"
            ? formData.teacherName
            : "",
        department: formData.department,
        semester: formData.semester,
        creditHours: creditHoursNum,
        year: yearNum,
      };

      console.log("Payload being sent:", payload);
      console.log("Operation:", isUpdate ? "UPDATE" : "CREATE");

      let res;

      if (isUpdate) {
        // UPDATE operation - use PUT request
        if (!formData.saId) {
          toast.error("Subject Allocation ID is required for update.");
          setSubmitting(false);
          return;
        }

        res = await axios.put(
          `${API}/api/subject-allocations/${formData.saId}`,
          payload,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        console.log("Subject updated:", res.data);
        toast.success("Teacher reassigned successfully!");
      } else {
        // CREATE operation - use POST request
        res = await axios.post(`${API}/api/subject-allocations`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log("Subject assigned:", res.data);
        toast.success("Teacher assigned successfully!");
      }

      setTimeout(() => {
        navigate("/SALU-PORTAL-FYP/SubjectAllocation");
      }, 1500);
    } catch (err) {
      console.error("Error in subject allocation:", err);
      const msg = err.response?.data?.message || err.message || "Unknown error";
      toast.error(
        `Error ${isUpdate ? "reassigning" : "assigning"} teacher: ${msg}`
      );
    } finally {
      setSubmitting(false);
    }
  };

  // Show Toastify confirmation for unassign
  const showUnassignConfirmation = () => {
    return new Promise((resolve) => {
      toast.info(
        <div className="text-center">
          <p className="font-semibold !mb-2">Unassign Teacher?</p>
          <p className="text-sm !mb-4">
            Are you sure you want to unassign this teacher from the subject?
          </p>
          <div className="flex gap-2 justify-center">
            <button
              onClick={() => {
                toast.dismiss();
                resolve(true);
              }}
              className="!px-4 !py-1 bg-red-500 text-white hover:bg-red-600 transition-colors cursor-pointer"
            >
              Yes, Unassign
            </button>
            <button
              onClick={() => {
                toast.dismiss();
                resolve(false);
              }}
              className="!px-4 !py-1 bg-gray-500 text-white hover:bg-gray-600 transition-colors cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </div>,
        {
          position: "top-center",
          autoClose: false,
          closeOnClick: false,
          draggable: false,
          closeButton: false,
          style: {
            minWidth: "300px",
          },
        }
      );
    });
  };

  // Handle unassign/delete
  const handleUnassign = async () => {
    if (!isUpdate || !formData.saId) {
      toast.error("No subject allocation to unassign.");
      return;
    }

    const confirmed = await showUnassignConfirmation();
    if (!confirmed) {
      return; // User cancelled the unassign
    }

    try {
      const token = localStorage.getItem("token");
      const API = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

      await axios.delete(`${API}/api/subject-allocations/${formData.saId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success("Teacher unassigned successfully!");

      setTimeout(() => {
        navigate("/SALU-PORTAL-FYP/SubjectAllocation");
      }, 1500);
    } catch (err) {
      console.error("Error unassigning teacher:", err);
      const msg = err.response?.data?.message || err.message || "Unknown error";
      toast.error("Error unassigning teacher: " + msg);
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
      <div className="flex flex-col gap-3 w-full min-h-[80vh] bg-[#D5BBE0] rounded-md !p-5">
        <div className="flex justify-start items-center gap-3">
          <BackButton url={"/SALU-PORTAL-FYP/SubjectAllocation"} />
          <h1 className="text-2xl sm:text-3xl md:text-4xl py-3 font-bold text-gray-900 dark:text-white">
            {isUpdate ? "Reassign Subject" : "Assign Subject"}
          </h1>
        </div>
        <hr className="border-t-[3px] border-gray-900 dark:border-white mb-4" />

        <form
          onSubmit={handleSubmit}
          className="flex flex-col justify-center items-center gap-5 min-h-[60vh] w-full bg-white dark:bg-gray-900 rounded-md overflow-x-auto !p-6"
        >
          <InputContainer
            title="Subjects Allocation ID"
            name="saId"
            inputType="text"
            value={formData.saId}
            disabled
          />
          <InputContainer
            title="Subject Name"
            name="subName"
            inputType="text"
            value={formData.subName}
            disabled
          />

          {/* Teacher Selection */}
          <div className="flex w-full max-w-[800px] items-start md:items-center justify-start flex-col md:flex-row gap-[8px] md:gap-5">
            <label
              htmlFor="teacherName"
              className="w-auto md:w-1/4 text-start md:text-right text-gray-900 dark:text-white"
            >
              <span className="text-[#ff0000] mr-1">*</span>
              Teacher Name:
            </label>
            <select
              id="teacherName"
              name="teacherName"
              required
              value={formData.teacherName}
              onChange={handleChange}
              disabled={loading}
              className="w-[40%] [@media(max-width:768px)]:!w-full min-w-0 !px-2 !py-1 border-2 border-[#a5a5a5] outline-none bg-[#f9f9f9] text-[#2a2a2a] dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
            >
              <option value="" disabled>
                {loading ? "Loading teachers..." : "[Select a Teacher]"}
              </option>
              {teachers.map((teacher) => (
                <option key={teacher} value={teacher}>
                  {teacher}
                </option>
              ))}
            </select>
          </div>

          <InputContainer
            title="Department"
            name="department"
            inputType="text"
            value={formData.department}
            disabled
          />

          {/* Semester Dropdown */}
          <div className="flex w-full max-w-[800px] items-start md:items-center justify-start flex-col md:flex-row gap-[8px] md:gap-5">
            <label
              htmlFor="semester"
              className="w-auto md:w-1/4 text-start md:text-right text-gray-900 dark:text-white"
            >
              <span className="text-[#ff0000] mr-1">*</span>
              Semester:
            </label>
            <select
              id="semester"
              name="semester"
              required
              value={formData.semester}
              onChange={handleChange}
              className="w-[40%] [@media(max-width:768px)]:!w-full min-w-0 !px-2 !py-1 border-2 border-[#a5a5a5] outline-none bg-[#f9f9f9] text-[#2a2a2a] dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
            >
              <option value="" disabled={!formData.semester}>
                {formData.semester
                  ? "Select Semester"
                  : "No semester data available"}
              </option>
              {semesterOptions.map((semester) => (
                <option key={semester} value={semester}>
                  {semester}
                </option>
              ))}
            </select>
          </div>

          <InputContainer
            title="Credit Hours"
            name="creditHours"
            inputType="text"
            value={formData.creditHours}
            width="20%"
            disabled
          />

          {/* Year Dropdown */}
          <div className="flex w-full max-w-[800px] items-start md:items-center justify-start flex-col md:flex-row gap-[8px] md:gap-5">
            <label
              htmlFor="year"
              className="w-auto md:w-1/4 text-start md:text-right text-gray-900 dark:text-white"
            >
              <span className="text-[#ff0000] mr-1">*</span>
              Year:
            </label>
            <select
              id="year"
              name="year"
              required
              value={formData.year}
              onChange={handleChange}
              className="w-[40%] [@media(max-width:768px)]:!w-full min-w-0 !px-2 !py-1 border-2 border-[#a5a5a5] outline-none bg-[#f9f9f9] text-[#2a2a2a] dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
            >
              <option value="" disabled={!formData.year}>
                {formData.year ? "Select Year" : "No year data available"}
              </option>
              {yearOptions.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>

          <div className="w-full flex justify-end gap-4">
            {/* Unassign button - only show for update operations */}
            {isUpdate && (
              <button
                type="button"
                onClick={handleUnassign}
                disabled={submitting}
                className="cursor-pointer relative overflow-hidden !px-[15px] !py-[5px] border-2 border-[#ef4444] text-white text-[0.8rem] font-medium bg-transparent transition-all duration-300 ease-linear
                         before:content-[''] before:absolute before:inset-x-0 before:bottom-0 before:h-full before:bg-[#ef4444] before:transition-all before:duration-300 before:ease-linear hover:before:h-0 disabled:opacity-60"
              >
                <span className="relative z-10">
                  {submitting ? "Processing..." : "Unassign"}
                </span>
              </button>
            )}

            {/* Submit button */}
            <button
              type="submit"
              disabled={submitting}
              className="cursor-pointer relative overflow-hidden !px-[15px] !py-[5px] border-2 border-[#e5b300] text-white text-[0.8rem] font-medium bg-transparent transition-all duration-300 ease-linear
                         before:content-[''] before:absolute before:inset-x-0 before:bottom-0 before:h-full before:bg-[#e5b300] before:transition-all before:duration-300 before:ease-linear hover:before:h-0 disabled:opacity-60"
            >
              <span className="relative z-10">
                {submitting
                  ? "Saving..."
                  : isUpdate
                  ? "Reassign Subject"
                  : "Assign Subject"}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AssigningSubject;
