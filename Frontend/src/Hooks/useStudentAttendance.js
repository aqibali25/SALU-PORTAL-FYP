import { useState, useEffect, useCallback, useMemo } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const backendBaseUrl =
  import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

export const useStudentAttendance = (
  subjectId,
  studentRollNo,
  enrolledStudents
) => {
  const [studentData, setStudentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const token = localStorage.getItem("token");

  // Memoized student find
  const student = useMemo(
    () =>
      enrolledStudents?.find((student) => student.roll_no === studentRollNo),
    [enrolledStudents, studentRollNo]
  );

  const getStudentDisplayName = useCallback((student) => {
    if (student?.student_name) return student.student_name;
    if (student?.firstName && student?.lastName)
      return `${student.firstName} ${student.lastName}`;
    if (student?.fullName) return student.fullName;
    return "Unknown Student";
  }, []);

  const fetchStudentAttendance = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      if (!studentRollNo) {
        throw new Error("Student roll number not found.");
      }

      if (!subjectId) {
        throw new Error("Subject ID not found.");
      }

      if (!student) {
        throw new Error("Student data not found in enrolled students.");
      }

      const response = await axios.get(`${backendBaseUrl}/api/attendance`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      // Format subject name for comparison
      const formattedSubjectId = subjectId
        .replace(/([a-zA-Z])-([a-zA-Z])/g, "$1 - $2")
        .replace(/\s+/g, " ")
        .trim();

      // Filter records for current student and subject
      const studentRecords = response.data.data.filter((record) => {
        const recordRollNo =
          record.roll_no || record.rollNo || record.rollNumber;
        const recordSubjectName =
          record.subject_name || record.subjectName || "";
        const formattedRecordSubject = recordSubjectName
          .replace(/([a-zA-Z])-([a-zA-Z])/g, "$1 - $2")
          .replace(/\s+/g, " ")
          .trim();

        return (
          recordRollNo === studentRollNo &&
          (formattedRecordSubject === formattedSubjectId ||
            recordSubjectName.replace(/\s+/g, "") ===
              subjectId.replace(/\s+/g, ""))
        );
      });

      if (studentRecords.length === 0) {
        toast.info("No attendance records found for you in this subject.");
      }

      // Calculate overall percentage
      const totalRecords = studentRecords.length;
      const attendedCount = studentRecords.filter(
        (record) =>
          record.status?.toLowerCase() === "present" ||
          record.status?.toLowerCase() === "leave"
      ).length;
      const overallPercentage =
        totalRecords > 0 ? Math.round((attendedCount / totalRecords) * 100) : 0;

      // Prepare student data
      const studentData = {
        student: {
          rollNo: student.roll_no || studentRollNo,
          name: getStudentDisplayName(student),
          department: student.department,
          semester: student.current_semester,
        },
        attendanceRecords: studentRecords.sort(
          (a, b) => new Date(b.attendance_date) - new Date(a.attendance_date)
        ),
        subject: {
          name: formattedSubjectId,
          id: subjectId,
        },
        overallPercentage,
      };

      setStudentData(studentData);
    } catch (err) {
      console.error("Error fetching student attendance:", err);
      setError(err.message);
      toast.error(err.message || "Failed to load attendance data.");
    } finally {
      setLoading(false);
    }
  }, [subjectId, studentRollNo, token, student, getStudentDisplayName]);

  useEffect(() => {
    if (enrolledStudents && student) {
      fetchStudentAttendance();
    } else if (enrolledStudents && !student) {
      setLoading(false);
      setError("Student not found in enrolled students.");
      toast.error("Student not found in enrolled students.");
    }
  }, [enrolledStudents, student, fetchStudentAttendance]);

  return {
    studentData,
    loading,
    error,
    refetch: fetchStudentAttendance,
  };
};
