import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit } from "@fortawesome/free-solid-svg-icons";
import DataTable from "../TableData";
import Pagination from "../Pagination";
import Background from "../../assets/Background.png";
import BackButton from "../BackButton";
import { toast } from "react-toastify";

const StudentAttendance = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const pageSize = 10;
  const user = JSON.parse(localStorage.getItem("user"));
  const userRole = user?.role;

  // Get student data from navigation state
  const studentData = location.state;

  // Check if data exists
  useEffect(() => {
    if (!studentData) {
      toast.error("No student data found. Please go back and try again.");
      navigate("/SALU-PORTAL-FYP/Attendance/ViewAttendance");
    }
  }, [studentData, navigate]);

  if (!studentData) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-90px)] bg-white dark:bg-gray-900">
        <div className="w-16 h-16 border-4 border-yellow-400 border-dashed rounded-full animate-spin"></div>
      </div>
    );
  }

  const { student, attendanceRecords, subject, overallPercentage } =
    studentData;

  // Safe value extraction function
  const getSafeStringValue = (value) => {
    if (value === null || value === undefined) return "";
    if (typeof value === "object") {
      // If it's an object, try to get the status property or stringify it
      return value.status || JSON.stringify(value);
    }
    return String(value);
  };

  // Filter attendance records based on search query
  const filteredRecords = attendanceRecords.filter((record) => {
    const searchTerm = query.toLowerCase();

    const date = getSafeStringValue(record.attendance_date);
    const status = getSafeStringValue(record.status);
    const subjectName = getSafeStringValue(record.subject_name);

    return (
      date.toLowerCase().includes(searchTerm) ||
      status.toLowerCase().includes(searchTerm) ||
      subjectName.toLowerCase().includes(searchTerm)
    );
  });

  // Pagination logic
  const pageCount = Math.ceil(filteredRecords.length / pageSize);
  const currentPageRows = filteredRecords.slice(
    (page - 1) * pageSize,
    page * pageSize
  );

  // Format date for display
  const formatDisplayDate = (dateString) => {
    const safeDate = getSafeStringValue(dateString);
    if (!safeDate) return "N/A";

    try {
      const date = new Date(safeDate + "T00:00:00+05:00");
      if (isNaN(date.getTime())) return "Invalid Date";

      const day = date.getDate();
      const month = date.toLocaleString("default", { month: "short" });
      const year = date.getFullYear();
      return `${day} ${month} ${year}`;
    } catch (error) {
      return "Invalid Date";
    }
  };

  // Safe status display function
  const renderStatus = (value) => {
    const statusValue = getSafeStringValue(value);
    const lowerStatus = statusValue.toLowerCase();

    let displayText = statusValue || "N/A";
    let colorClass = "text-gray-600";

    if (lowerStatus === "present") {
      colorClass = "text-green-600";
    } else if (lowerStatus === "leave") {
      colorClass = "text-yellow-600";
    } else if (lowerStatus === "absent") {
      colorClass = "text-red-600";
    }

    return <span className={`font-semibold ${colorClass}`}>{displayText}</span>;
  };

  // Safe subject name display
  const renderSubjectName = (value) => {
    const subjectValue = getSafeStringValue(value);
    return subjectValue || "N/A";
  };

  // Columns configuration
  const columns = [
    {
      key: "attendance_date",
      label: "Date",
      render: (value) => formatDisplayDate(value),
    },
    {
      key: "status",
      label: "Status",
      render: (value) => renderStatus(value),
    },
    {
      key: "subject_name",
      label: "Subject Name",
      render: (value) => renderSubjectName(value),
    },
  ];

  // Actions configuration
  const actions = [
    {
      label: "Edit",
      onClick: (row) => {
        if (userRole === "hod" || userRole === "super admin") {
          navigate(
            `/SALU-PORTAL-FYP/Attendance/ViewAttendance/${subject.name.replace(
              /\s+/g,
              ""
            )}/${student.rollNo}/UpdateAttendance`,
            {
              state: {
                attendanceRecord: row,
                student: student,
                subject: subject,
              },
            }
          );
        } else {
          toast.error("Only HOD can edit attendance records.");
        }
      },
      icon: (
        <FontAwesomeIcon
          icon={faEdit}
          className="cursor-pointer text-green-600 hover:text-green-700 text-lg"
        />
      ),
    },
  ];

  // Reset to page 1 when search query changes
  useEffect(() => {
    setPage(1);
  }, [query]);

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
        {/* Header with Back Button */}
        <div className="flex justify-start items-center gap-3">
          <BackButton url={"-1"} />
          <h1 className="text-2xl sm:text-3xl md:text-4xl !py-3 font-bold text-gray-900 dark:text-white">
            {subject.name}
          </h1>
        </div>

        <hr className="border-t-[3px] border-gray-900 dark:border-white !mb-4" />

        {/* Student Info and Search in same line - Responsive */}
        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 !mb-4">
          {/* Student Information - Responsive flex layout */}
          <div className="flex flex-col sm:flex-row gap-3 w-full xl:flex-1 xl:min-w-0">
            <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 !p-3 flex-1 min-w-0">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Roll No
              </p>
              <p className="font-semibold text-gray-900 dark:text-white truncate">
                {student.rollNo}
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 !p-3 flex-1 min-w-0">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Student Name
              </p>
              <p className="font-semibold text-gray-900 dark:text-white truncate">
                {student.name}
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 !p-3 flex-1 min-w-0">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Attendance %
              </p>
              <p className="font-semibold text-gray-900 dark:text-white">
                {overallPercentage}%
              </p>
            </div>
          </div>

          {/* Search Input */}
          <div className="w-full xl:w-80 flex-shrink-0">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by date, status, or subject..."
              className="w-full !px-3 !py-2 border-2 border-[#a5a5a5] outline-none bg-[#f9f9f9] text-[#2a2a2a] dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
            />
          </div>
        </div>

        {/* Attendance Records Table */}
        <DataTable
          columns={columns}
          rows={currentPageRows}
          actions={actions}
          emptyMessage="No attendance records found for this student."
        />

        {/* Pagination and Total Records */}
        <div className="flex flex-col gap-5 sm:flex-row items-center justify-between mt-4">
          <span className="font-bold text-[1.3rem] text-gray-900 dark:text-white">
            Total Records: {filteredRecords.length}
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
};

export default StudentAttendance;
