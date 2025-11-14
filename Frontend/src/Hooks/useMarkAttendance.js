// src/Hooks/useMarkAttendance.js
import axios from "axios";
import { useState, useMemo } from "react";
import { toast } from "react-toastify";

export const useMarkAttendance = ({ initial = [], pageSize = 10 }) => {
  const [rows, setRows] = useState(initial);
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState({ key: "", dir: "" });
  const [page, setPage] = useState(1);
  const [attendance, setAttendance] = useState([]);

  const backendBaseUrl =
    import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

  const fetchEnrolledStudents = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await axios.get(`${backendBaseUrl}/api/admissions`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = res.data.data;

      const enrolledStudents = data.filter(
        (student) => student.status === "Enrolled"
      );
      setAttendance(...enrolledStudents);
      console.log(attendance);
    } catch (err) {
      console.error("❌ Error fetching admissions:", err);
      toast.error(
        err.response?.data?.message ||
          "Failed to fetch admissions. Please check your token or try again."
      );
    }
  };

  //fetchEnrolledStudents();

  // 🔹 Filter rows based on search query
  const filteredRows = useMemo(() => {
    if (!query) return rows;
    return rows.filter(
      (r) =>
        r.studentName.toLowerCase().includes(query.toLowerCase()) ||
        r.rollNo.toLowerCase().includes(query.toLowerCase())
    );
  }, [rows, query]);

  // 🔹 Sort rows
  const sortedRows = useMemo(() => {
    if (!sort.key) return filteredRows;
    return [...filteredRows].sort((a, b) => {
      const aVal = a[sort.key];
      const bVal = b[sort.key];
      if (typeof aVal === "string") {
        return sort.dir === "asc"
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }
      return sort.dir === "asc" ? aVal - bVal : bVal - aVal;
    });
  }, [filteredRows, sort]);

  // 🔹 Pagination
  const pageCount = Math.ceil(sortedRows.length / pageSize);
  const paginatedRows = useMemo(() => {
    const start = (page - 1) * pageSize;
    return sortedRows.slice(start, start + pageSize);
  }, [sortedRows, page, pageSize]);

  // 🔹 Sorting handler
  const onSort = (key) => {
    setSort((prev) => {
      if (prev.key === key) {
        return { key, dir: prev.dir === "asc" ? "desc" : "asc" };
      }
      return { key, dir: "asc" };
    });
  };

  return {
    rows: paginatedRows,
    query,
    setQuery,
    sort,
    onSort,
    page,
    setPage,
    pageCount,
  };
};
