import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Background from "../../assets/Background.png";
import BackButton from "../BackButton";
import { useDepartments } from "../../Hooks/HomeCards";
import { useEnrolledStudents } from "../../Hooks/useEnrolledStudents";

const API = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const ViewTimeTable = () => {
  const [allTimetables, setAllTimetables] = useState([]); // Store all fetched data
  const [filteredTimetables, setFilteredTimetables] = useState([]); // Store filtered data
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [department, setDepartment] = useState("");
  const [semester, setSemester] = useState("");
  const [imageUrls, setImageUrls] = useState({});
  const [deletingId, setDeletingId] = useState(null); // Track which timetable is being deleted
  const currentUser = JSON.parse(localStorage.getItem("user"));

  const {
    departmentsArray,
    loading: departmentsLoading,
    error: departmentsError,
  } = useDepartments();

  const { students } = useEnrolledStudents();

  // Get student department and semester for enrolled students
  const studentInfo =
    currentUser?.role === "student" && students && students.length > 0
      ? students.find(
          (s) =>
            s.email === currentUser.email ||
            s.roll_no === currentUser.rollNo ||
            s.cnic === currentUser.cnic
        ) || {}
      : {};

  // Set initial department based on user role
  useEffect(() => {
    if (currentUser?.role === "student" && studentInfo.department) {
      setDepartment(studentInfo.department);
      setSemester(studentInfo.current_semester || "");
    } else if (currentUser?.role !== "super admin" && currentUser?.department) {
      setDepartment(currentUser.department);
    }
  }, [currentUser, studentInfo]);

  // Fetch all timetables once when component mounts
  useEffect(() => {
    fetchAllTimetables();
  }, []);

  // Apply filters whenever department, semester, or allTimetables change
  useEffect(() => {
    applyFilters();
  }, [department, semester, allTimetables]);

  // Convert buffer array to blob URL
  const convertBufferToImageUrl = (bufferArray, timetableId) => {
    try {
      const uint8Array = new Uint8Array(bufferArray);
      const blob = new Blob([uint8Array], { type: "image/png" });
      const imageUrl = URL.createObjectURL(blob);

      setImageUrls((prev) => ({
        ...prev,
        [timetableId]: imageUrl,
      }));

      return imageUrl;
    } catch (err) {
      console.error("Error converting buffer to image:", err);
      toast.error("Failed to process timetable image");
      return null;
    }
  };

  // Clean up blob URLs when component unmounts
  useEffect(() => {
    return () => {
      Object.values(imageUrls).forEach((url) => {
        if (url) URL.revokeObjectURL(url);
      });
    };
  }, [imageUrls]);

  // Fetch all timetables once
  const fetchAllTimetables = async () => {
    try {
      setLoading(true);
      setError(null);

      const token =
        localStorage.getItem("token") || sessionStorage.getItem("token");

      if (!token) {
        const errorMsg = "Authentication required. Please log in.";
        setError(errorMsg);
        toast.error(errorMsg);
        setLoading(false);
        return;
      }

      let params = {};

      // For initial fetch, get all data that might be needed
      if (currentUser?.role === "super admin") {
        // Super Admin can see all departments - no filters for initial fetch
      } else if (currentUser?.role === "student") {
        // Students can only see their department (all semesters for initial fetch)
        if (studentInfo.department) {
          params.department = studentInfo.department;
        }
      } else {
        // HOD, Teacher, Admin - only their department
        params.department = currentUser?.department || department;
      }

      const response = await axios.get(`${API}/api/timetable`, {
        params: params,
        headers: {
          Authorization: `Bearer ${token}`,
        },
        withCredentials: true,
      });

      if (response.data.data && response.data.data.length > 0) {
        const currentYear = new Date().getFullYear();
        const currentYearData = response.data.data.filter(
          (timetable) => timetable.year === currentYear
        );

        setAllTimetables(currentYearData);

        // Process images for all timetables
        currentYearData.forEach((timetable) => {
          if (
            timetable.timetable_image &&
            timetable.timetable_image.data &&
            timetable.id
          ) {
            convertBufferToImageUrl(
              timetable.timetable_image.data,
              timetable.id
            );
          }
        });
      } else {
        setAllTimetables([]);
        setError("No timetable found");
        toast.info("No timetable available");
      }
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Failed to fetch timetable";
      setError(errorMessage);
      toast.error(errorMessage);
      console.error("Error fetching timetable:", err);
    } finally {
      setLoading(false);
    }
  };

  // Delete timetable function with Toastify confirmation
  const deleteTimetable = async (timetable) => {
    // Show confirmation toast
    toast.info(
      <div className="flex flex-col gap-2">
        <p className="font-semibold">Delete Timetable?</p>
        <p>
          {timetable.department} - {timetable.semester} - {timetable.year}
        </p>
        <div className="flex gap-2 mt-2">
          <button
            onClick={() => {
              toast.dismiss();
              confirmDelete(timetable.id);
            }}
            className="!px-4 !py-2 bg-red-500 text-white hover:bg-red-600 transition-colors cursor-pointer text-sm"
          >
            Yes, Delete
          </button>
          <button
            onClick={() => toast.dismiss()}
            className="!px-4 !py-2 bg-gray-500 text-white hover:bg-gray-600 transition-colors cursor-pointer text-sm"
          >
            Cancel
          </button>
        </div>
      </div>,
      {
        autoClose: false,
        closeButton: false,
        position: "top-center",
      }
    );
  };

  // Actual delete function
  const confirmDelete = async (timetableId) => {
    try {
      setDeletingId(timetableId);

      const token =
        localStorage.getItem("token") || sessionStorage.getItem("token");

      if (!token) {
        toast.error("Authentication required. Please log in.");
        return;
      }

      const response = await axios.delete(
        `${API}/api/timetable/${timetableId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        }
      );

      if (response.data.success) {
        // Remove the deleted timetable from state
        setAllTimetables((prev) =>
          prev.filter((timetable) => timetable.id !== timetableId)
        );

        // Also remove from filtered timetables
        setFilteredTimetables((prev) =>
          prev.filter((timetable) => timetable.id !== timetableId)
        );

        // Clean up the blob URL
        if (imageUrls[timetableId]) {
          URL.revokeObjectURL(imageUrls[timetableId]);
          setImageUrls((prev) => {
            const newUrls = { ...prev };
            delete newUrls[timetableId];
            return newUrls;
          });
        }

        toast.success("🎉 Timetable deleted successfully!");
      } else {
        toast.error("❌ Failed to delete timetable");
      }
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Failed to delete timetable";
      toast.error(`❌ ${errorMessage}`);
      console.error("Error deleting timetable:", err);
    } finally {
      setDeletingId(null);
    }
  };

  // Apply filters locally to the already fetched data
  const applyFilters = () => {
    if (allTimetables.length === 0) return;

    let filtered = [...allTimetables];

    // Apply department filter for Super Admin
    if (department && currentUser?.role === "super admin") {
      filtered = filtered.filter(
        (timetable) => timetable.department === department
      );
    }

    // Apply semester filter for non-student roles
    if (semester && currentUser?.role !== "student") {
      filtered = filtered.filter(
        (timetable) => timetable.semester === semester
      );
    }

    // For students, show ONLY their current semester timetable
    if (currentUser?.role === "student") {
      filtered = filtered.filter(
        (timetable) =>
          timetable.department === studentInfo.department &&
          timetable.semester === studentInfo.current_semester
      );
    }

    setFilteredTimetables(filtered);

    // Set error if no results after filtering
    if (filtered.length === 0 && allTimetables.length > 0) {
      setError(
        currentUser?.role === "student"
          ? `No timetable found for ${studentInfo.department} - Semester ${studentInfo.current_semester}`
          : `No timetable found${department ? ` for ${department}` : ""}${
              semester ? ` semester ${semester}` : ""
            }`
      );
    } else {
      setError(null);
    }
  };

  // Download image function
  const downloadTimetable = (timetable) => {
    if (imageUrls[timetable.id]) {
      const link = document.createElement("a");
      link.href = imageUrls[timetable.id];
      link.download = `timetable-${timetable.department}-${timetable.semester}-${timetable.year}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("📥 Timetable downloaded successfully!");
    } else {
      toast.error("❌ Timetable image not available for download");
    }
  };

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

  // Check if user can see semester filter (Super Admin, HOD, Teacher, Admin)
  const canSeeSemesterFilter = [
    "super admin",
    "hod",
    "teacher",
    "admin",
  ].includes(currentUser?.role);

  // Check if user can change department (only Super Admin)
  const canChangeDepartment = currentUser?.role === "super admin";

  // Check if user is student (to hide filters)
  const isStudent = currentUser?.role === "student";

  // Check if user is super admin or hod (can delete)
  const canDeleteTimetable = ["super admin", "hod"].includes(currentUser?.role);

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
      <div className="flex flex-col gap-3 w-full min-h-[80vh] bg-[#D5BBE0] !p-5">
        <div className="flex justify-start items-center gap-3">
          <BackButton url={"/SALU-PORTAL-FYP/TimeTable"} />
          <h1 className="text-2xl sm:text-3xl md:text-4xl !py-3 font-bold text-gray-900 dark:text-white">
            View Time Table
          </h1>
        </div>

        <hr className="border-t-[3px] border-gray-900 dark:border-white !mb-4" />

        <div className="flex flex-col items-center justify-center gap-5 min-h-[60vh] w-full bg-white dark:bg-gray-900 overflow-x-auto !p-5">
          {/* Filters Section - Hidden for Students */}
          {!isStudent && (
            <div className="w-full max-w-6xl !mb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Department Selector */}
                <div>
                  <label
                    htmlFor="department"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 !mb-2"
                  >
                    {currentUser?.role === "super admin"
                      ? "Select Department"
                      : "Department"}
                  </label>
                  <select
                    id="department"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    disabled={!canChangeDepartment}
                    className="w-full !px-3 !py-2 border-2 border-gray-300 dark:border-gray-600 shadow-sm outline-none dark:bg-gray-700 dark:text-white"
                  >
                    <option value="">
                      {canChangeDepartment ? "All Departments" : "Loading..."}
                    </option>
                    {departmentsArray &&
                      departmentsArray.map((dept, index) => {
                        const departmentName =
                          typeof dept === "string"
                            ? dept
                            : dept.name || dept.title || "Unknown Department";
                        return (
                          <option key={index} value={departmentName}>
                            {departmentName}
                          </option>
                        );
                      })}
                  </select>
                </div>

                {/* Semester Selector - Only for Super Admin, HOD, Teacher, Admin */}
                {canSeeSemesterFilter && (
                  <div>
                    <label
                      htmlFor="semester"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 !mb-2"
                    >
                      Select Semester
                    </label>
                    <select
                      id="semester"
                      value={semester}
                      onChange={(e) => setSemester(e.target.value)}
                      className="w-full !px-3 !py-2 border-2 border-gray-300 dark:border-gray-600 shadow-sm outline-none dark:bg-gray-700 dark:text-white"
                    >
                      <option value="">All Semesters</option>
                      {semesterOptions.map((sem) => (
                        <option key={sem} value={sem}>
                          {sem} Semester
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Student Info Display */}
          {isStudent && studentInfo.department && (
            <div className="w-full flex flex-col md:flex-row justify-center items-center gap-5 max-w-6xl !mb-4 text-center">
              <div className="bg-gray-100 dark:bg-gray-800 w-1/4 max-auto !p-4 dark:text-white">
                {studentInfo.student_name} - {studentInfo.roll_no}
              </div>{" "}
            </div>
          )}

          {/* Error State - No Data Found */}
          {error && (
            <div className="flex flex-col items-center justify-center w-full h-64 bg-white dark:bg-gray-800 border-2 border-dashed border-gray-300 dark:border-gray-600">
              <div className="text-center">
                <div className="text-6xl text-gray-400 dark:text-gray-500 !mb-4">
                  📭
                </div>
                <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-400 !mb-2">
                  No Data Found
                </h3>
                <p className="text-gray-500 dark:text-gray-400 !mb-4 max-w-md">
                  {error}
                </p>
                <button
                  onClick={fetchAllTimetables}
                  className="!px-6 !py-2 bg-blue-500 text-white hover:bg-blue-600 transition-colors"
                >
                  Refresh Data
                </button>
              </div>
            </div>
          )}

          {/* Multiple Timetables - 2 per row */}
          {filteredTimetables.length > 0 && !error ? (
            <div className="w-full max-w-6xl">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {filteredTimetables.map((timetable, index) => (
                  <div
                    key={index}
                    className="bg-white dark:bg-gray-800 shadow-xl min-h-[400px] flex flex-col overflow-hidden cursor-default"
                  >
                    {/* Timetable Header */}
                    <div className="flex justify-between items-center !p-4 border-b border-gray-200 dark:border-gray-700">
                      <h2 className="text-lg font-bold text-gray-900 dark:text-white truncate">
                        {timetable.department} - {timetable.semester} -{" "}
                        {timetable.year}
                      </h2>
                    </div>

                    {/* Timetable Content */}
                    <div className="flex-1 !p-4 overflow-auto">
                      {timetable.id && imageUrls[timetable.id] ? (
                        <div className="flex justify-center h-full">
                          <img
                            src={imageUrls[timetable.id]}
                            alt={`Timetable for ${timetable.department || ""} ${
                              timetable.semester || ""
                            }`}
                            className="max-w-full max-h-64 object-contain"
                            onError={(e) => {
                              console.error(
                                "Image failed to load:",
                                timetable.id
                              );
                              toast.error("❌ Failed to load timetable image");
                              e.target.style.display = "none";
                            }}
                          />
                        </div>
                      ) : timetable.timetable_image &&
                        timetable.timetable_image.data ? (
                        <div className="flex flex-col items-center justify-center h-full">
                          <div className="text-center text-gray-500">
                            <div className="w-8 h-8 border-2 border-blue-500 border-dashed rounded-full animate-spin mx-auto mb-2"></div>
                            <p>Loading image...</p>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center text-gray-500 dark:text-gray-400 h-full flex flex-col justify-center">
                          <p>Timetable image not available.</p>
                        </div>
                      )}
                    </div>

                    {/* Timetable Footer */}
                    <div className="flex justify-end gap-3 !p-4 border-t border-gray-200 dark:border-gray-700">
                      <button
                        onClick={() => downloadTimetable(timetable)}
                        className="!px-4 !py-2 bg-blue-500 text-white hover:bg-blue-600 transition-colors cursor-pointer text-sm"
                      >
                        Download
                      </button>
                      {/* Delete Button - Only for Super Admin and HOD */}
                      {canDeleteTimetable && (
                        <button
                          onClick={() => deleteTimetable(timetable)}
                          disabled={deletingId === timetable.id}
                          className="!px-4 !py-2 bg-red-500 text-white hover:bg-red-600 disabled:bg-red-300 transition-colors cursor-pointer text-sm"
                        >
                          {deletingId === timetable.id ? (
                            <div className="w-4 h-4 border-2 border-white border-dashed rounded-full animate-spin mx-auto"></div>
                          ) : (
                            "Delete"
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : !department && currentUser?.role === "super admin" && !error ? (
            <div className="flex flex-col items-center justify-center w-full h-64 bg-white dark:bg-gray-800 border-2 border-dashed border-gray-300 dark:border-gray-600">
              <div className="text-center">
                <div className="text-6xl text-gray-400 dark:text-gray-500 !mb-4">
                  📋
                </div>
                <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-400 !mb-2">
                  Select a Department
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Please choose a department to view the timetable
                </p>
              </div>
            </div>
          ) : (
            !error &&
            filteredTimetables.length === 0 && (
              <div className="flex flex-col items-center justify-center w-full h-64 bg-white dark:bg-gray-800 border-2 border-dashed border-gray-300 dark:border-gray-600">
                <div className="text-center">
                  <div className="text-6xl text-gray-400 dark:text-gray-500 !mb-4">
                    📭
                  </div>
                  <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-400 !mb-2">
                    No Timetable Available
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 !mb-4">
                    {isStudent
                      ? `No timetable found for ${studentInfo.department} - Semester ${studentInfo.current_semester}`
                      : `No timetable found${
                          department ? ` for ${department}` : ""
                        }${semester ? ` semester ${semester}` : ""}`}
                  </p>
                  <button
                    onClick={fetchAllTimetables}
                    className="!px-6 !py-2 bg-blue-500 text-white hover:bg-blue-600 transition-colors"
                  >
                    Refresh Data
                  </button>
                </div>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default ViewTimeTable;
