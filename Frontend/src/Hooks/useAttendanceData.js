import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const backendBaseUrl =
  import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

export const useAttendanceData = (subject, token) => {
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAttendanceRecords = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.get(`${backendBaseUrl}/api/attendance`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (subject) {
        const subjectAttendance = response.data.data.filter((record) => {
          const recordSubjectName =
            record.subject_name || record.subjectName || "";
          const currentSubjectName = subject.subName || subject.title || "";

          return (
            record.subjectId === subject.saId ||
            recordSubjectName.trim() === currentSubjectName.trim() ||
            recordSubjectName.replace(/\s+/g, "") ===
              currentSubjectName.replace(/\s+/g, "")
          );
        });

        setAttendanceRecords(subjectAttendance);
      }
    } catch (err) {
      console.error("Error fetching attendance records:", err);
      setError(err.message);
      toast.error("Failed to load attendance records.");
    } finally {
      setLoading(false);
    }
  }, [subject, token]);

  useEffect(() => {
    if (subject && token) {
      fetchAttendanceRecords();
    }
  }, [subject, token, fetchAttendanceRecords]);

  return {
    attendanceRecords,
    loading,
    error,
    refetch: fetchAttendanceRecords,
  };
};
