import React, { useEffect, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faAngleUp,
  faChevronDown,
  faCircleCheck,
  faCircleXmark,
  faClockRotateLeft,
} from "@fortawesome/free-solid-svg-icons";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Pagination from "../Pagination";
import Background from "../../assets/Background.png";
import BackButton from "../BackButton";
import { useEnrolledStudents } from "../../Hooks/useEnrolledStudents";
import axios from "axios";

const backendBaseUrl =
  import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

export default function ViewAttendance() {
  const { subjectId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const subjectsData = location.state;
  const [studentsEnrolledinSubject, setStudentsEnrolledinSubject] = useState(
    []
  );
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [loadingAttendance, setLoadingAttendance] = useState(true);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const pageSize = 10;

  const token = localStorage.getItem("token");

  // Get current Pakistan date as string in YYYY-MM-DD format
  function getPakistanDateString() {
    const now = new Date();
    // Convert to Pakistan time (UTC+5)
    const pakistanTime = new Date(now.getTime() + 5 * 60 * 60 * 1000);
    return pakistanTime.toISOString().split("T")[0];
  }

  // Format date for display in DD Month format (e.g., 15 Nov)
  const formatDisplayDate = (dateString) => {
    const date = new Date(dateString + "T00:00:00+05:00"); // Force Pakistan timezone
    const day = date.getDate();
    const month = date.toLocaleString("default", { month: "short" });
    return `${day} ${month}`;
  };

  const formatSubjectName = (urlString) => {
    return urlString
      .replace(/([a-zA-Z])-([a-zA-Z])/g, "$1 - $2")
      .replace(/\s+/g, " ")
      .trim();
  };

  const formattedSubjectName = formatSubjectName(subjectId);
  const subject = subjectsData.find((sub) => {
    return (
      sub.subName === formattedSubjectName ||
      sub.title === formattedSubjectName ||
      sub.subName?.replace(/\s+/g, "") === subjectId.replace(/\s+/g, "")
    );
  });

  const displaySubjectName = subject ? subject.subName : subjectId;

  const { students, loading } = useEnrolledStudents();

  // Fetch attendance records from API
  const fetchAttendanceRecords = async () => {
    try {
      setLoadingAttendance(true);
      const response = await axios.get(`${backendBaseUrl}/api/attendance`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      // Filter attendance records for current subject
      if (subject) {
        const subjectAttendance = response.data.data.filter((record) => {
          const recordSubjectName =
            record.subject_name || record.subjectName || "";
          const currentSubjectName = subject.subName || subject.title || "";

          return (
            record.subjectId === subject.saId ||
            recordSubjectName.trim() === currentSubjectName.trim() ||
            recordSubjectName.replace(/\s+/g, "") ===
              currentSubjectName.replace(/\s+/g, "")
          );
        });

        setAttendanceRecords(subjectAttendance);
      }
    } catch (error) {
      console.error("Error fetching attendance records:", error);
      setAttendanceRecords([]);
    } finally {
      setLoadingAttendance(false);
    }
  };

  useEffect(() => {
    if (students && subject) {
      const enrolledStudents = students
        .filter((student) => student.current_semester === subject.semester)
        .filter((student) => student.department === subject.department);

      setStudentsEnrolledinSubject(enrolledStudents);

      // Fetch attendance records after we have the subject data
      fetchAttendanceRecords();
    }
  }, [students, subject]);

  useEffect(() => {
    document.title = `SALU Portal | View Attendance (${displaySubjectName})`;
  }, [displaySubjectName]);

  // Get student display name
  const getStudentDisplayName = (student) => {
    if (student.student_name) return student.student_name;
    if (student.firstName && student.lastName)
      return `${student.firstName} ${student.lastName}`;
    if (student.fullName) return student.fullName;
    return "Unknown Student";
  };

  // Get student roll number
  const getStudentRollNo = (student) => {
    return student.roll_no || student.rollNo || student.rollNumber || "N/A";
  };

  // Get last 5 attendance records for a specific student (max 5, min 0)
  const getLast5DaysAttendance = (studentRollNo) => {
    if (!attendanceRecords.length) return [];

    // Filter records for this specific student
    const studentRecords = attendanceRecords.filter(
      (record) => getStudentRollNo(record) === studentRollNo
    );

    if (studentRecords.length === 0) return [];

    // Sort by date descending (newest first) and take latest 5
    const sortedRecords = studentRecords
      .filter((record) => record.attendance_date) // Ensure date exists
      .sort((a, b) => new Date(b.attendance_date) - new Date(a.attendance_date))
      .slice(0, 5); // Get only the latest 5 records

    return sortedRecords.map((record) => ({
      date: record.attendance_date,
      status: record.status,
    }));
  };

  // Calculate attendance percentage for a student - Leave counts as Present
  const calculateAttendancePercentage = (studentRollNo) => {
    if (!attendanceRecords.length) return 0;

    const studentRecords = attendanceRecords.filter(
      (record) => getStudentRollNo(record) === studentRollNo
    );

    if (studentRecords.length === 0) return 0;

    // Count both "present" and "leave" as attended
    const attendedCount = studentRecords.filter(
      (record) =>
        record.status?.toLowerCase() === "present" ||
        record.status?.toLowerCase() === "leave"
    ).length;

    return Math.round((attendedCount / studentRecords.length) * 100);
  };

  // Handle view individual attendance
  const handleViewStudentAttendance = (student) => {
    setSubmitting(true);

    // Get student's full attendance records
    const studentRollNo = getStudentRollNo(student);
    const studentRecords = attendanceRecords.filter(
      (record) => getStudentRollNo(record) === studentRollNo
    );

    // Prepare student data to send
    const studentData = {
      student: {
        rollNo: studentRollNo,
        name: getStudentDisplayName(student),
        department: student.department || subject?.department,
        semester: student.current_semester || subject?.semester,
      },
      attendanceRecords: studentRecords.sort(
        (a, b) => new Date(b.attendance_date) - new Date(a.attendance_date)
      ),
      subject: {
        name: subject?.subName,
        id: subject?.saId,
      },
      overallPercentage: calculateAttendancePercentage(studentRollNo),
    };

    // Navigate to student attendance detail page
    setTimeout(() => {
      navigate(
        `/SALU-PORTAL-FYP/Attendance/ViewAttendance/${subjectId}/${studentRollNo}`,
        {
          state: studentData,
        }
      );
      setSubmitting(false);
    }, 500);
  };

  // Filter students based on search query
  const filteredStudents = studentsEnrolledinSubject.filter((student) => {
    const studentName = getStudentDisplayName(student).toLowerCase();
    const rollNo = getStudentRollNo(student).toLowerCase();
    const searchTerm = query.toLowerCase();

    return studentName.includes(searchTerm) || rollNo.includes(searchTerm);
  });

  // Paginate students
  const paginatedStudents = filteredStudents.slice(
    (page - 1) * pageSize,
    page * pageSize
  );

  const pageCount = Math.ceil(filteredStudents.length / pageSize);

  const columns = [
    { key: "rollNo", label: "Roll No", sortable: true },
    { key: "student_name", label: "Student Name", sortable: true },
    { key: "Previous5DaysStats", label: "Previous 5 Days Stats" },
    { key: "percentage", label: "Percentage", sortable: true },
  ];

  const renderStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case "present":
        return (
          <FontAwesomeIcon
            icon={faCircleCheck}
            className="text-green-500 text-lg"
          />
        );
      case "absent":
        return (
          <FontAwesomeIcon
            icon={faCircleXmark}
            className="text-red-500 text-lg"
          />
        );
      case "leave":
        return (
          <FontAwesomeIcon
            icon={faClockRotateLeft}
            className="text-yellow-500 text-lg"
          />
        );
      default:
        return "-";
    }
  };

  const DataTable = ({ columns = [], students = [] }) => {
    return (
      <div className="w-full overflow-x-auto bg-white dark:bg-gray-900 rounded-md">
        <table className="w-full border-collapse table-auto">
          <thead className="bg-[#D6D6D6] border-b-2 border-gray-500">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className="!px-6 !py-3 text-center text-lg font-medium tracking-wider cursor-pointer select-none whitespace-nowrap"
                >
                  <div className="flex justify-center items-center gap-2">
                    <span>{col.label}</span>
                  </div>
                </th>
              ))}
              <th className="!px-6 !py-3 text-center text-lg font-medium tracking-wider whitespace-nowrap">
                Actions
              </th>
            </tr>
          </thead>

          <tbody>
            {students.length > 0 ? (
              students.map((student, i) => {
                const studentRollNo = getStudentRollNo(student);
                const studentName = getStudentDisplayName(student);
                const last5Attendance = getLast5DaysAttendance(studentRollNo);
                const attendancePercentage =
                  calculateAttendancePercentage(studentRollNo);

                return (
                  <tr
                    key={i}
                    className="text-center hover:bg-gray-100 dark:hover:bg-gray-800 transition border-b border-gray-300 dark:border-gray-700"
                  >
                    <td className="!px-6 !py-3 text-md text-gray-900 dark:text-gray-100">
                      {studentRollNo}
                    </td>
                    <td className="!px-6 !py-3 text-md text-gray-900 dark:text-gray-100">
                      {studentName}
                    </td>

                    {/* Previous 5 Days Stats with Icons */}
                    <td className="!px-6 !py-3 text-center flex justify-center items-center">
                      {loadingAttendance ? (
                        <div className="text-gray-500">Loading...</div>
                      ) : last5Attendance.length > 0 ? (
                        <table className="min-w-[350px] text-sm text-center mx-auto">
                          <thead>
                            <tr>
                              {last5Attendance.map((attendance, idx) => (
                                <th
                                  key={idx}
                                  className="!px-2 !py-1 font-semibold text-gray-900 dark:text-gray-100"
                                >
                                  {formatDisplayDate(attendance.date)}
                                </th>
                              ))}
                              {/* Fill empty spaces if less than 5 records */}
                              {Array.from({
                                length: 5 - last5Attendance.length,
                              }).map((_, idx) => (
                                <th
                                  key={`empty-${idx}`}
                                  className="!px-2 !py-1 font-semibold text-gray-900 dark:text-gray-100"
                                >
                                  -
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            <tr>
                              {last5Attendance.map((attendance, idx) => (
                                <td key={idx} className="!px-2 !py-1">
                                  {renderStatusIcon(attendance.status)}
                                </td>
                              ))}
                              {/* Fill empty spaces if less than 5 records */}
                              {Array.from({
                                length: 5 - last5Attendance.length,
                              }).map((_, idx) => (
                                <td
                                  key={`empty-${idx}`}
                                  className="!px-2 !py-1"
                                >
                                  -
                                </td>
                              ))}
                            </tr>
                          </tbody>
                        </table>
                      ) : (
                        <div className="text-gray-500 text-sm">
                          No attendance taken yet
                        </div>
                      )}
                    </td>

                    <td className="!px-6 !py-3 text-md text-gray-900 dark:text-gray-100">
                      {attendancePercentage}%
                    </td>

                    <td className="!px-6 !py-3 text-center">
                      <button
                        type="submit"
                        onClick={() => handleViewStudentAttendance(student)}
                        disabled={submitting}
                        className="cursor-pointer relative overflow-hidden !px-[15px] !py-[5px] border-2 border-[#e5b300] text-white text-[0.8rem] font-medium bg-transparent transition-all duration-300 ease-linear
                                   before:content-[''] before:absolute before:inset-x-0 before:bottom-0 before:h-full before:bg-[#e5b300] before:transition-all before:duration-300 before:ease-linear hover:before:h-0 disabled:opacity-60"
                      >
                        <span className="relative z-10">
                          {submitting ? "Loading..." : "View"}
                        </span>
                      </button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={columns.length + 1} className="!px-6 !py-3">
                  <div className="w-full h-[30vh] flex items-center justify-center">
                    <h1 className="text-center text-gray-900 text-2xl dark:text-gray-100">
                      {studentsEnrolledinSubject.length === 0
                        ? "No students enrolled in this subject."
                        : "No students match your search."}
                    </h1>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    );
  };

  /** ⏳ Loader */
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-90px)] bg-white dark:bg-gray-900">
        <div className="w-16 h-16 border-4 border-yellow-400 border-dashed rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <>
      <ToastContainer
        position="top-center"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />

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
            <BackButton url={"/SALU-PORTAL-FYP/Attendance/ViewAttendance"} />
            <h1 className="text-2xl sm:text-3xl md:text!-4xl !py-3 font-bold text-gray-900 dark:text-white">
              View Attendance ({displaySubjectName})
            </h1>
          </div>

          <hr className="border-t-[3px] border-gray-900 dark:border-white !mb-4" />

          <div className="w-full flex justify-end overflow-hidden">
            <input
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setPage(1);
              }}
              placeholder="Search students by name or roll number..."
              className="max-w-[100%] !px-2 !py-1 border-2 border-[#a5a5a5] outline-none
                bg-[#f9f9f9] text-[#2a2a2a]
                dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100
                disabled:opacity-60 disabled:cursor-not-allowed"
            />
          </div>

          <DataTable columns={columns} students={paginatedStudents} />

          <div className="flex flex-col gap-5 sm:flex-row items-center justify-between mt-4">
            <span className="font-bold text-[1.3rem] text-gray-900 dark:text-white">
              Total Students: {filteredStudents.length}
            </span>
            <Pagination
              totalPages={pageCount}
              currentPage={page}
              onPageChange={setPage}
            />
          </div>
        </div>
      </div>
    </>
  );
}
