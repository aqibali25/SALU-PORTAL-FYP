import { useEffect, useMemo, useState } from "react";
import Cookies from "js-cookie";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import Background from "../../assets/Background.png";
import CnicInput from "../CNICInput";
import InputContainer from "../InputContainer";
import BackButton from "../BackButton";
import { useDepartments } from "../../Hooks/HomeCards";
import { useEnrolledStudents } from "../../Hooks/useEnrolledStudents";

const AddFees = ({ Title }) => {
  const [cnic, setCnic] = useState("");
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  const { students, error } = useEnrolledStudents();

  // Use the departments hook
  const {
    departmentsArray,
    loading: departmentsLoading,
    error: departmentsError,
  } = useDepartments();

  const editingFee = useMemo(
    () => location.state?.fee ?? null,
    [location.state]
  );

  const [form, setForm] = useState({
    feeId: "",
    paidDate: "",
    amount: "",
    year: "",
    status: "",
    challanNo: "",
    department: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [validatingCnic, setValidatingCnic] = useState(false);
  const [studentInfo, setStudentInfo] = useState(null);

  // Status options for the dropdown
  const statusOptions = ["Partial Pay", "Full Pay"];

  // Year options for the dropdown
  const yearOptions = ["1st Year", "2nd Year", "3rd Year", "4th Year"];

  // Get today's date in YYYY-MM-DD format for max date validation
  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  };

  // ✅ Normalize CNIC by removing dashes for comparison
  const normalizeCNIC = (cnic) => {
    return cnic.replace(/\D/g, "");
  };

  // ✅ Extract department from roll number (e.g., "GC26-BSENG-01" -> "BSENG")
  const extractDepartmentFromRollNo = (rollNo) => {
    if (!rollNo) return "";
    const parts = rollNo.split("-");
    if (parts.length >= 2) {
      return parts[1]; // Returns "BSENG", "BSCS", etc.
    }
    return "";
  };

  // ✅ Map department code to full department name
  const getDepartmentName = (deptCode) => {
    const departmentMap = {
      BSENG: "English Linguistics and Literature",
      BSCS: "Computer Science",
      BBA: "Business Administration",
      // Add more mappings as needed
    };
    return departmentMap[deptCode] || deptCode;
  };

  // ✅ Map current_year to year format (e.g., "1st" -> "1st Year")
  const mapYearToFormat = (currentYear) => {
    if (!currentYear) return "";
    const yearMap = {
      "1st": "1st Year",
      "2nd": "2nd Year",
      "3rd": "3rd Year",
      "4th": "4th Year",
    };
    return yearMap[currentYear] || currentYear;
  };

  // ✅ CNIC validation function using enrolled students data
  const validateCNIC = (cnicToValidate) => {
    if (!cnicToValidate || !/^\d{5}-\d{7}-\d$/.test(cnicToValidate)) {
      setStudentInfo(null);
      return false;
    }

    const cnicDigits = normalizeCNIC(cnicToValidate);
    console.log("Searching for CNIC:", cnicDigits);

    const student = students.find((student) => {
      const studentCnicDigits = normalizeCNIC(student.cnic);
      return studentCnicDigits === cnicDigits;
    });

    if (student) {
      console.log("Found student:", student);
      const deptCode = extractDepartmentFromRollNo(student.roll_no);
      const department = getDepartmentName(deptCode);
      const year = mapYearToFormat(student.current_year);
      const studentData = {
        name: student.student_name,
        rollNo: student.roll_no,
        department: department,
        year: year,
      };
      setStudentInfo(studentData); // This should trigger re-render
      return studentData;
    }

    console.log("Student not found for CNIC:", cnicDigits);
    setStudentInfo(null);
    return false;
  };

  // ✅ Auto-fill department and year when CNIC changes (for both new entries and updates)
  useEffect(() => {
    if (cnic && /^\d{5}-\d{7}-\d$/.test(cnic)) {
      setValidatingCnic(true);

      // Use setTimeout to avoid blocking the UI
      setTimeout(() => {
        const result = validateCNIC(cnic);
        setValidatingCnic(false);

        if (result) {
          // For new entries AND updates, auto-fill all fields
          setForm((f) => ({
            ...f,
            department: result.department,
            year: result.year,
          }));
        } else {
          if (!editingFee) {
            setForm((f) => ({
              ...f,
              department: "",
              year: "",
            }));
          }
        }
      }, 100);
    } else if (!cnic) {
      // Reset when CNIC is cleared
      setStudentInfo(null);
      if (!editingFee) {
        setForm((f) => ({
          ...f,
          department: "",
          year: "",
        }));
      }
    }
  }, [cnic, editingFee, students]); // Added students to dependencies

  // ✅ If editing, prefill the form and auto-fill student info
  useEffect(() => {
    const initData = async () => {
      try {
        setLoading(true);

        if (editingFee) {
          console.log("Editing fee data:", editingFee); // Debug log

          // Format date for input field (YYYY-MM-DD)
          const formatDateForInput = (dateString) => {
            if (!dateString) return "";
            const date = new Date(dateString);
            return date.toISOString().split("T")[0];
          };

          setForm((f) => ({
            ...f,
            feeId: editingFee.fee_id ?? "",
            paidDate: formatDateForInput(editingFee.paid_date) ?? "",
            amount: editingFee.amount?.toString() ?? "",
            year: editingFee.year ?? "",
            status: editingFee.status ?? "",
            challanNo: editingFee.challan_no ?? "",
            department: editingFee.department ?? "",
          }));

          if (editingFee.cnic) {
            setCnic(editingFee.cnic);
            // Auto-validate and get student info for updates too
            setTimeout(() => {
              validateCNIC(editingFee.cnic);
            }, 100);
          }
        }
      } finally {
        setLoading(false);
      }
    };

    initData();
  }, [editingFee]);

  const onChange = (key) => (e) => {
    const value = e.target.value;
    setForm((f) => ({
      ...f,
      [key]: value,
    }));
  };

  // ✅ Special handler for amount to handle number formatting
  const handleAmountChange = (e) => {
    let value = e.target.value;

    // Allow only numbers and decimal point
    value = value.replace(/[^0-9.]/g, "");

    // Ensure only one decimal point
    const decimalCount = (value.match(/\./g) || []).length;
    if (decimalCount > 1) {
      value = value.substring(0, value.lastIndexOf("."));
    }

    // Limit to 2 decimal places
    if (value.includes(".")) {
      const parts = value.split(".");
      if (parts[1].length > 2) {
        value = parts[0] + "." + parts[1].substring(0, 2);
      }
    }

    setForm((f) => ({
      ...f,
      amount: value,
    }));
  };

  // ✅ CNIC formatting
  const formatCNIC = (digitsOnly) => {
    const a = digitsOnly.slice(0, 5);
    const b = digitsOnly.slice(5, 12);
    const c = digitsOnly.slice(12, 13);
    return [a, b, c].filter(Boolean).join("-");
  };

  const handleCnicChange = (valOrEvent) => {
    const raw =
      typeof valOrEvent === "string"
        ? valOrEvent
        : valOrEvent?.target?.value ?? "";
    const digits = raw.replace(/\D/g, "").slice(0, 13);
    const formattedCnic = formatCNIC(digits);
    setCnic(formattedCnic);
  };

  // Validate if date is today or before today
  const isValidDate = (dateString) => {
    if (!dateString) return false;

    const selectedDate = new Date(dateString);
    const today = new Date();

    // Reset time part for accurate comparison
    selectedDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    return selectedDate <= today;
  };

  // ✅ Parse amount properly to avoid issues with commas
  const parseAmount = (amountString) => {
    if (!amountString) return 0;
    // Remove commas and convert to number
    const cleanAmount = amountString.toString().replace(/,/g, "");
    const parsed = parseFloat(cleanAmount);
    return isNaN(parsed) ? 0 : parsed;
  };

  // ✅ Submit Handler
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation with Toastify
    if (!cnic) {
      toast.error("CNIC is required.");
      return;
    }

    if (!/^\d{5}-\d{7}-\d$/.test(cnic)) {
      toast.error("CNIC must be in the format 12345-1234567-1.");
      return;
    }

    if (!form.paidDate) {
      toast.error("Paid Date is required.");
      return;
    }

    // Validate date is today or before today
    if (!isValidDate(form.paidDate)) {
      toast.error("Paid Date must be today or a past date.");
      return;
    }

    const parsedAmount = parseAmount(form.amount);
    if (!form.amount || parsedAmount <= 0) {
      toast.error("Valid Amount is required.");
      return;
    }

    if (!form.year) {
      toast.error("Year is required.");
      return;
    }

    if (!form.status) {
      toast.error("Status is required.");
      return;
    }

    if (!form.challanNo) {
      toast.error("Challan No is required.");
      return;
    }

    if (!form.department) {
      toast.error("Department is required.");
      return;
    }

    // ✅ Validate CNIC exists in enrolled students (only for new entries)
    if (!editingFee) {
      const result = validateCNIC(cnic);
      if (!result) {
        toast.error(
          "This CNIC is not registered in the system. Please register the student first."
        );
        return;
      }
    }

    try {
      setSubmitting(true);

      const token = localStorage.getItem("token");
      const API = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

      // Prepare payload for API - use the properly parsed amount
      const payload = {
        cnic: cnic,
        paid_date: form.paidDate,
        amount: parsedAmount, // Use the properly parsed amount
        year: form.year,
        status: form.status,
        challan_no: form.challanNo,
        department: form.department,
        // fee_id will be included for updates if editingFee exists
        ...(editingFee && { fee_id: form.feeId }),
      };

      console.log("Submitting fee payload:", payload);

      // API call
      const response = await axios.post(`${API}/api/fees/upsert`, payload, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        withCredentials: true,
      });

      console.log("API Response:", response.data);

      // Success toast with auto navigation
      toast.success(
        Title === "Update Fees"
          ? "Fee updated successfully!"
          : "Fee added successfully!",
        {
          position: "top-right",
          autoClose: 2000,
        }
      );

      // Navigate after success message
      setTimeout(() => {
        Title === "Update Fees"
          ? navigate("/SALU-PORTAL-FYP/Fees/ViewFees")
          : navigate("/SALU-PORTAL-FYP/Fees");
      }, 2000);
    } catch (err) {
      console.error("Submission error:", err);
      const errorMessage =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Error saving fee. Please try again.";

      // Handle specific backend validation errors
      if (
        errorMessage.includes("CNIC does not exist") ||
        errorMessage.includes("Cannot add fee") ||
        errorMessage.includes("foreign key constraint")
      ) {
        toast.error(
          "This CNIC is not registered in the system. Please register the student first.",
          {
            position: "top-right",
            autoClose: 5000,
          }
        );
      } else {
        toast.error(errorMessage, {
          position: "top-right",
          autoClose: 5000,
        });
      }
    } finally {
      setSubmitting(false);
      setValidatingCnic(false);
    }
  };

  // ✅ Loading Spinner
  if (loading || departmentsLoading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-90px)] bg-white dark:bg-gray-900">
        <div className="w-16 h-16 border-4 border-yellow-400 border-dashed rounded-full animate-spin"></div>
      </div>
    );
  }

  // ✅ Error state for departments
  if (departmentsError) {
    console.warn("Departments loading error:", departmentsError);
    // Don't show toast here to avoid multiple toasts
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
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-3 w-full min-h-[80vh] bg-[#D5BBE0] rounded-md !p-5"
      >
        <div className="flex justify-start items-center gap-3">
          <BackButton
            url={
              Title === "Update Fees"
                ? "/SALU-PORTAL-FYP/Fees/ViewFees"
                : "/SALU-PORTAL-FYP/Fees"
            }
          />
          <h1 className="text-2xl sm:text-3xl md:text-4xl py-3 font-bold text-gray-900 dark:text-white">
            {Title}
          </h1>
        </div>

        <hr className="border-t-[3px] border-gray-900 dark:border-white mb-4" />

        <div className="flex flex-col justify-center items-center gap-5 min-h-[60vh] w-full !p-5 bg-white dark:bg-gray-900 rounded-md">
          {/* Fee ID - Only show and disable when updating */}
          {Title === "Update Fees" && (
            <InputContainer
              placeholder="Fee ID"
              title="Fee ID"
              htmlFor="feeId"
              inputType="text"
              value={form.feeId}
              onChange={onChange("feeId")}
              disabled={true}
            />
          )}

          <InputContainer
            placeholder="Enter Challan Number"
            title="Challan No"
            htmlFor="challanNo"
            inputType="text"
            required
            value={form.challanNo}
            onChange={onChange("challanNo")}
          />

          <div className="flex w-full max-w-[800px] items-start md:items-center justify-start flex-col md:flex-row gap-[8px] md:gap-5 [@media(max-width:550px)]:gap-[5px]">
            <label
              htmlFor="cnic"
              className="w-auto md:w-1/4 text-start md:text-right text-gray-900 dark:text-white"
            >
              <span className="text-[#ff0000] mr-1">*</span>
              CNIC:
            </label>
            <div className="w-[40%] [@media(max-width:768px)]:!w-full">
              <CnicInput
                id="cnic"
                value={cnic}
                onChange={handleCnicChange}
                width="100%"
                placeholder="XXXXX-XXXXXXX-X"
                disabled={editingFee} // Disable CNIC editing when updating
              />
              {validatingCnic && (
                <div className="text-xs text-blue-600 mt-1">
                  Validating CNIC...
                </div>
              )}
              {studentInfo && (
                <div className="text-xs text-green-600 !mt-2">
                  ✓ {studentInfo.name} - {studentInfo.rollNo} -{" "}
                  {studentInfo.department}
                </div>
              )}
              {!studentInfo && cnic && /^\d{5}-\d{7}-\d$/.test(cnic) && (
                <div className="text-xs text-red-600 !mt-1">
                  ✗ Student not found. Please check CNIC.
                </div>
              )}
            </div>
          </div>

          {/* Student Name Display - Auto-filled for both new and update */}
          <div className="flex w-full max-w-[800px] items-start md:items-center justify-start flex-col md:flex-row gap-[8px] md:gap-5 [@media(max-width:550px)]:gap-[5px]">
            <label
              htmlFor="studentName"
              className="w-auto md:w-1/4 text-start md:text-right text-gray-900 dark:text-white"
            >
              Student Name:
            </label>
            <input
              id="studentName"
              type="text"
              value={studentInfo?.name || ""}
              readOnly
              disabled
              placeholder="Student name will auto-fill from CNIC"
              className="w-[40%] [@media(max-width:768px)]:!w-full min-w-0 !px-2 !py-1 border-2 border-[#a5a5a5] outline-none bg-gray-200 text-[#2a2a2a] dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 cursor-not-allowed"
            />
          </div>

          {/* Department Display - Auto-filled for both new entries and updates */}
          <div className="flex w-full max-w-[800px] items-start md:items-center justify-start flex-col md:flex-row gap-[8px] md:gap-5 [@media(max-width:550px)]:gap-[5px]">
            <label
              htmlFor="department"
              className="w-auto md:w-1/4 text-start md:text-right text-gray-900 dark:text-white"
            >
              <span className="text-[#ff0000] mr-1">*</span>
              Department:
            </label>
            <input
              id="department"
              type="text"
              required
              value={form.department}
              readOnly
              className="w-[40%] [@media(max-width:768px)]:!w-full min-w-0 !px-2 !py-1 border-2 border-[#a5a5a5] outline-none bg-[#f9f9f9] text-[#2a2a2a] dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
              placeholder="Department will auto-fill from CNIC"
            />
          </div>

          {/* Year Display - Auto-filled for both new entries and updates */}
          <div className="flex w-full max-w-[800px] items-start md:items-center justify-start flex-col md:flex-row gap-[8px] md:gap-5 [@media(max-width:550px)]:gap-[5px]">
            <label
              htmlFor="year"
              className="w-auto md:w-1/4 text-start md:text-right text-gray-900 dark:text-white"
            >
              <span className="text-[#ff0000] mr-1">*</span>
              Year:
            </label>
            <input
              id="year"
              type="text"
              required
              value={form.year}
              readOnly
              className="w-[40%] [@media(max-width:768px)]:!w-full min-w-0 !px-2 !py-1 border-2 border-[#a5a5a5] outline-none bg-[#f9f9f9] text-[#2a2a2a] dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
              placeholder="Year will auto-fill from CNIC"
            />
          </div>

          <InputContainer
            placeholder="Select Paid Date"
            title="Paid Date"
            htmlFor="paidDate"
            inputType="date"
            required
            value={form.paidDate}
            onChange={onChange("paidDate")}
            max={getTodayDate()}
          />

          {/* Custom Amount Input to ensure proper display */}
          <div className="flex w-full max-w-[800px] items-start md:items-center justify-start flex-col md:flex-row gap-[8px] md:gap-5 [@media(max-width:550px)]:gap-[5px]">
            <label
              htmlFor="amount"
              className="w-auto md:w-1/4 text-start md:text-right text-gray-900 dark:text-white"
            >
              <span className="text-[#ff0000] mr-1">*</span>
              Amount:
            </label>
            <input
              id="amount"
              type="text"
              required
              value={form.amount}
              onChange={handleAmountChange}
              placeholder="Enter Amount (e.g., 10000.00)"
              autoComplete="off"
              className="w-[40%] [@media(max-width:768px)]:!w-full min-w-0 !px-2 !py-1 border-2 border-[#a5a5a5] outline-none bg-[#f9f9f9] text-[#2a2a2a] dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
            />
          </div>

          {/* Status Dropdown */}
          <div className="flex w-full max-w-[800px] items-start md:items-center justify-start flex-col md:flex-row gap-[8px] md:gap-5 [@media(max-width:550px)]:gap-[5px]">
            <label
              htmlFor="status"
              className="w-auto md:w-1/4 text-start md:text-right text-gray-900 dark:text-white"
            >
              <span className="text-[#ff0000] mr-1">*</span>
              Status:
            </label>
            <select
              id="status"
              required
              value={form.status}
              onChange={onChange("status")}
              className="w-[40%] [@media(max-width:768px)]:!w-full min-w-0 !px-2 !py-1 border-2 border-[#a5a5a5] outline-none bg-[#f9f9f9] text-[#2a2a2a] dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
            >
              <option value="" disabled>
                [Select Status]
              </option>
              {statusOptions.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>

          <div className="w-full flex justify-end mt-4">
            <button
              type="submit"
              disabled={
                submitting || validatingCnic || (!editingFee && !studentInfo)
              }
              className="cursor-pointer relative overflow-hidden !px-[15px] !py-[5px] border-2 border-[#e5b300] text-white text-[0.8rem] font-medium bg-transparent transition-all duration-300 ease-linear
                         before:content-[''] before:absolute before:inset-x-0 before:bottom-0 before:h-full before:bg-[#e5b300] before:transition-all before:duration-300 before:ease-linear hover:before:h-0 disabled:opacity-60"
            >
              <span className="relative z-10">
                {validatingCnic
                  ? "Validating CNIC..."
                  : submitting
                  ? "Saving..."
                  : "Save & Proceed"}
              </span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AddFees;
