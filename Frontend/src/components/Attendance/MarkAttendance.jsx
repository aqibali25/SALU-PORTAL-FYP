import React, { useEffect, useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
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
  const [allAttendanceRecords, setAllAttendanceRecords] = useState([]);
  const [loadingAttendance, setLoadingAttendance] = useState(true);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [selectedSlot, setSelectedSlot] = useState("");
  const [scheduleType, setScheduleType] = useState("Regular");
  const pageSize = 10;

  const token = localStorage.getItem("token");

  const regularSlots = [
    { id: "slot1", name: "Slot 1", time: "9:00 AM - 9:50 AM" },
    { id: "slot2", name: "Slot 2", time: "9:50 AM - 10:40 AM" },
    { id: "slot3", name: "Slot 3", time: "10:40 AM - 11:30 AM" },
    { id: "slot4", name: "Slot 4", time: "11:30 AM - 12:20 PM" },
    { id: "slot5", name: "Slot 5", time: "12:20 PM - 1:10 PM" },
    { id: "slot6", name: "Slot 6", time: "1:10 PM - 2:00 PM" },
  ];

  const ramadanSlots = [
    { id: "slot1", name: "Slot 1", time: "9:00 AM - 9:35 AM" },
    { id: "slot2", name: "Slot 2", time: "9:35 AM - 10:10 AM" },
    { id: "slot3", name: "Slot 3", time: "10:10 AM - 10:45 AM" },
    { id: "slot4", name: "Slot 4", time: "10:45 AM - 11:20 AM" },
    { id: "slot5", name: "Slot 5", time: "11:20 AM - 11:55 AM" },
    { id: "slot6", name: "Slot 6", time: "11:55 AM - 12:30 PM" },
  ];

  const getCurrentSlots = () => {
    return scheduleType === "Regular" ? regularSlots : ramadanSlots;
  };

  function getPakistanDateString() {
    const now = new Date();
    return now.toLocaleDateString("en-CA", {
      timeZone: "Asia/Karachi",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  }

  const getTodayDate = () => getPakistanDateString();

  const formatDisplayDate = (dateString) => {
    const date = new Date(dateString + "T00:00:00+05:00");
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

  const fetchAllAttendanceRecords = async () => {
    try {
      setLoadingAttendance(true);
      const response = await axios.get(`${backendBaseUrl}/api/attendance`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      setAllAttendanceRecords(response.data.data);

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
      setAllAttendanceRecords([]);
      setAttendanceRecords([]);
    } finally {
      setLoadingAttendance(false);
    }
  };

  const checkSlotAvailability = async (slotTime) => {
    try {
      const today = getTodayDate();

      const existingRecord = allAttendanceRecords.find(
        (record) =>
          record.attendance_date === today &&
          record.department === subject?.department &&
          record.semester === subject?.semester &&
          record.class_time === slotTime
      );

      return !!existingRecord;
    } catch (error) {
      return false;
    }
  };

  const resetForNewDay = () => {
    const today = getTodayDate();
    if (today !== currentDate) {
      setCurrentDate(today);
      setSubmitted(false);
      setAttendanceData({});
      setSelectedSlot("");

      toast.info(`New day started! Today's date: ${formatDisplayDate(today)}`, {
        position: "top-center",
        autoClose: 4000,
      });

      fetchAllAttendanceRecords();
    }
  };

  useEffect(() => {
    if (students && subject) {
      const enrolledStudents = students
        .filter((student) => student.current_semester === subject.semester)
        .filter((student) => student.department === subject.department);

      setStudentsEnrolledinSubject(enrolledStudents);

      fetchAllAttendanceRecords();
    }
  }, [students, subject]);

  useEffect(() => {
    document.title = `SALU Portal | Mark Attendance (${displaySubjectName}) - ${formatDisplayDate(
      getTodayDate()
    )}`;
  }, [displaySubjectName]);

  useEffect(() => {
    const checkDateChange = () => {
      resetForNewDay();
    };

    checkDateChange();

    const interval = setInterval(() => {
      checkDateChange();
    }, 60000);

    return () => {
      clearInterval(interval);
    };
  }, [currentDate]);

  useEffect(() => {
    setSelectedSlot("");
  }, [scheduleType]);

  const getStudentDisplayName = (student) => {
    if (student.student_name) return student.student_name;
    if (student.firstName && student.lastName)
      return `${student.firstName} ${student.lastName}`;
    if (student.fullName) return student.fullName;
    return "Unknown Student";
  };

  const getStudentRollNo = (student) => {
    return student.roll_no || student.rollNo || student.rollNumber || "N/A";
  };

  const getLast5DaysAttendance = (studentRollNo) => {
    if (!attendanceRecords.length) return [];

    const studentRecords = attendanceRecords.filter(
      (record) => getStudentRollNo(record) === studentRollNo
    );

    if (studentRecords.length === 0) return [];

    const sortedRecords = studentRecords
      .filter((record) => record.attendance_date)
      .sort((a, b) => new Date(b.attendance_date) - new Date(a.attendance_date))
      .slice(0, 5);

    return sortedRecords.map((record) => ({
      date: record.attendance_date,
      status: record.status,
    }));
  };

  const calculateAttendancePercentage = (studentRollNo) => {
    if (!attendanceRecords.length) return 0;

    const studentRecords = attendanceRecords.filter(
      (record) => getStudentRollNo(record) === studentRollNo
    );

    if (studentRecords.length === 0) return 0;

    const attendedCount = studentRecords.filter(
      (record) =>
        record.status?.toLowerCase() === "present" ||
        record.status?.toLowerCase() === "leave"
    ).length;

    return Math.round((attendedCount / studentRecords.length) * 100);
  };

  const filteredStudents = studentsEnrolledinSubject.filter((student) => {
    const studentName = getStudentDisplayName(student).toLowerCase();
    const rollNo = getStudentRollNo(student).toLowerCase();
    const searchTerm = query.toLowerCase();

    return studentName.includes(searchTerm) || rollNo.includes(searchTerm);
  });

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

  const handleSlotSelect = async (slotId) => {
    const currentSlots = getCurrentSlots();
    const selectedSlotTime = currentSlots.find(
      (slot) => slot.id === slotId
    )?.time;

    if (!selectedSlotTime) return;

    const isSlotTaken = await checkSlotAvailability(selectedSlotTime);

    if (isSlotTaken) {
      toast.error(
        `This time slot (${selectedSlotTime}) is already occupied for ${subject?.department} department, semester ${subject?.semester} on today's date. Please select a different time slot.`,
        {
          position: "top-center",
          autoClose: 6000,
        }
      );
      return;
    }

    setSelectedSlot(slotId);
  };

  const handleScheduleTypeSelect = (type) => {
    setScheduleType(type);
  };

  const handleMarkAllPresent = () => {
    const newAttendanceData = {};
    studentsEnrolledinSubject.forEach((student) => {
      const rollNo = getStudentRollNo(student);
      const studentName = getStudentDisplayName(student);
      newAttendanceData[rollNo] = { rollNo, studentName, status: "Present" };
    });
    setAttendanceData(newAttendanceData);
    toast.success("All students marked as Present!", {
      position: "top-center",
      autoClose: 3000,
    });
  };

  const allSelected = studentsEnrolledinSubject.every(
    (student) =>
      attendanceData[getStudentRollNo(student)]?.status &&
      attendanceData[getStudentRollNo(student)]?.status !== ""
  );

  const handleSaveAttendance = async () => {
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

    if (!selectedSlot) {
      toast.warning("⚠️ Please select a time slot before saving!", {
        position: "top-center",
        autoClose: 4000,
      });
      return;
    }

    setSubmitting(true);
    try {
      const currentSlots = getCurrentSlots();
      const selectedSlotTime = currentSlots.find(
        (slot) => slot.id === selectedSlot
      )?.time;

      const isSlotTaken = await checkSlotAvailability(selectedSlotTime);
      if (isSlotTaken) {
        toast.error(
          `This time slot (${selectedSlotTime}) has been taken by another subject in ${subject?.department} department. Please select a different time slot.`,
          {
            position: "top-center",
            autoClose: 6000,
          }
        );
        setSubmitting(false);
        return;
      }

      const attendancePayload = Object.values(attendanceData).map((record) => {
        const student = studentsEnrolledinSubject.find(
          (s) => getStudentRollNo(s) === record.rollNo
        );

        return {
          subject_name: subject?.subName,
          roll_no: record.rollNo,
          department: student?.department || subject?.department,
          attendance_date: getTodayDate(),
          status: record.status,
          semester: subject?.semester || student?.current_semester,
          class_time: selectedSlotTime,
        };
      });

      await axios.post(`${backendBaseUrl}/api/attendance`, attendancePayload, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      await fetchAllAttendanceRecords();

      setSubmitting(false);
      setSubmitted(true);
      setAttendanceData({});
      setSelectedSlot("");

      toast.success("Attendance saved successfully!", {
        position: "top-center",
        autoClose: 3000,
      });
    } catch (error) {
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
                const currentStatus = attendanceData[studentRollNo]?.status;

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
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() =>
                            handleAttendanceChange(
                              studentRollNo,
                              studentName,
                              "Present"
                            )
                          }
                          className={`!px-3 !py-1 border-2 border-green-800 cursor-pointer text-white font-semibold text-sm transition-colors ${
                            currentStatus === "Present"
                              ? "bg-green-600  border-white"
                              : "bg-green-500 hover:bg-green-600"
                          }`}
                        >
                          P
                        </button>
                        <button
                          onClick={() =>
                            handleAttendanceChange(
                              studentRollNo,
                              studentName,
                              "Absent"
                            )
                          }
                          className={`!px-3 !py-1 border-2 border-red-800 cursor-pointer text-white font-semibold text-sm transition-colors ${
                            currentStatus === "Absent"
                              ? "bg-red-600  border-white"
                              : "bg-red-500 hover:bg-red-600"
                          }`}
                        >
                          A
                        </button>
                        <button
                          onClick={() =>
                            handleAttendanceChange(
                              studentRollNo,
                              studentName,
                              "Leave"
                            )
                          }
                          className={`!px-3 !py-1 border-2 border-yellow-800 cursor-pointer text-white font-semibold text-sm transition-colors ${
                            currentStatus === "Leave"
                              ? "bg-yellow-600  border-white"
                              : "bg-yellow-500 hover:bg-yellow-600"
                          }`}
                        >
                          L
                        </button>
                      </div>
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

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-90px)] bg-white dark:bg-gray-900">
        <div className="w-16 h-16 border-4 border-yellow-400 border-dashed rounded-full animate-spin"></div>
      </div>
    );
  }

  const currentSlots = getCurrentSlots();

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
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 flex-1">
              <BackButton url={"/SALU-PORTAL-FYP/Attendance/TakeAttendance"} />
              <h1 className="text-xl sm:text-2xl md:text-3xl !py-3 font-bold text-gray-900 dark:text-white break-words">
                Mark Attendance ({displaySubjectName}) -{" "}
                {formatDisplayDate(getTodayDate())}
              </h1>
            </div>
          </div>

          <hr className="border-t-[3px] border-gray-900 dark:border-white !mb-4" />

          <div className="flex flex-col sm:flex-row justify-between gap-4 items-start sm:items-center">
            <div className="flex justify-center items-center gap-2">
              <button
                onClick={() => handleScheduleTypeSelect("Regular")}
                className={`!px-4 !py-2 cursor-pointer text-white font-semibold transition-colors whitespace-nowrap ${
                  scheduleType === "Regular"
                    ? "bg-gray-900 border-2 border-white"
                    : "bg-[#a5a5a5] hover:bg-gray-700"
                }`}
              >
                Regular
              </button>
              <button
                onClick={() => handleScheduleTypeSelect("Ramadan")}
                className={`!px-4 !py-2 cursor-pointer text-white font-semibold transition-colors whitespace-nowrap ${
                  scheduleType === "Ramadan"
                    ? "bg-gray-900 border-2 border-white"
                    : "bg-[#a5a5a5] hover:bg-gray-700"
                }`}
              >
                Ramadan
              </button>
            </div>
            <input
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setPage(1);
              }}
              placeholder="Search students by name or roll number..."
              className="w-full sm:w-80 !px-3 !py-2 border-2 border-[#a5a5a5] outline-none 
                  bg-[#f9f9f9] text-[#2a2a2a]
                  dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100
                  disabled:opacity-60 disabled:cursor-not-allowed"
            />
          </div>

          <div className="flex flex-col sm:flex-row justify-between gap-4 items-start sm:items-center">
            <div className="flex flex-col">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {scheduleType} Schedule Time Slots:
              </h3>
              <div className="flex flex-wrap gap-2">
                {currentSlots.map((slot) => (
                  <button
                    key={slot.id}
                    onClick={() => handleSlotSelect(slot.id)}
                    className={`!px-4 !py-2 border-2 border-gray-500 cursor-pointer text-white font-semibold transition-colors whitespace-nowrap ${
                      selectedSlot === slot.id
                        ? "bg-gray-900 border-white"
                        : "bg-gray-800 hover:bg-gray-900"
                    }`}
                  >
                    {slot.name}
                    <br />
                    <span className="text-xs font-normal">{slot.time}</span>
                  </button>
                ))}
              </div>
              {selectedSlot && (
                <p className="text-green-600 text-sm mt-2">
                  Selected:{" "}
                  {currentSlots.find((s) => s.id === selectedSlot)?.time}
                </p>
              )}
            </div>
            <button
              onClick={handleMarkAllPresent}
              className="!px-4 !py-2 bg-green-500 hover:bg-green-600 text-white font-semibold transition-colors cursor-pointer whitespace-nowrap"
            >
              Mark All Present
            </button>
          </div>

          <DataTable columns={columns} students={paginatedStudents} />

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
                !selectedSlot
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
