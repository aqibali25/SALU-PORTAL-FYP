import { FaClipboardCheck } from "react-icons/fa";
import Background from "../../assets/Background.png";
import BackButton from "../BackButton";
import AdmissionCard from "../Admissions/AdmissionCard";
import { useState, useEffect } from "react";
import axios from "axios";
import { COLOR_COMBINATIONS } from "../../Hooks/useColorCombination";
import { useEnrolledStudents } from "../../Hooks/useEnrolledStudents";

// API base URL - adjust according to your configuration
const API = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const TakeAttendance = ({ title }) => {
  // Improved user data retrieval with validation
  const getUserData = () => {
    try {
      const userStr = localStorage.getItem("user");
      if (!userStr) return null;

      const user = JSON.parse(userStr);
      return {
        username: user?.username,
        cnic: user?.cnic,
        token: user?.token || localStorage.getItem("token"),
        role: user?.role,
      };
    } catch (error) {
      console.error("Error parsing user data:", error);
      return null;
    }
  };

  const userData = getUserData();
  const username = userData?.username;
  const cnic = userData?.cnic;
  const token = userData?.token;
  const userRole = userData?.role;

  const [subjectCards, setSubjectCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [subjectsData, setSubjectsData] = useState([]);
  const { students, loading: studentsLoading } = useEnrolledStudents();

  // Find current student - with additional safety checks
  const student = students?.find((student) => student.cnic === cnic);

  // Function to fetch subjects from database/API
  const fetchSubjects = async () => {
    // Check if required data is available
    if (!token) {
      setError("Authentication token not found. Please log in again.");
      setLoading(false);
      return;
    }

    // If user is student and we're still loading student data, wait
    if (userRole === "student" && studentsLoading) {
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await axios.get(`${API}/api/subject-allocations`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        withCredentials: true,
        timeout: 10000, // 10 second timeout
      });

      if (!response.data || !response.data.data) {
        throw new Error("Invalid response format from server");
      }

      const data = response.data.data;

      // Check if user is super admin
      const isSuperAdmin = userRole === "super admin";
      const isStudent = userRole === "student";

      let filteredSubjects;
      if (isSuperAdmin) {
        // Show all subjects for super admin
        filteredSubjects = data;
      } else if (isStudent) {
        // Show only subjects assigned to the student
        if (!student) {
          console.warn("Student data not found for CNIC:", cnic);
          filteredSubjects = [];
        } else {
          filteredSubjects = data.filter(
            (subject) =>
              subject.department === student.department &&
              subject.semester === student.current_semester
          );
          console.log("Filtered subjects for student:", {
            department: student.department,
            semester: student.current_semester,
            totalSubjects: data.length,
            filteredCount: filteredSubjects.length,
          });
        }
      } else {
        // Show only subjects assigned to the teacher
        filteredSubjects = data.filter(
          (subject) => subject.teacherName === username
        );
      }

      setSubjectsData(filteredSubjects);

      // Transform the data into subject cards with unique colors
      const transformedSubjects = filteredSubjects.map((subject, index) => {
        const colorIndex = index % COLOR_COMBINATIONS.length;
        const colors = COLOR_COMBINATIONS[colorIndex];

        return {
          title:
            subject.subName ||
            subject.name ||
            subject.subjectName ||
            "Unknown Subject",
          subjectId: subject.saId || subject.id || subject._id,
          code: subject.code || subject.subjectCode || "",
          teacherName: subject.teacherName,
          department: subject.department,
          semester: subject.semester,
          ...colors,
          Icon: FaClipboardCheck,
        };
      });

      setSubjectCards(transformedSubjects);
    } catch (error) {
      console.error("Error fetching subjects:", error);

      let errorMessage = "Failed to load subjects. Please try again.";

      if (axios.isAxiosError(error)) {
        if (error.response) {
          // Server responded with error status
          if (error.response.status === 401) {
            errorMessage = "Authentication failed. Please log in again.";
          } else if (error.response.status === 403) {
            errorMessage = "You don't have permission to view subjects.";
          } else if (error.response.status >= 500) {
            errorMessage = "Server error. Please try again later.";
          }
        } else if (error.request) {
          // Request was made but no response received
          errorMessage = "Network error. Please check your connection.";
        } else if (error.code === "ECONNABORTED") {
          errorMessage = "Request timeout. Please try again.";
        }
      }

      setError(errorMessage);
      setSubjectCards([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Only fetch subjects when we have all required data
    if (userRole === "student") {
      if (!studentsLoading && students !== undefined) {
        fetchSubjects();
      }
    } else {
      // For teachers and super admins, fetch immediately
      fetchSubjects();
    }
  }, [userRole, studentsLoading, students]); // Add dependencies

  // Determine the base route based on the title prop
  const getBaseRoute = () => {
    if (title === "Take Attendance") {
      return "TakeAttendance";
    } else if (title === "View Attendance") {
      return "ViewAttendance";
    }
    return "Attendance";
  };

  // Show loading while students data is being fetched for students
  if (userRole === "student" && studentsLoading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-90px)] bg-white dark:bg-gray-900">
        <div className="w-16 h-16 border-4 border-yellow-400 border-dashed rounded-full animate-spin"></div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-90px)] bg-white dark:bg-gray-900">
        <div className="w-16 h-16 border-4 border-yellow-400 border-dashed rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="sm:!px-[40px] md:!px-[50px] !px-5 !py-[20px] min-h-[calc(100vh-90px)] w-full bg-white dark:bg-gray-900 flex items-center justify-center"
        style={{
          backgroundImage: `url(${Background})`,
          backgroundSize: "cover",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center",
        }}
      >
        <div className="text-lg text-red-500 dark:text-red-400 text-center">
          {error}
          <button
            onClick={fetchSubjects}
            className="!mt-4 !px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors block mx-auto"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const displayTitle =
    userRole === "super admin"
      ? `All Subjects - ${title}`
      : userRole === "student"
      ? `My Subjects - ${title}`
      : `${username}'s Subjects - ${title}`;

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
      <div className="flex flex-col gap-3 w-full min-h-[80vh] bg-[#D5BBE0] rounded-md !p-5">
        <div className="flex justify-start items-center gap-3">
          <BackButton url={"/SALU-PORTAL-FYP/Attendance"} />
          <h1 className="text-2xl sm:text-3xl md:text-4xl py-3 font-bold text-gray-900 dark:text-white">
            {displayTitle}
          </h1>
        </div>

        <hr className="border-t-[3px] border-gray-900 dark:border-white mb-4" />

        <div className="flex flex-wrap items-center justify-center gap-5 min-h-[60vh] w-full bg-white dark:bg-gray-900 rounded-md overflow-x-auto !p-5">
          {subjectCards.length === 0 ? (
            <div className="w-full text-center">
              <h1 className="text-2xl text-red-600 mb-4">
                {userRole === "student"
                  ? `You don't have any subjects assigned for ${title.toLowerCase()} yet!`
                  : userRole === "super admin"
                  ? `No subjects available for ${title.toLowerCase()}!`
                  : `You don't have any subjects assigned for ${title.toLowerCase()} yet!`}
              </h1>
              {userRole === "student" && student && (
                <div className="text-gray-600 dark:text-gray-400 text-sm">
                  <p>Department: {student.department}</p>
                  <p>Semester: {student.current_semester}</p>
                  <p className="mt-2">
                    Please contact your department if you believe this is
                    incorrect.
                  </p>
                </div>
              )}
              {userRole === "student" && !student && (
                <div className="text-gray-600 dark:text-gray-400 text-sm">
                  <p>
                    Student profile not found. Please contact administration.
                  </p>
                </div>
              )}
            </div>
          ) : (
            subjectCards.map((card, index) => (
              <AdmissionCard
                key={card.subjectId || index}
                title={card.title}
                bgColor={card.bgColor}
                borderColor={card.borderColor}
                iconBg={card.iconBg}
                Icon={card.Icon}
                to={`Attendance/${getBaseRoute()}/${card.title.replace(
                  /\s+/g,
                  ""
                )}`}
                subjectsData={subjectsData}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default TakeAttendance;
