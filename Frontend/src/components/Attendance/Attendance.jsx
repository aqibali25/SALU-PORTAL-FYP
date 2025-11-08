import { FaClipboardCheck } from "react-icons/fa";
import Background from "../../assets/Background.png";
import SubjectCardsSection from "../SubjectCardsSection";
import { useState, useEffect } from "react";
import axios from "axios";

// Predefined color combinations to ensure good contrast and visual appeal
const COLOR_COMBINATIONS = [
  { bgColor: "#FFFBEB", borderColor: "#FACC15", iconBg: "#FACC15" }, // Yellow
  { bgColor: "#EFF6FF", borderColor: "#3B82F6", iconBg: "#3B82F6" }, // Blue
  { bgColor: "#FEF2F2", borderColor: "#EF4444", iconBg: "#EF4444" }, // Red
  { bgColor: "#F0FDF4", borderColor: "#22C55E", iconBg: "#22C55E" }, // Green
  { bgColor: "#FAF5FF", borderColor: "#A855F7", iconBg: "#A855F7" }, // Purple
  { bgColor: "#FFF7ED", borderColor: "#F97316", iconBg: "#F97316" }, // Orange
  { bgColor: "#F0F9FF", borderColor: "#0EA5E9", iconBg: "#0EA5E9" }, // Sky Blue
  { bgColor: "#FDF2F8", borderColor: "#EC4899", iconBg: "#EC4899" }, // Pink
  { bgColor: "#FEFCE8", borderColor: "#EAB308", iconBg: "#EAB308" }, // Amber
  { bgColor: "#ECFDF5", borderColor: "#10B981", iconBg: "#10B981" }, // Emerald
];

// API base URL - adjust according to your configuration
const API = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const Attendance = () => {
  const user = JSON.parse(localStorage.getItem("user"));
  const username = user?.username;
  const token = user?.token || localStorage.getItem("token");

  const [subjectCards, setSubjectCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Function to fetch subjects from database/API
  const fetchSubjects = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.get(`${API}/api/subject-allocations`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        withCredentials: true,
      });
      const data = response.data.data;

      const subjectsData = data.filter(
        (subject) => subject.teacherName === username
      );

      // Transform the filtered data into subject cards with unique colors
      const transformedSubjects = subjectsData.map((subject, index) => {
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
      setError("Failed to load subjects. Please try again.");
      setSubjectCards([]);
    } finally {
      setLoading(false);
    }
  };
  // const fetchSubjects = async () => {
  //   try {
  //     setLoading(true);
  //     setError(null);

  //     const response = await axios.get(`${API}/api/subject-allocations`, {
  //       headers: {
  //         Authorization: `Bearer ${token}`,
  //         "Content-Type": "application/json",
  //       },
  //       withCredentials: true,
  //     });
  //     const data = response.data.data;

  //     // First filter by teacher name
  //     const subjectsData = data.filter(
  //       (subject) => subject.teacherName === username
  //     );

  //     // Then filter out duplicates based on subject name before "-"
  //     const finalSubjects = subjectsData.filter((subject, index, array) => {
  //       // Extract subject name before "-"
  //       const baseSubjectName = subject.subName.split(" - ")[0].trim();

  //       // Check if this is the first occurrence of this base subject name
  //       const firstOccurrenceIndex = array.findIndex(
  //         (item) => item.subName.split(" - ")[0].trim() === baseSubjectName
  //       );

  //       return index === firstOccurrenceIndex;
  //     });

  //     // Transform the filtered data into subject cards with unique colors
  //     const transformedSubjects = finalSubjects.map((subject, index) => {
  //       const colorIndex = index % COLOR_COMBINATIONS.length;
  //       const colors = COLOR_COMBINATIONS[colorIndex];

  //       return {
  //         title:
  //           subject.subName ||
  //           subject.name ||
  //           subject.subjectName ||
  //           "Unknown Subject",
  //         subjectId: subject.saId || subject.id || subject._id,
  //         code: subject.code || subject.subjectCode || "",
  //         teacherName: subject.teacherName,
  //         department: subject.department,
  //         semester: subject.semester,
  //         ...colors,
  //         Icon: FaClipboardCheck,
  //       };
  //     });

  //     setSubjectCards(transformedSubjects);
  //   } catch (error) {
  //     console.error("Error fetching subjects:", error);
  //     setError("Failed to load subjects. Please try again.");
  //     setSubjectCards([]);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  useEffect(() => {
    fetchSubjects();
  }, []);

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
        className="sm:!px-[40px] md:!px-[80px] !px-5 !py-[20px] min-h-[calc(100vh-90px)] w-full bg-white dark:bg-gray-900 flex items-center justify-center"
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
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors block mx-auto"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

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
      <SubjectCardsSection
        title={username}
        subjects={subjectCards}
        routePrefix="Attendance"
      />
    </div>
  );
};

export default Attendance;
