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

  // Debug: Check the actual data structure
  useEffect(() => {
    console.log("Attendance Records:", attendanceRecords);
    if (attendanceRecords.length > 0) {
      console.log("First record structure:", attendanceRecords[0]);
    }
  }, [attendanceRecords]);

  // Safe value extraction function
  const getSafeValue = (row, key) => {
    if (!row || typeof row !== "object") return "";

    // Direct property access
    if (row[key] !== undefined && row[key] !== null) {
      return String(row[key]);
    }

    // Nested object access
    if (typeof row === "object") {
      const value = row[key];
      if (value !== undefined && value !== null) {
        return String(value);
      }
    }

    return "";
  };

  // Add serial numbers to records
  const recordsWithSerialNo = attendanceRecords.map((record, index) => ({
    ...record,
    serialno: index + 1,
  }));

  // Filter attendance records based on search query
  const filteredRecords = recordsWithSerialNo.filter((record) => {
    if (!query.trim()) return true;

    const searchTerm = query.toLowerCase();

    const serialNo = String(record.serialno).toLowerCase();
    const date = getSafeValue(record, "attendance_date").toLowerCase();
    const status = getSafeValue(record, "status").toLowerCase();
    const subjectName = getSafeValue(record, "subject_name").toLowerCase();

    return (
      serialNo.includes(searchTerm) ||
      date.includes(searchTerm) ||
      status.includes(searchTerm) ||
      subjectName.includes(searchTerm)
    );
  });

  // Pagination logic
  const pageCount = Math.ceil(filteredRecords.length / pageSize);
  const currentPageRows = filteredRecords.slice(
    (page - 1) * pageSize,
    page * pageSize
  );

  // Safe status display function
  const renderStatus = (row) => {
    const statusValue = getSafeValue(row, "status");
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

  // Safe text renderer for all values
  const renderText = (row, key) => {
    const textValue = getSafeValue(row, key);
    return <span>{textValue}</span>;
  };

  // Render serial number
  const renderSerialNo = (row) => {
    return <span className="font-semibold">{row.serialno}</span>;
  };

  // Render date
  const renderDate = (row) => {
    const dateValue = getSafeValue(row, "attendance_date");
    return <span>{dateValue}</span>;
  };

  // Columns configuration
  const columns = [
    {
      key: "serialno",
      label: "Serial No.",
      render: (row) => renderSerialNo(row),
    },
    {
      key: "attendance_date",
      label: "Date",
      render: (row) => renderDate(row),
    },
    {
      key: "class_start_time",
      label: "Class Start Time",
      render: (row) => renderText(row, "class_start_time"),
    },
    {
      key: "class_end_time",
      label: "Class End Time",
      render: (row) => renderText(row, "class_end_time"),
    },
    {
      key: "status",
      label: "Status",
      render: (row) => renderStatus(row),
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
              placeholder="Search by serial no, date, status, or subject..."
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
