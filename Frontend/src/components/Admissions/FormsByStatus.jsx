import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import DataTable from "../TableData";
import Pagination from "../Pagination";
import Background from "../../assets/Background.png";
import BackButton from "../BackButton";

export default function FormsByStatus({ status = "" }) {
  const navigate = useNavigate();

  const [forms, setForms] = useState([]);
  const [filteredForms, setFilteredForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingForm, setLoadingForm] = useState(false);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  // Fetch all admissions
  useEffect(() => {
    const fetchAdmissions = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");

        console.log("🔄 Fetching admissions from backend...");

        const res = await axios.get("http://localhost:5000/api/admissions", {
          headers: { Authorization: `Bearer ${token}` },
        });

        console.log("✅ Raw Admissions Data:", res.data);

        let fetchedData = Array.isArray(res.data.data) ? res.data.data : [];

        const uniqueForms = fetchedData.filter(
          (form, index, self) =>
            index ===
            self.findIndex(
              (f) => f.cnic === form.cnic && f.form_id === form.form_id
            )
        );

        console.log(
          `🧾 Total fetched: ${fetchedData.length}, Unique: ${uniqueForms.length}`
        );

        setForms(uniqueForms);
      } catch (err) {
        console.error("❌ Error fetching admissions:", err);
        alert(
          err.response?.data?.message ||
            "Failed to fetch admissions. Please check your token or try again."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchAdmissions();
  }, []);

  // Filter by status and search query
  useEffect(() => {
    let data = [...forms];

    if (status && status.trim() !== "") {
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

  // Pagination logic
  const startIndex = (page - 1) * pageSize;
  const paginatedForms = filteredForms.slice(startIndex, startIndex + pageSize);
  const pageCount = Math.ceil(filteredForms.length / pageSize);

  // Columns
  const columns = [
    { key: "serialNo", label: "Serial No." },
    { key: "student_name", label: "Student's Name" },
    { key: "father_name", label: "Father's Name" },
    { key: "department", label: "Department" },
    { key: "cnic", label: "CNIC" },
  ];

  if (!status || status.trim() === "") {
    columns.push({ key: "status", label: "Status" });
  }

  // Add serial numbers
  const rows = paginatedForms.map((form, index) => ({
    ...form,
    serialNo: startIndex + index + 1,
  }));

  // Actions
  const actions = [
    {
      label: "View",
      onClick: async (row) => {
        try {
          setLoadingForm(true);
          const token = localStorage.getItem("token");
          const res = await axios.get(
            `http://localhost:5000/api/admissions/${row.form_id}`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );

          const formData = res.data;

          localStorage.removeItem("reviewFormStep");

          navigate(
            `/SALU-PORTAL-FYP/Admissions/RecivedForms/ReviewForm?${row.cnic}`,
            { state: { form: formData } }
          );
        } catch (err) {
          console.error("❌ Error fetching form by CNIC:", err);
          alert(
            err.response?.data?.message ||
              "Failed to fetch form data. Please try again."
          );
        } finally {
          setLoadingForm(false);
        }
      },
      icon: (
        <button
          disabled={loadingForm}
          className="!px-4 !py-1 border border-yellow-500 text-yellow-500 hover:bg-yellow-500 hover:text-white transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loadingForm ? "Loading..." : "View"}
        </button>
      ),
    },
  ];

  const heading = `${
    status && status.trim() !== "" ? status : "Received"
  } Forms`;

  // Main loader
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
            {heading}
          </h1>
        </div>

        <hr className="border-t-[3px] border-gray-900 dark:border-white mb-4" />

        {/* Search */}
        <div className="w-full flex justify-end overflow-hidden">
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
