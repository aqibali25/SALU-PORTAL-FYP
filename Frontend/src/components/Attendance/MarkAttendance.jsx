import React, { useEffect, useRef, useState } from "react";
import { useParams, useLocation } from "react-router-dom";
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

export default function MarkAttendance() {
  const { subjectId } = useParams();
  const [submitting, setSubmitting] = useState(false);
  const [attendanceData, setAttendanceData] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [currentDate, setCurrentDate] = useState(getPakistanDateString());
  const location = useLocation();
  const subjectsData = location.state;
  const [studentsEnrolledinSubject, setStudentsEnrolledinSubject] = useState(
    []
  );
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [loadingAttendance, setLoadingAttendance] = useState(true);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [classesToday, setClassesToday] = useState(0);
  const [classesTakenToday, setClassesTakenToday] = useState(0);
  const [showClassInput, setShowClassInput] = useState(false);
  const [hasCheckedAttendance, setHasCheckedAttendance] = useState(false);
  const pageSize = 10;
  const toastShownRef = useRef(false);

  const token = localStorage.getItem("token");

  // Get current Pakistan date as string in YYYY-MM-DD format
  function getPakistanDateString() {
    const now = new Date();
    // Convert to Pakistan time (UTC+5)
    const pakistanTime = new Date(now.getTime() + 5 * 60 * 60 * 1000);
    return pakistanTime.toISOString().split("T")[0];
  }

  // Get today's date in YYYY-MM-DD format in Pakistan timezone
  const getTodayDate = () => getPakistanDateString();

  // Format date for display in DD Month format (e.g., 15 Nov)
  const formatDisplayDate = (dateString) => {
    const date = new Date(dateString + "T00:00:00+05:00"); // Force Pakistan timezone
    const day = date.getDate();
    const month = date.toLocaleString("default", { month: "short" });
    return `${day} ${month}`;
  };

  // Get current Pakistan time for midnight calculation
  function getPakistanTime() {
    const now = new Date();
    return new Date(now.getTime() + 5 * 60 * 60 * 1000); // UTC+5
  }

  // Storage key for class count
  const getStorageKey = () =>
    `attendance_classes_${subjectId}_${getTodayDate()}`;

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

  // Calculate classes taken today from API data
  const calculateClassesTakenToday = (attendanceData) => {
    if (!attendanceData.length || !subject) return 0;

    const today = getTodayDate();
    const todayRecords = attendanceData.filter(
      (record) => record.attendance_date === today
    );

    if (todayRecords.length === 0) return 0;

    // Group by unique session (we'll consider each unique set of records as a session)
    const studentCount = studentsEnrolledinSubject.length;
    if (studentCount === 0) return 0;

    // Each complete set of attendance for all students counts as one session
    const sessions = Math.floor(todayRecords.length / studentCount);
    return sessions;
  };

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

        // Calculate classes taken today from API data
        const takenToday = calculateClassesTakenToday(subjectAttendance);
        setClassesTakenToday(takenToday);

        // Check if we need to show class input
        const storedClasses = localStorage.getItem(getStorageKey());

        if (takenToday > 0 && !storedClasses) {
          // If API shows attendance but no local storage, set classes from API
          const calculatedClasses = takenToday;
          setClassesToday(calculatedClasses);
          localStorage.setItem(getStorageKey(), calculatedClasses.toString());
        } else if (storedClasses) {
          setClassesToday(parseInt(storedClasses));
        }

        setHasCheckedAttendance(true);
      }
    } catch (error) {
      console.error("Error fetching attendance records:", error);
      setAttendanceRecords([]);
      setHasCheckedAttendance(true);
    } finally {
      setLoadingAttendance(false);
    }
  };

  // Reset all data for new day
  const resetForNewDay = () => {
    const today = getTodayDate();
    if (today !== currentDate) {
      console.log("🔄 New day detected! Resetting attendance data...");
      console.log("Previous date:", currentDate, "New date:", today);

      setCurrentDate(today);
      setSubmitted(false);
      setClassesToday(0);
      setClassesTakenToday(0);
      setShowClassInput(false);
      setAttendanceData({});

      // Clear all attendance-related localStorage for this subject
      localStorage.removeItem(getStorageKey());

      // Show new day notification
      toast.info(`New day started! Today's date: ${formatDisplayDate(today)}`, {
        position: "top-center",
        autoClose: 4000,
      });

      // Refresh attendance records for new day
      fetchAttendanceRecords();
    }
  };

  useEffect(() => {
    if (
      hasCheckedAttendance &&
      subject &&
      studentsEnrolledinSubject.length > 0 &&
      !toastShownRef.current
    ) {
      const today = getTodayDate();
      const storedClasses = localStorage.getItem(getStorageKey());

      if (classesTakenToday >= classesToday && classesToday > 0) {
        // Limit reached
        toastShownRef.current = true;
        toast.warning(
          `You have already taken attendance for all ${classesToday} class${
            classesToday > 1 ? "es" : ""
          } today.`,
          {
            position: "top-center",
            autoClose: 6000,
          }
        );
      } else if (!storedClasses && classesTakenToday === 0) {
        // No classes set and no attendance taken - show class input
        toastShownRef.current = true;
        setShowClassInput(true);
        toast.info(
          <div className="text-center w-full">
            <h3 className="font-bold text-lg !mb-2 sm:text-base">
              How many classes do you have today? ({formatDisplayDate(today)})
            </h3>
            <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 !mt-4">
              <button
                onClick={() => handleClassInput(1)}
                className="bg-blue-500 hover:bg-blue-600 text-white !px-4 sm:!px-6 !py-2 font-semibold transition-colors cursor-pointer text-sm sm:text-base"
              >
                1 Class
              </button>
              {subject.creditHours > 1 && (
                <div>
                  <button
                    onClick={() => handleClassInput(2)}
                    className="bg-green-500 hover:bg-green-600 text-white !px-4 sm:!px-6 !py-2 font-semibold transition-colors cursor-pointer text-sm sm:text-base"
                  >
                    2 Classes
                  </button>
                  <button
                    onClick={() => handleClassInput(3)}
                    className="bg-yellow-500 hover:bg-yellow-600 text-white !px-4 sm:!px-6 !py-2 font-semibold transition-colors cursor-pointer text-sm sm:text-base"
                  >
                    3 Classes
                  </button>
                </div>
              )}
            </div>
          </div>,
          {
            position: "top-center",
            autoClose: false,
            closeOnClick: false,
            draggable: false,
            closeButton: false,
            style: {
              minWidth: "min(450px, 90vw)",
              maxWidth: "95vw",
            },
          }
        );
      } else if (storedClasses && classesTakenToday > 0) {
        // Show current status
        toastShownRef.current = true;
        toast.info(
          `Today (${formatDisplayDate(
            today
          )}): ${classesTakenToday}/${storedClasses} class${
            parseInt(storedClasses) > 1 ? "es" : ""
          } taken`,
          {
            position: "top-center",
            autoClose: 4000,
          }
        );
      }
    }
  }, [
    hasCheckedAttendance,
    subject,
    studentsEnrolledinSubject,
    classesTakenToday,
    classesToday,
  ]);

  // Reset the toast shown flag when date changes
  useEffect(() => {
    toastShownRef.current = false;
  }, [currentDate]);

  const handleClassInput = (classCount) => {
    setClassesToday(classCount);
    setShowClassInput(false);
    localStorage.setItem(getStorageKey(), classCount.toString());
    toast.dismiss();
    toast.success(
      `Set to ${classCount} class${
        classCount > 1 ? "es" : ""
      } for today (${formatDisplayDate(getTodayDate())})!`,
      {
        position: "top-center",
        autoClose: 3000,
      }
    );
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
    document.title = `SALU Portal | Mark Attendance (${displaySubjectName}) - ${formatDisplayDate(
      getTodayDate()
    )}`;
  }, [displaySubjectName]);

  // Check for date change and reset - Pakistani timezone
  useEffect(() => {
    const checkDateChange = () => {
      resetForNewDay();
    };

    // Check immediately on component mount
    checkDateChange();

    // Calculate milliseconds until next 12:00 AM Pakistan time
    const getMillisecondsUntilMidnight = () => {
      const now = getPakistanTime();
      const midnight = new Date(now);
      midnight.setHours(24, 0, 0, 0); // Next midnight
      midnight.setMinutes(0, 0, 0);
      return midnight.getTime() - now.getTime();
    };

    // Set interval for checking date change (every minute)
    const interval = setInterval(() => {
      checkDateChange();
    }, 60000); // Check every minute

    // Set timeout for midnight reset
    const midnightTimeout = setTimeout(() => {
      resetForNewDay();
      // After midnight, set up the next midnight check
      const dailyInterval = setInterval(() => {
        resetForNewDay();
      }, 24 * 60 * 60 * 1000); // Check every 24 hours

      return () => clearInterval(dailyInterval);
    }, getMillisecondsUntilMidnight());

    return () => {
      clearInterval(interval);
      clearTimeout(midnightTimeout);
    };
  }, [currentDate]);

  // Check if attendance limit reached for today
  const isAttendanceLimitReached =
    classesTakenToday >= classesToday && classesToday > 0;

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
    if (isAttendanceLimitReached) {
      toast.warning(
        "You have already taken attendance for today. Please contact your Admin or HOD for updates.",
        {
          position: "top-center",
          autoClose: 5000,
        }
      );
      return;
    }

    if (classesToday === 0) {
      toast.warning("Please set the number of classes for today first.", {
        position: "top-center",
        autoClose: 4000,
      });
      return;
    }

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
    if (isAttendanceLimitReached) {
      toast.warning(
        "You have already taken attendance for today. Please contact your Admin or HOD for updates.",
        {
          position: "top-center",
          autoClose: 5000,
        }
      );
      return;
    }

    if (!allSelected) {
      toast.warning(
        "⚠️ Please mark attendance for all students before saving!",
        {
          position: "top-center",
          autoClose: 4000,
        }
      );
      return;
    }

    if (classesToday === 0) {
      toast.warning("Please set the number of classes for today first.", {
        position: "top-center",
        autoClose: 4000,
      });
      return;
    }

    setSubmitting(true);
    try {
      // Create array of attendance records with all required fields
      const attendancePayload = Object.values(attendanceData).map((record) => {
        // Find the student in enrolled students to get department
        const student = studentsEnrolledinSubject.find(
          (s) => getStudentRollNo(s) === record.rollNo
        );

        return {
          subject_name: subject?.subName, // from subject
          roll_no: record.rollNo, // from current row
          department: student?.department || subject?.department, // department from enrolled student or subject
          attendance_date: getTodayDate(), // current date in Pakistan timezone
          status: record.status, // status from action select options
        };
      });

      console.log("✅ Saving Attendance Data:", attendancePayload);
      console.log("📅 Using Pakistan date:", getTodayDate());

      // Send attendance data to API - Send array directly, not wrapped in object
      const response = await axios.post(
        `${backendBaseUrl}/api/attendance`,
        attendancePayload, // Send array directly here
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("✅ Attendance saved successfully:", response.data);

      // Refresh attendance records to get updated count
      await fetchAttendanceRecords();

      setSubmitting(false);
      setSubmitted(true);
      setAttendanceData({}); // Clear current attendance data

      toast.success("Attendance saved successfully!", {
        position: "top-center",
        autoClose: 3000,
      });
    } catch (error) {
      console.error("❌ Error saving attendance:", error);
      setSubmitting(false);
      toast.error("Failed to save attendance. Please try again.", {
        position: "top-center",
        autoClose: 4000,
      });
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
                      <select
                        required
                        disabled={
                          isAttendanceLimitReached || classesToday === 0
                        }
                        className={`border-2 border-gray-400 dark:border-gray-600 !px-2 !py-1 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm focus:outline-none ${
                          isAttendanceLimitReached || classesToday === 0
                            ? "opacity-50 cursor-not-allowed"
                            : ""
                        }`}
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
                          {isAttendanceLimitReached
                            ? "Limit Reached"
                            : classesToday === 0
                            ? "Set Classes First"
                            : "Mark Status"}
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
          <div className="flex justify-between items-center">
            <div className="flex justify-start items-center gap-3">
              <BackButton url={"/SALU-PORTAL-FYP/Attendance/TakeAttendance"} />
              <h1 className="text-2xl sm:text-3xl md:text!-4xl !py-3 font-bold text-gray-900 dark:text-white">
                Mark Attendance ({displaySubjectName}) -{" "}
                {formatDisplayDate(getTodayDate())}
              </h1>
            </div>

            {/* Class Info Display */}
            {classesToday > 0 && (
              <div
                className={`border !px-4 !py-2 ${
                  isAttendanceLimitReached
                    ? "bg-red-100 border-red-300"
                    : "bg-blue-100 border-blue-300"
                }`}
              >
                <p
                  className={`font-semibold ${
                    isAttendanceLimitReached ? "text-red-800" : "text-blue-800"
                  }`}
                >
                  Today: {classesTakenToday}/{classesToday} class
                  {classesToday > 1 ? "es" : ""} taken
                </p>
                {isAttendanceLimitReached && (
                  <p className="text-red-600 text-sm font-medium">
                    Limit reached for today
                  </p>
                )}
              </div>
            )}
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
            <div>
              <button
                type="button"
                onClick={handleSaveAttendance}
                disabled={
                  submitting ||
                  studentsEnrolledinSubject.length === 0 ||
                  isAttendanceLimitReached ||
                  classesToday === 0
                }
                className="cursor-pointer relative overflow-hidden !px-[15px] !py-[5px] border-2 border-[#22c55e] text-white text-[0.9rem] font-medium bg-transparent transition-all duration-300 ease-linear
                  before:content-[''] before:absolute before:inset-x-0 before:bottom-0 before:h-full before:bg-[#22c55e] before:transition-all before:duration-300 before:ease-linear hover:before:h-0 disabled:opacity-60 disabled:cursor-not-allowed"
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
    </>
  );
}
