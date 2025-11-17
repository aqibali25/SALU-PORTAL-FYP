import { useEffect, useState } from "react";
import axios from "axios";
import DataTable from "../TableData";
import Pagination from "../Pagination";
import Background from "./../../assets/Background.png";
import BackButton from "../BackButton";
import { toast } from "react-toastify";

export default function BookIssues({ title = "Issued Books" }) {
  const [issuedBooks, setIssuedBooks] = useState([]);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const pageSize = 10;

  // Determine which status to filter by based on title
  const isOverdueView = title === "Overdue Books";

  // ✅ Fetch issued books using Axios
  useEffect(() => {
    const fetchIssuedBooks = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        const API =
          import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
        const res = await axios.get(`${API}/api/book-issues`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        // Map the data to match the expected structure
        const data = res.data.map((issue) => ({
          ...issue,
          // All data including status should come from DB
          rollNo: issue.rollNo || "",
          bookId: issue.bookId || "",
          bookName: issue.bookName || issue.title || "",
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

    // For Overdue Books view, automatically filter by "Overdue" status
    // For Issued Books view, show all books
    const matchesStatus = isOverdueView ? issue.status === "Overdue" : true;

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
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            row.status === "Issued"
              ? "bg-blue-100 text-blue-800"
              : row.status === "Returned"
              ? "bg-green-100 text-green-800"
              : row.status === "Overdue"
              ? "bg-red-100 text-red-800"
              : "bg-yellow-100 text-yellow-800"
          }`}
        >
          {row.status}
        </span>
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
        <DataTable columns={columns} rows={currentPageRows} />

        <div className="flex flex-col gap-5 sm:flex-row items-center justify-between mt-4">
          <span className="font-bold text-[1.3rem] text-gray-900 dark:text-white">
            {isOverdueView ? "Total Overdue Books" : "Total Issued Books"} :{" "}
            {filteredBooks.length}
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
