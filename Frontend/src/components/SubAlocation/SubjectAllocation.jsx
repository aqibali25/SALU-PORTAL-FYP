import { useEffect, useState } from "react";
import useSubjectAllocation from "../../Hooks/useSubjectAllocation";
import DataTable from "../TableData";
import Pagination from "../Pagination";
import Background from "../../assets/Background.png";
import BackButton from "../BackButton";
import { Link } from "react-router-dom";

export default function SubjectAllocation() {
  const [subjectData, setSubjectData] = useState([]);
  const [loading, setLoading] = useState(true); // ✅ Loading state added

  useEffect(() => {
    document.title = "SALU Portal | Subject Allocation";

    const fetchData = async () => {
      try {
        const response = await fetch(
          "http://localhost:5000/api/subject-allocations"
        );
        const data = await response.json();
        console.log("Fetched Subject Allocations:", data.data);
        setSubjectData(data.data || []);
      } catch (error) {
        console.error("Error fetching subject allocations:", error);
      } finally {
        setLoading(false); // ✅ Stop loader after fetch completes
      }
    };

    fetchData();
  }, []);

  const { rows, page, pageCount, setPage, query, setQuery, sorts, onSort } =
    useSubjectAllocation({ initial: subjectData, pageSize: 10 });

  const columns = [
    { key: "saId", label: "SA ID" },
    { key: "subName", label: "Sub Name" },
    { key: "teacherName", label: "Teacher Name" },
    { key: "department", label: "Department" },
    { key: "semester", label: "Semester" },
    { key: "creditHours", label: "Credit Hours" },
    { key: "year", label: "Year" },
  ];

  const actions = [
    {
      label: "Action",
      render: (row) => {
        // ✅ Safe values with fallback
        const subNameSafe = row.subName
          ? row.subName.replace(/\s+/g, "")
          : "UNKNOWN";
        const saIdSafe = row.saId || "0";

        const isAssign = row.teacherName === "Yet to assign";
        const borderColor = isAssign ? "#22c55e" : "#ef4444";
        const text = isAssign ? "Assign" : "Reassign";
        const buttonClass = isAssign ? "assign-btn" : "reassign-btn";

        return (
          <Link
            to={`/SALU-PORTAL-FYP/SubjectAllocation/${subNameSafe}-${saIdSafe}`}
            state={{ subjectData: row }} // ✅ Send subject row data here
            type="button"
            className={`cursor-pointer relative overflow-hidden !px-[15px] !py-[5px]
          border-2 text-white text-[0.8rem] font-medium bg-transparent transition-all duration-300 ease-linear
          before:content-[''] before:absolute before:inset-x-0 before:bottom-0 before:h-full
          before:transition-all before:duration-300 before:ease-linear hover:before:h-0 disabled:opacity-60 ${buttonClass}`}
            style={{ borderColor }}
          >
            <span className="relative z-10">{text}</span>

            <style jsx="true">{`
              .${buttonClass}::before {
                background: ${borderColor} !important;
              }
            `}</style>
          </Link>
        );
      },
    },
  ];

  // ✅ Show loader while fetching
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
          <BackButton />
          <h1 className="text-2xl sm:text-3xl md:text-4xl !py-3 font-bold text-gray-900 dark:text-white">
            Subject Allocation
          </h1>
        </div>
        <hr className="border-t-[3px] border-gray-900 dark:border-white mb-4" />

        <div className="w-full flex justify-end mb-3">
          <input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(1);
            }}
            placeholder="Search subjects..."
            className="max-w-[100%] !px-2 !py-1 border-2 border-[#a5a5a5] outline-none
            bg-[#f9f9f9] text-[#2a2a2a] dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100
            disabled:opacity-60 disabled:cursor-not-allowed"
          />
        </div>

        <DataTable
          columns={columns}
          rows={rows}
          sort={sorts[0]}
          onSort={onSort}
          actions={actions}
        />

        <div className="flex flex-col sm:flex-row justify-between items-center mt-4 gap-5">
          <span className="font-bold text-[1.3rem] text-gray-900 dark:text-white">
            Total Subjects: {rows.length}
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
