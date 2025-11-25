import React, { useState, useEffect, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit } from "@fortawesome/free-solid-svg-icons";
import DataTable from "../TableData";
import Pagination from "../Pagination";
import Background from "../../assets/Background.png";
import BackButton from "../BackButton";
import { toast } from "react-toastify";

const StudentAttendance = ({ data }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const user = JSON.parse(localStorage.getItem("user"));
  const userRole = user?.role;

  // Use data from props if available, otherwise from location state
  const studentData = data || location.state;

  // Safe value extraction function
  const getSafeValue = useMemo(
    () => (row, key) => {
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
    },
    []
  );

  // Safe destructuring with defaults
  const { student, attendanceRecords, subject, overallPercentage } = useMemo(
    () => ({
      student: {
        rollNo: studentData?.student?.rollNo || studentData?.rollNo || "",
        name: studentData?.student?.name || "Unknown Student",
        department: studentData?.student?.department || "",
        semester: studentData?.student?.semester || "",
      },
      attendanceRecords: studentData?.attendanceRecords || [],
      subject: {
        name: studentData?.subject?.name || "Unknown Subject",
        id: studentData?.subject?.id || "",
      },
      overallPercentage: studentData?.overallPercentage || 0,
    }),
    [studentData]
  );

  // Add serial numbers to records
  const recordsWithSerialNo = useMemo(
    () =>
      Array.isArray(attendanceRecords)
        ? attendanceRecords.map((record, index) => ({
            ...record,
            serialno: index + 1,
          }))
        : [],
    [attendanceRecords]
  );

  // Filter attendance records based on search query
  const filteredRecords = useMemo(
    () =>
      recordsWithSerialNo.filter((record) => {
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
      }),
    [recordsWithSerialNo, query, getSafeValue]
  );

  // Pagination
  const pageCount = Math.ceil(filteredRecords.length / pageSize);
  const currentPageRows = useMemo(
    () => filteredRecords.slice((page - 1) * pageSize, page * pageSize),
    [filteredRecords, page, pageSize]
  );

  // Render functions
  const renderStatus = useMemo(
    () => (row) => {
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

      return (
        <span className={`font-semibold ${colorClass}`}>{displayText}</span>
      );
    },
    [getSafeValue]
  );

  const renderText = useMemo(
    () => (row, key) => {
      const textValue = getSafeValue(row, key);
      return <span>{textValue || "N/A"}</span>;
    },
    [getSafeValue]
  );

  const renderSerialNo = useMemo(
    () => (row) => {
      return <span className="font-semibold">{row.serialno}</span>;
    },
    []
  );

  const renderDate = useMemo(
    () => (row) => {
      const dateValue = getSafeValue(row, "attendance_date");
      return <span>{dateValue || "N/A"}</span>;
    },
    [getSafeValue]
  );

  // Columns configuration
  const columns = useMemo(
    () => [
      {
        key: "serialno",
        label: "Serial No.",
        render: renderSerialNo,
      },
      {
        key: "attendance_date",
        label: "Date",
        render: renderDate,
      },
      {
        key: "class_time",
        label: "Class Time",
        render: (row) => renderText(row, "class_time"),
      },
      {
        key: "status",
        label: "Status",
        render: renderStatus,
      },
    ],
    [renderSerialNo, renderDate, renderText, renderStatus]
  );

  // Actions configuration
  const actions = useMemo(
    () =>
      userRole === "hod" || userRole === "super admin"
        ? [
            {
              label: "Edit",
              onClick: (row) => {
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
              },
              icon: (
                <FontAwesomeIcon
                  icon={faEdit}
                  className="cursor-pointer text-green-600 hover:text-green-700 text-lg"
                />
              ),
            },
          ]
        : [],
    [userRole, navigate, subject, student]
  );

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
          <BackButton url="/SALU-PORTAL-FYP/Attendance/ViewAttendance" />
          <h1 className="text-2xl sm:text-3xl md:text-4xl !py-3 font-bold text-gray-900 dark:text-white">
            {subject.name}
          </h1>
        </div>

        <hr className="border-t-[3px] border-gray-900 dark:border-white !mb-4" />

        {/* Student Info and Search */}
        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 !mb-4">
          {/* Student Information */}
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
