import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const FileUploadOverlay = ({ department, onClose }) => {
  const [files, setFiles] = useState([]);
  const [semester, setSemester] = useState("");
  const [uploading, setUploading] = useState(false);
  const [existingTimetables, setExistingTimetables] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
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

  // Allowed file types
  const allowedFileTypes = ["image/png", "image/jpeg", "image/jpg"];
  const allowedExtensions = [".png", ".jpg", ".jpeg"];

  // Get current year
  const currentYear = new Date().getFullYear();

  // Fetch existing timetables on component mount and when semester changes
  useEffect(() => {
    if (department && department.title) {
      fetchExistingTimetables();
    }
  }, [department, semester]);

  // Fetch existing timetables from API
  const fetchExistingTimetables = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      const token = user?.token || localStorage.getItem("token");

      const response = await axios.get(
        `${
          import.meta.env.VITE_API_BASE_URL || "http://localhost:5000"
        }/api/timetable`,
        {
          params: {
            department: department.title,
          },
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        }
      );

      // Handle the API response format
      if (response.data.success) {
        setExistingTimetables(response.data.data || []);
      } else {
        setExistingTimetables([]);
        console.error("Failed to fetch timetables:", response.data);
      }
    } catch (error) {
      console.error("Error fetching existing timetables:", error);
      setExistingTimetables([]);
    }
  };

  // Check if record already exists in frontend
  const checkDuplicateInFrontend = (department, semester, year) => {
    return existingTimetables.some(
      (timetable) =>
        timetable.department === department &&
        timetable.semester === semester &&
        timetable.year === year
    );
  };

  // Get existing timetables for current selection
  const getExistingTimetablesForSelection = () => {
    return existingTimetables.filter(
      (timetable) =>
        timetable.department === department.title &&
        timetable.semester === semester &&
        timetable.year === currentYear
    );
  };

  // Validate file type
  const validateFileType = (file) => {
    return allowedFileTypes.includes(file.type);
  };

  const handleFileUpload = async (selectedFiles) => {
    if (!semester) {
      toast.error("Please select a semester first!");
      return;
    }

    // Check for duplicate in frontend
    const duplicateExists = checkDuplicateInFrontend(
      department.title,
      semester,
      currentYear
    );

    if (duplicateExists) {
      const existingOnes = getExistingTimetablesForSelection();
      toast.error(
        <div>
          <p className="font-semibold">Timetable already exists!</p>
          <p className="text-sm">
            {department.title} - {semester} semester {currentYear}
          </p>
          <p className="text-sm">
            1st delete the existing record to upload new one
          </p>
          {existingOnes.length > 0 && (
            <p className="text-xs mt-1">
              Uploaded on:{" "}
              {new Date(existingOnes[0].uploaded_on).toLocaleDateString()}
            </p>
          )}
        </div>
      );
      return;
    }

    // Allow only one file at a time
    if (selectedFiles.length > 1) {
      toast.warning(
        "Only one file can be uploaded at a time. Please select a single file."
      );
      return;
    }

    const file = selectedFiles[0];

    // Validate file type
    if (!validateFileType(file)) {
      toast.error(
        `Invalid file format. Please upload only PNG, JPG, or JPEG files.`
      );
      return;
    }

    // Validate file size (optional: 5MB limit)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (file.size > maxSize) {
      toast.error(`File size too large. Please upload files smaller than 5MB.`);
      return;
    }

    // If validation passes, create file object
    const uploaded = [
      {
        id: Date.now() + Math.random(),
        file,
        status: "pending",
        size: file.size,
        semester: semester,
        department: department.title,
        year: currentYear,
      },
    ];

    // Replace existing files with new one (only one file allowed)
    setFiles(uploaded);

    // Reset the file input properly to prevent auto-opening
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    toast.success(`File selected for upload: ${file.name}`);
  };

  const removeFile = (id) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
    toast.info("File removed from upload list");
  };

  // Function to view file preview
  const viewFilePreview = (fileItem) => {
    setSelectedFile(fileItem);
    setShowPreview(true);
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

      // Refresh existing timetables after successful upload
      await fetchExistingTimetables();

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

      const errorMessage = error.response?.data?.message || error.message;
      return { success: false, error: errorMessage };
    }
  };

  // Function to upload the single file
  const uploadFile = async () => {
    if (!semester) {
      toast.error("Please select a semester first!");
      return;
    }

    const pendingFiles = files.filter((file) => file.status === "pending");
    if (pendingFiles.length === 0) {
      toast.warning("No file to upload!");
      return;
    }

    // Check for duplicate in frontend before starting upload
    const duplicateExists = checkDuplicateInFrontend(
      department.title,
      semester,
      currentYear
    );

    if (duplicateExists) {
      const existingOnes = getExistingTimetablesForSelection();
      toast.error(
        <div>
          <p className="font-semibold">Cannot upload - Timetable exists!</p>
          <p className="text-sm">
            {department.title} - {semester} semester {currentYear}
          </p>
          <p className="text-sm">1st delete this record to upload new one</p>
          {existingOnes.length > 0 && (
            <p className="text-xs mt-1">
              Already uploaded on:{" "}
              {new Date(existingOnes[0].uploaded_on).toLocaleDateString()}
            </p>
          )}
        </div>
      );
      return;
    }

    setUploading(true);
    toast.info("Starting file upload...");

    try {
      // Upload the single file
      const fileData = pendingFiles[0];
      const result = await uploadSingleFile(fileData);

      if (result.success) {
        toast.success(`File uploaded successfully: ${fileData.file.name}`);

        // Reset semester and close overlay after successful upload
        setSemester("");
        setTimeout(() => {
          onClose();
        }, 1500);
      } else {
        toast.error(`Failed to upload ${fileData.file.name}: ${result.error}`);
        // Don't close overlay on error - let user try again
      }
    } catch (error) {
      console.error("Error in upload process:", error);
      toast.error("Upload process failed unexpectedly.");
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

  // Handle preview overlay click
  const handlePreviewOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      setShowPreview(false);
      setSelectedFile(null);
    }
  };

  // Handle drag and drop
  const handleDrop = async (e) => {
    e.preventDefault();
    if (!semester) {
      toast.error("Please select a semester first!");
      return;
    }
    await handleFileUpload(e.dataTransfer.files);
  };

  // Handle file input change - fixed to prevent auto-opening
  const handleFileInputChange = async (e) => {
    if (!semester) {
      toast.error("Please select a semester first!");
      // Reset input if semester not selected
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      return;
    }

    if (e.target.files && e.target.files.length > 0) {
      await handleFileUpload(e.target.files);
    }
  };

  // Handle click on upload area to trigger file input - fixed
  const handleUploadAreaClick = () => {
    if (!semester) {
      toast.error("Please select a semester first!");
      return;
    }

    // Reset the input first to ensure change event fires properly
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
      fileInputRef.current.click();
    }
  };

  // Count files by status
  const pendingCount = files.filter((f) => f.status === "pending").length;
  const completedCount = files.filter((f) => f.status === "completed").length;
  const uploadingCount = files.filter((f) => f.status === "uploading").length;
  const errorCount = files.filter((f) => f.status === "error").length;

  // Get duplicates for current selection
  const currentDuplicates = getExistingTimetablesForSelection();

  return (
    <>
      <div
        className="fixed inset-0 flex items-center justify-center z-50 !p-4 cursor-pointer"
        style={{ backgroundColor: "rgba(0,0,0,0.7)" }}
        onClick={handleOverlayClick}
      >
        <div
          className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl overflow-hidden cursor-default"
          onClick={(e) => e.stopPropagation()}
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
          <div className="!p-6 overflow-y-auto">
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
                onClick={handleUploadAreaClick}
              >
                <div className="text-gray-500 dark:text-gray-400 !mb-2">
                  Choose a file or drag & drop it here.
                </div>
                <div className="text-xs text-gray-400 dark:text-gray-500">
                  PNG, JPG, and JPEG formats only. Only one file allowed.
                </div>

                <label className="!mt-4 inline-block bg-gray-200 dark:bg-gray-500 !px-4 !py-2 cursor-pointer hover:bg-gray-300 dark:hover:bg-gray-400 transition-colors text-gray-800 dark:text-white">
                  Browse File
                  <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    onChange={handleFileInputChange}
                    accept=".png,.jpg,.jpeg"
                  />
                </label>
              </div>

              {/* File List */}
              {files.length > 0 && (
                <div className="!mt-6 space-y-3">
                  {files.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between bg-gray-100 dark:bg-gray-600 !p-3 !mb-2 rounded-lg"
                    >
                      <div className="flex items-center space-x-3 flex-1">
                        <img
                          src="https://upload.wikimedia.org/wikipedia/commons/8/87/PDF_file_icon.svg"
                          className="w-8 h-8 !px-2"
                          alt="file icon"
                        />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {item.file.name}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {(item.size / 1024).toFixed(0)} KB •{" "}
                            {item.status === "pending" && (
                              <span className="text-yellow-600 dark:text-yellow-400">
                                Ready to upload
                              </span>
                            )}
                            {item.status === "uploading" && (
                              <span className="text-blue-600 dark:text-blue-400">
                                Uploading...
                              </span>
                            )}
                            {item.status === "completed" && (
                              <span className="text-green-600 dark:text-green-400">
                                Uploaded successfully
                              </span>
                            )}
                            {item.status === "error" && (
                              <span className="text-red-600 dark:text-red-400">
                                Upload failed
                              </span>
                            )}
                          </p>
                        </div>
                      </div>

                      <div className="flex justify-between w-[50px] items-center space-x-2">
                        {/* Eye Button for Preview */}
                        <button
                          onClick={() => viewFilePreview(item)}
                          className="text-blue-500 hover:text-blue-700 dark:hover:text-blue-300 transition-colors text-lg cursor-pointer"
                          title="Preview File"
                        >
                          👁️
                        </button>

                        {/* Remove Button */}
                        <button
                          onClick={() => removeFile(item.id)}
                          className="text-gray-500 hover:text-red-600 dark:hover:text-red-400 transition-colors text-lg cursor-pointer"
                          disabled={item.status === "uploading"}
                          title="Remove File"
                        >
                          {item.status === "uploading" ? "⏳" : "✖"}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Overlay Footer */}
          <div className="flex justify-end gap-3 !p-6 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={onClose}
              className="!px-6 !py-2 bg-gray-500 text-white hover:bg-gray-600 transition-colors disabled:opacity-50 cursor-pointer"
              disabled={uploading}
            >
              Close
            </button>
            <button
              onClick={uploadFile}
              className="!px-6 !py-2 bg-blue-500 text-white hover:bg-blue-600 transition-colors disabled:opacity-50 cursor-pointer"
              disabled={
                uploading ||
                !semester ||
                files.length === 0 ||
                pendingCount === 0 ||
                currentDuplicates.length > 0
              }
            >
              {uploading ? "Uploading..." : "Upload File"}
            </button>
          </div>
        </div>
      </div>

      {/* File Preview Overlay */}
      {showPreview && selectedFile && (
        <div
          className="fixed inset-0 flex items-center justify-center z-[60] !p-4 cursor-pointer"
          style={{ backgroundColor: "rgba(0,0,0,0.8)" }}
          onClick={handlePreviewOverlayClick}
        >
          <div
            className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden cursor-default"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Preview Header */}
            <div className="flex justify-between items-center !p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                File Preview - {selectedFile.file.name}
              </h2>
              <button
                onClick={() => {
                  setShowPreview(false);
                  setSelectedFile(null);
                }}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-2xl font-bold transition-colors cursor-pointer"
              >
                ×
              </button>
            </div>

            {/* Preview Content */}
            <div className="!p-6 max-h-[70vh] overflow-auto">
              {selectedFile.file.type.startsWith("image/") ? (
                <div className="flex justify-center">
                  <img
                    src={URL.createObjectURL(selectedFile.file)}
                    alt="Preview"
                    className="max-w-full max-h-[60vh] object-contain"
                  />
                </div>
              ) : (
                <div className="text-center text-gray-500 dark:text-gray-400">
                  <p>Preview not available for this file type.</p>
                  <p className="text-sm mt-2">File: {selectedFile.file.name}</p>
                  <p className="text-sm">
                    Size: {(selectedFile.file.size / 1024).toFixed(0)} KB
                  </p>
                </div>
              )}
            </div>

            {/* Preview Footer */}
            <div className="flex justify-end gap-3 !p-6 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => {
                  setShowPreview(false);
                  setSelectedFile(null);
                }}
                className="!px-6 !py-2 bg-gray-500 text-white hover:bg-gray-600 transition-colors cursor-pointer"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default FileUploadOverlay;
