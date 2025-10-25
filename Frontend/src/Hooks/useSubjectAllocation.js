import { useState, useMemo } from "react";

// 🧩 Example data for demo/testing
export const initialAllocations = [
  {
    saId: "001",
    subName: "OOP",
    teacherName: "Dr. Shahid Mahar",
    department: "Computer Science",
    semester: "First",
    creditHours: "3+1",
    year: new Date().getFullYear(),
  },
  {
    saId: "002",
    subName: "I & CP",
    teacherName: "Yet to assign",
    department: "Computer Science",
    semester: "First",
    creditHours: "3",
    year: new Date().getFullYear(),
  },
  {
    saId: "003",
    subName: "E. W",
    teacherName: "Mr. Ahmed",
    department: "Computer Science",
    semester: "First",
    creditHours: "3",
    year: new Date().getFullYear(),
  },
  {
    saId: "004",
    subName: "B. E",
    teacherName: "Ms. Saima",
    department: "Computer Science",
    semester: "First",
    creditHours: "3",
    year: new Date().getFullYear(),
  },
  {
    saId: "005",
    subName: "M. C",
    teacherName: "Mr. Irfan Ali Memon",
    department: "Computer Science",
    semester: "First",
    creditHours: "3",
    year: new Date().getFullYear(),
  },
  {
    saId: "006",
    subName: "I. M",
    teacherName: "Mr. Rashid Ali Ghotto",
    department: "Computer Science",
    semester: "First",
    creditHours: "3",
    year: new Date().getFullYear(),
  },
  {
    saId: "007",
    subName: "DBS",
    teacherName: "Yet to assign",
    department: "Computer Science",
    semester: "Second",
    creditHours: "3+1",
    year: new Date().getFullYear(),
  },
  {
    saId: "008",
    subName: "O. S",
    teacherName: "Mr. Imran Mushtaque",
    department: "Computer Science",
    semester: "Second",
    creditHours: "3+1",
    year: new Date().getFullYear(),
  },
  {
    saId: "009",
    subName: "P & S",
    teacherName: "Yet to assign",
    department: "Computer Science",
    semester: "Second",
    creditHours: "3",
    year: new Date().getFullYear(),
  },
  {
    saId: "010",
    subName: "C. C & N",
    teacherName: "Mr. Shamsuddin",
    department: "Computer Science",
    semester: "Second",
    creditHours: "3",
    year: new Date().getFullYear(),
  },
  {
    saId: "011",
    subName: "I. S",
    teacherName: "Mr. Shamsuddin",
    department: "Computer Science",
    semester: "Second",
    creditHours: "3",
    year: new Date().getFullYear(),
  },
  {
    saId: "012",
    subName: "B. E",
    teacherName: "Mr. Irfan Ali Memon",
    department: "Computer Science",
    semester: "Third",
    creditHours: "3",
    year: new Date().getFullYear(),
  },
  {
    saId: "013",
    subName: "DAA",
    teacherName: "Dr. Shahid Mahar",
    department: "Computer Science",
    semester: "Third",
    creditHours: "3",
    year: new Date().getFullYear(),
  },
  {
    saId: "014",
    subName: "CC",
    teacherName: "Mr. Imran Mushtaque",
    department: "Computer Science",
    semester: "Third",
    creditHours: "3",
    year: new Date().getFullYear(),
  },
  {
    saId: "015",
    subName: "CA",
    teacherName: "Ms. Saima",
    department: "Computer Science",
    semester: "Third",
    creditHours: "3",
    year: new Date().getFullYear(),
  },
];

export default function useSubjectAllocation({ initial = [], pageSize = 10 }) {
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [sorts, setSorts] = useState([]); // [{ key, dir }]

  const filtered = useMemo(() => {
    let data = [...initial];

    // 🔎 Filter by search query
    if (query) {
      const lowerQuery = query.toLowerCase();
      data = data.filter((item) =>
        Object.values(item).join(" ").toLowerCase().includes(lowerQuery)
      );
    }

    // 🔄 Multi-column sorting
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
  }, [initial, query, sorts]);

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

  return { rows, page, pageCount, setPage, query, setQuery, sorts, onSort };
}
