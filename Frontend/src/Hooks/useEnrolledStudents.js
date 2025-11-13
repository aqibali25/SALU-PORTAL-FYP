// hooks/useEnrolledStudents.js
import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const backendBaseUrl =
  import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

export const useEnrolledStudents = () => {
  const [enrolledStudents, setEnrolledStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [forms, setForms] = useState([]);
  const [candidate, setCandidate] = useState([]);

  // Function to convert number to ordinal (1st, 2nd, 3rd, etc.)
  const getOrdinal = (number) => {
    if (!number || isNaN(number)) return null;

    const num = parseInt(number);
    if (num === 1) return "1st";
    if (num === 2) return "2nd";
    if (num === 3) return "3rd";
    if (num === 4) return "4th";
    if (num === 5) return "5th";
    if (num === 6) return "6th";
    if (num === 7) return "7th";
    if (num === 8) return "8th";
    return `${num}th`;
  };

  // Function to calculate current year, semester number, and display values
  const calculateYearAndSemester = (
    rollNumber,
    enrollmentYearFromData = null
  ) => {
    // If enrollment year is provided from data, use it
    if (enrollmentYearFromData) {
      const enrollmentYear = parseInt(enrollmentYearFromData);
      return calculateFromEnrollmentYear(enrollmentYear);
    }

    // Otherwise calculate from roll number
    if (!rollNumber || typeof rollNumber !== "string") {
      return {
        current_year: null,
        current_semester: null,
        enrollment_year: null,
      };
    }

    // Extract year from roll number (e.g., GC26-BSENG-02, GC2023-BSCS-01, etc.)
    const yearMatch = rollNumber.match(/GC(\d{2,4})/i);
    if (!yearMatch) {
      return {
        current_year: null,
        current_semester: null,
        enrollment_year: null,
      };
    }

    let enrollmentYear = parseInt(yearMatch[1]);

    // Handle 2-digit years (e.g., GC26 → 2026, GC99 → 1999)
    if (enrollmentYear < 100) {
      enrollmentYear =
        enrollmentYear < 50 ? 2000 + enrollmentYear : 1900 + enrollmentYear;
    }

    return calculateFromEnrollmentYear(enrollmentYear);
  };

  // Common calculation logic from enrollment year
  const calculateFromEnrollmentYear = (enrollmentYear) => {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1; // January is 1

    // Calculate academic year based on enrollment year and current date
    let academicYear;

    if (currentYear < enrollmentYear) {
      // Student hasn't started yet (future enrollment)
      academicYear = 1;
    } else if (currentYear === enrollmentYear) {
      // Student enrolled in current year
      academicYear = 1;
    } else {
      // Student enrolled in previous years
      academicYear = currentYear - enrollmentYear + 1;
    }

    // Determine semester based on month
    // Semester 1: January to June (<=6), Semester 2: July to December (>6)
    let semester;
    if (currentYear < enrollmentYear) {
      // Future enrollment - always semester 1
      semester = 1;
    } else if (currentYear === enrollmentYear) {
      // Current enrollment year
      semester = currentMonth <= 6 ? 1 : 2;
    } else {
      // Previous enrollment years
      semester = currentMonth <= 6 ? 1 : 2;
    }

    // Calculate actual semester number (1st-8th)
    let semesterNumber;
    if (academicYear === 1) {
      semesterNumber = semester === 1 ? 1 : 2; // 1st or 2nd semester
    } else if (academicYear === 2) {
      semesterNumber = semester === 1 ? 3 : 4; // 3rd or 4th semester
    } else if (academicYear === 3) {
      semesterNumber = semester === 1 ? 5 : 6; // 5th or 6th semester
    } else if (academicYear === 4) {
      semesterNumber = semester === 1 ? 7 : 8; // 7th or 8th semester
    } else {
      semesterNumber = null; // Beyond 4th year
    }

    return {
      current_year: getOrdinal(academicYear),
      current_semester: semesterNumber ? getOrdinal(semesterNumber) : null,
      enrollment_year: enrollmentYear,
    };
  };

  /** ✅ Fetch All Admissions */
  const fetchAdmissions = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${backendBaseUrl}/api/admissions`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      let fetchedData = res.data.data;

      const uniqueForms = fetchedData.filter(
        (form, index, self) =>
          index ===
          self.findIndex(
            (f) => f.cnic === form.cnic && f.form_id === form.form_id
          )
      );
      const enrolledForms = uniqueForms.filter(
        (form) => form.status === "Enrolled"
      );

      return enrolledForms;
    } catch (err) {
      console.error("❌ Error fetching admissions:", err);
      toast.error(
        err.response?.data?.message ||
          "Failed to fetch admissions. Please check your token or try again."
      );
      return [];
    }
  };

  // Process enrolled students with department switching, roll numbers, and year/semester calculation
  const processEnrolledStudents = (formsData, candidateData) => {
    if (!formsData || formsData.length === 0) {
      setEnrolledStudents([]);
      return [];
    }

    const processedStudents = formsData.map((form) => {
      const matchingCandidate = candidateData?.find(
        (c) => c.cnic === form.cnic
      );

      const department = matchingCandidate?.department || form.department;
      const rollNumber =
        matchingCandidate?.roll_no ||
        form.roll_no ||
        matchingCandidate?.roll_number ||
        form.roll_number;

      // Use enrollment year from data if available, otherwise calculate from roll number
      const enrollmentYearFromData =
        form.enrollment_year || matchingCandidate?.enrollment_year;

      // Calculate current year and semester
      const { current_year, current_semester, enrollment_year } =
        calculateYearAndSemester(rollNumber, enrollmentYearFromData);

      const processedForm = {
        ...form,
        department: department,
        current_year: current_year,
        current_semester: current_semester,
        enrollment_year: enrollment_year,
        student_name:
          form.student_name || matchingCandidate?.student_name || "N/A",
        father_name:
          form.father_name || matchingCandidate?.father_name || "N/A",
        cnic: form.cnic || "N/A",
      };

      return processedForm;
    });

    // Filter out 5th year students and students with invalid roll numbers
    const filteredStudents = processedStudents.filter((student) => {
      return student.current_year !== "5th" && student.current_year !== null;
    });

    // Sort by year first, then semester, then name alphabetically
    const sortedStudents = filteredStudents.sort((a, b) => {
      // First, sort by year (1st, 2nd, 3rd, 4th)
      const yearOrder = { "1st": 1, "2nd": 2, "3rd": 3, "4th": 4 };
      const yearA = yearOrder[a.current_year] || 99;
      const yearB = yearOrder[b.current_year] || 99;

      if (yearA !== yearB) {
        return yearA - yearB;
      }

      // If same year, sort by semester (1st, 2nd, 3rd, 4th, 5th, 6th, 7th, 8th)
      const semOrder = {
        "1st": 1,
        "2nd": 2,
        "3rd": 3,
        "4th": 4,
        "5th": 5,
        "6th": 6,
        "7th": 7,
        "8th": 8,
      };
      const semA = semOrder[a.current_semester] || 99;
      const semB = semOrder[b.current_semester] || 99;

      if (semA !== semB) {
        return semA - semB;
      }

      // If same year and semester, sort by student name alphabetically
      const nameA = a.student_name?.toLowerCase() || "";
      const nameB = b.student_name?.toLowerCase() || "";

      if (nameA < nameB) return -1;
      if (nameA > nameB) return 1;

      return 0;
    });

    setEnrolledStudents(sortedStudents);
    return sortedStudents;
  };

  // ✅ Fetch candidate data
  const fetchCandidate = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        `${backendBaseUrl}/api/admissions/enrolled/list`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const candidateData = res.data.data;
      return candidateData;
    } catch (err) {
      console.error("Error fetching candidate:", err);
      toast.error("Failed to fetch candidate data!");
      return [];
    }
  };

  // Main data fetching effect
  useEffect(() => {
    document.title = `SALU Portal | Enrolled Students`;

    const fetchAllData = async () => {
      try {
        setLoading(true);

        // Fetch both data sources
        const [candidateData, formsData] = await Promise.all([
          fetchCandidate(),
          fetchAdmissions(),
        ]);

        // Set state first
        setCandidate(candidateData);
        setForms(formsData);

        // Then process the data immediately
        if (formsData.length > 0) {
          processEnrolledStudents(formsData, candidateData);
        } else {
          setEnrolledStudents([]);
        }
      } catch (error) {
        console.error("❌ Error fetching data:", error);
        setError(error.message);
        toast.error("Failed to fetch enrolled students data!");
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, []);

  // Fallback processing when state updates
  useEffect(() => {
    if (forms.length > 0) {
      processEnrolledStudents(forms, candidate);
    }
  }, [forms, candidate]);

  return {
    students: enrolledStudents,
    loading: loading,
    error: error,
    refreshEnrolledStudents: () => {
      if (forms.length > 0) {
        processEnrolledStudents(forms, candidate);
      }
    },
  };
};
