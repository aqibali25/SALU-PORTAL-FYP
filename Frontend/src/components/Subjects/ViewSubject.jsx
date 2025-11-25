import { useEffect, useState } from "react";
import axios from "axios";
import { FaEdit, FaTrash } from "react-icons/fa";
import DataTable from "../TableData";
import Pagination from "../../components/Pagination";
import Background from "./../../assets/Background.png";
import { useNavigate } from "react-router-dom";
import BackButton from "../BackButton";
import { useEnrolledStudents } from "../../Hooks/useEnrolledStudents";

export default function ViewSubject() {
  const [subjects, setSubjects] = useState([]);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const pageSize = 10;
  const navigate = useNavigate();

  // Get student data from useEnrolledStudents hook
  const { students } = useEnrolledStudents();

  // Get user info
  const userString = localStorage.getItem("user");
  const user = userString ? JSON.parse(userString) : null;
  const userRole = user?.role?.toLowerCase() || "";
  const userName = user?.username || "";
  const userCNIC = user?.cnic || "";
  const isSuperAdmin = user?.department === "Super Admin";
  const isStudent = userRole === "student";
  const isTeacher = userRole === "teacher";
  const isHOD = userRole === "hod";

  // Determine data source based on user role
  const useSubjectAllocations = isStudent || isTeacher;
  const useSubjectsData = isSuperAdmin || isHOD || (!isStudent && !isTeacher);

  // Find the logged-in student from the students array
  const enrolledStudent = students?.find(
    (student) => student.cnic === userCNIC
  );

  const API = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

  // ✅ Fetch subjects from backend
  useEffect(() => {
    document.title = "SALU Portal | View Subjects";

    const fetchSubjects = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");

        // Determine which endpoint to use based on user role
        const endpoint = useSubjectAllocations
          ? "subject-allocations"
          : "subjects";

        const res = await axios.get(`${API}/api/${endpoint}`, {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        });
        const currentYear = new Date().getFullYear();

        const allSubjects =
          endpoint === "subject-allocations"
            ? res.data.data.filter(
                (allocation) => allocation.year === currentYear
              )
            : res.data.data || [];

        let filteredSubjects = [];

        if (isStudent) {
          const studentCurrentSemester = enrolledStudent?.current_semester;

          if (studentCurrentSemester) {
            filteredSubjects = allSubjects.filter(
              (subject) => subject.semester === studentCurrentSemester
            );
          } else {
            toast.warn("Student semester not available");
            filteredSubjects = [];
          }
        } else if (isTeacher) {
          // For teachers: show only their assigned subjects
          filteredSubjects = allSubjects.filter(
            (allocation) => allocation.teacherName === userName
          );
        } else {
          // Super Admin, HOD and other roles see all subjects
          filteredSubjects = allSubjects;
        }

        setSubjects(filteredSubjects);
      } catch (err) {
        console.error(err);
        alert("Error loading subjects: " + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSubjects();
  }, [
    isSuperAdmin,
    isStudent,
    isTeacher,
    userName,
    enrolledStudent,
    userCNIC,
    students,
    API,
    useSubjectAllocations,
  ]);

  // ✅ Filter subjects by search query
  const filteredSubjects = subjects
    .filter((s) => {
      const searchableFields = useSubjectAllocations
        ? [s.saId, s.subName, s.teacherName, s.semester, s.year]
        : [s.subjectId, s.subjectName, s.subjectType, s.creditHours, s.year];

      return searchableFields
        .join(" ")
        .toLowerCase()
        .includes(query.toLowerCase());
    })
    .sort((a, b) => {
      // Sort by appropriate ID based on data source
      const idA = useSubjectAllocations ? a.saId : a.subjectId;
      const idB = useSubjectAllocations ? b.saId : b.subjectId;
      return idA - idB;
    });

  // ✅ Pagination logic
  const pageCount = Math.ceil(filteredSubjects.length / pageSize);
  const currentPageRows = filteredSubjects.slice(
    (page - 1) * pageSize,
    page * pageSize
  );

  // ✅ Columns for subject table - different based on data source
  const columns = useSubjectAllocations
    ? [
        { key: "saId", label: "ID" },
        { key: "subName", label: "Subject Name" },
        ...(isTeacher ? [] : [{ key: "teacherName", label: "Teacher Name" }]),
        { key: "semester", label: "Semester" },
        { key: "year", label: "Academic Year" },
        { key: "creditHours", label: "Credit Hours" },
      ]
    : [
        { key: "subjectId", label: "Subject ID" },
        { key: "subjectName", label: "Subject Name" },
        { key: "subjectType", label: "Subject Type" },
        { key: "creditHours", label: "Credit Hours" },
      ];

  // ✅ Table actions (Edit & Delete) - Only show for HOD and Super Admin
  const showActions = !isStudent && !isTeacher && (isSuperAdmin || isHOD);

  const actions = showActions
    ? [
        {
          label: "Edit",
          onClick: (row) => {
            const route = useSubjectAllocations
              ? `/SALU-PORTAL-FYP/Subjects/UpdateSubject/${row.saId}`
              : `/SALU-PORTAL-FYP/Subjects/UpdateSubject/${row.subjectId}`;

            navigate(route, {
              state: { subject: row },
            });
          },
          icon: (
            <FaEdit
              size={20}
              className="cursor-pointer text-green-600 hover:text-green-700"
            />
          ),
        },
        {
          label: "Delete",
          onClick: async (row) => {
            const subjectName = useSubjectAllocations
              ? row.subName
              : row.subjectName;
            if (!window.confirm(`Delete subject "${subjectName}"?`)) return;
            try {
              setLoading(true);
              const token = localStorage.getItem("token");

              // Use appropriate endpoint based on data source
              const endpoint = useSubjectAllocations
                ? `subject-allocations/${row.saId}`
                : `subjects/${row.subjectId}`;

              await axios.delete(`${API}/api/${endpoint}`, {
                headers: { Authorization: `Bearer ${token}` },
                withCredentials: true,
              });

              setSubjects((prev) =>
                prev.filter((s) =>
                  useSubjectAllocations
                    ? s.saId !== row.saId
                    : s.subjectId !== row.subjectId
                )
              );
            } catch (err) {
              console.error(err);
              alert("Error deleting subject: " + err.message);
            } finally {
              setLoading(false);
            }
          },
          icon: (
            <FaTrash
              size={20}
              className="cursor-pointer text-red-500 hover:text-red-600"
            />
          ),
        },
      ]
    : [];

  // Reset to page 1 when filters change
  useEffect(() => {
    setPage(1);
  }, [query]);

  // ✅ Loader
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
      <div className="flex flex-col gap-3 w-full min-h-[80vh] bg-[#D5BBE0] rounded-md !p-5">
        <div className="flex justify-start items-center gap-3">
          <BackButton url={"/SALU-PORTAL-FYP/Subjects"} />
          <h1 className="text-2xl sm:text-3xl md:text-4xl !py-3 font-bold text-gray-900 dark:text-white">
            {isStudent
              ? "Available Subjects"
              : isTeacher
              ? "My Assigned Subjects"
              : "Subjects List"}
          </h1>
        </div>
        <hr className="border-t-[3px] border-gray-900 dark:border-white mb-4" />

        <div className="flex flex-col md:flex-row justify-between items-center gap-3">
          {/* Teacher Info */}
          {isTeacher && (
            <div className="w-full !p-2 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white border-2 border-gray-500">
              Teacher: {userName}
            </div>
          )}

          {/* Search Input */}
          <div className="w-full flex justify-end lg:w-auto">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={
                useSubjectAllocations
                  ? "Search by ID, subject name, teacher, semester..."
                  : "Search subjects by ID, name, type..."
              }
              className="w-full lg:w-80 !px-3 !py-2 border-2 border-[#a5a5a5] outline-none bg-[#f9f9f9] text-[#2a2a2a] dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
            />
          </div>
        </div>

        {/* Clear Search Button */}
        {query && (
          <div className="flex justify-end mb-4">
            <button
              onClick={() => setQuery("")}
              className="!px-4 !py-2 bg-red-500 hover:bg-red-600 text-white font-medium transition-colors duration-200"
            >
              Clear Search
            </button>
          </div>
        )}

        <DataTable columns={columns} rows={currentPageRows} actions={actions} />

        {/* Pagination */}
        {filteredSubjects.length > 0 && (
          <div className="flex flex-col gap-5 sm:flex-row items-center justify-between mt-4">
            <span className="font-bold text-[1.3rem] text-gray-900 dark:text-white">
              {isStudent
                ? "Total Available Subjects"
                : isTeacher
                ? "Total Assigned Subjects"
                : "Total Subjects"}{" "}
              : {filteredSubjects.length}
            </span>
            <Pagination
              totalPages={pageCount}
              currentPage={page}
              onPageChange={setPage}
            />
          </div>
        )}
      </div>
    </div>
  );
}
