import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import Background from "../../assets/Background.png";
import InputContainer from "../InputContainer";
import BackButton from "../BackButton";
import { useEnrolledStudents } from "../../Hooks/useEnrolledStudents";

const IssueBook = () => {
  const [rollNo, setRollNo] = useState("");
  const [bookId, setBookId] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { students } = useEnrolledStudents();

  const [form, setForm] = useState({
    bookName: "",
    issueDate: "",
    dueDate: "",
    status: "Issued",
  });

  const [submitting, setSubmitting] = useState(false);
  const [validatingRollNo, setValidatingRollNo] = useState(false);
  const [validatingBookId, setValidatingBookId] = useState(false);
  const [studentInfo, setStudentInfo] = useState(null);
  const [bookInfo, setBookInfo] = useState(null);
  const [lastValidatedBookId, setLastValidatedBookId] = useState(""); // Track last validated book to prevent duplicate toasts

  // Get today's date in YYYY-MM-DD format
  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  };

  // Calculate due date (15 days from issue date)
  const calculateDueDate = (issueDate) => {
    if (!issueDate) return "";
    const date = new Date(issueDate);
    date.setDate(date.getDate() + 15);
    return date.toISOString().split("T")[0];
  };

  // ✅ Updated Roll Number validation format:
  // GCYY-XXXX-01 or GCYY-XXXX-011 (YY means year 22, 23, 26 etc)
  // X means program and Department (3-5 characters)
  const isValidRollNoFormat = (rollNo) => {
    const rollNoRegex = /^GC\d{2}-[A-Z]{3,5}-\d{2,3}$/;
    return rollNoRegex.test(rollNo);
  };

  const isValidBookIdFormat = (bookId) => {
    return bookId && bookId.trim().length > 0;
  };

  // ✅ Check if book is available for issuing - FIXED LOGIC
  const isBookAvailable = (book) => {
    if (!book) return false;

    // Book is available only if:
    // 1. availableCopies > 0 AND
    // 2. status is NOT "Out of stock"
    return book.availableCopies > 0 && book.status !== "Out of stock";
  };

  // ✅ Extract department from roll number
  const extractDepartmentFromRollNo = (rollNo) => {
    if (!rollNo) return "";
    const parts = rollNo.split("-");
    if (parts.length >= 2) {
      const deptCode = parts[1];
      // Map department codes to full names
      const departmentMap = {
        BSCS: "Computer Science",
        BBA: "Business Administration",
        BSENG: "English Linguistics and Literature",
        BSE: "Software Engineering",
        BIT: "Information Technology",
        // Add more mappings as needed
      };
      return departmentMap[deptCode] || deptCode;
    }
    return "";
  };

  // ✅ Validate Roll Number and get student info
  const validateRollNo = (rollNoToValidate) => {
    if (!rollNoToValidate || !isValidRollNoFormat(rollNoToValidate)) {
      setStudentInfo(null);
      return false;
    }

    const student = students.find((student) => {
      return student.roll_no === rollNoToValidate;
    });

    if (student) {
      const studentData = {
        name: student.student_name,
        rollNo: student.roll_no,
        department: extractDepartmentFromRollNo(student.roll_no),
        year: student.current_year,
        semester: student.current_semester,
      };
      setStudentInfo(studentData);
      return studentData;
    }

    setStudentInfo(null);
    return false;
  };

  // ✅ Validate Book ID and get book info - REMOVED TOAST FROM HERE
  const validateBookId = async (bookIdToValidate) => {
    if (!bookIdToValidate || !isValidBookIdFormat(bookIdToValidate)) {
      setBookInfo(null);
      return false;
    }

    try {
      setValidatingBookId(true);
      const token = localStorage.getItem("token");
      const API = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

      const response = await axios.get(
        `${API}/api/library/books/${bookIdToValidate}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data) {
        const book = response.data;
        const bookData = {
          id: book.bookId || book._id,
          title: book.title,
          bookAddition: book.bookAddition,
          authors: book.authors,
          availableCopies: book.availableCopies,
          status: book.status, // Include status in book info
        };
        setBookInfo(bookData);

        // Auto-fill book name
        setForm((f) => ({
          ...f,
          bookName: book.title || "",
        }));

        return bookData;
      }
    } catch (err) {
      setBookInfo(null);
      setForm((f) => ({
        ...f,
        bookName: "",
      }));
      return false;
    } finally {
      setValidatingBookId(false);
    }
  };

  // ✅ Auto-validate when roll number changes
  useEffect(() => {
    if (rollNo && isValidRollNoFormat(rollNo)) {
      setValidatingRollNo(true);
      setTimeout(() => {
        validateRollNo(rollNo);
        setValidatingRollNo(false);
      }, 100);
    } else if (!rollNo) {
      setStudentInfo(null);
    }
  }, [rollNo]);

  // ✅ Auto-validate when book ID changes - MOVED TOAST LOGIC HERE ONLY
  useEffect(() => {
    if (bookId && isValidBookIdFormat(bookId)) {
      // Store current book ID before validation
      const currentBookId = bookId;

      setValidatingBookId(true);
      setTimeout(async () => {
        const bookData = await validateBookId(bookId);

        // Only process if the book ID hasn't changed during validation
        if (bookData && currentBookId === bookId) {
          setLastValidatedBookId(currentBookId);

          // Show out of stock toast if applicable - ONLY ONCE HERE
          if (!isBookAvailable(bookData)) {
            toast.warning(
              "⚠️ This book is currently out of stock and cannot be issued!",
              {
                position: "top-center",
                autoClose: 5000,
              }
            );
          }
        }

        setValidatingBookId(false);
      }, 500);
    } else if (!bookId) {
      setBookInfo(null);
      setForm((f) => ({
        ...f,
        bookName: "",
      }));
      setLastValidatedBookId("");
    }
  }, [bookId]);

  // ✅ Auto-update due date when issue date changes
  useEffect(() => {
    if (form.issueDate) {
      const calculatedDueDate = calculateDueDate(form.issueDate);
      setForm((f) => ({
        ...f,
        dueDate: calculatedDueDate,
      }));
    }
  }, [form.issueDate]);

  const onChange = (key) => (e) => {
    const value = e.target.value;
    setForm((f) => ({
      ...f,
      [key]: value,
    }));
  };

  const handleRollNoChange = (e) => {
    const value = e.target.value.toUpperCase();
    setRollNo(value);
  };

  const handleBookIdChange = (e) => {
    const value = e.target.value;
    setBookId(value);
  };

  // ✅ Submit Handler
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation with Toastify - All messages top-center
    if (!rollNo) {
      toast.error("Student Roll No. is required.", {
        position: "top-center",
        autoClose: 4000,
      });
      return;
    }

    if (!isValidRollNoFormat(rollNo)) {
      toast.error(
        "Roll No must be in format GCYY-XXXX-01 or GCYY-XXXX-011 (e.g., GC22-BSCS-01, GC23-BBA-015)",
        {
          position: "top-center",
          autoClose: 5000,
        }
      );
      return;
    }

    if (!bookId) {
      toast.error("Book ID is required.", {
        position: "top-center",
        autoClose: 4000,
      });
      return;
    }

    if (!form.bookName) {
      toast.error("Book Name is required.", {
        position: "top-center",
        autoClose: 4000,
      });
      return;
    }

    if (!form.issueDate) {
      toast.error("Book Issue Date is required.", {
        position: "top-center",
        autoClose: 4000,
      });
      return;
    }

    if (!form.dueDate) {
      toast.error("Book Due Date is required.", {
        position: "top-center",
        autoClose: 4000,
      });
      return;
    }

    // Validate student exists
    if (!studentInfo) {
      toast.error("Student not found. Please check Roll No.", {
        position: "top-center",
        autoClose: 4000,
      });
      return;
    }

    // Validate book exists and is available
    if (!bookInfo) {
      toast.error("Book not found. Please check Book ID.", {
        position: "top-center",
        autoClose: 4000,
      });
      return;
    }

    if (!isBookAvailable(bookInfo)) {
      toast.error("This book is currently out of stock and cannot be issued.", {
        position: "top-center",
        autoClose: 5000,
      });
      return;
    }

    try {
      setSubmitting(true);
      const token = localStorage.getItem("token");
      const API = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

      // ✅ Send only required data to DB
      const payload = {
        rollNo: rollNo,
        bookId: bookId,
        bookName: form.bookName,
        bookAddition: form.bookAddition || "",
        issueDate: form.issueDate,
        dueDate: form.dueDate,
        status: form.status, // Only extra field besides inputs
      };
      console.log("Payload:", payload);

      // API call
      const response = await axios.post(
        `${API}/api/library/book-issues`,
        payload,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        }
      );

      console.log("API Response:", response.data);

      // Success toast with auto navigation - top-center
      toast.success("Book issued successfully!", {
        position: "top-center",
        autoClose: 2000,
      });

      // Navigate after success message
      setTimeout(() => {
        navigate("/SALU-PORTAL-FYP/Library");
      }, 2000);
    } catch (err) {
      console.error("Submission error:", err);
      const errorMessage =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Error issuing book. Please try again.";

      toast.error(errorMessage, {
        position: "top-center",
        autoClose: 5000,
      });
    } finally {
      setSubmitting(false);
    }
  };

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
          <BackButton url="/SALU-PORTAL-FYP/Library" />
          <h1 className="text-2xl sm:text-3xl md:text-4xl py-3 font-bold text-gray-900 dark:text-white">
            Issue Book
          </h1>
        </div>

        <hr className="border-t-[3px] border-gray-900 dark:border-white mb-4" />

        <div className="flex flex-col justify-center items-center gap-5 min-h-[60vh] w-full !p-5 bg-white dark:bg-gray-900 rounded-md">
          {/* Student Roll No Input */}
          <div className="flex w-full max-w-[800px] items-start md:items-center justify-start flex-col md:flex-row gap-[8px] md:gap-5 [@media(max-width:550px)]:gap-[5px]">
            <label
              htmlFor="rollNo"
              className="w-auto md:w-1/4 text-start md:text-right text-gray-900 dark:text-white"
            >
              <span className="text-[#ff0000] mr-1">*</span>
              Student Roll No.:
            </label>
            <div className="w-[40%] [@media(max-width:768px)]:!w-full">
              <input
                id="rollNo"
                type="text"
                value={rollNo}
                onChange={handleRollNoChange}
                autoComplete="off"
                placeholder="GCYY-XXXX-01 or GCYY-XXXX-011"
                className="w-full min-w-0 !px-2 !py-1 border-2 border-[#a5a5a5] outline-none bg-[#f9f9f9] text-[#2a2a2a] dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 uppercase"
              />
              {validatingRollNo && (
                <div className="text-xs text-blue-600 mt-1">
                  Validating Roll No...
                </div>
              )}
              {studentInfo && (
                <div className="text-xs text-green-600 !mt-2">
                  ✓ {studentInfo.name} - {studentInfo.department} -{" "}
                  {studentInfo.year}
                </div>
              )}
              {!studentInfo && rollNo && isValidRollNoFormat(rollNo) && (
                <div className="text-xs text-red-600 !mt-1">
                  ✗ Student not found. Please check Roll No.
                </div>
              )}
              {rollNo && !isValidRollNoFormat(rollNo) && (
                <div className="text-xs text-red-600 !mt-1">
                  ✗ Invalid format. Use: GCYY-XXXX-01 or GCYY-XXXX-011
                </div>
              )}
            </div>
          </div>

          {/* Book ID Input */}
          <div className="flex w-full max-w-[800px] items-start md:items-center justify-start flex-col md:flex-row gap-[8px] md:gap-5 [@media(max-width:550px)]:gap-[5px]">
            <label
              htmlFor="bookId"
              className="w-auto md:w-1/4 text-start md:text-right text-gray-900 dark:text-white"
            >
              <span className="text-[#ff0000] mr-1">*</span>
              Book ID:
            </label>
            <div className="w-[40%] [@media(max-width:768px)]:!w-full">
              <input
                id="bookId"
                type="text"
                value={bookId}
                onChange={handleBookIdChange}
                placeholder="Enter Book ID"
                className="w-full min-w-0 !px-2 !py-1 border-2 border-[#a5a5a5] outline-none bg-[#f9f9f9] text-[#2a2a2a] dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
              />
              {validatingBookId && (
                <div className="text-xs text-blue-600 mt-1">
                  Validating Book ID...
                </div>
              )}
              {bookInfo && (
                <div
                  className={`text-xs !mt-2 ${
                    !isBookAvailable(bookInfo)
                      ? "text-red-600"
                      : "text-green-600"
                  }`}
                >
                  {!isBookAvailable(bookInfo) ? (
                    <>
                      ✗ {bookInfo.title} - {bookInfo.bookAddition} by{" "}
                      {bookInfo.authors} - OUT OF STOCK
                    </>
                  ) : (
                    <>
                      ✓ {bookInfo.title}{" "}
                      {bookInfo.bookAddition && `-${bookInfo.bookAddition}`} by
                      {"    "}
                      {bookInfo.authors} - {bookInfo.availableCopies} available
                    </>
                  )}
                </div>
              )}
              {!bookInfo && bookId && isValidBookIdFormat(bookId) && (
                <div className="text-xs text-red-600 !mt-1">
                  ✗ Book not found. Please check Book ID.
                </div>
              )}
            </div>
          </div>

          {/* Book Name Display - Auto-filled from Book ID */}
          <InputContainer
            placeholder="Book Name will auto-fill from Book ID"
            title="Book Name"
            htmlFor="bookName"
            inputType="text"
            required
            value={form.bookName}
            onChange={onChange("bookName")}
            readOnly={true}
          />

          {/* Book Issue Date */}
          <InputContainer
            placeholder="Select Issue Date"
            title="Book Issue Date"
            htmlFor="issueDate"
            inputType="date"
            required
            value={form.issueDate}
            onChange={onChange("issueDate")}
            min={getTodayDate()}
            max={getTodayDate()}
          />

          {/* Book Due Date - Auto-calculated */}
          <InputContainer
            placeholder="Due Date will auto-calculate"
            title="Book Due Date"
            htmlFor="dueDate"
            inputType="date"
            required
            value={form.dueDate}
            onChange={onChange("dueDate")}
            readOnly={true}
          />

          {/* Status Field - Hidden but included in form data */}
          <input
            type="hidden"
            value={form.status}
            onChange={onChange("status")}
          />

          <div className="w-full flex justify-end mt-4">
            <button
              type="submit"
              disabled={
                submitting ||
                validatingRollNo ||
                validatingBookId ||
                !studentInfo ||
                !bookInfo ||
                !isBookAvailable(bookInfo)
              }
              className="cursor-pointer relative overflow-hidden !px-[15px] !py-[5px] border-2 border-[#e5b300] text-white text-[0.8rem] font-medium bg-transparent transition-all duration-300 ease-linear
                         before:content-[''] before:absolute before:inset-x-0 before:bottom-0 before:h-full before:bg-[#e5b300] before:transition-all before:duration-300 before:ease-linear hover:before:h-0 disabled:opacity-60"
            >
              <span className="relative z-10">
                {validatingRollNo || validatingBookId
                  ? "Validating..."
                  : submitting
                  ? "Processing..."
                  : "Issue Book"}
              </span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default IssueBook;
