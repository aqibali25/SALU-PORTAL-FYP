import { useCallback } from "react";

export const useStudentUtils = () => {
  const getStudentDisplayName = useCallback((student) => {
    if (student?.student_name) return student.student_name;
    if (student?.firstName && student?.lastName)
      return `${student.firstName} ${student.lastName}`;
    if (student?.fullName) return student.fullName;
    return "Unknown Student";
  }, []);

  const getStudentRollNo = useCallback((student) => {
    return student?.roll_no || student?.rollNo || student?.rollNumber || "N/A";
  }, []);

  const formatDisplayDate = useCallback((dateString) => {
    try {
      const date = new Date(dateString + "T00:00:00+05:00");
      const day = date.getDate();
      const month = date.toLocaleString("default", { month: "short" });
      return `${day} ${month}`;
    } catch {
      return "Invalid Date";
    }
  }, []);

  const formatSubjectName = useCallback((urlString) => {
    return (
      urlString
        ?.replace(/([a-zA-Z])-([a-zA-Z])/g, "$1 - $2")
        ?.replace(/\s+/g, " ")
        ?.trim() || ""
    );
  }, []);

  return {
    getStudentDisplayName,
    getStudentRollNo,
    formatDisplayDate,
    formatSubjectName,
  };
};
