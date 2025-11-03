import { useState, useMemo, useEffect } from "react";
import axios from "axios";

export default function useSubjectAllocation({ pageSize = 10 }) {
  const [subjects, setSubjects] = useState([]);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [sorts, setSorts] = useState([]); // [{ key, dir }]
  const [loading, setLoading] = useState(true);

  const API = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

  // ✅ Fetch both subject allocations and subjects from backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");

        // Fetch both subject allocations and subjects in parallel
        const [allocationsRes, subjectsRes] = await Promise.all([
          axios.get(`${API}/api/subject-allocations`, {
            headers: { Authorization: `Bearer ${token}` },
            withCredentials: true,
          }),
          axios.get(`${API}/api/subjects`, {
            headers: { Authorization: `Bearer ${token}` },
            withCredentials: true,
          }),
        ]);

        console.log("Subject Allocations:", allocationsRes.data.data);
        console.log("Subjects:", subjectsRes.data.data);

        // Create a map of subjectId/subjectName to teacherName from allocations
        const allocationMap = new Map();
        (allocationsRes.data.data || []).forEach((allocation) => {
          if (allocation.subjectId && allocation.teacherName) {
            allocationMap.set(allocation.subjectId, allocation.teacherName);
          }
          // Also map by subject name as fallback
          if (allocation.subName && allocation.teacherName) {
            allocationMap.set(allocation.subName, allocation.teacherName);
          }
          if (allocation.subjectName && allocation.teacherName) {
            allocationMap.set(allocation.subjectName, allocation.teacherName);
          }
        });

        // Process subjects data and combine with allocations
        const subjectsData = subjectsRes.data.data || subjectsRes.data || [];
        const allocationsData = allocationsRes.data.data || [];

        // Create a set of subjects that are already allocated to avoid duplicates
        const allocatedSubjectIds = new Set();
        (allocationsData || []).forEach((allocation) => {
          if (allocation.subjectId)
            allocatedSubjectIds.add(allocation.subjectId);
          if (allocation.subName) allocatedSubjectIds.add(allocation.subName);
          if (allocation.subjectName)
            allocatedSubjectIds.add(allocation.subjectName);
        });

        // Transform allocations data
        const allocationsTransformed = (allocationsData || []).map(
          (allocation, index) => ({
            saId: allocation.saId || allocation.subjectId || `alloc-${index}`,
            subName:
              allocation.subName || allocation.subjectName || "Unknown Subject",
            teacherName: allocation.teacherName || "Yet to assign",
            department: allocation.department,
            semester: allocation.semester,
            creditHours: allocation.creditHours,
            year: allocation.year,
            createdAt: allocation.createdAt,
            updatedAt: allocation.updatedAt,
            source: "allocation",
          })
        );

        // Transform subjects data that are not already in allocations
        const subjectsTransformed = subjectsData
          .filter((subject) => {
            const subjectId = subject.subjectId || subject._id;
            const subjectName = subject.subjectName || subject.name;
            return (
              !allocatedSubjectIds.has(subjectId) &&
              !allocatedSubjectIds.has(subjectName)
            );
          })
          .map((subject, index) => {
            // Check if this subject has an allocation
            const teacherName =
              allocationMap.get(subject.subjectId) ||
              allocationMap.get(subject.subjectName) ||
              allocationMap.get(subject.name) ||
              subject.teacherName ||
              "Yet to assign";

            return {
              saId: subject.subjectId || subject._id || `sub-${index}`,
              subName: subject.subjectName || subject.name || "Unknown Subject",
              teacherName: teacherName,
              department: subject.department,
              semester: subject.semester,
              creditHours: subject.creditHours,
              year: subject.year,
              createdAt: subject.createdAt,
              updatedAt: subject.updatedAt,
              source: "subject",
            };
          });

        // Combine both arrays
        const combinedData = [
          ...allocationsTransformed,
          ...subjectsTransformed,
        ];

        console.log("Combined Data:", combinedData);
        setSubjects(combinedData);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
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
