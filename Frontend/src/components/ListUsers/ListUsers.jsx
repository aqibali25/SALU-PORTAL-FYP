import { useEffect, useState } from "react";
import axios from "axios";
import { FaEdit, FaTrash } from "react-icons/fa";
import DataTable from "../TableData";
import Pagination from "../../components/Pagination";
import Background from "./../../assets/Background.png";
import { useNavigate } from "react-router-dom";
import BackButton from "../BackButton";
import { useDepartments } from "../../Hooks/HomeCards";
import { toast } from "react-toastify";

export default function ListUsers() {
  const [users, setUsers] = useState([]);
  const [query, setQuery] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const pageSize = 10;
  const navigate = useNavigate();

  const {
    departmentsArray,
    loading: departmentsLoading,
    error: departmentsError,
  } = useDepartments();

  // Departments including additional ones
  const departments = [
    ...departmentsArray,
    "Admin",
    "Examination",
    "Library",
    "Super Admin",
  ];

  // ✅ Fetch users using Axios
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        const API =
          import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
        const res = await axios.get(`${API}/api/users`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        // Map backend roles to frontend format
        const mapRoleToFrontend = (backendRole = "") => {
          const roleMap = {
            "super admin": "Super Admin",
            admin: "Admin",
            "examination officer": "Examination Officer",
            hod: "HOD",
            "focal person admin": "Focal Person Admin",
            "focal person teacher": "Focal Person Teacher",
            teacher: "Teacher",
            "transport incharge": "Transport Incharge",
            librarian: "Librarian",
            clerk: "Clerk",
            peon: "Peon",
          };

          const normalizedRole = backendRole.toLowerCase();
          return roleMap[normalizedRole] || backendRole;
        };

        const data = res.data.map((user, index) => ({
          ...user,
          role: mapRoleToFrontend(user.role),
          serialno: index + 1,
        }));
        setUsers(data);
      } catch (err) {
        console.error(err);
        toast.error("Error loading users: " + err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  // ✅ Filter users by search query and department
  const filteredUsers = users.filter((u) => {
    const matchesSearch = [u.username, u.cnic, u.role, u.department]
      .join(" ")
      .toLowerCase()
      .includes(query.toLowerCase());

    const matchesDepartment =
      !departmentFilter || u.department === departmentFilter;

    return matchesSearch && matchesDepartment;
  });

  // ✅ Pagination logic
  const pageCount = Math.ceil(filteredUsers.length / pageSize);
  const currentPageRows = filteredUsers.slice(
    (page - 1) * pageSize,
    page * pageSize
  );

  const columns = [
    { key: "serialno", label: "Serial No" },
    { key: "username", label: "Username" },
    { key: "cnic", label: "User CNIC" },
    { key: "role", label: "User Role" },
    { key: "department", label: "Department" },
  ];

  // ✅ Table actions
  const actions = [
    {
      label: "Edit",
      onClick: (row) => {
        // ✅ Correct navigation URL for update
        navigate(`/SALU-PORTAL-FYP/UpdateUser/${row.cnic}`, {
          state: { user: row },
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
        if (!window.confirm(`Delete user ${row.username}?`)) return;
        try {
          setLoading(true);
          const token = localStorage.getItem("token");
          const API =
            import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
          await axios.delete(`${API}/api/users/${row.id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          setUsers((prev) => prev.filter((u) => u.id !== row.id));
          toast.success("User deleted successfully!");
        } catch (err) {
          console.error(err);
          toast.error("Error deleting user: " + err.message);
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
  }, [query, departmentFilter]);

  // Show error toast if departments fail to load
  useEffect(() => {
    if (departmentsError) {
      toast.error("Failed to load departments. Using default list.");
    }
  }, [departmentsError]);

  if (loading || departmentsLoading) {
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
            Users List
          </h1>
        </div>

        <hr className="border-t-[3px] border-gray-900 dark:border-white mb-4" />

        {/* Search Input */}
        <div className="w-full flex justify-end mb-4">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search users by name, CNIC, role, or department..."
            className="w-full sm:w-80 !px-3 !py-2 border-2 border-[#a5a5a5] outline-none bg-[#f9f9f9] text-[#2a2a2a] dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
          />
        </div>

        {/* Department Filter with Clear Button */}
        <div className="flex gap-3 items-center w-full sm:w-fit">
          {/* Department Dropdown Container */}
          <div className="relative flex-1 lg:w-80">
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
            {/* Dropdown Arrow */}
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

          {/* Clear All Button - Only show when filters are active */}
          {(query || departmentFilter) && (
            <button
              onClick={() => {
                setQuery("");
                setDepartmentFilter("");
              }}
              className="!px-4 !py-2 cursor-pointer bg-red-500 hover:bg-red-600 text-white font-medium transition-colors duration-200 whitespace-nowrap"
            >
              Clear All
            </button>
          )}
        </div>

        {/* Table */}
        <DataTable columns={columns} rows={currentPageRows} actions={actions} />

        <div className="flex flex-col gap-5 sm:flex-row items-center justify-between mt-4">
          <span className="font-bold text-[1.3rem] text-gray-900 dark:text-white">
            Total Users : {filteredUsers.length}
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
