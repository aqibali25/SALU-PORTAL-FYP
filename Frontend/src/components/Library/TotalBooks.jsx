import { useEffect, useState } from "react";
import axios from "axios";
import { FaEdit, FaTrash } from "react-icons/fa";
import DataTable from "../TableData";
import Pagination from "../../components/Pagination";
import Background from "./../../assets/Background.png";
import { useNavigate } from "react-router-dom";
import BackButton from "../BackButton";
import { toast } from "react-toastify";

export default function TotalBooks() {
  const [books, setBooks] = useState([]);
  const [query, setQuery] = useState("");
  const [genreFilter, setGenreFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [deletingBook, setDeletingBook] = useState(null);
  const pageSize = 10;
  const navigate = useNavigate();

  // ✅ Get current theme
  const getCurrentTheme = () => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("theme") || "light";
    }
    return "light";
  };

  // ✅ Function to fetch books (extracted for reusability)
  const fetchBooks = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const API = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
      const res = await axios.get(`${API}/api/library/books`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Map the data to match the expected structure
      const data = res.data.data.map((book, index) => ({
        ...book,
        serialno: index + 1,
        // All data including status should come from DB
        bookId: book.bookId || book.isbn || "", // Support both bookId and isbn
        title: book.title || "",
        authors: book.authors || "",
        genre: book.genre || book.category || "", // Support both genre and category
        language: book.language || "",
        totalCopies: book.totalCopies || 0,
        availableCopies: book.availableCopies || 0,
        status:
          book.status ||
          (book.availableCopies > 0 ? "Available" : "Out of Stock"), // Use status from DB if available
      }));
      setBooks(data);
    } catch (err) {
      console.error(err);
      toast.error("Error loading books: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Fetch books using Axios
  useEffect(() => {
    fetchBooks();
  }, []);

  // ✅ Handle book delete
  const handleDeleteBook = async (book) => {
    if (deletingBook) return; // Prevent multiple clicks

    const theme = getCurrentTheme();

    // Custom toast for confirmation
    toast.info(
      <div className="!p-4 !m-2">
        <div className="flex items-center gap-3 !mb-3">
          <FaTrash className="text-red-500 text-xl" />
          <span className="font-semibold text-gray-900 dark:text-gray-100">
            Confirm Book Deletion
          </span>
        </div>
        <p className="!mb-4 text-gray-700 dark:text-gray-300">
          Are you sure you want to delete the book "{book.title}"? This action
          cannot be undone.
        </p>
        <div className="flex gap-2 justify-end">
          <button
            onClick={() => {
              toast.dismiss();
              processBookDelete(book);
            }}
            className="!px-4 !py-2 bg-red-500 hover:bg-red-600 text-white cursor-pointer font-medium transition-colors"
          >
            Yes, Delete Book
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

  // ✅ Process book delete API call
  const processBookDelete = async (book) => {
    try {
      setDeletingBook(book._id);
      const token = localStorage.getItem("token");
      const API = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

      // Delete the book from the server
      await axios.delete(`${API}/api/library/books/${book.bookId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // ✅ Option 1: Remove from local state immediately for better UX
      setBooks((prev) => prev.filter((b) => b.bookId !== book.bookId));

      // ✅ Option 2: Refresh data in background to ensure consistency
      setTimeout(() => {
        fetchBooks();
      }, 500);

      const theme = getCurrentTheme();
      toast.success(
        <div className="!p-3 !m-1">
          <div className="flex items-center gap-2">
            <span className="font-medium text-gray-900 dark:text-gray-100">
              Book "{book.title}" deleted successfully!
            </span>
          </div>
        </div>,
        {
          position: "top-center",
          autoClose: 3000,
          style: {
            backgroundColor: theme === "dark" ? "#1f2937" : "#ffffff",
            color: theme === "dark" ? "#f9fafb" : "#1f2937",
          },
        }
      );
    } catch (err) {
      console.error(err);
      const theme = getCurrentTheme();
      toast.error(
        <div className="!p-3 !m-1">
          <div className="flex items-center gap-2">
            <span className="font-medium text-gray-900 dark:text-gray-100">
              {err.response?.data?.message || err.message}
            </span>
          </div>
        </div>,
        {
          position: "top-center",
          autoClose: 5000,
          style: {
            backgroundColor: theme === "dark" ? "#1f2937" : "#ffffff",
            color: theme === "dark" ? "#f9fafb" : "#1f2937",
          },
        }
      );
    } finally {
      setDeletingBook(null);
    }
  };

  // Get unique genres for filter
  const genres = [...new Set(books.map((book) => book.genre).filter(Boolean))];

  // Get unique statuses for filter (from DB)
  const statuses = [
    ...new Set(books.map((book) => book.status).filter(Boolean)),
  ];

  // ✅ Filter books by search query, genre, and status
  const filteredBooks = books.filter((book) => {
    const matchesSearch = [
      book.bookId,
      book.title,
      book.bookAddition || "N/A",
      book.authors,
      book.genre,
      book.language,
    ]
      .join(" ")
      .toLowerCase()
      .includes(query.toLowerCase());

    const matchesGenre = !genreFilter || book.genre === genreFilter;

    const matchesStatus = !statusFilter || book.status === statusFilter;

    return matchesSearch && matchesGenre && matchesStatus;
  });

  // ✅ Pagination logic
  const pageCount = Math.ceil(filteredBooks.length / pageSize);
  const currentPageRows = filteredBooks.slice(
    (page - 1) * pageSize,
    page * pageSize
  );

  const columns = [
    { key: "bookId", label: "Book ID" },
    { key: "title", label: "Book Title" },
    { key: "bookAddition", label: "Book Addition" },
    { key: "authors", label: "Author(s)" },
    { key: "genre", label: "Genre/Category" },
    { key: "language", label: "Language" },
    { key: "totalCopies", label: "Total Copies" },
    { key: "availableCopies", label: "Available Copies" },
    {
      key: "status",
      label: "Status",
      render: (row) => (
        <span
          className={`!px-2 !py-1 rounded-full text-sm font-medium ${
            row.status === "Available"
              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
              : row.status === "Out of Stock"
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
      label: "Edit",
      onClick: (row) => {
        navigate(`/SALU-PORTAL-FYP/Library/UpdateBook/${row.bookId}`, {
          state: { book: row },
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
      onClick: (row) => handleDeleteBook(row),
      icon: (
        <FaTrash
          size={20}
          className="text-red-500 hover:text-red-600 cursor-pointer"
        />
      ),
    },
  ];

  // Reset to page 1 when filters change
  useEffect(() => {
    setPage(1);
  }, [query, genreFilter, statusFilter]);

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
            Total Books
          </h1>
        </div>

        <hr className="border-t-[3px] border-gray-900 dark:border-white mb-4" />

        {/* Search Input */}
        <div className="w-full flex justify-end mb-4">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search books by ID, title, author, genre, or language..."
            className="w-full sm:w-80 !px-3 !py-2 border-2 border-[#a5a5a5] outline-none bg-[#f9f9f9] text-[#2a2a2a] dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
          />
        </div>

        {/* Filters Container */}
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center w-full">
          {/* Genre Filter */}
          <div className="relative flex-1 sm:w-60">
            <select
              value={genreFilter}
              onChange={(e) => setGenreFilter(e.target.value)}
              className="w-full !px-4 !py-2 border-2 border-[#a5a5a5] bg-[#f9f9f9] dark:bg-gray-800 text-[#2a2a2a] dark:text-gray-100 focus:outline-none appearance-none cursor-pointer"
            >
              <option value="">All Genres</option>
              {genres.map((genre) => (
                <option key={genre} value={genre}>
                  {genre}
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
          <div className="relative flex-1 sm:w-60">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full !px-4 !py-2 border-2 border-[#a5a5a5] bg-[#f9f9f9] dark:bg-gray-800 text-[#2a2a2a] dark:text-gray-100 focus:outline-none appearance-none cursor-pointer"
            >
              <option value="">All Status</option>
              {statuses.map((status) => (
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
          {(query || genreFilter || statusFilter) && (
            <button
              onClick={() => {
                setQuery("");
                setGenreFilter("");
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
            Total Books : {filteredBooks.length}
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
