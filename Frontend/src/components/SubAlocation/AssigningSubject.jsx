import { useEffect, useState } from "react";
import { useLocation, useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Background from "../../assets/Background.png";
import BackButton from "../BackButton";
import InputContainer from "../InputContainer";

const AssigningSubject = () => {
  const { subjectId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  // Extract the name from subjectId (remove trailing numbers if any)
  const subjectName = subjectId.replace(/-\d+$/, "");
  const subjectFromState = location.state?.subjectData;

  const [formData, setFormData] = useState(
    subjectFromState || {
      saId: "",
      subName: subjectName,
      teacherName: "",
      department: "",
      semester: "",
      creditHours: "",
      year: "",
    }
  );

  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Fetch teachers
  useEffect(() => {
    document.title = `SALU Portal | Subject Allocation ${subjectName}`;

    const fetchTeachers = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        const res = await axios.get("http://localhost:5000/api/users", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const teacherUsers = res.data.filter(
          (user) => user.role?.toLowerCase() === "teacher"
        );

        setTeachers(["Yet to assign", ...teacherUsers.map((t) => t.username)]);
      } catch (err) {
        console.error("Error fetching teachers:", err);
        alert("Error loading teachers: " + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTeachers();
  }, [subjectName]);

  // Handle form input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const token = localStorage.getItem("token");

      // Convert numeric fields
      const creditHoursNum = Number(formData.creditHours);
      const yearNum = Number(formData.year);

      // Validate fields
      if (!formData.subName || !formData.department || !formData.semester) {
        alert("Please fill in all required fields.");
        setSubmitting(false);
        return;
      }

      if (isNaN(creditHoursNum) || creditHoursNum <= 0) {
        alert("Credit Hours must be a valid number.");
        setSubmitting(false);
        return;
      }

      if (isNaN(yearNum) || yearNum <= 0) {
        alert("Year must be a valid number.");
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

      // Send POST request to backend
      const res = await axios.post(
        `http://localhost:5000/api/subject-allocations`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      console.log("Subject updated:", res.data);
      alert("Teacher assigned successfully!");
      navigate("/SALU-PORTAL-FYP/SubjectAllocation");
    } catch (err) {
      console.error("Error assigning teacher:", err);
      const msg = err.response?.data?.message || err.message || "Unknown error";
      alert("Error assigning teacher: " + msg);
    } finally {
      setSubmitting(false);
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
          <BackButton />
          <h1 className="text-2xl sm:text-3xl md:text-4xl py-3 font-bold text-gray-900 dark:text-white">
            Subject Allocation - {subjectName}
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
          <InputContainer
            title="Semester"
            name="semester"
            inputType="text"
            value={formData.semester}
            disabled
          />
          <InputContainer
            title="Credit Hours"
            name="creditHours"
            inputType="text"
            value={formData.creditHours}
            disabled
          />
          <InputContainer
            title="Year"
            name="year"
            inputType="text"
            value={formData.year}
            disabled
          />

          <div className="w-full flex justify-end">
            <button
              type="submit"
              disabled={submitting}
              className="cursor-pointer relative overflow-hidden !px-[15px] !py-[5px] border-2 border-[#e5b300] text-white text-[0.8rem] font-medium bg-transparent transition-all duration-300 ease-linear
                         before:content-[''] before:absolute before:inset-x-0 before:bottom-0 before:h-full before:bg-[#e5b300] before:transition-all before:duration-300 before:ease-linear hover:before:h-0 disabled:opacity-60"
            >
              <span className="relative z-10">
                {submitting ? "Saving..." : "Assign Subject"}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AssigningSubject;
