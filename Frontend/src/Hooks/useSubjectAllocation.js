import { useState, useMemo, useEffect } from "react";
import axios from "axios";

export default function useSubjectAllocation({ pageSize = 10 }) {
  const [subjects, setSubjects] = useState([]);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  // Get user department
  const userString = localStorage.getItem("user");
  const user = userString ? JSON.parse(userString) : null;
  const userDepartment = user?.department || "";
  const isSuperAdmin = userDepartment === "Super Admin";

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
        const allocationsTransformed = (allocationsData || [])
          .filter(
            (allocation) =>
              isSuperAdmin || allocation.department === userDepartment
          )
          .map((allocation, index) => ({
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
          }));

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
          .filter(
            (subject) => isSuperAdmin || subject.department === userDepartment
          )
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
              semester: subject.semester || "N/A",
              creditHours: subject.creditHours,
              year: subject.year || "N/A",
              createdAt: subject.createdAt,
              updatedAt: subject.updatedAt,
              source: "subject",
            };
          });

        // Combine both arrays and sort by saId in descending order
        const combinedData = [
          ...allocationsTransformed,
          ...subjectsTransformed,
        ].sort((a, b) => a.saId.toString().localeCompare(b.saId.toString()));

        setSubjects(combinedData);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isSuperAdmin, userDepartment]);

  // ✅ Filter only (no sorting on header click)
  const filtered = useMemo(() => {
    let data = [...subjects];

    if (query) {
      const lower = query.toLowerCase();
      data = data.filter((item) =>
        Object.values(item).join(" ").toLowerCase().includes(lower)
      );
    }

    return data;
  }, [subjects, query]);

  const pageCount = Math.ceil(filtered.length / pageSize) || 1;
  const rows = filtered.slice((page - 1) * pageSize, page * pageSize);

  return {
    loading,
    rows,
    page,
    pageCount,
    setPage,
    query,
    setQuery,
  };
}
