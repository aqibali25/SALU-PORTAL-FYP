import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
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
import {
  useMarkAttendance,
  initialAttendance,
} from "../../Hooks/useMarkAttendance";

export default function MarkAttendance() {
  const { subjectId } = useParams();
  const [submitting, setSubmitting] = useState(false);
  const [attendanceData, setAttendanceData] = useState({});
  const [submitted, setSubmitted] = useState(false); // ✅ Added submitted state
  const [currentDate, setCurrentDate] = useState(new Date().getDate()); // ✅ Track date

  useEffect(() => {
    document.title = `SALU Portal | Mark Attendance (${subjectId})`;
  }, [subjectId]);

  // ✅ Reset submitted when day changes
  useEffect(() => {
    const interval = setInterval(() => {
      const today = new Date().getDate();
      if (today !== currentDate) {
        setCurrentDate(today);
        setSubmitted(false);
      }
    }, 60000); // check every 1 minute
    return () => clearInterval(interval);
  }, [currentDate]);

  const { rows, query, setQuery, sort, onSort, page, setPage, pageCount } =
    useMarkAttendance({
      initial: initialAttendance,
      pageSize: 10,
    });

  const handleAttendanceChange = (rollNo, studentName, value) => {
    setAttendanceData((prev) => ({
      ...prev,
      [rollNo]: { rollNo, studentName, status: value },
    }));
  };

  const allSelected = rows.every(
    (row) =>
      attendanceData[row.rollNo]?.status &&
      attendanceData[row.rollNo]?.status !== ""
  );

  const handleSaveAttendance = () => {
    if (!allSelected) {
      alert("⚠️ Please mark attendance for all students before saving!");
      return;
    }

    setSubmitting(true);
    setTimeout(() => {
      const formatted = Object.values(attendanceData);
      console.log("✅ Final Attendance Data:", formatted);
      setSubmitting(false);
      setSubmitted(true); // ✅ Mark attendance as submitted
      alert("Attendance saved successfully!");
    }, 1000);
  };

  const columns = [
    { key: "rollNo", label: "Roll No", sortable: true },
    { key: "studentName", label: "Student Name", sortable: true },
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

  const DataTable = ({ columns = [], rows = [], sort, onSort }) => {
    const chevron = (key) => {
      if (sort?.key === key) {
        return sort.dir === "asc" ? (
          <FontAwesomeIcon icon={faAngleUp} className="text-xs" />
        ) : (
          <FontAwesomeIcon icon={faChevronDown} className="text-xs" />
        );
      }
      return null;
    };

    // ✅ Dynamic Date Logic (depends on `submitted`)
    const today = new Date();
    const dates = [];

    if (submitted) {
      // include today + 4 previous days
      for (let i = 4; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(today.getDate() - i);
        const day = d.getDate();
        const month = d.toLocaleString("default", { month: "short" });
        dates.push(`${day} ${month}`);
      }
    } else {
      // show 5 days before today
      for (let i = 5; i > 0; i--) {
        const d = new Date(today);
        d.setDate(today.getDate() - i);
        const day = d.getDate();
        const month = d.toLocaleString("default", { month: "short" });
        dates.push(`${day} ${month}`);
      }
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
                  onClick={() => col.sortable !== false && onSort?.(col.key)}
                >
                  <div className="flex justify-center items-center gap-2">
                    <span>{col.label}</span>
                    <span className="text-xs">{chevron(col.key)}</span>
                  </div>
                </th>
              ))}
              <th className="!px-6 !py-3 text-center text-lg font-medium tracking-wider whitespace-nowrap">
                Actions
              </th>
            </tr>
          </thead>

          <tbody>
            {rows.length > 0 ? (
              rows.map((row, i) => (
                <tr
                  key={i}
                  className="text-center hover:bg-gray-100 dark:hover:bg-gray-800 transition border-b border-gray-300 dark:border-gray-700"
                >
                  <td className="!px-6 !py-3 text-md text-gray-900 dark:text-gray-100">
                    {row.rollNo}
                  </td>
                  <td className="!px-6 !py-3 text-md text-gray-900 dark:text-gray-100">
                    {row.studentName}
                  </td>

                  {/* ✅ Previous 5 Days Stats with Icons */}
                  <td className="!px-6 !py-3 text-center flex justify-center items-center">
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
                          {row.attendance?.slice(-5).map((status, idx) => (
                            <td key={idx} className="!px-2 !py-1">
                              {renderStatusIcon(status)}
                            </td>
                          ))}
                        </tr>
                      </tbody>
                    </table>
                  </td>

                  <td className="!px-6 !py-3 text-md text-gray-900 dark:text-gray-100">
                    {row.percentage + "%" || "-"}
                  </td>

                  <td className="!px-6 !py-3 text-center">
                    <select
                      required
                      className="border-2 border-gray-400 dark:border-gray-600 !px-2 !py-1 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm focus:outline-none"
                      value={attendanceData[row.rollNo]?.status || ""}
                      onChange={(e) =>
                        handleAttendanceChange(
                          row.rollNo,
                          row.studentName,
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
              ))
            ) : (
              <tr>
                <td colSpan={columns.length + 1} className="!px-6 !py-3">
                  <div className="w-full h-[30vh] flex items-center justify-center">
                    <h1 className="text-center text-gray-900 text-2xl dark:text-gray-100">
                      No data found.
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
          <BackButton />
          <h1 className="text-2xl sm:text-3xl md:text!-4xl !py-3 font-bold text-gray-900 dark:text-white">
            Mark Attendance ({subjectId})
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
            placeholder="Search students..."
            className="max-w-[100%] !px-2 !py-1 border-2 border-[#a5a5a5] outline-none
              bg-[#f9f9f9] text-[#2a2a2a]
              dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100
              disabled:opacity-60 disabled:cursor-not-allowed"
          />
        </div>

        <DataTable columns={columns} rows={rows} sort={sort} onSort={onSort} />

        <div className="flex flex-col gap-5 sm:flex-row items-center justify-between mt-4">
          <span className="font-bold text-[1.3rem] text-gray-900 dark:text-white">
            Total Students: {rows.length}
          </span>
          <div>
            <button
              type="button"
              onClick={handleSaveAttendance}
              disabled={submitting}
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
