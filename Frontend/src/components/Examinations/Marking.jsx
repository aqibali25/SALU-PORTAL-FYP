import { FaClipboardCheck } from "react-icons/fa";
import Background from "../../assets/Background.png";
import BackButton from "../BackButton";
import AdmissionCard from "../Admissions/AdmissionCard";
import { useState, useEffect } from "react";
import axios from "axios";
import { COLOR_COMBINATIONS } from "../../Hooks/useColorCombination";

// API base URL - adjust according to your configuration
const API = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const Marking = () => {
  const user = JSON.parse(localStorage.getItem("user"));
  const username = user?.username;
  const token = user?.token || localStorage.getItem("token");
  const userRole = user?.role; // Get user role from user object

  const [subjectCards, setSubjectCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [subjectsData, setSubjectsData] = useState([]);

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

      // Check if user is super admin
      const isSuperAdmin = userRole === "super admin";

      let subjectsData;
      if (isSuperAdmin) {
        // Show all subjects for super admin
        subjectsData = data;
      } else {
        // Show only subjects assigned to the teacher
        subjectsData = data.filter(
          (subject) => subject.teacherName === username
        );
      }
      setSubjectsData(subjectsData);

      // Transform the data into subject cards with unique colors
      const transformedSubjects = subjectsData.map((subject, index) => {
        const colorIndex = index % COLOR_COMBINATIONS.length;
        const colors = COLOR_COMBINATIONS[colorIndex];

        return {
          id: subject.saId || subject.id || subject._id,
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

  const displayTitle =
    userRole === "super admin" ? "All Subjects" : `${username}'s Subjects`;

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
      {/* Integrated SubjectCardsLayout directly */}
      <div className="flex flex-col gap-3 w-full min-h-[80vh] bg-[#D5BBE0] rounded-md !p-5">
        <div className="flex justify-start items-center gap-3">
          <BackButton />
          <h1 className="text-2xl sm:text-3xl md:text-4xl py-3 font-bold text-gray-900 dark:text-white">
            {displayTitle}
          </h1>
        </div>

        <hr className="border-t-[3px] border-gray-900 dark:border-white mb-4" />

        <div className="flex flex-wrap items-center justify-center gap-5 min-h-[60vh] w-full bg-white dark:bg-gray-900 rounded-md overflow-x-auto !p-5">
          {subjectCards.length === 0 ? (
            <h1 className="w-full text-center text-2xl text-red-600">
              You don't have any{" "}
              {displayTitle === "All Subjects"
                ? "subjects available"
                : `${displayTitle} assigned`}{" "}
              yet!
            </h1>
          ) : (
            subjectCards.map((card, index) => (
              <AdmissionCard
                key={index}
                title={card.title}
                bgColor={card.bgColor}
                borderColor={card.borderColor}
                iconBg={card.iconBg}
                Icon={card.Icon}
                to={`EnterMarks/Subject/${card.title.replace(/\s+/g, "")}`}
                subjectsData={subjectsData}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Marking;
