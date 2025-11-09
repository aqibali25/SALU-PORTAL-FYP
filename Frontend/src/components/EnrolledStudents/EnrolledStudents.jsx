import React, { useState, useEffect, useMemo } from "react";
import DataTable from "../TableData";
import Pagination from "../Pagination";
import Background from "../../assets/Background.png";
import { useEnrolledStudents } from "../../Hooks/useEnrolledStudents";

const EnrolledStudents = () => {
  const { students, loading, error } = useEnrolledStudents();
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [departmentFilter, setDepartmentFilter] = useState("");
  const [yearFilter, setYearFilter] = useState("");
  const [semesterFilter, setSemesterFilter] = useState("");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  // Get logged-in user info
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const userRole = user?.role?.toLowerCase();
  const userDepartment = user?.department;

  // Check if user has access to all departments (handle "super admin" with space)
  const hasFullAccess =
    userRole === "admin" ||
    userRole === "superadmin" ||
    userRole === "super admin";

  // Use useMemo to prevent recreation on every render
  const validStudents = useMemo(() => {
    return students.filter(
      (student) =>
        student.current_year !== "5th" && student.current_year !== null
    );
  }, [students]);

  // Extract unique departments, years, and semesters from validStudents using useMemo
  const departments = useMemo(() => {
    return [
      ...new Set(
        validStudents.map((student) => student.department).filter(Boolean)
      ),
    ].sort();
  }, [validStudents]);

  const years = useMemo(() => {
    return [
      ...new Set(
        validStudents.map((student) => student.current_year).filter(Boolean)
      ),
    ].sort();
  }, [validStudents]);

  const semesters = useMemo(() => {
    return [
      ...new Set(
        validStudents.map((student) => student.current_semester).filter(Boolean)
      ),
    ].sort();
  }, [validStudents]);

  // Apply filters
  useEffect(() => {
    let filtered = [...validStudents];

    // Apply department filter based on user role
    if (!hasFullAccess && userDepartment) {
      filtered = filtered.filter(
        (student) =>
          student.department?.toLowerCase() === userDepartment.toLowerCase()
      );
    } else if (departmentFilter && hasFullAccess) {
      filtered = filtered.filter(
        (student) =>
          student.department?.toLowerCase() === departmentFilter.toLowerCase()
      );
    }

    // Apply year filter
    if (yearFilter) {
      filtered = filtered.filter(
        (student) => student.current_year === yearFilter
      );
    }

    // Apply semester filter
    if (semesterFilter) {
      filtered = filtered.filter(
        (student) => student.current_semester === semesterFilter
      );
    }

    // Apply search query
    if (query.trim() !== "") {
      const lowerQuery = query.toLowerCase();
      filtered = filtered.filter(
        (student) =>
          student.student_name?.toLowerCase().includes(lowerQuery) ||
          student.father_name?.toLowerCase().includes(lowerQuery) ||
          student.roll_number?.toLowerCase().includes(lowerQuery) ||
          student.cnic?.toLowerCase().includes(lowerQuery) ||
          student.department?.toLowerCase().includes(lowerQuery)
      );
    }

    setFilteredStudents(filtered);
    setPage(1); // Reset to first page when filters change
  }, [
    validStudents,
    departmentFilter,
    yearFilter,
    semesterFilter,
    query,
    hasFullAccess,
    userDepartment,
  ]);

  // Pagination
  const startIndex = (page - 1) * pageSize;
  const paginatedStudents = filteredStudents.slice(
    startIndex,
    startIndex + pageSize
  );
  const pageCount = Math.ceil(filteredStudents.length / pageSize);

  // Table columns
  const columns = [
    { key: "roll_number", label: "Roll No." },
    { key: "student_name", label: "Student Name" },
    { key: "father_name", label: "Father Name" },
    { key: "cnic", label: "CNIC" },
    { key: "department", label: "Department" },
    { key: "current_year", label: "Year" },
    { key: "current_semester", label: "Semester" },
    { key: "enrollment_year", label: "Enrollment Year" },
  ];

  // Transform data for table
  const rows = paginatedStudents.map((student) => ({
    ...student,
    student_name: student.student_name || "N/A",
    father_name: student.father_name || "N/A",
    roll_number: student.roll_number || "N/A",
    department: student.department || "N/A",
    current_year: student.current_year || "N/A",
    current_semester: student.current_semester || "N/A",
    enrollment_year: student.enrollment_year || "N/A",
    cnic: student.cnic || "N/A",
  }));

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-90px)] bg-white dark:bg-gray-900">
        <div className="w-16 h-16 border-4 border-yellow-400 border-dashed rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="sm:!px-[40px] md:!px-[80px] !px-5 !py-[20px] min-h-[calc(100vh-90px)] w-full bg-white dark:bg-gray-900 flex items-center justify-center"
        style={{
          backgroundImage: `url(${Background})`,
          backgroundSize: "cover",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center",
        }}
      >
        <div className="text-lg text-red-500 dark:text-red-400 text-center">
          {error}
        </div>
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
        <h1 className="text-2xl sm:text-3xl md:text-4xl !py-3 font-bold text-gray-900 dark:text-white">
          Enrolled Students
        </h1>

        <hr className="border-t-[3px] border-gray-900 dark:border-white mb-4" />

        {/* Search */}
        <div className="w-full flex justify-end overflow-hidden mb-2">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, roll no, CNIC, or department..."
            className="w-full sm:w-[300px] !px-2 !py-1 border-2 border-[#a5a5a5] outline-none bg-[#f9f9f9] text-[#2a2a2a] dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center w-full">
          {/* Department Filter - Only show for admin/superadmin */}
          {hasFullAccess && (
            <div className="relative flex-1 sm:w-60">
              <select
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
                className="w-full !px-4 !py-2 border-2 border-[#a5a5a5] bg-[#f9f9f9] dark:bg-gray-800 text-[#2a2a2a] dark:text-gray-100 focus:outline-none appearance-none cursor-pointer"
              >
                <option value="">All Departments</option>
                {departments.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                <svg
                  className="h-5 w-5 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>
            </div>
          )}

          {/* Year Filter */}
          <div className="relative flex-1 sm:w-40">
            <select
              value={yearFilter}
              onChange={(e) => setYearFilter(e.target.value)}
              className="w-full !px-4 !py-2 border-2 border-[#a5a5a5] bg-[#f9f9f9] dark:bg-gray-800 text-[#2a2a2a] dark:text-gray-100 focus:outline-none appearance-none cursor-pointer"
            >
              <option value="">All Years</option>
              {years.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
              <svg
                className="h-5 w-5 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>
          </div>

          {/* Semester Filter */}
          <div className="relative flex-1 sm:w-40">
            <select
              value={semesterFilter}
              onChange={(e) => setSemesterFilter(e.target.value)}
              className="w-full !px-4 !py-2 border-2 border-[#a5a5a5] bg-[#f9f9f9] dark:bg-gray-800 text-[#2a2a2a] dark:text-gray-100 focus:outline-none appearance-none cursor-pointer"
            >
              <option value="">All Semesters</option>
              {semesters.map((semester) => (
                <option key={semester} value={semester}>
                  {semester}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
              <svg
                className="h-5 w-5 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>
          </div>

          {/* Clear All Button */}
          {(query || departmentFilter || yearFilter || semesterFilter) && (
            <button
              onClick={() => {
                setQuery("");
                setDepartmentFilter("");
                setYearFilter("");
                setSemesterFilter("");
              }}
              className="!px-4 !py-2 cursor-pointer bg-red-500 hover:bg-red-600 text-white font-medium transition-colors duration-200 whitespace-nowrap"
            >
              Clear All
            </button>
          )}
        </div>

        <DataTable columns={columns} rows={rows} actions={[]} />

        {/* Pagination */}
        <div className="flex flex-col gap-5 sm:flex-row items-center justify-between mt-4">
          <span className="font-bold text-[1.3rem] text-gray-900 dark:text-white">
            Total Students: {filteredStudents.length}
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

export default EnrolledStudents;
