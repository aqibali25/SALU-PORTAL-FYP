// src/Hooks/useMarkAttendance.js
import { useState, useMemo } from "react";

export const useMarkAttendance = ({ initial = [], pageSize = 10 }) => {
  const [rows, setRows] = useState(initial);
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState({ key: "", dir: "" });
  const [page, setPage] = useState(1);

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

export const initialAttendance = [
  {
    rollNo: "BSCS-001",
    studentName: "Ali Raza",
    attendance: [
      "Present",
      "Absent",
      "Present",
      "Present",
      "Absent",
      "Present",
      "Present",
      "Present",
      "Absent",
      "Present",
      "Present",
      "Absent",
      "Present",
      "Present",
      "Present",
      "Absent",
      "Present",
      "Present",
      "Present",
      "Present",
      "Absent",
      "Present",
      "Absent",
      "Present",
      "Present",
      "Present",
      "Absent",
      "Present",
      "Present",
      "Absent",
    ],
    get percentage() {
      return (
        (this.attendance.filter((d) => d === "Present").length /
          this.attendance.length) *
        100
      ).toFixed(1);
    },
  },
  {
    rollNo: "BSCS-002",
    studentName: "Aqib Ali",
    attendance: [
      "Present",
      "Present",
      "Absent",
      "Absent",
      "Present",
      "Present",
      "Absent",
      "Present",
      "Present",
      "Absent",
      "Present",
      "Absent",
      "Present",
      "Absent",
      "Present",
      "Present",
      "Present",
      "Absent",
      "Absent",
      "Present",
      "Present",
      "Absent",
      "Present",
      "Present",
      "Present",
      "Present",
      "Absent",
      "Present",
      "Present",
      "Absent",
    ],
    get percentage() {
      return (
        (this.attendance.filter((d) => d === "Present").length /
          this.attendance.length) *
        100
      ).toFixed(1);
    },
  },
  {
    rollNo: "BSCS-003",
    studentName: "Hassan Ahmed",
    attendance: [
      "Present",
      "Present",
      "Present",
      "Present",
      "Absent",
      "Present",
      "Present",
      "Absent",
      "Absent",
      "Present",
      "Absent",
      "Present",
      "Present",
      "Absent",
      "Present",
      "Present",
      "Absent",
      "Absent",
      "Present",
      "Present",
      "Present",
      "Absent",
      "Present",
      "Absent",
      "Present",
      "Present",
      "Absent",
      "Present",
      "Absent",
      "Present",
    ],
    get percentage() {
      return (
        (this.attendance.filter((d) => d === "Present").length /
          this.attendance.length) *
        100
      ).toFixed(1);
    },
  },
  {
    rollNo: "BSCS-004",
    studentName: "Bilal Khan",
    attendance: [
      "Present",
      "Absent",
      "Absent",
      "Present",
      "Absent",
      "Present",
      "Absent",
      "Present",
      "Present",
      "Absent",
      "Present",
      "Absent",
      "Absent",
      "Present",
      "Present",
      "Present",
      "Absent",
      "Present",
      "Absent",
      "Present",
      "Present",
      "Absent",
      "Present",
      "Absent",
      "Present",
      "Absent",
      "Present",
      "Present",
      "Absent",
      "Present",
    ],
    get percentage() {
      return (
        (this.attendance.filter((d) => d === "Present").length /
          this.attendance.length) *
        100
      ).toFixed(1);
    },
  },
  {
    rollNo: "BSCS-005",
    studentName: "Zain Shah",
    attendance: [
      "Present",
      "Present",
      "Absent",
      "Present",
      "Present",
      "Absent",
      "Present",
      "Absent",
      "Present",
      "Absent",
      "Present",
      "Present",
      "Absent",
      "Absent",
      "Present",
      "Present",
      "Present",
      "Present",
      "Absent",
      "Present",
      "Absent",
      "Present",
      "Present",
      "Present",
      "Absent",
      "Absent",
      "Present",
      "Absent",
      "Present",
      "Present",
    ],
    get percentage() {
      return (
        (this.attendance.filter((d) => d === "Present").length /
          this.attendance.length) *
        100
      ).toFixed(1);
    },
  },
  {
    rollNo: "BSCS-006",
    studentName: "Umair Sheikh",
    attendance: [
      "Present",
      "Present",
      "Absent",
      "Present",
      "Present",
      "Absent",
      "Absent",
      "Present",
      "Present",
      "Present",
      "Present",
      "Absent",
      "Absent",
      "Present",
      "Present",
      "Absent",
      "Present",
      "Present",
      "Present",
      "Present",
      "Present",
      "Absent",
      "Present",
      "Present",
      "Absent",
      "Absent",
      "Present",
      "Absent",
      "Present",
      "Absent",
    ],
    get percentage() {
      return (
        (this.attendance.filter((d) => d === "Present").length /
          this.attendance.length) *
        100
      ).toFixed(1);
    },
  },
  {
    rollNo: "BSCS-007",
    studentName: "Sana Tariq",
    attendance: [
      "Present",
      "Absent",
      "Present",
      "Present",
      "Present",
      "Absent",
      "Absent",
      "Present",
      "Present",
      "Present",
      "Absent",
      "Present",
      "Absent",
      "Present",
      "Absent",
      "Present",
      "Present",
      "Present",
      "Present",
      "Absent",
      "Absent",
      "Present",
      "Absent",
      "Present",
      "Present",
      "Present",
      "Present",
      "Absent",
      "Absent",
      "Present",
    ],
    get percentage() {
      return (
        (this.attendance.filter((d) => d === "Present").length /
          this.attendance.length) *
        100
      ).toFixed(1);
    },
  },
  {
    rollNo: "BSCS-008",
    studentName: "Fatima Noor",
    attendance: [
      "Absent",
      "Absent",
      "Present",
      "Present",
      "Present",
      "Present",
      "Present",
      "Absent",
      "Present",
      "Absent",
      "Absent",
      "Present",
      "Present",
      "Present",
      "Absent",
      "Present",
      "Present",
      "Absent",
      "Present",
      "Absent",
      "Present",
      "Present",
      "Present",
      "Absent",
      "Absent",
      "Present",
      "Present",
      "Present",
      "Absent",
      "Present",
    ],
    get percentage() {
      return (
        (this.attendance.filter((d) => d === "Present").length /
          this.attendance.length) *
        100
      ).toFixed(1);
    },
  },
  {
    rollNo: "BSCS-009",
    studentName: "Hamza Yousuf",
    attendance: [
      "Present",
      "Present",
      "Absent",
      "Absent",
      "Present",
      "Present",
      "Present",
      "Present",
      "Absent",
      "Present",
      "Present",
      "Absent",
      "Absent",
      "Present",
      "Present",
      "Present",
      "Present",
      "Present",
      "Absent",
      "Absent",
      "Present",
      "Present",
      "Absent",
      "Present",
      "Absent",
      "Present",
      "Present",
      "Present",
      "Present",
      "Absent",
    ],
    get percentage() {
      return (
        (this.attendance.filter((d) => d === "Present").length /
          this.attendance.length) *
        100
      ).toFixed(1);
    },
  },
  {
    rollNo: "BSCS-010",
    studentName: "Ayesha Khan",
    attendance: [
      "Absent",
      "Present",
      "Absent",
      "Present",
      "Present",
      "Absent",
      "Present",
      "Absent",
      "Present",
      "Absent",
      "Present",
      "Present",
      "Absent",
      "Present",
      "Present",
      "Absent",
      "Present",
      "Absent",
      "Present",
      "Present",
      "Present",
      "Absent",
      "Present",
      "Absent",
      "Present",
      "Absent",
      "Present",
      "Present",
      "Present",
      "Present",
    ],
    get percentage() {
      return (
        (this.attendance.filter((d) => d === "Present").length /
          this.attendance.length) *
        100
      ).toFixed(1);
    },
  },
  // 🟢 Remaining 20 students (BSCS-011 to BSCS-030)
  {
    rollNo: "BSCS-011",
    studentName: "Ahmed Ali",
    attendance: [
      "Present",
      "Present",
      "Present",
      "Absent",
      "Absent",
      "Present",
      "Absent",
      "Present",
      "Absent",
      "Present",
      "Present",
      "Present",
      "Absent",
      "Absent",
      "Present",
      "Present",
      "Absent",
      "Present",
      "Absent",
      "Present",
      "Absent",
      "Present",
      "Present",
      "Absent",
      "Absent",
      "Present",
      "Present",
      "Present",
      "Present",
      "Absent",
    ],
    get percentage() {
      return (
        (this.attendance.filter((d) => d === "Present").length /
          this.attendance.length) *
        100
      ).toFixed(1);
    },
  },
  {
    rollNo: "BSCS-012",
    studentName: "Maria Iqbal",
    attendance: [
      "Absent",
      "Present",
      "Present",
      "Absent",
      "Present",
      "Absent",
      "Present",
      "Present",
      "Present",
      "Absent",
      "Present",
      "Absent",
      "Present",
      "Present",
      "Present",
      "Absent",
      "Absent",
      "Present",
      "Present",
      "Present",
      "Absent",
      "Present",
      "Present",
      "Absent",
      "Absent",
      "Present",
      "Absent",
      "Present",
      "Absent",
      "Present",
    ],
    get percentage() {
      return (
        (this.attendance.filter((d) => d === "Present").length /
          this.attendance.length) *
        100
      ).toFixed(1);
    },
  },
  {
    rollNo: "BSCS-013",
    studentName: "Shahid Mehmood",
    attendance: [
      "Present",
      "Absent",
      "Absent",
      "Present",
      "Absent",
      "Absent",
      "Present",
      "Present",
      "Absent",
      "Present",
      "Present",
      "Absent",
      "Present",
      "Absent",
      "Present",
      "Absent",
      "Present",
      "Absent",
      "Present",
      "Present",
      "Present",
      "Present",
      "Absent",
      "Present",
      "Present",
      "Absent",
      "Present",
      "Present",
      "Absent",
      "Present",
    ],
    get percentage() {
      return (
        (this.attendance.filter((d) => d === "Present").length /
          this.attendance.length) *
        100
      ).toFixed(1);
    },
  },
  {
    rollNo: "BSCS-014",
    studentName: "Eman Fatima",
    attendance: [
      "Absent",
      "Present",
      "Absent",
      "Present",
      "Present",
      "Present",
      "Absent",
      "Absent",
      "Present",
      "Absent",
      "Present",
      "Present",
      "Absent",
      "Present",
      "Present",
      "Absent",
      "Absent",
      "Present",
      "Absent",
      "Present",
      "Present",
      "Absent",
      "Present",
      "Present",
      "Absent",
      "Present",
      "Absent",
      "Present",
      "Present",
      "Absent",
    ],
    get percentage() {
      return (
        (this.attendance.filter((d) => d === "Present").length /
          this.attendance.length) *
        100
      ).toFixed(1);
    },
  },
  {
    rollNo: "BSCS-015",
    studentName: "Noor Ahmed",
    attendance: [
      "Present",
      "Present",
      "Present",
      "Absent",
      "Present",
      "Absent",
      "Present",
      "Absent",
      "Present",
      "Absent",
      "Present",
      "Present",
      "Absent",
      "Absent",
      "Present",
      "Present",
      "Present",
      "Absent",
      "Present",
      "Absent",
      "Present",
      "Absent",
      "Present",
      "Present",
      "Present",
      "Absent",
      "Absent",
      "Present",
      "Present",
      "Absent",
    ],
    get percentage() {
      return (
        (this.attendance.filter((d) => d === "Present").length /
          this.attendance.length) *
        100
      ).toFixed(1);
    },
  },
  {
    rollNo: "BSCS-016",
    studentName: "Ibrahim Khan",
    attendance: [
      "Present",
      "Absent",
      "Absent",
      "Present",
      "Present",
      "Absent",
      "Absent",
      "Present",
      "Absent",
      "Present",
      "Present",
      "Present",
      "Absent",
      "Present",
      "Absent",
      "Present",
      "Absent",
      "Present",
      "Absent",
      "Present",
      "Absent",
      "Present",
      "Present",
      "Absent",
      "Present",
      "Absent",
      "Present",
      "Absent",
      "Present",
      "Present",
    ],
    get percentage() {
      return (
        (this.attendance.filter((d) => d === "Present").length /
          this.attendance.length) *
        100
      ).toFixed(1);
    },
  },
  {
    rollNo: "BSCS-017",
    studentName: "Rida Hasan",
    attendance: [
      "Present",
      "Absent",
      "Present",
      "Absent",
      "Absent",
      "Present",
      "Absent",
      "Present",
      "Absent",
      "Absent",
      "Present",
      "Present",
      "Absent",
      "Absent",
      "Present",
      "Present",
      "Absent",
      "Present",
      "Absent",
      "Present",
      "Present",
      "Absent",
      "Absent",
      "Present",
      "Absent",
      "Present",
      "Present",
      "Absent",
      "Present",
      "Present",
    ],
    get percentage() {
      return (
        (this.attendance.filter((d) => d === "Present").length /
          this.attendance.length) *
        100
      ).toFixed(1);
    },
  },
  {
    rollNo: "BSCS-018",
    studentName: "Hassan Raza",
    attendance: [
      "Present",
      "Present",
      "Absent",
      "Present",
      "Absent",
      "Present",
      "Absent",
      "Present",
      "Absent",
      "Present",
      "Absent",
      "Present",
      "Absent",
      "Present",
      "Absent",
      "Absent",
      "Present",
      "Absent",
      "Present",
      "Absent",
      "Present",
      "Absent",
      "Present",
      "Present",
      "Present",
      "Absent",
      "Absent",
      "Present",
      "Absent",
      "Present",
    ],
    get percentage() {
      return (
        (this.attendance.filter((d) => d === "Present").length /
          this.attendance.length) *
        100
      ).toFixed(1);
    },
  },
  {
    rollNo: "BSCS-019",
    studentName: "Sara Naveed",
    attendance: [
      "Absent",
      "Present",
      "Absent",
      "Absent",
      "Present",
      "Absent",
      "Present",
      "Absent",
      "Present",
      "Absent",
      "Absent",
      "Present",
      "Absent",
      "Present",
      "Absent",
      "Present",
      "Present",
      "Absent",
      "Present",
      "Absent",
      "Present",
      "Absent",
      "Absent",
      "Present",
      "Present",
      "Absent",
      "Present",
      "Present",
      "Absent",
      "Absent",
    ],
    get percentage() {
      return (
        (this.attendance.filter((d) => d === "Present").length /
          this.attendance.length) *
        100
      ).toFixed(1);
    },
  },
  {
    rollNo: "BSCS-020",
    studentName: "Kamran Ali",
    attendance: [
      "Present",
      "Absent",
      "Absent",
      "Present",
      "Absent",
      "Present",
      "Absent",
      "Present",
      "Absent",
      "Present",
      "Present",
      "Present",
      "Absent",
      "Absent",
      "Present",
      "Absent",
      "Present",
      "Absent",
      "Present",
      "Absent",
      "Present",
      "Present",
      "Present",
      "Absent",
      "Present",
      "Absent",
      "Absent",
      "Present",
      "Absent",
      "Present",
    ],
    get percentage() {
      return (
        (this.attendance.filter((d) => d === "Present").length /
          this.attendance.length) *
        100
      ).toFixed(1);
    },
  },
  {
    rollNo: "BSCS-021",
    studentName: "Hina Fatima",
    attendance: [
      "Present",
      "Present",
      "Present",
      "Absent",
      "Absent",
      "Present",
      "Absent",
      "Absent",
      "Present",
      "Present",
      "Present",
      "Absent",
      "Present",
      "Absent",
      "Absent",
      "Present",
      "Absent",
      "Present",
      "Absent",
      "Present",
      "Absent",
      "Present",
      "Absent",
      "Present",
      "Present",
      "Absent",
      "Absent",
      "Present",
      "Present",
      "Absent",
    ],
    get percentage() {
      return (
        (this.attendance.filter((d) => d === "Present").length /
          this.attendance.length) *
        100
      ).toFixed(1);
    },
  },
  {
    rollNo: "BSCS-022",
    studentName: "Owais Sheikh",
    attendance: [
      "Absent",
      "Present",
      "Absent",
      "Absent",
      "Present",
      "Absent",
      "Absent",
      "Present",
      "Present",
      "Present",
      "Absent",
      "Absent",
      "Present",
      "Absent",
      "Present",
      "Absent",
      "Present",
      "Absent",
      "Present",
      "Present",
      "Absent",
      "Absent",
      "Present",
      "Absent",
      "Absent",
      "Present",
      "Present",
      "Present",
      "Absent",
      "Present",
    ],
    get percentage() {
      return (
        (this.attendance.filter((d) => d === "Present").length /
          this.attendance.length) *
        100
      ).toFixed(1);
    },
  },
  {
    rollNo: "BSCS-023",
    studentName: "Mahnoor Tariq",
    attendance: [
      "Absent",
      "Absent",
      "Present",
      "Present",
      "Absent",
      "Absent",
      "Present",
      "Present",
      "Absent",
      "Absent",
      "Present",
      "Absent",
      "Absent",
      "Present",
      "Present",
      "Absent",
      "Absent",
      "Present",
      "Present",
      "Absent",
      "Present",
      "Absent",
      "Absent",
      "Present",
      "Present",
      "Absent",
      "Present",
      "Absent",
      "Absent",
      "Present",
    ],
    get percentage() {
      return (
        (this.attendance.filter((d) => d === "Present").length /
          this.attendance.length) *
        100
      ).toFixed(1);
    },
  },
  {
    rollNo: "BSCS-024",
    studentName: "Adeel Rehman",
    attendance: [
      "Present",
      "Present",
      "Absent",
      "Absent",
      "Present",
      "Absent",
      "Absent",
      "Present",
      "Present",
      "Absent",
      "Absent",
      "Present",
      "Absent",
      "Absent",
      "Present",
      "Absent",
      "Absent",
      "Present",
      "Absent",
      "Present",
      "Present",
      "Absent",
      "Present",
      "Absent",
      "Absent",
      "Present",
      "Absent",
      "Absent",
      "Present",
      "Absent",
    ],
    get percentage() {
      return (
        (this.attendance.filter((d) => d === "Present").length /
          this.attendance.length) *
        100
      ).toFixed(1);
    },
  },
  {
    rollNo: "BSCS-025",
    studentName: "Fizza Imran",
    attendance: [
      "Absent",
      "Present",
      "Absent",
      "Absent",
      "Present",
      "Absent",
      "Absent",
      "Present",
      "Absent",
      "Absent",
      "Present",
      "Absent",
      "Absent",
      "Present",
      "Absent",
      "Present",
      "Absent",
      "Absent",
      "Present",
      "Absent",
      "Absent",
      "Present",
      "Present",
      "Absent",
      "Absent",
      "Present",
      "Absent",
      "Absent",
      "Present",
      "Absent",
    ],
    get percentage() {
      return (
        (this.attendance.filter((d) => d === "Present").length /
          this.attendance.length) *
        100
      ).toFixed(1);
    },
  },
  {
    rollNo: "BSCS-026",
    studentName: "Shahzaib Khan",
    attendance: [
      "Absent",
      "Absent",
      "Absent",
      "Absent",
      "Present",
      "Absent",
      "Present",
      "Absent",
      "Leave",
      "Present",
      "Absent",
      "Absent",
      "Absent",
      "Present",
      "Absent",
      "Absent",
      "Leave",
      "Present",
      "Absent",
      "Absent",
      "Present",
      "Absent",
      "Absent",
      "Absent",
      "Present",
      "Absent",
      "Absent",
      "Present",
      "Absent",
      "Absent",
    ],
    get percentage() {
      return (
        (this.attendance.filter((d) => d === "Present").length /
          this.attendance.length) *
        100
      ).toFixed(1);
    },
  },
  {
    rollNo: "BSCS-027",
    studentName: "Khadija Noor",
    attendance: [
      "Absent",
      "Absent",
      "Absent",
      "Present",
      "Absent",
      "Absent",
      "Absent",
      "Present",
      "Leave",
      "Absent",
      "Present",
      "Absent",
      "Absent",
      "Absent",
      "Present",
      "Absent",
      "Leave",
      "Absent",
      "Absent",
      "Present",
      "Absent",
      "Absent",
      "Present",
      "Absent",
      "Absent",
      "Absent",
      "Present",
      "Absent",
      "Absent",
      "Absent",
    ],
    get percentage() {
      return (
        (this.attendance.filter((d) => d === "Present").length /
          this.attendance.length) *
        100
      ).toFixed(1);
    },
  },
  {
    rollNo: "BSCS-028",
    studentName: "Imran Qureshi",
    attendance: [
      "Absent",
      "Absent",
      "Absent",
      "Absent",
      "Absent",
      "Present",
      "Absent",
      "Absent",
      "Absent",
      "Absent",
      "Absent",
      "Present",
      "Leave",
      "Absent",
      "Absent",
      "Absent",
      "Absent",
      "Absent",
      "Leave",
      "Absent",
      "Absent",
      "Absent",
      "Absent",
      "Absent",
      "Absent",
      "Absent",
      "Absent",
      "Present",
      "Absent",
      "Absent",
    ],
    get percentage() {
      return (
        (this.attendance.filter((d) => d === "Present").length /
          this.attendance.length) *
        100
      ).toFixed(1);
    },
  },
  {
    rollNo: "BSCS-029",
    studentName: "Nimra Aslam",
    attendance: [
      "Absent",
      "Absent",
      "Absent",
      "Present",
      "Absent",
      "Absent",
      "Absent",
      "Absent",
      "Absent",
      "Present",
      "Absent",
      "Absent",
      "Absent",
      "Leave",
      "Present",
      "Absent",
      "Absent",
      "Absent",
      "Present",
      "Absent",
      "Absent",
      "Absent",
      "Absent",
      "Absent",
      "Present",
      "Absent",
      "Absent",
      "Absent",
      "Present",
      "Leave",
    ],
    get percentage() {
      return (
        (this.attendance.filter((d) => d === "Present").length /
          this.attendance.length) *
        100
      ).toFixed(1);
    },
  },
  {
    rollNo: "BSCS-030",
    studentName: "Faizan Malik",
    attendance: [
      "Absent",
      "Absent",
      "Absent",
      "Absent",
      "Absent",
      "Absent",
      "Present",
      "Absent",
      "Absent",
      "Absent",
      "Absent",
      "Absent",
      "Absent",
      "Present",
      "Absent",
      "Absent",
      "Absent",
      "Absent",
      "Absent",
      "Present",
      "Absent",
      "Absent",
      "Absent",
      "Present",
      "Absent",
      "Absent",
      "Absent",
      "Absent",
      "Present",
      "Absent",
    ],
    get percentage() {
      return (
        (this.attendance.filter((d) => d === "Present").length /
          this.attendance.length) *
        100
      ).toFixed(1);
    },
  },
];
