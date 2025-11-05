import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import DataTable from "../TableData";
import Pagination from "../Pagination";
import Background from "../../assets/Background.png";
import BackButton from "../BackButton";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function FormsByStatus({ heading }) {
  const navigate = useNavigate();

  const [forms, setForms] = useState([]);
  const [filteredForms, setFilteredForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingForm, setLoadingForm] = useState(false);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [updatingStatus, setUpdatingStatus] = useState({}); // Track which forms are being updated
  const pageSize = 10;
  const status = heading.split(" ")[0];
  localStorage.removeItem("reviewFormStep");

  const backendBaseUrl =
    import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

  /** ✅ Fetch All Admissions */
  const fetchAdmissions = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await axios.get(`${backendBaseUrl}/api/admissions`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      let fetchedData = Array.isArray(res.data.data) ? res.data.data : [];

      const uniqueForms = fetchedData.filter(
        (form, index, self) =>
          index ===
          self.findIndex(
            (f) => f.cnic === form.cnic && f.form_id === form.form_id
          )
      );

      setForms(uniqueForms);
    } catch (err) {
      console.error("❌ Error fetching admissions:", err);
      toast.error(
        err.response?.data?.message ||
          "Failed to fetch admissions. Please check your token or try again."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmissions();
  }, []);

  /** 🔍 Filter by status + search */
  useEffect(() => {
    let data = [...forms];

    if (status) {
      data = data.filter(
        (form) => form.status?.toLowerCase() === status.toLowerCase()
      );
    }

    if (query.trim() !== "") {
      const lowerQuery = query.toLowerCase();
      data = data.filter(
        (form) =>
          form.student_name?.toLowerCase().includes(lowerQuery) ||
          form.father_name?.toLowerCase().includes(lowerQuery) ||
          form.department?.toLowerCase().includes(lowerQuery) ||
          form.cnic?.toLowerCase().includes(lowerQuery)
      );
    }

    setFilteredForms(data);
    setPage(1);
  }, [forms, status, query]);

  /** ✅ Handle Status Change for All Forms */
  const handleSelectChange = async (formId, currentStatus, newStatus) => {
    // Don't update if the status is the same
    if (currentStatus === newStatus) {
      return;
    }

    try {
      setUpdatingStatus((prev) => ({ ...prev, [formId]: true }));

      const token = localStorage.getItem("token");

      // Update the status in the backend using your API endpoint
      await axios.patch(
        `${backendBaseUrl}/api/admissions/updateStatus/${formId}`,
        { status: newStatus },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      // Update forms array
      setForms((prevForms) =>
        prevForms.map((form) =>
          form.form_id === formId ? { ...form, status: newStatus } : form
        )
      );

      toast.success(`Status updated to ${newStatus} successfully!`);
    } catch (err) {
      console.error("❌ Error updating status:", err);
      toast.error(
        err.response?.data?.message ||
          "Failed to update status. Please try again."
      );
    } finally {
      setUpdatingStatus((prev) => ({ ...prev, [formId]: false }));
    }
  };

  /** 📌 Pagination */
  const startIndex = (page - 1) * pageSize;
  const paginatedForms = filteredForms.slice(startIndex, startIndex + pageSize);
  const pageCount = Math.ceil(filteredForms.length / pageSize);

  /** 🧱 Columns */
  const columns = [
    { key: "serialNo", label: "Serial No." },
    { key: "student_name", label: "Student's Name" },
    { key: "father_name", label: "Father's Name" },
    { key: "department", label: "Department" },
    { key: "cnic", label: "CNIC" },
    { key: "status", label: "Status" },
  ];

  const rows = paginatedForms.map((form, index) => ({
    ...form,
    serialNo: startIndex + index + 1,
  }));

  /** 🎯 Table Actions */
  const actions = [
    (() => {
      switch (status) {
        case "Approved":
          return {
            label: "Appeared Status",
            render: (row) => (
              <select
                className="border-2 border-gray-400 dark:border-gray-600 !px-2 !py-1 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm focus:outline-none"
                value={
                  row.status === "Appeared" || row.status === "Not Appeared"
                    ? row.status
                    : ""
                }
                onChange={(e) => {
                  if (e.target.value) {
                    handleSelectChange(row.form_id, row.status, e.target.value);
                  }
                }}
                disabled={updatingStatus[row.form_id]}
              >
                <option value="" disabled>
                  {updatingStatus[row.form_id]
                    ? "Updating..."
                    : "Select Status"}
                </option>
                <option value="Appeared">Appeared</option>
                <option value="Not Appeared">Not Appeared</option>
              </select>
            ),
          };

        case "Pending":
          return {
            label: "Review",
            onClick: async (row) => {
              try {
                setLoadingForm(true);
                const token = localStorage.getItem("token");
                const res = await axios.get(
                  `${backendBaseUrl}/api/admissions/${row.form_id}`,
                  { headers: { Authorization: `Bearer ${token}` } }
                );

                navigate(
                  `/SALU-PORTAL-FYP/Admissions/Pending/ReviewForm?${row.cnic}`,
                  { state: { form: res.data } }
                );
              } catch (err) {
                console.error("❌ Error fetching form:", err);
                toast.error("Failed to fetch form data. Please try again.");
              } finally {
                setLoadingForm(false);
              }
            },
            icon: (
              <button
                disabled={loadingForm}
                className="!px-4 !py-1 border border-yellow-500 text-yellow-500 hover:bg-yellow-500 hover:text-white transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loadingForm ? "Loading..." : "Review"}
              </button>
            ),
          };

        case "Appeared":
          return {
            label: "Add Test Marks",
            onClick: (row) => {
              navigate(
                `/SALU-PORTAL-FYP/Admissions/AppearedInTest/AddTestMarks?${row.cnic}`,
                { state: { form: row } }
              );
            },
            icon: (
              <button className="!px-4 !py-1 border border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white transition cursor-pointer">
                Add Test Marks
              </button>
            ),
          };

        case "Passed":
          return {
            label: "Select in Merit",
            onClick: (row) => {
              navigate(
                `/SALU-PORTAL-FYP/Admissions/PassedCandidates/SelectedInMeritList?${row.cnic}`,
                { state: { form: row } }
              );
            },
            icon: (
              <button className="!px-4 !py-1 border border-green-500 text-green-500 hover:bg-green-500 hover:text-white transition cursor-pointer">
                Select in Merit
              </button>
            ),
          };

        case "Selected":
          return {
            label: "Enrollment Status",
            render: (row) => (
              <select
                className="border-2 border-gray-400 dark:border-gray-600 !px-2 !py-1 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm focus:outline-none"
                value={
                  row.status === "Enrolled" || row.status === "Not Enrolled"
                    ? row.status
                    : ""
                }
                onChange={(e) => {
                  if (e.target.value) {
                    handleSelectChange(row.form_id, row.status, e.target.value);
                  }
                }}
                disabled={updatingStatus[row.form_id]}
              >
                <option value="" disabled>
                  {updatingStatus[row.form_id]
                    ? "Updating..."
                    : "Select Status"}
                </option>
                <option value="Enrolled">Enrolled</option>
                <option value="Not Enrolled">Not Enrolled</option>
              </select>
            ),
          };

        default:
          return null;
      }
    })(),
  ];

  /** ⏳ Loader */
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-90px)] bg-white dark:bg-gray-900">
        <div className="w-16 h-16 border-4 border-yellow-400 border-dashed rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div
      className="sm:!px-[40px] md:!px-[80px] !px-5 !py-[20px] min-h-[calc(100vh-90px)] w-full bg-white dark:bg-gray-900"
      style={{
        backgroundImage: `url(${Background})`,
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center",
      }}
    >
      {/* ✅ ToastContainer at top level */}
      <ToastContainer
        position="top-center"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />

      <div className="flex flex-col gap-3 w-full min-h-[80vh] bg-[#D5BBE0] rounded-md !p-5">
        <div className="flex justify-start items-center gap-3">
          <BackButton url={"/SALU-PORTAL-FYP/Admissions"} />
          <h1 className="text-2xl sm:text-3xl md:text-4xl !py-3 font-bold text-gray-900 dark:text-white">
            {heading} {heading.includes(" ") ? null : " Forms"}
          </h1>
        </div>

        <hr className="border-t-[3px] border-gray-900 dark:border-white mb-4" />

        {/* Search */}
        <div className="w-full flex justify-end overflow-hidden mb-2">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search forms..."
            className="w-full sm:w-[250px] !px-2 !py-1 border-2 border-[#a5a5a5] outline-none bg-[#f9f9f9] text-[#2a2a2a] dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 rounded"
          />
        </div>

        <DataTable columns={columns} rows={rows} actions={actions} />

        {/* Pagination */}
        <div className="flex flex-col gap-5 sm:flex-row items-center justify-between mt-4">
          <span className="font-bold text-[1.3rem] text-gray-900 dark:text-white">
            Total Forms: {filteredForms.length}
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
