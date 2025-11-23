import React, { useState, useRef } from "react";
import axios from "axios";

const FileUploadOverlay = ({ department, onClose }) => {
  const [files, setFiles] = useState([]);
  const [semester, setSemester] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  // Semester options
  const semesterOptions = [
    "1st",
    "2nd",
    "3rd",
    "4th",
    "5th",
    "6th",
    "7th",
    "8th",
  ];

  // Get current year
  const currentYear = new Date().getFullYear();

  const handleFileUpload = (selectedFiles) => {
    const uploaded = Array.from(selectedFiles).map((file) => ({
      id: Date.now() + Math.random(),
      file,
      status: "pending", // Start with pending status
      size: file.size,
      semester: semester, // Store selected semester
      department: department.title, // Store department name
      year: currentYear, // Store current year
    }));

    setFiles((prev) => [...prev, ...uploaded]);

    // Reset the file input to allow uploading the same file again
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removeFile = (id) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  // Function to upload a single file
  const uploadSingleFile = async (fileData) => {
    try {
      // Update file status to uploading
      setFiles((prev) =>
        prev.map((f) =>
          f.id === fileData.id ? { ...f, status: "uploading" } : f
        )
      );

      // Create form data for the API
      const formData = new FormData();
      formData.append("timetable_image", fileData.file);
      formData.append("department", fileData.department);
      formData.append("semester", fileData.semester);
      formData.append("year", fileData.year.toString());

      // Get token from localStorage
      const user = JSON.parse(localStorage.getItem("user"));
      const token = user?.token || localStorage.getItem("token");

      // API call
      const response = await axios.post(
        `${
          import.meta.env.VITE_API_BASE_URL || "http://localhost:5000"
        }/api/timetable/upload`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
          withCredentials: true,
        }
      );

      // Update file status to completed
      setFiles((prev) =>
        prev.map((f) =>
          f.id === fileData.id
            ? { ...f, status: "completed", response: response.data }
            : f
        )
      );

      return { success: true, data: response.data };
    } catch (error) {
      console.error("Error uploading file:", error);

      // Update file status to error
      setFiles((prev) =>
        prev.map((f) =>
          f.id === fileData.id
            ? {
                ...f,
                status: "error",
                error: error.response?.data || error.message,
              }
            : f
        )
      );

      return { success: false, error: error.response?.data || error.message };
    }
  };

  // Function to upload all files sequentially
  const uploadAllFiles = async () => {
    if (!semester) {
      alert("Please select a semester first!");
      return;
    }

    const pendingFiles = files.filter((file) => file.status === "pending");
    if (pendingFiles.length === 0) {
      alert("No files to upload!");
      return;
    }

    setUploading(true);

    try {
      // Upload files one by one
      for (const fileData of pendingFiles) {
        await uploadSingleFile(fileData);

        // Small delay between uploads to avoid overwhelming the server
        await new Promise((resolve) => setTimeout(resolve, 500));
      }

      alert("All files uploaded successfully!");
    } catch (error) {
      console.error("Error in upload process:", error);
      alert("Some files failed to upload. Please check the file list.");
    } finally {
      setUploading(false);
    }
  };

  // Handle overlay background click (close only when clicking the background)
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Handle drag and drop
  const handleDrop = (e) => {
    e.preventDefault();
    if (!semester) {
      alert("Please select a semester first!");
      return;
    }
    handleFileUpload(e.dataTransfer.files);
  };

  // Handle file input change
  const handleFileInputChange = (e) => {
    if (!semester) {
      alert("Please select a semester first!");
      return;
    }
    if (e.target.files.length > 0) {
      handleFileUpload(e.target.files);
    }
  };

  // Handle click on upload area to trigger file input
  const handleUploadAreaClick = () => {
    if (!semester) {
      alert("Please select a semester first!");
      return;
    }
    fileInputRef.current?.click();
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50 !p-4 cursor-pointer"
      style={{ backgroundColor: "rgba(0,0,0,0.7)" }}
      onClick={handleOverlayClick}
    >
      <div
        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl overflow-hidden cursor-default"
        onClick={(e) => e.stopPropagation()} // Prevent click from closing when clicking inside
      >
        {/* Overlay Header */}
        <div className="flex justify-between items-center !p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {department.title} - Upload Time Table
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-2xl font-bold transition-colors cursor-pointer"
          >
            ×
          </button>
        </div>

        {/* Overlay Content - File Upload Box */}
        <div className="!p-6 overflow-y-auto ">
          {/* Semester Dropdown */}
          <div className="flex w-full max-w-[800px] items-start md:items-center justify-start flex-col md:flex-row gap-[8px] md:gap-5 !mb-6">
            <label
              htmlFor="semester"
              className="w-auto md:w-1/4 text-start md:text-right text-gray-900 dark:text-white"
            >
              <span className="text-[#ff0000] mr-1">*</span>
              Semester:
            </label>
            <select
              id="semester"
              name="semester"
              required
              value={semester}
              onChange={(e) => setSemester(e.target.value)}
              className="w-[40%] [@media(max-width:768px)]:!w-full min-w-0 !px-2 !py-1 border-2 border-[#a5a5a5] outline-none bg-[#f9f9f9] text-[#2a2a2a] dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
            >
              <option value="" disabled>
                Select Semester
              </option>
              {semesterOptions.map((sem) => (
                <option key={sem} value={sem}>
                  {sem}
                </option>
              ))}
            </select>
          </div>

          {/* Year Display */}
          <div className="flex w-full max-w-[800px] items-start md:items-center justify-start flex-col md:flex-row gap-[8px] md:gap-5 !mb-6">
            <label className="w-auto md:w-1/4 text-start md:text-right text-gray-900 dark:text-white">
              Year:
            </label>
            <div className="w-[40%] [@media(max-width:768px)]:!w-full text-gray-700 dark:text-gray-300">
              {currentYear}
            </div>
          </div>

          <div className="w-full bg-white dark:bg-gray-700 rounded-lg !p-6">
            {/* Title */}
            <h2 className="text-lg font-semibold !mb-4 text-gray-900 dark:text-white">
              Upload file for {department.title}
            </h2>

            {/* Upload Area */}
            <div
              className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl !p-8 text-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              onClick={handleUploadAreaClick} // Added click handler for the entire upload area
            >
              <div className="text-gray-500 dark:text-gray-400 !mb-2">
                Choose a file or drag & drop it here.
              </div>
              <div className="text-xs text-gray-400 dark:text-gray-500">
                JPEG, PNG, and PDF formats.
              </div>

              <label className="!mt-4 inline-block bg-gray-200 dark:bg-gray-500 !px-4 !py-2 cursor-pointer hover:bg-gray-300 dark:hover:bg-gray-400 transition-colors text-gray-800 dark:text-white">
                Browse File
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  onChange={handleFileInputChange}
                  multiple
                  accept=".jpg,.jpeg,.png,.pdf"
                />
              </label>
            </div>

            {/* File List */}
            <div className="!mt-6 space-y-3">
              {files.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between bg-gray-100 dark:bg-gray-600 !p-3 !mb-2 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <img
                      src="https://upload.wikimedia.org/wikipedia/commons/8/87/PDF_file_icon.svg"
                      className="w-8 h-8 !px-2"
                      alt="file icon"
                    />
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {item.file.name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {(item.size / 1024).toFixed(0)} KB •{" "}
                        {item.status === "pending" && (
                          <span className="text-yellow-600 dark:text-yellow-400">
                            Pending
                          </span>
                        )}
                        {item.status === "uploading" && (
                          <span className="text-blue-600 dark:text-blue-400">
                            Uploading...
                          </span>
                        )}
                        {item.status === "completed" && (
                          <span className="text-green-600 dark:text-green-400">
                            Completed
                          </span>
                        )}
                        {item.status === "error" && (
                          <span className="text-red-600 dark:text-red-400">
                            Failed
                          </span>
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Remove Button */}
                  <button
                    onClick={() => removeFile(item.id)}
                    className="text-gray-500 hover:text-red-600 dark:hover:text-red-400 transition-colors text-lg cursor-pointer"
                    disabled={item.status === "uploading"}
                  >
                    {item.status === "uploading" ? "⏳" : "✖"}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Overlay Footer */}
        <div className="flex justify-end gap-3 !p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="!px-6 !py-2 bg-gray-500 text-white  hover:bg-gray-600 transition-colors disabled:opacity-50 cursor-pointer"
            disabled={uploading}
          >
            Close
          </button>
          <button
            onClick={uploadAllFiles}
            className="!px-6 !py-2 bg-blue-500 text-white  hover:bg-blue-600 transition-colors disabled:opacity-50 cursor-pointer"
            disabled={uploading || !semester || files.length === 0}
          >
            {uploading ? "Uploading..." : "Upload All Files"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default FileUploadOverlay;
