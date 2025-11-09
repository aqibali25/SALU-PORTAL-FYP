import { useEffect, useMemo, useState } from "react";
import Cookies from "js-cookie";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import Background from "../../assets/Background.png";
import CnicInput from "../CNICInput";
import InputContainer from "../InputContainer";
import BackButton from "../BackButton";
import { useDepartments } from "../../Hooks/HomeCards"; // Import the hook

const AddFees = ({ Title }) => {
  const [cnic, setCnic] = useState("");
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();

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
    department: "", // Added department field
  });
  const [submitting, setSubmitting] = useState(false);

  // Status options for the dropdown
  const statusOptions = ["Partial Pay", "Full Pay"];

  // Year options for the dropdown
  const yearOptions = ["1st Year", "2nd Year", "3rd Year", "4th Year"];

  // Get today's date in YYYY-MM-DD format for max date validation
  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  };

  // ✅ If editing, prefill the form
  useEffect(() => {
    const initData = async () => {
      try {
        setLoading(true);

        if (editingFee) {
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
            amount: editingFee.amount ?? "",
            year: editingFee.year ?? "",
            status: editingFee.status ?? "",
            challanNo: editingFee.challan_no ?? "",
            department: editingFee.department ?? "", // Prefill department if editing
          }));

          if (editingFee.cnic) setCnic(editingFee.cnic);
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
    setCnic(formatCNIC(digits));
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

  // ✅ Submit Handler (Axios) - Commented as requested
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

    if (!form.amount || parseFloat(form.amount) <= 0) {
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

    try {
      setSubmitting(true);
      const token = localStorage.getItem("token");
      const API = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

      // Prepare payload for API
      const payload = {
        cnic: cnic,
        paid_date: form.paidDate,
        amount: parseFloat(form.amount),
        year: form.year,
        status: form.status,
        challan_no: form.challanNo,
        department: form.department, // Added department to payload
        // fee_id will be included for updates if editingFee exists
        ...(editingFee && { fee_id: form.feeId }),
      };

      console.log("Submitting fee payload:", payload);

      /* 
      // API call commented as requested
      await axios.post(`${API}/api/fees/upsert`, payload, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        withCredentials: true,
      });
      */

      // Success toast with auto navigation
      toast.success(
        Title === "Update Fee"
          ? "Fee updated successfully!"
          : "Fee added successfully!",
        {
          position: "top-right",
          autoClose: 2000,
        }
      );

      // Navigate after success message
      setTimeout(() => {
        Title === "Update Fee"
          ? navigate("/SALU-PORTAL-FYP/ViewFees")
          : navigate("/SALU-PORTAL-FYP/Fees");
      }, 3000);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Error saving fee", {
        position: "top-right",
      });
    } finally {
      setSubmitting(false);
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
    toast.error("Failed to load departments. Using default list.");
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
              Title === "Update Fee"
                ? "/SALU-PORTAL-FYP/ViewFees"
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
          {Title === "Update Fee" && (
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
            <CnicInput
              id="cnic"
              value={cnic}
              onChange={handleCnicChange}
              width="35%"
              placeholder="XXXXX-XXXXXXX-X"
            />
          </div>

          {/* Department Dropdown */}
          <div className="flex w-full max-w-[800px] items-start md:items-center justify-start flex-col md:flex-row gap-[8px] md:gap-5 [@media(max-width:550px)]:gap-[5px]">
            <label
              htmlFor="department"
              className="w-auto md:w-1/4 text-start md:text-right text-gray-900 dark:text-white"
            >
              <span className="text-[#ff0000] mr-1">*</span>
              Department:
            </label>
            <select
              id="department"
              required
              value={form.department}
              onChange={onChange("department")}
              className="w-[40%] [@media(max-width:768px)]:!w-full min-w-0 !px-2 !py-1 border-2 border-[#a5a5a5] outline-none bg-[#f9f9f9] text-[#2a2a2a] dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
            >
              <option value="" disabled>
                [Select Department]
              </option>
              {departmentsArray.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>

          <InputContainer
            placeholder="Select Paid Date"
            title="Paid Date"
            htmlFor="paidDate"
            inputType="date"
            required
            value={form.paidDate}
            onChange={onChange("paidDate")}
            max={getTodayDate()} // Set max date to today
          />

          <InputContainer
            placeholder="Enter Amount"
            title="Amount"
            htmlFor="amount"
            inputType="number"
            required
            value={form.amount}
            onChange={onChange("amount")}
            min="0"
            step="0.01"
          />

          {/* Year Dropdown */}
          <div className="flex w-full max-w-[800px] items-start md:items-center justify-start flex-col md:flex-row gap-[8px] md:gap-5 [@media(max-width:550px)]:gap-[5px]">
            <label
              htmlFor="year"
              className="w-auto md:w-1/4 text-start md:text-right text-gray-900 dark:text-white"
            >
              <span className="text-[#ff0000] mr-1">*</span>
              Year:
            </label>
            <select
              id="year"
              required
              value={form.year}
              onChange={onChange("year")}
              className="w-[40%] [@media(max-width:768px)]:!w-full min-w-0 !px-2 !py-1 border-2 border-[#a5a5a5] outline-none bg-[#f9f9f9] text-[#2a2a2a] dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
            >
              <option value="" disabled>
                [Select Year]
              </option>
              {yearOptions.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
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
              disabled={submitting}
              className="cursor-pointer relative overflow-hidden !px-[15px] !py-[5px] border-2 border-[#e5b300] text-white text-[0.8rem] font-medium bg-transparent transition-all duration-300 ease-linear
                         before:content-[''] before:absolute before:inset-x-0 before:bottom-0 before:h-full before:bg-[#e5b300] before:transition-all before:duration-300 before:ease-linear hover:before:h-0 disabled:opacity-60"
            >
              <span className="relative z-10">
                {submitting ? "Saving..." : "Save & Proceed"}
              </span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AddFees;
