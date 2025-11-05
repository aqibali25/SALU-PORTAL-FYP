import { useState } from "react";
import DataTable from "../TableData";
import Pagination from "../../components/Pagination";
import Background from "./../../assets/Background.png";
import BackButton from "../BackButton";
import { Link, useParams } from "react-router-dom";
import { initialAttendance } from "../../Hooks/useMarkAttendance";

export default function ShowStudentsForMarking() {
  const { subjectId } = useParams();

  const [students, setStudents] = useState(initialAttendance);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  // Search Filter
  const filteredStudents = students.filter((s) =>
    [s.studentName, s.rollNo, s.department]
      .join(" ")
      .toLowerCase()
      .includes(query.toLowerCase())
  );

  // Pagination
  const pageCount = Math.ceil(filteredStudents.length / pageSize);
  const currentPageRows = filteredStudents.slice(
    (page - 1) * pageSize,
    page * pageSize
  );

  // Replace subject with subjectId for table
  const transformedRows = currentPageRows.map((row) => ({
    ...row,
    subject: subjectId,
    semester: "8th",
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
            state={{ row: row }}
            className="cursor-pointer !px-4 !py-1 border border-green-500 text-green-500 hover:bg-green-500 hover:text-white transition"
          >
            Enter Marks
          </Link>
        );
      },
    },
  ];

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
            Enter Marks For Subject - {subjectId}
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
            placeholder="Search students..."
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
