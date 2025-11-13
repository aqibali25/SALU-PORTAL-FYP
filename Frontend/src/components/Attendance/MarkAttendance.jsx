import React, { useEffect, useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faAngleUp,
  faChevronDown,
  faCircleCheck,
  faCircleXmark,
  faClockRotateLeft,
} from "@fortawesome/free-solid-svg-icons";
import Pagination from "../Pagination";
import Background from "../../assets/Background.png";
import BackButton from "../BackButton";
import { useEnrolledStudents } from "../../Hooks/useEnrolledStudents";
import axios from "axios";

const backendBaseUrl =
  import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

export default function MarkAttendance() {
  const { subjectId } = useParams();
  const [submitting, setSubmitting] = useState(false);
  const [attendanceData, setAttendanceData] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date().getDate());
  const location = useLocation();
  const subjectsData = location.state;
  const [studentsEnrolledinSubject, setStudentsEnrolledinSubject] = useState(
    []
  );
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [loadingAttendance, setLoadingAttendance] = useState(true);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const token = localStorage.getItem("token");

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
  console.log("✅ Subject:", subject);

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
        const subjectAttendance = response.data.data.filter(
          (record) =>
            record.subjectId === subject.saId ||
            record.subjectName === subject.subName
        );
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
      console.log("✅ Enrolled Students:", enrolledStudents);

      // Fetch attendance records after we have the subject data
      fetchAttendanceRecords();
    }
  }, [students, subject]);

  useEffect(() => {
    document.title = `SALU Portal | Mark Attendance (${displaySubjectName})`;
  }, [displaySubjectName]);

  useEffect(() => {
    const interval = setInterval(() => {
      const today = new Date().getDate();
      if (today !== currentDate) {
        setCurrentDate(today);
        setSubmitted(false);
      }
    }, 60000);
    return () => clearInterval(interval);
  }, [currentDate]);

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

  // Get last 5 days attendance for a specific student
  const getLast5DaysAttendance = (studentRollNo) => {
    if (!attendanceRecords.length) return Array(5).fill(null);

    // Get today's date and last 5 days
    const today = new Date();
    const last5Days = [];

    for (let i = 5; i > 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      last5Days.push(date.toISOString().split("T")[0]); // Format as YYYY-MM-DD
    }

    // Find attendance for this student on these dates
    return last5Days.map((date) => {
      const record = attendanceRecords.find(
        (record) =>
          getStudentRollNo(record) === studentRollNo &&
          record.date &&
          new Date(record.date).toISOString().split("T")[0] === date
      );
      return record ? record.status : null;
    });
  };

  // Calculate attendance percentage for a student
  const calculateAttendancePercentage = (studentRollNo) => {
    if (!attendanceRecords.length) return 0;

    const studentRecords = attendanceRecords.filter(
      (record) => getStudentRollNo(record) === studentRollNo
    );

    if (studentRecords.length === 0) return 0;

    const presentCount = studentRecords.filter(
      (record) => record.status?.toLowerCase() === "present"
    ).length;

    return Math.round((presentCount / studentRecords.length) * 100);
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

  const handleAttendanceChange = (rollNo, studentName, value) => {
    setAttendanceData((prev) => ({
      ...prev,
      [rollNo]: { rollNo, studentName, status: value },
    }));
  };

  const allSelected = studentsEnrolledinSubject.every(
    (student) =>
      attendanceData[getStudentRollNo(student)]?.status &&
      attendanceData[getStudentRollNo(student)]?.status !== ""
  );

  const handleSaveAttendance = async () => {
    if (!allSelected) {
      alert("⚠️ Please mark attendance for all students before saving!");
      return;
    }

    setSubmitting(true);
    try {
      const attendancePayload = Object.values(attendanceData).map((record) => ({
        ...record,
        subjectId: subject?.saId,
        subjectName: subject?.subName,
        date: new Date().toISOString().split("T")[0], // Current date in YYYY-MM-DD
        semester: subject?.semester,
        department: subject?.department,
      }));

      console.log("✅ Saving Attendance Data:", attendancePayload);

      // Send attendance data to API
      const response = await axios.post(
        `${backendBaseUrl}/api/attendance`,
        { attendance: attendancePayload },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("✅ Attendance saved successfully:", response.data);

      // Refresh attendance records
      await fetchAttendanceRecords();

      setSubmitting(false);
      setSubmitted(true);
      setAttendanceData({}); // Clear current attendance data
      alert("Attendance saved successfully!");
    } catch (error) {
      console.error("❌ Error saving attendance:", error);
      setSubmitting(false);
      alert("Failed to save attendance. Please try again.");
    }
  };

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
    // Get last 5 dates for display
    const today = new Date();
    const dates = [];

    for (let i = 5; i > 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const day = d.getDate();
      const month = d.toLocaleString("default", { month: "short" });
      dates.push(`${day} ${month}`);
    }

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
                const last5DaysAttendance =
                  getLast5DaysAttendance(studentRollNo);
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
                      ) : attendanceRecords.length > 0 ? (
                        <table className="min-w-[350px] text-sm text-center mx-auto">
                          <thead>
                            <tr>
                              {dates.map((date) => (
                                <th
                                  key={date}
                                  className="!px-2 !py-1 font-semibold text-gray-900 dark:text-gray-100"
                                >
                                  {date}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            <tr>
                              {last5DaysAttendance.map((status, idx) => (
                                <td key={idx} className="!px-2 !py-1">
                                  {renderStatusIcon(status)}
                                </td>
                              ))}
                            </tr>
                          </tbody>
                        </table>
                      ) : (
                        <div className="text-gray-500 text-sm">
                          No attendance taken for this subject yet
                        </div>
                      )}
                    </td>

                    <td className="!px-6 !py-3 text-md text-gray-900 dark:text-gray-100">
                      {attendancePercentage}%
                    </td>

                    <td className="!px-6 !py-3 text-center">
                      <select
                        required
                        className="border-2 border-gray-400 dark:border-gray-600 !px-2 !py-1 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm focus:outline-none"
                        value={attendanceData[studentRollNo]?.status || ""}
                        onChange={(e) =>
                          handleAttendanceChange(
                            studentRollNo,
                            studentName,
                            e.target.value
                          )
                        }
                      >
                        <option value="" disabled>
                          Mark Status
                        </option>
                        <option value="Present">Present</option>
                        <option value="Absent">Absent</option>
                        <option value="Leave">Leave</option>
                      </select>
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
          <h1 className="text-2xl sm:text-3xl md:text!-4xl !py-3 font-bold text-gray-900 dark:text-white">
            Mark Attendance ({displaySubjectName})
          </h1>
        </div>

        <hr className="border-t-[3px] border-gray-900 dark:border-white mb-4" />

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
          <div>
            <button
              type="button"
              onClick={handleSaveAttendance}
              disabled={submitting || studentsEnrolledinSubject.length === 0}
              className="cursor-pointer relative overflow-hidden !px-[15px] !py-[5px] border-2 border-[#22c55e] text-white text-[0.9rem] font-medium bg-transparent transition-all duration-300 ease-linear
                before:content-[''] before:absolute before:inset-x-0 before:bottom-0 before:h-full before:bg-[#22c55e] before:transition-all before:duration-300 before:ease-linear hover:before:h-0 disabled:opacity-60"
            >
              <span className="relative z-10">
                {submitting ? "Saving..." : "Save Attendance"}
              </span>
            </button>
          </div>
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
