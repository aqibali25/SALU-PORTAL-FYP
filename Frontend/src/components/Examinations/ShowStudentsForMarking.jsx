import { useState, useEffect } from "react";
import DataTable from "../TableData";
import Pagination from "../../components/Pagination";
import Background from "./../../assets/Background.png";
import BackButton from "../BackButton";
import { Link, useParams, useLocation, useNavigate } from "react-router-dom";
import { useEnrolledStudents } from "../../Hooks/useEnrolledStudents";
import axios from "axios";

const backendBaseUrl =
  import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

export default function ShowStudentsForMarking() {
  const { subjectId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const subjectsData = location.state;
  const [studentsEnrolledinSubject, setStudentsEnrolledinSubject] = useState(
    []
  );
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const token = localStorage.getItem("token");
  const { students, loading } = useEnrolledStudents();

  const formatSubjectName = (urlString) => {
    return urlString
      .replace(/([a-zA-Z])-([a-zA-Z])/g, "$1 - $2")
      .replace(/\s+/g, " ")
      .trim();
  };

  // ✅ Safe subject finding with null checks
  const formattedSubjectName = formatSubjectName(subjectId);
  const subject = subjectsData?.find((sub) => {
    return (
      sub.subName === formattedSubjectName ||
      sub.title === formattedSubjectName ||
      sub.subName?.replace(/\s+/g, "") === subjectId.replace(/\s+/g, "")
    );
  });

  // ✅ Redirect if no subject data is available
  useEffect(() => {
    if (!subjectsData) {
      navigate("/SALU-PORTAL-FYP/EnterMarks");
      return;
    }
  }, [subjectsData, navigate]);

  // Get student display name - updated for student_name field
  const getStudentDisplayName = (student) => {
    if (student.student_name) return student.student_name;
    if (student.name) return student.name;
    if (student.firstName && student.lastName)
      return `${student.firstName} ${student.lastName}`;
    if (student.fullName) return student.fullName;
    return "Unknown Student";
  };

  // Get student roll number
  const getStudentRollNo = (student) => {
    return student.roll_no || student.rollNo || student.rollNumber || "N/A";
  };

  // Filter enrolled students by semester and department
  useEffect(() => {
    if (students && subject) {
      const enrolledStudents = students
        .filter((student) => student.current_semester === subject.semester)
        .filter((student) => student.department === subject.department);

      setStudentsEnrolledinSubject(enrolledStudents);
    }
  }, [students, subject]);

  // Search Filter
  const filteredStudents = studentsEnrolledinSubject.filter((student) => {
    const studentName = getStudentDisplayName(student).toLowerCase();
    const rollNo = getStudentRollNo(student).toLowerCase();
    const department = student.department?.toLowerCase() || "";
    const searchTerm = query.toLowerCase();

    return (
      studentName.includes(searchTerm) ||
      rollNo.includes(searchTerm) ||
      department.includes(searchTerm)
    );
  });

  // Pagination
  const pageCount = Math.ceil(filteredStudents.length / pageSize);
  const currentPageRows = filteredStudents.slice(
    (page - 1) * pageSize,
    page * pageSize
  );

  // Transform students for table display
  const transformedRows = currentPageRows.map((student) => ({
    rollNo: getStudentRollNo(student),
    studentName: getStudentDisplayName(student),
    department: student.department || "N/A",
    semester: student.current_semester || subject?.semester || "N/A",
    subject: subject?.subName || subjectId,
    academicYear: student.academic_year || "2024-2025",
    // Include original student data for passing to next component
    originalStudent: student,
    subjectData: subject,
  }));

  // Table Columns
  const columns = [
    { key: "rollNo", label: "Roll No" },
    { key: "studentName", label: "Student Name" },
    { key: "department", label: "Department" },
    { key: "semester", label: "Semester" },
    { key: "subject", label: "Subject" },
    { key: "academicYear", label: "Academic Year" },
  ];

  // Actions
  const actions = [
    {
      label: "Mark",
      render: (row) => {
        return (
          <Link
            to={`/SALU-PORTAL-FYP/EnterMarks/Subject/${subjectId}/EnterStdMarks?rollNo=${row.rollNo}`}
            state={{
              row: row,
            }}
            className="cursor-pointer !px-4 !py-1 border border-green-500 text-green-500 hover:bg-green-500 hover:text-white transition"
          >
            Enter Marks
          </Link>
        );
      },
    },
  ];

  // ✅ Show loading or error state if no subject data
  if (!subjectsData) {
    return (
      <div
        className="sm:!px-[40px] md:!px-[80px] !px-5 !py-[20px] min-h-[calc(100vh-90px)] w-[100%] bg-white dark:bg-gray-900 flex items-center justify-center"
        style={{
          backgroundImage: `url(${Background})`,
          backgroundSize: "cover",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center",
        }}
      >
        <div className="text-center">
          <h2 className="text-xl text-red-500 mb-4">
            No subject data available
          </h2>
          <p className="text-gray-600 mb-4">
            Please navigate from the Enter Marks page.
          </p>
          <BackButton url={"/SALU-PORTAL-FYP/EnterMarks"} />
        </div>
      </div>
    );
  }

  // ✅ Show error if subject not found
  if (!subject) {
    return (
      <div
        className="sm:!px-[40px] md:!px-[80px] !px-5 !py-[20px] min-h-[calc(100vh-90px)] w-[100%] bg-white dark:bg-gray-900 flex items-center justify-center"
        style={{
          backgroundImage: `url(${Background})`,
          backgroundSize: "cover",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center",
        }}
      >
        <div className="text-center">
          <h2 className="text-xl text-red-500 mb-4">Subject not found</h2>
          <p className="text-gray-600 mb-4">
            Subject "{subjectId}" not found in the available subjects.
          </p>
          <BackButton url={"/SALU-PORTAL-FYP/EnterMarks"} />
        </div>
      </div>
    );
  }
  /** ⏳ Loader */
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
          <BackButton url={"/SALU-PORTAL-FYP/EnterMarks"} />
          <h1 className="text-2xl sm:text-3xl md:text!-4xl !py-3 font-bold text-gray-900 dark:text-white">
            Enter Marks For Subject - {subject?.subName || subjectId}
          </h1>
        </div>

        <hr className="border-t-[3px] border-gray-900 dark:border-white mb-4" />

        {/* Search */}
        <div className="w-full flex justify-end">
          <input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(1);
            }}
            placeholder="Search students by name, roll number, or department..."
            className="max-w-[100%] !px-2 !py-1 border-2 border-[#a5a5a5] outline-none bg-[#f9f9f9] text-[#2a2a2a] dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
          />
        </div>

        {/* Table */}
        <DataTable columns={columns} rows={transformedRows} actions={actions} />

        {/* Footer & Pagination */}
        <div className="flex flex-col gap-5 sm:flex-row items-center justify-between mt-4">
          <span className="font-bold text-[1.3rem] text-gray-900 dark:text-white">
            Total Students : {filteredStudents.length}
          </span>

          <Pagination
            totalPages={pageCount}
            currentPage={page}
            onPageChange={setPage}
          />
        </div>
      </div>
    </div>
  );
}
