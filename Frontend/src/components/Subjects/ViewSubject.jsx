import { useEffect, useState } from "react";
import axios from "axios";
import { FaEdit, FaTrash } from "react-icons/fa";
import DataTable from "../TableData";
import Pagination from "../../components/Pagination";
import Background from "./../../assets/Background.png";
import { useNavigate } from "react-router-dom";
import BackButton from "../BackButton";

export default function ViewSubject() {
  const [subjects, setSubjects] = useState([]);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const pageSize = 10;
  const navigate = useNavigate();

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

        // res.data.data because backend sends { success, total, data }
        setSubjects(res.data.data || []);
      } catch (err) {
        console.error(err);
        alert("Error loading subjects: " + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSubjects();
  }, []);

  // ✅ Filter subjects by search query
  const filteredSubjects = subjects.filter((s) =>
    [
      s.subjectId,
      s.subjectName,
      s.subjectType,
      s.department,
      s.semester,
      s.creditHours,
      s.year,
    ]
      .join(" ")
      .toLowerCase()
      .includes(query.toLowerCase())
  );

  // ✅ Pagination logic
  const pageCount = Math.ceil(filteredSubjects.length / pageSize);
  const currentPageRows = filteredSubjects.slice(
    (page - 1) * pageSize,
    page * pageSize
  );

  // ✅ Columns for subject table
  const columns = [
    { key: "subjectId", label: "Subject ID" },
    { key: "subjectName", label: "Subject Name" },
    { key: "subjectType", label: "Subject Type" },
    { key: "department", label: "Department" },
    { key: "semester", label: "Semester" },
    { key: "creditHours", label: "Credit Hours" },
    { key: "year", label: "Year" },
  ];

  // ✅ Table actions (Edit & Delete)
  const actions = [
    {
      label: "Edit",
      onClick: (row) => {
        navigate(`/SALU-PORTAL-FYP/Subjects/UpdateSubject/${row.subjectId}`, {
          state: { subject: row },
        });
      },
      icon: (
        <FaEdit
          size={20}
          className="cursor-pointer text-green-600 hover:text-green-700"
        />
      ),
    },
    {
      label: "Delete",
      onClick: async (row) => {
        if (!window.confirm(`Delete subject "${row.subjectName}"?`)) return;
        try {
          setLoading(true);
          const token = localStorage.getItem("token");

          await axios.delete(`${API}/api/subjects/${row.subjectId}`, {
            headers: { Authorization: `Bearer ${token}` },
            withCredentials: true,
          });

          setSubjects((prev) =>
            prev.filter((s) => s.subjectId !== row.subjectId)
          );
        } catch (err) {
          console.error(err);
          alert("Error deleting subject: " + err.message);
        } finally {
          setLoading(false);
        }
      },
      icon: <FaTrash size={20} className="text-red-500 hover:text-red-600" />,
    },
  ];

  // ✅ Loader
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-90px)] bg-white dark:bg-gray-900">
        <div className="w-16 h-16 border-4 border-yellow-400 border-dashed rounded-full animate-spin"></div>
      </div>
    );
  }

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
          <BackButton />
          <h1 className="text-2xl sm:text-3xl md:text-4xl !py-3 font-bold text-gray-900 dark:text-white">
            Subjects List
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
            placeholder="Search subjects..."
            className="max-w-[100%] !px-2 !py-1 border-2 border-[#a5a5a5] outline-none bg-[#f9f9f9] text-[#2a2a2a] dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
          />
        </div>

        {/* Table */}
        <DataTable columns={columns} rows={currentPageRows} actions={actions} />

        {/* Pagination */}
        <div className="flex flex-col gap-5 sm:flex-row items-center justify-between mt-4">
          <span className="font-bold text-[1.3rem] text-gray-900 dark:text-white">
            Total Subjects : {filteredSubjects.length}
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
