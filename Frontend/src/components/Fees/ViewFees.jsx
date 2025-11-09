import { useEffect, useState } from "react";
import axios from "axios";
import { FaEdit, FaTrash, FaEye } from "react-icons/fa";
import DataTable from "../TableData";
import Pagination from "../../components/Pagination";
import Background from "./../../assets/Background.png";
import { useNavigate } from "react-router-dom";
import BackButton from "../BackButton";
import { useDepartments } from "../../Hooks/HomeCards";
import { toast } from "react-toastify";

export default function ViewFees() {
  const [fees, setFees] = useState([]);
  const [query, setQuery] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("");
  const [yearFilter, setYearFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const pageSize = 10;
  const navigate = useNavigate();

  // Get user role from localStorage or cookies
  const getUserRole = () => {
    // Try to get from localStorage first
    try {
      const userData = localStorage.getItem("user");
      if (userData) {
        const user = JSON.parse(userData);
        return user.role || "";
      }
    } catch (error) {
      console.error("Error parsing user data from localStorage:", error);
    }

    // Fallback to cookies
    const roleFromCookie = document.cookie
      .split("; ")
      .find((row) => row.startsWith("role="))
      ?.split("=")[1];

    return roleFromCookie || "";
  };

  const userRole = getUserRole();
  const isAdmin =
    userRole.toLowerCase() === "admin" ||
    userRole.toLowerCase() === "super admin";

  const {
    departmentsArray,
    loading: departmentsLoading,
    error: departmentsError,
  } = useDepartments();

  // Year options
  const yearOptions = ["1st Year", "2nd Year", "3rd Year", "4th Year"];

  // Status options
  const statusOptions = ["Partial Pay", "Full Pay"];

  //   // ✅ Fetch fees using Axios
  //   useEffect(() => {
  //     const fetchFees = async () => {
  //       try {
  //         setLoading(true);
  //         const token = localStorage.getItem("token");
  //         const API =
  //           import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
  //         const res = await axios.get(`${API}/api/fees`, {
  //           headers: { Authorization: `Bearer ${token}` },
  //         });

  //         const data = res.data.map((fee, index) => ({
  //           ...fee,
  //         }));
  //         setFees(data);
  //       } catch (err) {
  //         console.error(err);
  //         toast.error("Error loading fees: " + err.message);
  //       } finally {
  //         setLoading(false);
  //       }
  //     };
  //     fetchFees();
  //   }, []);

  // ✅ Filter fees by search query and filters
  const filteredFees = fees.filter((fee) => {
    const matchesSearch = [
      fee.cnic,
      fee.challan_no,
      fee.amount,
      fee.year,
      fee.status,
      fee.department,
    ]
      .join(" ")
      .toLowerCase()
      .includes(query.toLowerCase());

    const matchesDepartment =
      !departmentFilter || fee.department === departmentFilter;

    const matchesYear = !yearFilter || fee.year === yearFilter;

    const matchesStatus = !statusFilter || fee.status === statusFilter;

    return matchesSearch && matchesDepartment && matchesYear && matchesStatus;
  });

  // ✅ Pagination logic
  const pageCount = Math.ceil(filteredFees.length / pageSize);
  const currentPageRows = filteredFees.slice(
    (page - 1) * pageSize,
    page * pageSize
  );

  const columns = [
    { key: "challan_no", label: "Challan No" },
    { key: "cnic", label: "CNIC" },
    { key: "department", label: "Department" },
    { key: "year", label: "Year" },
    { key: "amount", label: "Amount" },
    { key: "status", label: "Status" },
    { key: "paid_date", label: "Paid Date" },
  ];

  // ✅ Table actions - Only show if user is admin
  const actions = isAdmin
    ? [
        {
          label: "Edit",
          onClick: (row) => {
            navigate(`/SALU-PORTAL-FYP/UpdateFee/${row.fee_id}`, {
              state: { fee: row },
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
            if (
              !window.confirm(
                `Delete fee record for challan no ${row.challan_no}?`
              )
            )
              return;
            try {
              setLoading(true);
              const token = localStorage.getItem("token");
              const API =
                import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
              await axios.delete(`${API}/api/fees/${row.fee_id}`, {
                headers: { Authorization: `Bearer ${token}` },
              });
              setFees((prev) =>
                prev.filter((fee) => fee.fee_id !== row.fee_id)
              );
              toast.success("Fee record deleted successfully!");
            } catch (err) {
              console.error(err);
              toast.error("Error deleting fee record: " + err.message);
            } finally {
              setLoading(false);
            }
          },
          icon: (
            <FaTrash size={20} className="text-red-500 hover:text-red-600" />
          ),
        },
      ]
    : [
        // View only action for non-admin users
        {
          label: "View",
          onClick: (row) => {
            // Navigate to view details page or show modal
            navigate(`/SALU-PORTAL-FYP/ViewFee/${row.fee_id}`, {
              state: { fee: row },
            });
          },
          icon: (
            <FaEye
              size={20}
              className="cursor-pointer text-blue-600 hover:text-blue-700"
            />
          ),
        },
      ];

  // Reset to page 1 when filters change
  useEffect(() => {
    setPage(1);
  }, [query, departmentFilter, yearFilter, statusFilter]);

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
          <BackButton url={"/SALU-PORTAL-FYP/Fees"} />
          <h1 className="text-2xl sm:text-3xl md:text-4xl !py-3 font-bold text-gray-900 dark:text-white">
            Fees List
          </h1>
        </div>

        <hr className="border-t-[3px] border-gray-900 dark:border-white mb-4" />

        {/* Search Input */}
        <div className="w-full flex justify-end mb-4">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search fees by CNIC, challan no, amount, year, status, or department..."
            className="w-full sm:w-80 !px-3 !py-2 border-2 border-[#a5a5a5] outline-none bg-[#f9f9f9] text-[#2a2a2a] dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
          />
        </div>

        {/* Filter Section */}
        <div className="flex flex-col sm:flex-row gap-3 items-start lg:items-center w-full">
          {/* Department Filter */}
          <div className="relative w-full flex-1 sm:w-64">
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="w-full !px-4 !py-2 border-2 border-[#a5a5a5] bg-[#f9f9f9] dark:bg-gray-800 text-[#2a2a2a] dark:text-gray-100 focus:outline-none appearance-none cursor-pointer"
            >
              <option value="">All Departments</option>
              {departmentsArray.map((dept) => (
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

          {/* Year Filter */}
          <div className="relative w-full flex-1 sm:w-48">
            <select
              value={yearFilter}
              onChange={(e) => setYearFilter(e.target.value)}
              className="w-full !px-4 !py-2 border-2 border-[#a5a5a5] bg-[#f9f9f9] dark:bg-gray-800 text-[#2a2a2a] dark:text-gray-100 focus:outline-none appearance-none cursor-pointer"
            >
              <option value="">All Years</option>
              {yearOptions.map((year) => (
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

          {/* Status Filter */}
          <div className="relative w-full flex-1 sm:w-48">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full !px-4 !py-2 border-2 border-[#a5a5a5] bg-[#f9f9f9] dark:bg-gray-800 text-[#2a2a2a] dark:text-gray-100 focus:outline-none appearance-none cursor-pointer"
            >
              <option value="">All Status</option>
              {statusOptions.map((status) => (
                <option key={status} value={status}>
                  {status}
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

          {/* Clear All Button - Only show when filters are active */}
          {(query || departmentFilter || yearFilter || statusFilter) && (
            <button
              onClick={() => {
                setQuery("");
                setDepartmentFilter("");
                setYearFilter("");
                setStatusFilter("");
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
            Total Fees Records : {filteredFees.length}
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
