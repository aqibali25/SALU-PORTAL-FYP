import { useEffect, useState } from "react";
import axios from "axios";
import DataTable from "../TableData";
import Pagination from "../Pagination";
import Background from "./../../assets/Background.png";
import BackButton from "../BackButton";
import { toast } from "react-toastify";
import { FaCheckCircle } from "react-icons/fa";

export default function BookIssues({ title = "Issued Books" }) {
  const [issuedBooks, setIssuedBooks] = useState([]);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [returningBook, setReturningBook] = useState(null);
  const pageSize = 10;

  // Determine which status to filter by based on title
  const isOverdueView = title === "Overdue Books";
  const isIssuedView = title === "Issued Books";

  // ✅ Get current theme
  const getCurrentTheme = () => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("theme") || "light";
    }
    return "light";
  };

  // ✅ Update overdue books status
  const updateOverdueBooks = async () => {
    try {
      const token = localStorage.getItem("token");
      const API = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

      const response = await axios.put(
        `${API}/api/library/book-issues/update-overdue`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        }
      );

      if (response.data.updatedCount > 0) {
        console.log(
          `Updated ${response.data.updatedCount} books to overdue status`
        );
      }
    } catch (err) {
      console.error("Error updating overdue books:", err);
    }
  };

  // ✅ Fetch issued books using Axios
  useEffect(() => {
    const fetchIssuedBooks = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        const API =
          import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

        // First update overdue books status
        await updateOverdueBooks();

        // Then fetch all book issues
        const res = await axios.get(`${API}/api/library/book-issues`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        // Map the data to match the expected structure
        const data = res.data.map((issue) => ({
          ...issue,
          // All data including status should come from DB
          rollNo: issue.rollNo || "",
          bookId: issue.bookId || "",
          bookName: issue.bookName || issue.title || "",
          bookAddition: issue.bookAddition || "N/A",
          issueDate: issue.issueDate || "",
          dueDate: issue.dueDate || "",
          status: issue.status || "Issued",
        }));

        setIssuedBooks(data);
      } catch (err) {
        console.error(err);
        toast.error("Error loading book issues: " + err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchIssuedBooks();
  }, []);

  // ✅ Handle book return
  const handleReturnBook = async (book) => {
    if (returningBook) return; // Prevent multiple clicks

    const isOverdue = book.status === "Overdue";
    const theme = getCurrentTheme();

    const confirmMessage = isOverdue
      ? "Are you sure the book is returned with the overdue fees?"
      : "Are you sure the book is returned within due date?";

    // Custom toast for confirmation
    toast.info(
      <div className="!p-4 !m-2">
        <div className="flex items-center gap-3 !mb-3">
          <FaCheckCircle className="text-blue-500 text-xl" />
          <span className="font-semibold text-gray-900 dark:text-gray-100">
            Confirm Book Return
          </span>
        </div>
        <p className="!mb-4 text-gray-700 dark:text-gray-300">
          {confirmMessage}
        </p>
        <div className="flex gap-2 justify-end">
          <button
            onClick={() => {
              toast.dismiss();
              processBookReturn(book);
            }}
            className="!px-4 !py-2 bg-green-500 hover:bg-green-600 text-white cursor-pointer font-medium transition-colors"
          >
            Yes, Return Book
          </button>
          <button
            onClick={() => toast.dismiss()}
            className="!px-4 !py-2 bg-gray-500 hover:bg-gray-600 text-white cursor-pointer font-medium transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>,
      {
        position: "top-center",
        autoClose: false,
        closeOnClick: false,
        draggable: false,
        closeButton: false,
        style: {
          minWidth: "400px",
          backgroundColor: theme === "dark" ? "#1f2937" : "#ffffff",
          color: theme === "dark" ? "#f9fafb" : "#1f2937",
          border: theme === "dark" ? "1px solid #374151" : "1px solid #e5e7eb",
        },
      }
    );
  };

  // ✅ Process book return API call
  const processBookReturn = async (book) => {
    try {
      setReturningBook(book._id);
      const token = localStorage.getItem("token");
      const API = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

      // Get current date in YYYY-MM-DD format
      const today = new Date();
      const returnDate = today.toISOString().split("T")[0];

      const payload = {
        rollNo: book.rollNo,
        bookId: book.bookId,
        status: "Returned",
        returnDate: returnDate,
      };

      // Update book status to Returned
      const response = await axios.put(
        `${API}/api/library/book-issues/status`,
        payload,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        }
      );

      // ✅ Refresh the table data by fetching updated book issues
      await refreshBookIssues();

      // Success message based on previous status
      const successMessage =
        book.status === "Overdue"
          ? "Book returned successfully with overdue fees!"
          : "Book returned successfully within due date!";

      const theme = getCurrentTheme();

      toast.success(
        <div className="!p-3 !m-1">
          <div className="flex items-center gap-2">
            <span className="font-medium text-gray-900 dark:text-gray-100">
              {successMessage}
            </span>
          </div>
        </div>,
        {
          position: "top-center", // Changed to top-center for consistency
          autoClose: 3000,
          style: {
            backgroundColor: theme === "dark" ? "#1f2937" : "#ffffff",
            color: theme === "dark" ? "#f9fafb" : "#1f2937",
          },
        }
      );
    } catch (err) {
      console.error("Error returning book:", err);
      const theme = getCurrentTheme();

      toast.error(
        <div className="!p-3 !m-1">
          <div className="flex items-center gap-2">
            <span className="font-medium text-gray-900 dark:text-gray-100">
              Error returning book: {err.response?.data?.message || err.message}
            </span>
          </div>
        </div>,
        {
          position: "top-center", // Changed to top-center for consistency
          autoClose: 5000,
          style: {
            backgroundColor: theme === "dark" ? "#1f2937" : "#ffffff",
            color: theme === "dark" ? "#f9fafb" : "#1f2937",
          },
        }
      );
    } finally {
      setReturningBook(null);
    }
  };

  // ✅ Function to refresh book issues data
  const refreshBookIssues = async () => {
    try {
      const token = localStorage.getItem("token");
      const API = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

      // Fetch updated book issues
      const res = await axios.get(`${API}/api/library/book-issues`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Map the data to match the expected structure
      const data = res.data.map((issue) => ({
        ...issue,
        rollNo: issue.rollNo || "",
        bookId: issue.bookId || "",
        bookName: issue.bookName || issue.title || "",
        issueDate: issue.issueDate || "",
        dueDate: issue.dueDate || "",
        status: issue.status || "Issued",
      }));

      setIssuedBooks(data);
    } catch (err) {
      console.error("Error refreshing book issues:", err);
      toast.error("Error refreshing data: " + err.message, {
        position: "top-center",
      });
    }
  };

  // ✅ Filter books based on title and search query
  const filteredBooks = issuedBooks.filter((issue) => {
    const matchesSearch = [
      issue.rollNo,
      issue.bookId,
      issue.bookName,
      issue.status,
    ]
      .join(" ")
      .toLowerCase()
      .includes(query.toLowerCase());

    // Filter by status based on title
    let matchesStatus = true;

    if (isIssuedView) {
      // For Issued Books view, show only books with "Issued" status
      matchesStatus = issue.status === "Issued";
    } else if (isOverdueView) {
      // For Overdue Books view, show only books with "Overdue" status
      matchesStatus = issue.status === "Overdue";
    }
    // If it's any other title, show all books

    return matchesSearch && matchesStatus;
  });

  // ✅ Pagination logic
  const pageCount = Math.ceil(filteredBooks.length / pageSize);
  const currentPageRows = filteredBooks.slice(
    (page - 1) * pageSize,
    page * pageSize
  );

  const columns = [
    { key: "rollNo", label: "Student Roll No" },
    { key: "bookId", label: "Book ID" },
    { key: "bookName", label: "Book Name" },
    { key: "bookAddition", label: "Book Addition" },
    {
      key: "issueDate",
      label: "Issue Date",
      render: (row) => (
        <span>
          {row.issueDate ? new Date(row.issueDate).toLocaleDateString() : "-"}
        </span>
      ),
    },
    {
      key: "dueDate",
      label: "Due Date",
      render: (row) => (
        <span>
          {row.dueDate ? new Date(row.dueDate).toLocaleDateString() : "-"}
        </span>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (row) => (
        <span
          className={`!px-2 !py-1 rounded-full text-sm font-medium ${
            row.status === "Issued"
              ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
              : row.status === "Returned"
              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
              : row.status === "Overdue"
              ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
              : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
          }`}
        >
          {row.status}
        </span>
      ),
    },
  ];

  // ✅ Table actions
  const actions = [
    {
      label: "Return",
      onClick: (row) => handleReturnBook(row),
      render: (row) => (
        <button
          onClick={() => handleReturnBook(row)}
          disabled={returningBook === row._id || row.status === "Returned"}
          className={`flex items-center gap-1 !px-3 !py-1 font-medium transition-colors cursor-pointer ${
            row.status === "Returned"
              ? "bg-gray-300 text-gray-500 dark:bg-gray-700 dark:text-gray-400 cursor-not-allowed"
              : row.status === "Issued"
              ? "bg-green-500 hover:bg-green-600 text-white dark:bg-green-600 dark:hover:bg-green-700"
              : row.status === "Overdue"
              ? "bg-red-500 hover:bg-red-600 text-white dark:bg-red-600 dark:hover:bg-red-700"
              : "bg-blue-500 hover:bg-blue-600 text-white dark:bg-blue-600 dark:hover:bg-blue-700"
          } ${
            returningBook === row._id ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          <FaCheckCircle size={14} />
          <span>{returningBook === row._id ? "Returning..." : "Return"}</span>
        </button>
      ),
    },
  ];

  // Reset to page 1 when search query changes
  useEffect(() => {
    setPage(1);
  }, [query]);

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
          <BackButton url="/SALU-PORTAL-FYP/Library" />
          <h1 className="text-2xl sm:text-3xl md:text-4xl !py-3 font-bold text-gray-900 dark:text-white">
            {title}
          </h1>
        </div>

        <hr className="border-t-[3px] border-gray-900 dark:border-white mb-4" />

        {/* Search Input */}
        <div className="w-full flex justify-end mb-4">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by roll no, book ID, book name, or status..."
            className="w-full sm:w-80 !px-3 !py-2 border-2 border-[#a5a5a5] outline-none bg-[#f9f9f9] text-[#2a2a2a] dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
          />
        </div>

        {/* Clear Search Button - Only show when search is active */}
        {query && (
          <div className="flex justify-start">
            <button
              onClick={() => setQuery("")}
              className="!px-4 !py-2 cursor-pointer bg-red-500 hover:bg-red-600 text-white font-medium transition-colors duration-200 whitespace-nowrap"
            >
              Clear Search
            </button>
          </div>
        )}

        {/* Table */}
        <DataTable columns={columns} rows={currentPageRows} actions={actions} />

        <div className="flex flex-col gap-5 sm:flex-row items-center justify-between mt-4">
          <span className="font-bold text-[1.3rem] text-gray-900 dark:text-white">
            {isIssuedView
              ? "Total Issued Books"
              : isOverdueView
              ? "Total Overdue Books"
              : "Total Book Issues"}{" "}
            : {filteredBooks.length}
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
