import { useState, useMemo, useEffect } from "react";
import axios from "axios";

export default function useSubjectAllocation({ pageSize = 10 }) {
  const [subjects, setSubjects] = useState([]);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [sorts, setSorts] = useState([]); // [{ key, dir }]
  const [loading, setLoading] = useState(true);

  const API = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

  // ✅ Fetch subjects from backend
  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");

        const res = await axios.get(`${API}/api/subjects`, {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        });
        console.log(res.data);
        // Add teacherName if missing
        const withTeacher = (res.data.data || []).map((sub, index) => ({
          saId: sub.subjectId, // auto-generate allocation ID
          subName: sub.subjectName,
          teacherName: sub.teacherName || "Yet to assign",
          department: sub.department,
          semester: sub.semester,
          creditHours: sub.creditHours,
          year: sub.year,
        }));

        setSubjects(withTeacher);
      } catch (error) {
        console.error("Error fetching subjects:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSubjects();
  }, []);

  // ✅ Filter + Sort
  const filtered = useMemo(() => {
    let data = [...subjects];

    if (query) {
      const lower = query.toLowerCase();
      data = data.filter((item) =>
        Object.values(item).join(" ").toLowerCase().includes(lower)
      );
    }

    if (sorts.length > 0) {
      data.sort((a, b) => {
        for (const { key, dir } of sorts) {
          const valA = a[key]?.toString().toLowerCase() ?? "";
          const valB = b[key]?.toString().toLowerCase() ?? "";
          if (valA < valB) return dir === "asc" ? -1 : 1;
          if (valA > valB) return dir === "asc" ? 1 : -1;
        }
        return 0;
      });
    }

    return data;
  }, [subjects, query, sorts]);

  const pageCount = Math.ceil(filtered.length / pageSize) || 1;
  const rows = filtered.slice((page - 1) * pageSize, page * pageSize);

  const onSort = (key, multi = false) => {
    setSorts((prev) => {
      const existing = prev.find((s) => s.key === key);
      if (existing) {
        if (existing.dir === "asc") {
          return prev.map((s) => (s.key === key ? { ...s, dir: "desc" } : s));
        } else {
          return prev.filter((s) => s.key !== key);
        }
      }
      const newSort = { key, dir: "asc" };
      return multi ? [...prev, newSort] : [newSort];
    });
  };

  return {
    loading,
    rows,
    page,
    pageCount,
    setPage,
    query,
    setQuery,
    sorts,
    onSort,
  };
}
