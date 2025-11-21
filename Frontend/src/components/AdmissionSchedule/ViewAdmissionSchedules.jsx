import { useEffect, useState } from "react";
import axios from "axios";
import { FaEdit, FaTrash } from "react-icons/fa";
import DataTable from "../TableData";
import Pagination from "../../components/Pagination";
import Background from "./../../assets/Background.png";
import { useNavigate } from "react-router-dom";
import BackButton from "../BackButton";
import { toast } from "react-toastify";

export default function ViewAdmissionSchedules() {
  const [schedules, setSchedules] = useState([]);
  const [query, setQuery] = useState("");
  const [yearFilter, setYearFilter] = useState("");
  const [shiftFilter, setShiftFilter] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const pageSize = 10;
  const navigate = useNavigate();

  // Available shifts for filter
  const shifts = ["Morning", "Evening"];

  // ✅ Fetch admission schedules using Axios
  useEffect(() => {
    const fetchAdmissionSchedules = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        const API =
          import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
        const res = await axios.get(`${API}/api/admission-schedules`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log(res.data.data);
        const data = res.data.data;

        const mapedData = data.map((schedule, index) => ({
          ...schedule,
          serialno: index + 1,
          // Format dates for display
          start_date_display: formatDate(schedule.start_date),
          end_date_display: formatDate(schedule.end_date),
        }));
        setSchedules(mapedData);
      } catch (err) {
        console.error("Error fetching admission schedules:", err);
        toast.error("Error loading admission schedules: " + err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchAdmissionSchedules();
  }, []);

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // ✅ Filter schedules by search query, year, and shift
  const filteredSchedules = schedules.filter((schedule) => {
    const matchesSearch = [
      schedule.admission_year?.toString(),
      schedule.admission_form_fee?.toString(),
      schedule.shift,
      formatDate(schedule.start_date),
      formatDate(schedule.end_date),
    ]
      .join(" ")
      .toLowerCase()
      .includes(query.toLowerCase());

    const matchesYear =
      !yearFilter || schedule.admission_year?.toString() === yearFilter;
    const matchesShift = !shiftFilter || schedule.shift === shiftFilter;

    return matchesSearch && matchesYear && matchesShift;
  });

  // Get unique years for filter dropdown
  const uniqueYears = [
    ...new Set(schedules.map((schedule) => schedule.admission_year)),
  ].sort((a, b) => b - a);

  // ✅ Pagination logic
  const pageCount = Math.ceil(filteredSchedules.length / pageSize);
  const currentPageRows = filteredSchedules.slice(
    (page - 1) * pageSize,
    page * pageSize
  );

  const columns = [
    { key: "serialno", label: "Serial No" },
    { key: "admission_year", label: "Admission Year" },
    { key: "start_date_display", label: "Start Date" },
    { key: "end_date_display", label: "End Date" },
    { key: "admission_form_fee", label: "Form Fee" },
    { key: "shift", label: "Shift" },
  ];

  // ✅ Table actions
  const actions = [
    {
      label: "Edit",
      onClick: (row) => {
        navigate("/SALU-PORTAL-FYP/AdmissionSchedule/AddAdmissionSchedule", {
          state: { schedule: row },
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
            `Delete admission schedule for ${row.admission_year} (${row.shift})?`
          )
        )
          return;
        try {
          setLoading(true);
          const token = localStorage.getItem("token");
          const API =
            import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
          await axios.delete(`${API}/api/admission-schedules/${row.id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          setSchedules((prev) =>
            prev.filter((schedule) => schedule.id !== row.id)
          );
          toast.success("Admission schedule deleted successfully!");
        } catch (err) {
          console.error("Error deleting admission schedule:", err);
          toast.error("Error deleting admission schedule: " + err.message);
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
  }, [query, yearFilter, shiftFilter]);

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
      <div className="flex flex-col gap-3 w-full min-h-[80vh] bg-[#E9D8FD] rounded-md !p-5">
        <div className="flex justify-start items-center gap-3">
          <BackButton url="/SALU-PORTAL-FYP/AdmissionSchedule" />
          <h1 className="text-2xl sm:text-3xl md:text-4xl !py-3 font-bold text-gray-900 dark:text-white">
            Admission Schedules
          </h1>
        </div>

        <hr className="border-t-[3px] border-gray-900 dark:border-white mb-4" />

        {/* Search Input */}
        <div className="w-full flex justify-end mb-4">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by year, fee, shift, or dates..."
            className="w-full sm:w-80 !px-3 !py-2 border-2 border-[#a5a5a5] outline-none bg-[#f9f9f9] text-[#2a2a2a] dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
          />
        </div>

        {/* Filters Row */}
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between w-full">
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center w-full lg:w-auto">
            {/* Year Filter */}
            <div className="relative flex-1 sm:w-48">
              <select
                value={yearFilter}
                onChange={(e) => setYearFilter(e.target.value)}
                className="w-full !px-4 !py-2 border-2 border-[#a5a5a5] bg-[#f9f9f9] dark:bg-gray-800 text-[#2a2a2a] dark:text-gray-100 focus:outline-none appearance-none cursor-pointer"
              >
                <option value="">All Years</option>
                {uniqueYears.map((year) => (
                  <option key={year} value={year}>
                    {year}
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

            {/* Shift Filter */}
            <div className="relative flex-1 sm:w-48">
              <select
                value={shiftFilter}
                onChange={(e) => setShiftFilter(e.target.value)}
                className="w-full !px-4 !py-2 border-2 border-[#a5a5a5] bg-[#f9f9f9] dark:bg-gray-800 text-[#2a2a2a] dark:text-gray-100 focus:outline-none appearance-none cursor-pointer"
              >
                <option value="">All Shifts</option>
                {shifts.map((shift) => (
                  <option key={shift} value={shift}>
                    {shift}
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
          </div>

          {/* Clear All Button - Only show when filters are active */}
          {(query || yearFilter || shiftFilter) && (
            <button
              onClick={() => {
                setQuery("");
                setYearFilter("");
                setShiftFilter("");
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
            Total Schedules: {filteredSchedules.length}
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
