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
  const [classStartTime, setClassStartTime] = useState("");
  const [classEndTime, setClassEndTime] = useState("");
  const [timeSlotError, setTimeSlotError] = useState("");
  const pageSize = 10;
  const toastShownRef = useRef(false);
  const classCountToastIdRef = useRef(null);

  const token = localStorage.getItem("token");

  // Get current Pakistan date as string in YYYY-MM-DD format
  function getPakistanDateString() {
    const now = new Date();
    return now.toLocaleDateString("en-CA", {
      timeZone: "Asia/Karachi",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  }

  // Get current Pakistan time in HH:MM format
  function getCurrentPakistanTime() {
    const now = new Date();
    return now.toLocaleTimeString("en-GB", {
      timeZone: "Asia/Karachi",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
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
    // Convert to Pakistan time string and back to Date object
    const pakistanTimeString = now.toLocaleString("en-US", {
      timeZone: "Asia/Karachi",
    });
    return new Date(pakistanTimeString);
  }

  // Storage key for class count
  const getStorageKey = () =>
    `attendance_classes_${subjectId}_${getTodayDate()}`;

  // Storage key for class time
  const getClassTimeStorageKey = (sessionIndex) =>
    `attendance_class_time_${subjectId}_${getTodayDate()}_${sessionIndex}`;

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

  // Check for duplicate time slots
  const checkDuplicateTimeSlot = (startTime, endTime) => {
    if (!startTime || !endTime || !subject) return false;

    const today = getTodayDate();

    // Check if there's any attendance record for the same department, date, and overlapping time
    const duplicateRecord = attendanceRecords.find((record) => {
      // Check if same department, same date
      if (
        record.department === subject.department &&
        record.attendance_date === today
      ) {
        const recordStart = record.class_start_time;
        const recordEnd = record.class_end_time;

        // Check for time overlap
        if (recordStart && recordEnd) {
          // Convert times to minutes for easy comparison
          const startMinutes = convertTimeToMinutes(startTime);
          const endMinutes = convertTimeToMinutes(endTime);
          const recordStartMinutes = convertTimeToMinutes(recordStart);
          const recordEndMinutes = convertTimeToMinutes(recordEnd);

          // Check for overlap
          return (
            startMinutes < recordEndMinutes && endMinutes > recordStartMinutes
          );
        }
      }
      return false;
    });

    return duplicateRecord;
  };

  // Convert time string (HH:MM) to minutes
  const convertTimeToMinutes = (timeString) => {
    const [hours, minutes] = timeString.split(":").map(Number);
    return hours * 60 + minutes;
  };

  // Handle end time blur to check for duplicates
  const handleEndTimeBlur = () => {
    if (!classStartTime || !classEndTime || !subject) return;

    const duplicate = checkDuplicateTimeSlot(classStartTime, classEndTime);

    if (duplicate) {
      setTimeSlotError(
        `Time slot conflict! Class already scheduled for ${subject.department} department from ${duplicate.class_start_time} to ${duplicate.class_end_time}. Please choose a different time slot.`
      );
      toast.warning(
        `Time slot conflict! ${subject.department} department already has a class from ${duplicate.class_start_time} to ${duplicate.class_end_time}.`,
        {
          position: "top-center",
          autoClose: 6000,
        }
      );
    } else {
      setTimeSlotError("");
    }
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
      setCurrentDate(today);
      setSubmitted(false);
      setClassesToday(0);
      setClassesTakenToday(0);
      setShowClassInput(false);
      setAttendanceData({});
      setClassStartTime("");
      setClassEndTime("");
      setTimeSlotError("");

      // Reset toast flag for new day
      toastShownRef.current = false;
      classCountToastIdRef.current = null;

      // Clear all attendance-related localStorage for this subject
      localStorage.removeItem(getStorageKey());
      // Clear class time storage for all sessions
      for (let i = 1; i <= 3; i++) {
        localStorage.removeItem(getClassTimeStorageKey(i));
      }

      // Show new day notification
      toast.info(`New day started! Today's date: ${formatDisplayDate(today)}`, {
        position: "top-center",
        autoClose: 4000,
      });

      // Refresh attendance records for new day
      fetchAttendanceRecords();
    }
  };

  // Show class count input message (initial setup)
  const showClassCountMessage = () => {
    const today = getTodayDate();

    // Clear any existing class count toast
    if (classCountToastIdRef.current) {
      toast.dismiss(classCountToastIdRef.current);
    }

    classCountToastIdRef.current = toast.info(
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
            <>
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
            </>
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
  };

  // Show session message with change count button
  const showSessionMessage = () => {
    const today = getTodayDate();
    const storedClasses = localStorage.getItem(getStorageKey());

    // Clear any existing class count toast
    if (classCountToastIdRef.current) {
      toast.dismiss(classCountToastIdRef.current);
    }

    if (classesTakenToday >= classesToday && classesToday > 0) {
      // All attendance taken - show only change count button
      classCountToastIdRef.current = toast.info(
        <div className="text-center w-full">
          <h3 className="font-bold text-lg !mb-2 sm:text-base">
            Attendance Complete for Today
          </h3>
          <p className="text-sm !mb-3">
            You have taken all {storedClasses} class
            {parseInt(storedClasses) > 1 ? "es" : ""} for today.
          </p>
          <div className="flex justify-center !mt-2">
            <button
              onClick={handleChangeCountRequest}
              className="bg-blue-500 hover:bg-blue-600 text-white !px-4 sm:!px-6 !py-2 font-semibold transition-colors cursor-pointer text-sm sm:text-base"
            >
              Change Class Count
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
            minWidth: "min(450px, 90vw)",
            maxWidth: "95vw",
          },
        }
      );
    } else {
      // Some attendance taken - show start session + change count
      classCountToastIdRef.current = toast.info(
        <div className="text-center w-full">
          <h3 className="font-bold text-lg !mb-2 sm:text-base">
            Ready to take attendance?
          </h3>
          <p className="text-sm !mb-3">
            Session {classesTakenToday + 1} of {storedClasses}
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 !mt-2">
            <button
              onClick={() => {
                toast.dismiss(classCountToastIdRef.current);
                setShowClassInput(false);
              }}
              className="bg-green-500 hover:bg-green-600 text-white !px-4 sm:!px-6 !py-2 font-semibold transition-colors cursor-pointer text-sm sm:text-base"
            >
              Start Session {classesTakenToday + 1}
            </button>
            <button
              onClick={handleChangeCountRequest}
              className="bg-blue-500 hover:bg-blue-600 text-white !px-4 sm:!px-6 !py-2 font-semibold transition-colors cursor-pointer text-sm sm:text-base"
            >
              Change Class Count
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
            minWidth: "min(450px, 90vw)",
            maxWidth: "95vw",
          },
        }
      );
    }
  };

  // Handle change count request
  const handleChangeCountRequest = () => {
    // Dismiss the current toast
    if (classCountToastIdRef.current) {
      toast.dismiss(classCountToastIdRef.current);
      classCountToastIdRef.current = null;
    }

    // Show success message that request is sent to HOD
    toast.info(
      <div className="text-center w-full">
        <h3 className="font-bold text-lg !mb-2">Change Request Sent</h3>
        <p className="text-sm">
          Your request to change class count has been sent to HOD.
        </p>
        <p className="text-sm !mt-1">
          You can change the count when HOD approves it.
        </p>
      </div>,
      {
        position: "top-center",
        autoClose: 5000,
        closeButton: true,
      }
    );
  };

  // CORRECTED LOGIC - This is the key fix
  useEffect(() => {
    if (
      hasCheckedAttendance &&
      subject &&
      studentsEnrolledinSubject.length > 0 &&
      !toastShownRef.current
    ) {
      if (classesTakenToday === 0) {
        // No attendance taken today - ALWAYS show class count message
        toastShownRef.current = true;
        setShowClassInput(true);
        showClassCountMessage();
      } else if (classesTakenToday > 0) {
        // At least 1 attendance taken - show session message
        toastShownRef.current = true;
        setShowClassInput(false);
        showSessionMessage();
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
    classCountToastIdRef.current = null;
  }, [currentDate]);

  const handleClassInput = (classCount) => {
    setClassesToday(classCount);
    setShowClassInput(false);
    localStorage.setItem(getStorageKey(), classCount.toString());

    // Dismiss the class count toast
    if (classCountToastIdRef.current) {
      toast.dismiss(classCountToastIdRef.current);
      classCountToastIdRef.current = null;
    }

    toast.success(
      `Set to ${classCount} class${classCount > 1 ? "es" : ""} for today!`,
      {
        position: "top-center",
        autoClose: 3000,
      }
    );
  };

  // Load saved class time for current session
  useEffect(() => {
    if (classesToday > 0 && classesTakenToday < classesToday) {
      const currentSession = classesTakenToday + 1;
      const savedTime = localStorage.getItem(
        getClassTimeStorageKey(currentSession)
      );
      if (savedTime) {
        const { startTime, endTime } = JSON.parse(savedTime);
        setClassStartTime(startTime);
        setClassEndTime(endTime);
      } else {
        setClassStartTime("");
        setClassEndTime("");
      }
    }
  }, [classesToday, classesTakenToday, subjectId]);

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

  // Validate class time inputs
  const validateClassTime = () => {
    if (!classStartTime) {
      toast.error("Class start time is required!", {
        position: "top-center",
        autoClose: 4000,
      });
      return false;
    }

    if (!classEndTime) {
      toast.error("Class end time is required!", {
        position: "top-center",
        autoClose: 4000,
      });
      return false;
    }

    if (classStartTime >= classEndTime) {
      toast.error("Class end time must be after start time!", {
        position: "top-center",
        autoClose: 4000,
      });
      return false;
    }

    if (timeSlotError) {
      toast.error("Please resolve the time slot conflict before saving.", {
        position: "top-center",
        autoClose: 4000,
      });
      return false;
    }

    return true;
  };

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

    // Validate class time
    if (!validateClassTime()) {
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
          subject_name: subject?.subName,
          roll_no: record.rollNo,
          department: student?.department || subject?.department,
          attendance_date: getTodayDate(),
          status: record.status,
          class_start_time: classStartTime,
          class_end_time: classEndTime,
          session_number: classesTakenToday + 1,
        };
      });

      // Send attendance data to API - Send array directly, not wrapped in object
      const response = await axios.post(
        `${backendBaseUrl}/api/attendance`,
        attendancePayload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      // Save class time for this session
      const currentSession = classesTakenToday + 1;
      localStorage.setItem(
        getClassTimeStorageKey(currentSession),
        JSON.stringify({
          startTime: classStartTime,
          endTime: classEndTime,
        })
      );

      // Refresh attendance records to get updated count
      await fetchAttendanceRecords();

      setSubmitting(false);
      setSubmitted(true);
      setAttendanceData({});
      setClassStartTime("");
      setClassEndTime("");
      setTimeSlotError("");

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
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4">
                          {last5Attendance.map((attendance, idx) => (
                            <div
                              key={idx}
                              className="flex flex-col items-center"
                            >
                              <span className="text-xs font-semibold text-gray-900 dark:text-gray-100">
                                {formatDisplayDate(attendance.date)}
                              </span>
                              <div className="!mt-1">
                                {renderStatusIcon(attendance.status)}
                              </div>
                            </div>
                          ))}
                          {/* Fill empty spaces if less than 5 records */}
                          {Array.from({
                            length: 5 - last5Attendance.length,
                          }).map((_, idx) => (
                            <div
                              key={`empty-${idx}`}
                              className="flex flex-col items-center"
                            >
                              <span className="text-xs font-semibold text-gray-900 dark:text-gray-100">
                                -
                              </span>
                              <div className="!mt-1">-</div>
                            </div>
                          ))}
                        </div>
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
          {/* Header Section - Made Responsive */}
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 flex-1">
              <BackButton url={"/SALU-PORTAL-FYP/Attendance/TakeAttendance"} />
              <h1 className="text-xl sm:text-2xl md:text-3xl !py-3 font-bold text-gray-900 dark:text-white break-words">
                Mark Attendance ({displaySubjectName}) -{" "}
                {formatDisplayDate(getTodayDate())}
              </h1>
            </div>

            {/* Class Info Display - Made Responsive */}
            {classesToday > 0 && (
              <div
                className={`border !px-3 sm:!px-4 !py-2 rounded-lg ${
                  isAttendanceLimitReached
                    ? "bg-red-100 border-red-300"
                    : "bg-blue-100 border-blue-300"
                }`}
              >
                <div className="flex flex-col sm:flex-row items-center gap-2">
                  <p
                    className={`font-semibold text-sm sm:text-base ${
                      isAttendanceLimitReached
                        ? "text-red-800"
                        : "text-blue-800"
                    }`}
                  >
                    Today: {classesTakenToday}/{classesToday} class
                    {classesToday > 1 ? "es" : ""} taken
                  </p>
                  {isAttendanceLimitReached && (
                    <p className="text-red-600 text-xs sm:text-sm font-medium">
                      Limit reached
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          <hr className="border-t-[3px] border-gray-900 dark:border-white !mb-4" />

          {/* Class Slot Time Input Section - Made Responsive */}
          {classesToday > 0 && classesTakenToday < classesToday && (
            <div className="w-full bg-white dark:bg-gray-900 text-black dark:text-white border border-blue-200 !p-4 !mb-4 rounded-lg">
              <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-300 mb-3">
                Class Slot Time (Session {classesTakenToday + 1})
              </h3>
              <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
                <div className="flex-1 w-full">
                  <label className="block text-sm font-medium text-gray-700 dark:text-white !mb-1">
                    Start Time *
                  </label>
                  <input
                    type="time"
                    value={classStartTime}
                    onChange={(e) => setClassStartTime(e.target.value)}
                    className="w-full !px-3 !py-2 border-2 border-gray-800 dark:border-gray-300 focus:outline-none focus:border-yellow-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    required
                  />
                </div>
                <div className="flex-1 w-full">
                  <label className="block text-sm font-medium text-gray-700 dark:text-white !mb-1">
                    End Time *
                  </label>
                  <input
                    type="time"
                    value={classEndTime}
                    onChange={(e) => setClassEndTime(e.target.value)}
                    onBlur={handleEndTimeBlur}
                    className={`w-full !px-3 !py-2 border-2 focus:outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-white ${
                      timeSlotError
                        ? "border-red-500 focus:border-red-500"
                        : "border-gray-800 dark:border-gray-300 focus:border-yellow-500"
                    }`}
                    required
                  />
                  {timeSlotError && (
                    <p className="text-red-600 text-sm !mt-2">
                      {timeSlotError}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex-1 w-full">
                <p className="text-sm text-gray-700 dark:text-white !mt-2">
                  Current Pakistan Time: {getCurrentPakistanTime()}
                </p>
              </div>
              {(!classStartTime || !classEndTime) && !timeSlotError && (
                <p className="text-red-600 text-sm !mt-2">
                  * Class start and end time are required to save attendance
                </p>
              )}
            </div>
          )}

          {/* Search Input - Made Responsive */}
          <div className="w-full flex justify-end">
            <input
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setPage(1);
              }}
              placeholder="Search students by name or roll number..."
              className="w-full sm:w-80 !px-3 !py-2 border-2 border-[#a5a5a5] outline-none rounded
                bg-[#f9f9f9] text-[#2a2a2a]
                dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100
                disabled:opacity-60 disabled:cursor-not-allowed"
            />
          </div>

          <DataTable columns={columns} students={paginatedStudents} />

          {/* Footer Section - Made Responsive */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 !mt-4">
            <span className="font-bold text-lg sm:text-xl text-gray-900 dark:text-white text-center sm:text-left">
              Total Students: {filteredStudents.length}
            </span>

            <button
              type="button"
              onClick={handleSaveAttendance}
              disabled={
                submitting ||
                studentsEnrolledinSubject.length === 0 ||
                isAttendanceLimitReached ||
                classesToday === 0 ||
                !classStartTime ||
                !classEndTime ||
                timeSlotError
              }
              className="cursor-pointer relative overflow-hidden !px-4 !py-2 border-2 border-[#22c55e] text-white text-base font-medium bg-transparent transition-all duration-300 ease-linear min-w-[140px]
                  before:content-[''] before:absolute before:inset-x-0 before:bottom-0 before:h-full before:bg-[#22c55e] before:transition-all before:duration-300 before:ease-linear hover:before:h-0 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <span className="relative z-10">
                {submitting ? "Saving..." : "Save Attendance"}
              </span>
            </button>
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <Pagination
                totalPages={pageCount}
                currentPage={page}
                onPageChange={setPage}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
