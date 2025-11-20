import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { FaUpload } from "react-icons/fa";
import Background from "../../assets/Background.png";
import InputContainer from "../InputContainer";
import BackButton from "../BackButton";

const AddBook = ({ Title }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const editingBook = useMemo(
    () => location.state?.book ?? null,
    [location.state]
  );

  const [form, setForm] = useState({
    bookId: "",
    bookTitle: "",
    bookEdition: "", // New field
    authors: "",
    genre: "",
    language: "",
    availableCopies: "",
    totalCopies: "",
    fileAttachment: null,
  });

  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [fileName, setFileName] = useState("");

  // ✅ If editing, prefill the form
  useEffect(() => {
    const initData = async () => {
      try {
        setLoading(true);

        if (editingBook) {
          setForm({
            bookId: editingBook.bookId || editingBook.isbn || "",
            bookTitle: editingBook.title || "",
            bookEdition: editingBook.bookEdition || "", // Prefill bookEdition
            authors: editingBook.authors || "",
            genre: editingBook.genre || "",
            language: editingBook.language || "",
            availableCopies: editingBook.availableCopies?.toString() || "",
            totalCopies: editingBook.totalCopies?.toString() || "",
            fileAttachment: editingBook.fileAttachment || null,
          });

          // Set file name if file attachment exists
          if (editingBook.fileAttachment) {
            setFileName(editingBook.fileAttachment.name || "Attached file");
          }
        }
      } finally {
        setLoading(false);
      }
    };

    initData();
  }, [editingBook]);

  const onChange = (key) => (e) => {
    const value = e.target.value;
    setForm((f) => ({
      ...f,
      [key]: value,
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setForm((f) => ({
        ...f,
        fileAttachment: file,
      }));
      setFileName(file.name);
    }
  };

  const removeFile = () => {
    setForm((f) => ({
      ...f,
      fileAttachment: null,
    }));
    setFileName("");
    // Reset the file input
    const fileInput = document.getElementById("fileAttachment");
    if (fileInput) {
      fileInput.value = "";
    }
  };

  // ✅ Submit Handler (Axios)
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation (keep your existing validation)

    try {
      setSubmitting(true);
      const token = localStorage.getItem("token");
      const API = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

      const payload = {
        bookId: form.bookId.trim(),
        title: form.bookTitle.trim(),
        bookEdition: form.bookEdition.trim() || null, // Send null if empty
        authors: form.authors.trim(),
        genre: form.genre.trim(),
        language: form.language.trim(),
        availableCopies: parseInt(form.availableCopies),
        totalCopies: parseInt(form.totalCopies),
        status: "Available",
      };

      // Your existing copies validation
      if (payload.availableCopies > payload.totalCopies) {
        toast.error("Available copies cannot exceed total copies.");
        return;
      }

      // Choose between update or create based on whether we're editing
      if (editingBook) {
        await axios.put(
          `${API}/api/library/books/${editingBook.bookId}`,
          payload,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            withCredentials: true,
          }
        );
      } else {
        await axios.post(`${API}/api/library/books`, payload, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        });
      }

      // Success toast with auto navigation
      toast.success(
        Title === "Update Book"
          ? "Book updated successfully!"
          : "Book added successfully!",
        {
          position: "top-center",
          autoClose: 2000,
        }
      );

      // Navigate after success message
      setTimeout(() => {
        Title === "Update Book"
          ? navigate("/SALU-PORTAL-FYP/Library/TotalBooks")
          : navigate("/SALU-PORTAL-FYP/Library");
      }, 3000);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Error saving book", {
        position: "top-center",
      });
    } finally {
      setSubmitting(false);
    }
  };

  // ✅ Loading Spinner
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
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-3 w-full min-h-[80vh] bg-[#D5BBE0] rounded-md !p-5"
      >
        <div className="flex justify-start items-center gap-3">
          <BackButton
            url={
              Title === "Update Book"
                ? "/SALU-PORTAL-FYP/Library/TotalBooks"
                : "/SALU-PORTAL-FYP/Library"
            }
          />
          <h1 className="text-2xl sm:text-3xl md:text-4xl py-3 font-bold text-gray-900 dark:text-white">
            {Title}
          </h1>
        </div>

        <hr className="border-t-[3px] border-gray-900 dark:border-white mb-4" />

        <div className="flex flex-col justify-center items-center gap-5 min-h-[60vh] w-full !p-5 bg-white dark:bg-gray-900 rounded-md">
          {/* Book ID - Now placed first */}
          <InputContainer
            placeholder="Enter Book ID"
            title="Book ID"
            htmlFor="bookId"
            inputType="text"
            required
            value={form.bookId}
            onChange={onChange("bookId")}
          />

          {/* Book Title */}
          <InputContainer
            placeholder="Enter Book Title"
            title="Book Title"
            htmlFor="bookTitle"
            inputType="text"
            required
            value={form.bookTitle}
            onChange={onChange("bookTitle")}
          />

          {/* Book Edition - New optional field */}
          <InputContainer
            placeholder="Enter Book Edition (Optional)"
            title="Book Edition"
            htmlFor="bookEdition"
            inputType="text"
            value={form.bookEdition}
            onChange={onChange("bookEdition")}
          />

          {/* Author(s) */}
          <InputContainer
            placeholder="Enter Author(s) Name"
            title="Author(s)"
            htmlFor="authors"
            inputType="text"
            required
            value={form.authors}
            onChange={onChange("authors")}
          />

          {/* Genre/Category */}
          <InputContainer
            placeholder="Enter Genre/Category"
            title="Genre/Category"
            htmlFor="genre"
            inputType="text"
            required
            value={form.genre}
            onChange={onChange("genre")}
          />

          {/* Language */}
          <InputContainer
            placeholder="Enter Language"
            title="Language"
            htmlFor="language"
            inputType="text"
            width="45%"
            required
            value={form.language}
            onChange={onChange("language")}
          />

          {/* Available Copies */}
          <InputContainer
            placeholder="Enter Available Copies"
            title="Available Copies"
            htmlFor="availableCopies"
            inputType="number"
            width="45%"
            required
            value={form.availableCopies}
            onChange={onChange("availableCopies")}
            min="0"
          />

          {/* Total Copies */}
          <InputContainer
            placeholder="Enter Total Copies"
            title="Total Copies"
            htmlFor="totalCopies"
            inputType="number"
            width="45%"
            required
            value={form.totalCopies}
            onChange={onChange("totalCopies")}
            min="0"
          />

          {/* File Attachment with Upload Icon */}
          <div className="flex w-full max-w-[800px] items-start md:items-center justify-start flex-col md:flex-row gap-[8px] md:gap-5 [@media(max-width:550px)]:gap-[5px]">
            <label
              htmlFor="fileAttachment"
              className="w-auto md:w-1/4 text-start md:text-right text-gray-900 dark:text-white"
            >
              File Attachment:
            </label>
            <div className="w-[40%] [@media(max-width:768px)]:!w-full relative cursor-pointer">
              <input
                id="fileAttachment"
                type="file"
                onChange={handleFileChange}
                className="w-full min-w-0 !px-2 !py-1 border-2 border-[#a5a5a5] outline-none bg-[#f9f9f9] text-[#2a2a2a] dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 opacity-0 absolute inset-0 cursor-pointer"
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              />
              <div className="flex items-center gap-2 border-2 border-[#a5a5a5] bg-[#f9f9f9] dark:border-gray-600 dark:bg-gray-800 !px-3 !py-2 cursor-pointer">
                <FaUpload className="text-gray-600 dark:text-gray-400 cursor-pointer" />
                <span className="text-gray-600 dark:text-gray-300 text-sm truncate cursor-pointer">
                  {fileName || "Choose file"}
                </span>
              </div>

              {/* Remove file button - only show when file is selected */}
              {fileName && (
                <button
                  type="button"
                  onClick={removeFile}
                  className="absolute -right-8 top-1/2 transform -translate-y-1/2 text-red-500 hover:text-red-700 cursor-pointer"
                  title="Remove file"
                >
                  ×
                </button>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <div className="w-full flex justify-end mt-4">
            <button
              type="submit"
              disabled={submitting}
              className="cursor-pointer relative overflow-hidden !px-[15px] !py-[5px] border-2 border-[#e5b300] text-white text-[0.8rem] font-medium bg-transparent transition-all duration-300 ease-linear
                         before:content-[''] before:absolute before:inset-x-0 before:bottom-0 before:h-full before:bg-[#e5b300] before:transition-all before:duration-300 before:ease-linear hover:before:h-0 disabled:opacity-60"
            >
              <span className="relative z-10">
                {submitting
                  ? Title === "Update Book"
                    ? "Updating..."
                    : "Adding..."
                  : Title === "Update Book"
                  ? "Update Book"
                  : "Add Book"}
              </span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AddBook;
