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
import { useDepartments } from "../../Hooks/HomeCards";

export default function FormsByStatus({ heading }) {
  const navigate = useNavigate();
  const {
    departmentsArray,
    loading: departmentsLoading,
    error: departmentsError,
  } = useDepartments();
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
          `${backendBaseUrl}/api/admissions/enrolled/list`,
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

  /** 🧱 Columns - Dynamic based on status */
  const getColumns = () => {
    const baseColumns = [
      { key: "serialNo", label: "Serial No." },
      { key: "student_name", label: "Student's Name" },
      { key: "father_name", label: "Father's Name" },
      { key: "department", label: "Department" },
      { key: "cnic", label: "CNIC" },
      { key: "status", label: "Status" },
    ];

    // Add roll number columns based on status
    if (
      status === "Approved" ||
      status === "Appeared" ||
      status === "Passed" ||
      status === "Selected"
    ) {
      baseColumns.splice(1, 0, {
        key: "entry_test_roll_no",
        label: "Test Roll No.",
      });
    } else if (status === "Enrolled") {
      baseColumns.splice(1, 0, { key: "roll_no", label: "Roll No." });
    }

    return baseColumns;
  };

  const columns = getColumns();

  // Just sort and add serial numbers (all filtering is already done)
  const rows = paginatedForms
    .sort((a, b) => a.student_name?.localeCompare(b.student_name))
    .map((form, index) => ({
      ...form,
      roll_no: form.roll_no || "Yet to Assign",
      entry_test_roll_no: form.entry_test_roll_no || "Yet to Assign",
      serialNo: startIndex + index + 1,
    }));

  /** Generate Regular Roll Numbers for Enrolled Candidates and Create User Accounts with Email Notification */
  const generateRollNumbers = async () => {
    try {
      // Check if there are any forms
      if (filteredForms.length === 0) {
        toast.error("There are no students to assign roll numbers!");
        return;
      }

      // Check if ANY form doesn't have roll number
      const hasFormsWithoutRollNumbers = filteredForms.some(
        (form) =>
          !form.roll_no ||
          form.roll_no === "Yet to Assign" ||
          form.roll_no === ""
      );

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

      // Function to generate random 6-digit unique password
      const generateRandomPassword = () => {
        return Math.floor(100000 + Math.random() * 900000).toString();
      };

      // Create counters for each department
      const departmentCounters = {};

      // ✅ Generate roll numbers for ALL forms
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
            roll_no: rollNumber,
          };
        });

      console.log("All forms with new roll numbers:", formsToUpdate);

      // Send roll numbers to backend for ALL forms and create user accounts
      const token = localStorage.getItem("token");
      const promises = formsToUpdate.map(async (form) => {
        try {
          // First, assign roll number to the admission form
          const rollNoRes = await axios.put(
            `${backendBaseUrl}/api/admissions/assignRollNo/${form.form_id}`,
            { roll_no: form.roll_no },
            {
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            }
          );

          // Then, create user account for the student
          const password = generateRandomPassword();

          // Get student email from the API
          let studentEmail = "";
          try {
            const emailRes = await axios.get(
              `${backendBaseUrl}/api/signups/${form.cnic}`,
              {
                params: { cnic: form.cnic },
                headers: { Authorization: `Bearer ${token}` },
              }
            );
            const data = emailRes.data.data || emailRes.data;
            studentEmail = data.EMAIL || "";
          } catch (emailError) {
            console.warn(
              `Could not fetch email for CNIC ${form.cnic}:`,
              emailError
            );
            // Continue without email if API fails
          }

          const userData = {
            username: form.roll_no,
            password: password,
            department: form.department,
            cnic: form.cnic,
            role: "student",
            email: studentEmail,
          };

          console.log(`Creating user account for ${form.roll_no}:`, userData);

          const userRes = await axios.post(
            `${backendBaseUrl}/api/users/upsert`,
            userData,
            {
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            }
          );

          // Send email with credentials if email is available
          if (studentEmail) {
            try {
              const emailResponse = await axios.post(
                `${backendBaseUrl}/api/email/send-credentials`,
                {
                  to: studentEmail,
                  studentName: form.student_name,
                  rollNumber: form.roll_no,
                  password: password,
                  department: form.department,
                },
                {
                  headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                  },
                }
              );

              console.log(`Credentials email sent to ${studentEmail}`);

              return {
                success: true,
                form_id: form.form_id,
                roll_no: form.roll_no,
                user_created: true,
                email_sent: true,
                username: form.roll_no,
                password: password,
                email: studentEmail,
                assigned: true,
              };
            } catch (emailError) {
              console.warn(
                `Failed to send email to ${studentEmail}:`,
                emailError
              );
              // User created successfully but email failed
              return {
                success: true,
                form_id: form.form_id,
                roll_no: form.roll_no,
                user_created: true,
                email_sent: false,
                username: form.roll_no,
                password: password,
                email: studentEmail,
                assigned: true,
                email_error:
                  emailError.response?.data?.message || emailError.message,
              };
            }
          } else {
            // No email available
            return {
              success: true,
              form_id: form.form_id,
              roll_no: form.roll_no,
              user_created: true,
              email_sent: false,
              username: form.roll_no,
              password: password,
              email: null,
              assigned: true,
            };
          }
        } catch (error) {
          console.error(
            `❌ Error Assigning roll number or creating user for form ${form.form_id}:`,
            error
          );
          return {
            success: false,
            form_id: form.form_id,
            error: error.response?.data?.message || error.message,
            user_created: false,
            email_sent: false,
          };
        }
      });

      const results = await Promise.all(promises);
      const successful = results.filter((r) => r && r.success);
      const failed = results.filter((r) => r && !r.success);

      const usersWithCredentials = successful.filter((r) => r.user_created);
      const emailsSent = successful.filter((r) => r.email_sent);
      const usersWithoutEmail = successful.filter(
        (r) => r.user_created && !r.email_sent
      );

      // Show comprehensive success message
      let successMessage = `Successfully assigned roll numbers to ${successful.length} students and created ${usersWithCredentials.length} user accounts.`;

      if (emailsSent.length > 0) {
        successMessage += ` Credentials emailed to ${emailsSent.length} students.`;
      }

      if (usersWithoutEmail.length > 0) {
        successMessage += ` ${usersWithoutEmail.length} accounts created but no email sent (missing email address).`;
      }

      if (failed.length > 0) {
        toast.error(`Failed to process ${failed.length} forms`);
        console.error(
          "Failed forms:",
          failed.map((f) => f.form_id)
        );
      }

      if (successful.length > 0) {
        toast.success(successMessage);

        // Log details for admin reference
        console.log("Processing Summary:", {
          total: formsToUpdate.length,
          successful: successful.length,
          failed: failed.length,
          emailsSent: emailsSent.length,
          usersWithoutEmail: usersWithoutEmail.length,
          details: successful.map((u) => ({
            username: u.username,
            email: u.email,
            email_sent: u.email_sent,
            form_id: u.form_id,
          })),
        });
      }

      setTimeout(() => {
        fetchAdmissions();
      }, 2000);
    } catch (error) {
      console.error("❌ Error in generateRollNumbers:", error);
      toast.error("Failed to generate roll numbers. Please try again.");
    }
  };

  /** Generate Test Roll Numbers for Approved Forms */
  const generateTestRollNumbers = async () => {
    try {
      if (filteredForms.length === 0) {
        toast.error("There are no students to assign test roll numbers!");
        return;
      }

      // Check if ANY form doesn't have test roll number
      const hasFormsWithoutTestRollNumbers = filteredForms.some(
        (form) =>
          !form.entry_test_roll_no ||
          form.entry_test_roll_no === "Yet to Assign" ||
          form.entry_test_roll_no === ""
      );

      // If ALL forms already have test roll numbers, show error and return
      if (!hasFormsWithoutTestRollNumbers) {
        toast.error("All students already have test roll numbers assigned!");
        return;
      }

      // Configuration for block numbers
      const BLOCK_CONFIG = {
        STUDENTS_PER_BLOCK: 40,
        STARTING_ROLL_NUMBER: 2100001,
        BLOCK_PREFIX: "Block ",
      };

      // Start from 2100001 and increment sequentially
      let testRollNumber = BLOCK_CONFIG.STARTING_ROLL_NUMBER;

      // Generate test roll numbers for ALL approved forms
      const formsToUpdate = filteredForms
        .sort((a, b) => a.student_name?.localeCompare(b.student_name))
        .map((form) => {
          const testRollNo = testRollNumber.toString();

          // Calculate block number based on roll number
          const studentsFromStart =
            testRollNumber - BLOCK_CONFIG.STARTING_ROLL_NUMBER;
          const blockNumber =
            Math.floor(studentsFromStart / BLOCK_CONFIG.STUDENTS_PER_BLOCK) + 1;

          // Format block number to 2 digits (01, 02, 03, etc.)
          const blockNo = blockNumber.toString().padStart(2, "0");

          testRollNumber++;

          return {
            ...form,
            entry_test_roll_no: testRollNo,
            block_no: blockNo,
          };
        });

      console.log(
        "All forms with new test roll numbers and block numbers:",
        formsToUpdate
      );

      // Display block distribution summary
      const blockSummary = formsToUpdate.reduce((acc, form) => {
        acc[form.block_no] = (acc[form.block_no] || 0) + 1;
        return acc;
      }, {});

      console.log("Block Distribution:", blockSummary);

      // Send test roll numbers and block numbers to backend for ALL forms
      const token = localStorage.getItem("token");
      const promises = formsToUpdate.map(async (form) => {
        try {
          const res = await axios.put(
            `${backendBaseUrl}/api/admissions/assignTestRollNo/${form.form_id}`,
            {
              entry_test_roll_no: form.entry_test_roll_no,
              block_no: form.block_no,
            },
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
            entry_test_roll_no: form.entry_test_roll_no,
            block_no: form.block_no,
            assigned: true,
          };
        } catch (error) {
          console.error(
            `❌ Error Assigning test roll number for form ${form.form_id}:`,
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
        toast.error(
          `Failed to assign test roll numbers for ${failed.length} forms`
        );
        console.error(
          "Failed forms:",
          failed.map((f) => f.form_id)
        );
      } else {
        // Create success message with block distribution
        const blockMessage = Object.entries(blockSummary)
          .map(([block, count]) => `Block ${block}: ${count} students`)
          .join(", ");

        toast.success(
          `Successfully assigned test roll numbers to ${successful.length} students! Distribution: ${blockMessage}`
        );
      }

      setTimeout(() => {
        fetchAdmissions();
      }, 2000);
    } catch (error) {
      console.error("❌ Error in generateTestRollNumbers:", error);
      toast.error("Failed to generate test roll numbers. Please try again.");
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
                    // Check if test roll number is assigned before allowing status change
                    if (
                      !row.entry_test_roll_no ||
                      row.entry_test_roll_no === "Yet to Assign"
                    ) {
                      toast.error("Please assign test roll number first!");
                      return;
                    }
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
                      }, 1500);
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
                      }, 1500);
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
              {departmentsArray.map((dept) => (
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

        <DataTable columns={columns} rows={rows} actions={actions} />

        {/* Pagination */}
        <div className="flex flex-col gap-5 sm:flex-row items-center justify-between mt-4">
          <span className="font-bold text-[1.3rem] text-gray-900 dark:text-white">
            Total Forms: {filteredForms.length}
          </span>

          {/* Show appropriate button based on status */}
          {status === "Enrolled" && (
            <button
              type="button"
              onClick={generateRollNumbers}
              className="cursor-pointer relative overflow-hidden !px-[20px] !py-[5px] border-2 border-[#e5b300] text-white  hover:dark:text-white text-[0.8rem] font-medium bg-transparent transition-all duration-300 ease-linear
                     before:content-[''] before:absolute before:inset-x-0 before:bottom-0 before:h-full before:bg-[#e5b300] before:transition-all before:duration-300 before:ease-linear hover:before:h-0 disabled:opacity-6"
            >
              <span className="relative z-10">Assign Roll No.</span>
            </button>
          )}

          {status === "Approved" && (
            <button
              type="button"
              onClick={generateTestRollNumbers}
              className="cursor-pointer relative overflow-hidden !px-[20px] !py-[5px] border-2 border-[#007bff] text-white  hover:dark:text-white text-[0.8rem] font-medium bg-transparent transition-all duration-300 ease-linear
                     before:content-[''] before:absolute before:inset-x-0 before:bottom-0 before:h-full before:bg-[#007bff] before:transition-all before:duration-300 before:ease-linear hover:before:h-0 disabled:opacity-6"
            >
              <span className="relative z-10">Assign Test Roll No.</span>
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
