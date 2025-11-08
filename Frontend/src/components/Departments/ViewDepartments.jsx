import { useEffect, useState } from "react";
import axios from "axios";
import { FaEdit, FaTrash } from "react-icons/fa";
import DataTable from "../TableData";
import Pagination from "../../components/Pagination";
import Background from "./../../assets/Background.png";
import { useNavigate } from "react-router-dom";
import BackButton from "../BackButton";
import { toast } from "react-toastify";

export default function ViewDepartment() {
  const [departments, setDepartments] = useState([]);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const pageSize = 10;
  const navigate = useNavigate();

  const API = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

  // ✅ Fetch departments from backend
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");

        const res = await axios.get(`${API}/api/departments`, {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        });

        if (res.data.success) {
          const allDepartments = res.data.data || [];
          setDepartments(allDepartments);
        } else {
          throw new Error(res.data.message || "Failed to fetch departments");
        }
      } catch (err) {
        console.error(err);
        toast.error("Error loading departments: " + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDepartments();
  }, [API]);

  // ✅ Filter departments by search query
  const filteredDepartments = departments
    .filter((dept) =>
      [
        dept.departmentName,
        dept.departmentId?.toString(), // Use departmentId instead of _id
      ]
        .join(" ")
        .toLowerCase()
        .includes(query.toLowerCase())
    )
    .sort((a, b) => a.departmentName.localeCompare(b.departmentName));

  // ✅ Pagination logic
  const pageCount = Math.ceil(filteredDepartments.length / pageSize);
  const currentPageRows = filteredDepartments.slice(
    (page - 1) * pageSize,
    page * pageSize
  );

  // ✅ Columns for department table - using departmentId instead of id
  const columns = [
    { key: "departmentId", label: "ID" },
    { key: "departmentName", label: "Department Name" },
  ];

  // ✅ Table actions (Edit & Delete)
  const actions = [
    {
      label: "Edit",
      onClick: (row) => {
        navigate(
          `/SALU-PORTAL-FYP/Departments/UpdateDepartment/${row.departmentId}`,
          {
            state: {
              department: {
                departmentId: row.departmentId,
                departmentName: row.departmentName,
              },
            },
          }
        );
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
        if (!window.confirm(`Delete department "${row.departmentName}"?`))
          return;
        try {
          setLoading(true);
          const token = localStorage.getItem("token");

          const response = await axios.delete(
            `${API}/api/departments/${row.departmentId}`,
            {
              headers: { Authorization: `Bearer ${token}` },
              withCredentials: true,
            }
          );

          if (response.data.success) {
            setDepartments((prev) =>
              prev.filter((dept) => dept.departmentId !== row.departmentId)
            );
            toast.success("Department deleted successfully!");
          } else {
            throw new Error(
              response.data.message || "Failed to delete department"
            );
          }
        } catch (err) {
          console.error(err);
          const errorMessage = err.response?.data?.message || err.message;
          toast.error("Error deleting department: " + errorMessage);
        } finally {
          setLoading(false);
        }
      },
      icon: <FaTrash size={20} className="text-red-500 hover:text-red-600" />,
    },
  ];

  // Reset to page 1 when filters change
  useEffect(() => {
    setPage(1);
  }, [query]);

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
        <div className="flex items-center gap-3">
          <BackButton url={"/SALU-PORTAL-FYP/Departments"} />
          <h1 className="text-2xl sm:text-3xl md:text-4xl !py-3 font-bold text-gray-900 dark:text-white">
            Departments List
          </h1>
        </div>

        <hr className="border-t-[3px] border-gray-900 dark:border-white mb-4" />

        {/* Search Input */}
        <div className="w-full flex justify-end lg:w-auto">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search departments by name or ID..."
            className="w-full lg:w-80 !px-3 !py-2 border-2 border-[#a5a5a5] outline-none bg-[#f9f9f9] text-[#2a2a2a] dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
          />
        </div>

        {/* Clear Search Button */}
        {query && (
          <div className="flex justify-end mb-4">
            <button
              onClick={() => setQuery("")}
              className="!px-4 !py-2 bg-red-500 hover:bg-red-600 text-white font-medium transition-colors duration-200 cursor-pointer"
            >
              Clear Search
            </button>
          </div>
        )}

        {/* Table */}

        <DataTable columns={columns} rows={currentPageRows} actions={actions} />

        {/* Pagination */}
        {filteredDepartments.length > 0 && (
          <div className="flex flex-col gap-5 sm:flex-row items-center justify-between mt-4">
            <span className="font-bold text-[1.3rem] text-gray-900 dark:text-white">
              Total Departments : {filteredDepartments.length}
            </span>
            <Pagination
              totalPages={pageCount}
              currentPage={page}
              onPageChange={setPage}
            />
          </div>
        )}
      </div>
    </div>
  );
}
