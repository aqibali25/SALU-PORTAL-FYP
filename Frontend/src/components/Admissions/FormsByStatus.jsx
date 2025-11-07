import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import DataTable from "../TableData";
import Pagination from "../Pagination";
import Background from "../../assets/Background.png";
import BackButton from "../BackButton";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Cookies from "js-cookie";

export default function FormsByStatus({ heading }) {
  const navigate = useNavigate();

  const [forms, setForms] = useState([]);
  const [filteredForms, setFilteredForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingForm, setLoadingForm] = useState(false);
  const [query, setQuery] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("");
  const [page, setPage] = useState(1);
  const [updatingStatus, setUpdatingStatus] = useState({});
  const pageSize = 10;
  const status = heading.split(" ")[0];
  localStorage.removeItem("reviewFormStep");
  const role = Cookies.get("role")?.toLowerCase();
  const [candidate, setCandidate] = useState(null);

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

  // ✅ Fetch candidate on mount
  useEffect(() => {
    document.title = `SALU Portal | Select Merit List`;

    const fetchCandidate = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(
          `http://localhost:5000/api/admissions/enrolled/list`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setCandidate(res.data.data);
      } catch (err) {
        console.error("Error fetching candidate:", err);
        toast.error("Failed to fetch candidate data!", {
          position: "top-center",
        });
      }
    };

    fetchCandidate();
  }, []);

  useEffect(() => {
    fetchAdmissions();
  }, []);

  /** 🔍 Apply all filters including department switching */
  const getFilteredAndSwitchedForms = () => {
    let data = [...forms];

    // Filter by status
    if (status) {
      data = data.filter(
        (form) => form.status?.toLowerCase() === status.toLowerCase()
      );
    }

    // Filter by search query
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

    // Switch departments first
    const formsWithSwitchedDepartments = data.map((form) => {
      const matchingCandidate = candidate?.find((c) => c.cnic === form.cnic);
      const department = matchingCandidate?.department || form.department;
      return {
        ...form,
        department: department,
      };
    });

    // Then apply department filter
    if (departmentFilter.trim() !== "") {
      return formsWithSwitchedDepartments.filter(
        (form) =>
          form.department?.toLowerCase() === departmentFilter.toLowerCase()
      );
    }

    return formsWithSwitchedDepartments;
  };

  // Update filteredForms when any filter changes
  useEffect(() => {
    const filteredData = getFilteredAndSwitchedForms();
    setFilteredForms(filteredData);
    setPage(1);
  }, [forms, status, query, departmentFilter, candidate]);

  /** ✅ Handle Status Change for All Forms */
  const handleSelectChange = async (formId, currentStatus, newStatus) => {
    if (currentStatus === newStatus) {
      return;
    }

    try {
      setUpdatingStatus((prev) => ({ ...prev, [formId]: true }));

      const token = localStorage.getItem("token");

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
    { key: "roll_no", label: "Roll No." },
    { key: "student_name", label: "Student's Name" },
    { key: "father_name", label: "Father's Name" },
    { key: "department", label: "Department" },
    { key: "cnic", label: "CNIC" },
    { key: "status", label: "Status" },
  ];

  // Just sort and add serial numbers (all filtering is already done)
  const rows = paginatedForms
    .sort((a, b) => a.student_name?.localeCompare(b.student_name))
    .map((form, index) => ({
      ...form,
      roll_no: form.roll_no || "Yet to Assign",
      serialNo: startIndex + index + 1, // Proper sequential numbers per page
    }));

  const generateRollNumbers = async () => {
    try {
      // Check if ANY form doesn't have roll number
      const hasFormsWithoutRollNumbers = filteredForms.some(
        (form) =>
          !form.roll_no ||
          form.roll_no === "Yet to Assign" ||
          form.roll_no === ""
      );

      // If ALL forms already have roll numbers, show error and return
      if (!hasFormsWithoutRollNumbers) {
        toast.error("All students already have roll numbers assigned!");
        return;
      }

      const currentYear = new Date().getFullYear().toString().slice(-2);
      const year = Number(currentYear) + 1;

      const getDepartmentCode = (dept) => {
        switch (dept) {
          case "English Linguistics and Literature":
            return "BSENG";
          case "Computer Science":
            return "BSCS";
          case "Business Administration":
            return "BBA";
          default:
            return dept;
        }
      };

      // Create counters for each department
      const departmentCounters = {};

      // ✅ FIXED: Generate roll numbers for ALL forms (not just the ones without roll numbers)
      const formsToUpdate = filteredForms
        .sort((a, b) => a.student_name?.localeCompare(b.student_name))
        .map((form) => {
          const departmentCode = getDepartmentCode(form.department);

          if (!departmentCounters[departmentCode]) {
            departmentCounters[departmentCode] = 1;
          }

          const rollNumber = `GC${year}-${departmentCode}-${String(
            departmentCounters[departmentCode]
          ).padStart(2, "0")}`;

          departmentCounters[departmentCode]++;

          return {
            ...form,
            roll_no: rollNumber, // Generate new roll number for EVERY form
          };
        });

      console.log("All forms with new roll numbers:", formsToUpdate);

      // Send roll numbers to backend for ALL forms
      const token = localStorage.getItem("token");
      const promises = formsToUpdate.map(async (form) => {
        try {
          const res = await axios.put(
            `${backendBaseUrl}/api/admissions/assignRollNo/${form.form_id}`,
            { roll_no: form.roll_no },
            {
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            }
          );
          return {
            success: true,
            form_id: form.form_id,
            roll_no: form.roll_no,
            assigned: true,
          };
        } catch (error) {
          console.error(
            `❌ Error Assigning roll number for form ${form.form_id}:`,
            error
          );
          return {
            success: false,
            form_id: form.form_id,
            error: error.response?.data?.message || error.message,
          };
        }
      });

      const results = await Promise.all(promises);
      const successful = results.filter((r) => r && r.success);
      const failed = results.filter((r) => r && !r.success);

      if (failed.length > 0) {
        toast.error(`Failed to assign roll numbers for ${failed.length} forms`);
        console.error(
          "Failed forms:",
          failed.map((f) => f.form_id)
        );
      } else {
        toast.success(
          `Successfully assigned roll numbers to ${successful.length} students!`
        );
      }

      setTimeout(() => {
        fetchAdmissions();
      }, 2000);
    } catch (error) {
      console.error("❌ Error in generateRollNumbers:", error);
      toast.error("Failed to generate roll numbers. Please try again.");
    }
  };
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

        case "Revert":
          if (role === "admin" || role === "superadmin") {
            return {
              label: "Back to Pending",
              render: (row) => (
                <button
                  disabled={updatingStatus[row.form_id]}
                  className="!px-4 !py-1 border border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={async () => {
                    try {
                      setUpdatingStatus((prev) => ({
                        ...prev,
                        [row.form_id]: true,
                      }));

                      const token = localStorage.getItem("token");
                      await axios.patch(
                        `${backendBaseUrl}/api/admissions/updateStatus/${row.form_id}`,
                        {
                          status: "Pending",
                          remarks: "Form moved back to pending from revert",
                        },
                        {
                          headers: { Authorization: `Bearer ${token}` },
                        }
                      );

                      toast.success("Form moved back to pending successfully!");

                      // Add delay before refreshing data
                      setTimeout(() => {
                        fetchAdmissions();
                      }, 1500); // 1.5 second delay
                    } catch (err) {
                      console.error("Error moving form to pending:", err);
                      toast.error("Failed to move form to pending");
                    } finally {
                      setUpdatingStatus((prev) => ({
                        ...prev,
                        [row.form_id]: false,
                      }));
                    }
                  }}
                >
                  {updatingStatus[row.form_id]
                    ? "Updating..."
                    : "Back to Pending"}
                </button>
              ),
            };
          }
          // Return null or empty object for non-admin users
          return null;

        case "Trash":
          if (role === "admin" || role === "superadmin") {
            return {
              label: "Back to Pending",
              render: (row) => (
                <button
                  disabled={updatingStatus[row.form_id]}
                  className="!px-4 !py-1 border border-purple-500 text-purple-500 hover:bg-purple-500 hover:text-white transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={async () => {
                    try {
                      setUpdatingStatus((prev) => ({
                        ...prev,
                        [row.form_id]: true,
                      }));

                      const token = localStorage.getItem("token");
                      await axios.patch(
                        `${backendBaseUrl}/api/admissions/updateStatus/${row.form_id}`,
                        {
                          status: "Pending",
                          remarks: "Form moved back to pending from trash",
                        },
                        {
                          headers: { Authorization: `Bearer ${token}` },
                        }
                      );

                      toast.success("Form moved back to pending successfully!");

                      // Add delay before refreshing data
                      setTimeout(() => {
                        fetchAdmissions();
                      }, 1500); // 1.5 second delay
                    } catch (err) {
                      console.error("Error moving form to pending:", err);
                      toast.error("Failed to move form to pending");
                    } finally {
                      setUpdatingStatus((prev) => ({
                        ...prev,
                        [row.form_id]: false,
                      }));
                    }
                  }}
                >
                  {updatingStatus[row.form_id]
                    ? "Updating..."
                    : "Back to Pending"}
                </button>
              ),
            };
          }
          return null;
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
        style={{ zIndex: 9999 }}
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
            className="w-full sm:w-[250px] !px-2 !py-1 border-2 border-[#a5a5a5] outline-none bg-[#f9f9f9] text-[#2a2a2a] dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
          />
        </div>

        {/* Department Filter */}
        <div className="relative sm:w-75">
          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            className="w-full !px-4 !py-1 border-2 border-[#a5a5a5] bg-[#f9f9f9] dark:bg-gray-800 text-[#2a2a2a] dark:text-gray-100 focus:outline-none appearance-none cursor-pointer"
          >
            <option value="">All Departments</option>
            <option value="computer science">Computer Science</option>
            <option value="business administration">
              Business Administration
            </option>
            <option value="english linguistics and literature">
              English linguistics and literature
            </option>
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center !pr-2 pointer-events-none">
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

        <DataTable columns={columns} rows={rows} actions={actions} />

        {/* Pagination */}
        <div className="flex flex-col gap-5 sm:flex-row items-center justify-between mt-4">
          <span className="font-bold text-[1.3rem] text-gray-900 dark:text-white">
            Total Forms: {rows.length} {/* Show filtered count */}
          </span>
          {heading === "Enrolled Candidates" && (
            <button
              type="button"
              onClick={generateRollNumbers}
              className="cursor-pointer relative overflow-hidden !px-[20px] !py-[5px] border-2 border-[#e5b300] text-white  hover:dark:text-white text-[0.8rem] font-medium bg-transparent transition-all duration-300 ease-linear
                     before:content-[''] before:absolute before:inset-x-0 before:bottom-0 before:h-full before:bg-[#e5b300] before:transition-all before:duration-300 before:ease-linear hover:before:h-0 disabled:opacity-6"
            >
              <span className="relative z-10">Assign Roll No.</span>
            </button>
          )}
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
