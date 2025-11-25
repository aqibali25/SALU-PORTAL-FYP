import { useState, useEffect } from "react";
import DataTable from "../TableData";
import Pagination from "../../components/Pagination";
import Background from "./../../assets/Background.png";
import BackButton from "../BackButton";
import { Link, useParams, useLocation, useNavigate } from "react-router-dom";
import { useEnrolledStudents } from "../../Hooks/useEnrolledStudents";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const backendBaseUrl =
  import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

// ---------------------------------------------
// GPA Calculation Functions (No Rounding)
// ---------------------------------------------
function getGradePoint(marks) {
  if (marks >= 87 && marks <= 100) return 4.0;

  if (marks >= 72 && marks < 87) {
    const scale = [
      { min: 72, gp: 3.0 },
      { min: 73.5, gp: 3.1 },
      { min: 75, gp: 3.2 },
      { min: 76.5, gp: 3.3 },
      { min: 78, gp: 3.4 },
      { min: 79.5, gp: 3.5 },
      { min: 81, gp: 3.6 },
      { min: 82.5, gp: 3.7 },
      { min: 84, gp: 3.8 },
      { min: 85.5, gp: 3.9 },
    ];

    return scale.reduce((gp, item) => (marks >= item.min ? item.gp : gp), 3.0);
  }

  if (marks >= 60 && marks < 72) {
    const scale = [
      { min: 60, gp: 2.0 },
      { min: 61.5, gp: 2.12 },
      { min: 63, gp: 2.25 },
      { min: 64.5, gp: 2.37 },
      { min: 66, gp: 2.5 },
      { min: 67.5, gp: 2.62 },
      { min: 69, gp: 2.75 },
      { min: 70.5, gp: 2.87 },
    ];

    return scale.reduce((gp, item) => (marks >= item.min ? item.gp : gp), 2.0);
  }

  return 0;
}

function calculateSubjectGPA(sessional, mid, final, subjectType = "Theory") {
  // For Practical subjects, only use final marks and convert to percentage out of 100
  if (subjectType === "Practical") {
    const finalMarks = parseFloat(final) || 0;

    // Convert to percentage out of 100 for GPA calculation
    const percentage = (finalMarks / 50) * 100;
    const subjectGPA = getGradePoint(percentage);

    return {
      subjectGPA: subjectGPA,
      obtainedMarks: finalMarks,
      totalMarks: 50, // Practical subjects are out of 50
    };
  }

  // For Theory subjects (original logic)
  const sessionalMarks = parseFloat(sessional) || 0;
  const midMarks = parseFloat(mid) || 0;
  const finalMarks = parseFloat(final) || 0;

  const totalObtainedMarks = sessionalMarks + midMarks + finalMarks;
  const subjectGPA = getGradePoint(totalObtainedMarks);

  return {
    subjectGPA: subjectGPA,
    obtainedMarks: totalObtainedMarks,
    totalMarks: 100,
  };
}

function calculateSemesterGPA(subjects, allSubjectsData = []) {
  if (!subjects.length) return 0;

  let totalGP = 0;
  let validSubjectsCount = 0;

  subjects.forEach((sub) => {
    // Find subject type from allSubjectsData
    const subjectInfo = allSubjectsData.find((s) => s.name === sub.subject);
    const subjectType = subjectInfo?.type || "Theory";

    if (subjectType === "Practical") {
      // For practical subjects, only check final marks
      if (sub.final_term_marks !== null && sub.final_term_marks !== undefined) {
        const percentage = (parseFloat(sub.final_term_marks) / 50) * 100;
        const gp = getGradePoint(percentage);
        totalGP += gp;
        validSubjectsCount++;
      }
    } else {
      // For theory subjects, check all marks
      if (
        sub.sessional_marks !== null &&
        sub.mid_term_marks !== null &&
        sub.final_term_marks !== null
      ) {
        const totalMarks =
          (parseFloat(sub.sessional_marks) || 0) +
          (parseFloat(sub.mid_term_marks) || 0) +
          (parseFloat(sub.final_term_marks) || 0);

        const gp = getGradePoint(totalMarks);
        totalGP += gp;
        validSubjectsCount++;
      }
    }
  });

  if (validSubjectsCount === 0) return 0;

  return totalGP / validSubjectsCount;
}

function calculateCGPA(semesterGPAs) {
  const validGPAs = semesterGPAs.filter((gpa) => gpa > 0);
  if (validGPAs.length === 0) return 0;

  const total = validGPAs.reduce((a, b) => a + b, 0);
  return total / validGPAs.length;
}

// Custom hook for student marks operations
const useStudentMarks = () => {
  const [subjectsData, setSubjectsData] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch all subjects data
  const fetchSubjectsData = async () => {
    try {
      const API = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
      const response = await axios.get(`${API}/api/subjects`);
      if (response.data.success) {
        setSubjectsData(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching subjects data:", error);
    }
  };

  // Fetch existing marks for a student
  const fetchStudentMarks = async (rollNo, subject, semester, department) => {
    try {
      const API = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
      const params = {
        rollNo,
        subject,
        semester,
        department,
      };

      const response = await axios.get(`${API}/api/student-marks`, { params });

      if (response.data && response.data.success) {
        const existingData = response.data.data;
        if (Array.isArray(existingData)) {
          return (
            existingData.find(
              (item) =>
                item.student_roll_no === rollNo || item.rollNo === rollNo
            ) || {}
          );
        }
        return existingData;
      }
      return {};
    } catch (error) {
      if (error.response && error.response.status !== 404) {
        console.error("Error fetching student marks:", error);
      }
      return {};
    }
  };

  // Save marks for a student
  const saveStudentMarks = async (marksData) => {
    try {
      const API = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
      const response = await axios.post(
        `${API}/api/student-marks/upsert`,
        marksData
      );
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.response?.data || error.message };
    }
  };

  // Bulk save marks
  const bulkSaveMarks = async (marksArray) => {
    setLoading(true);
    const results = [];

    for (const marksData of marksArray) {
      const result = await saveStudentMarks(marksData);
      results.push(result);
    }

    setLoading(false);
    return results;
  };

  return {
    subjectsData,
    loading,
    fetchSubjectsData,
    fetchStudentMarks,
    saveStudentMarks,
    bulkSaveMarks,
  };
};

export default function ShowStudentsForMarking() {
  const { subjectId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const subjectsData = location.state;
  const [studentsEnrolledinSubject, setStudentsEnrolledinSubject] = useState(
    []
  );
  const [studentMarks, setStudentMarks] = useState({});
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [saving, setSaving] = useState(false);
  const [bulkSaving, setBulkSaving] = useState(false);
  const [subjectType, setSubjectType] = useState("Theory");
  const [individualSaving, setIndividualSaving] = useState({}); // Track individual student saving states
  const pageSize = 10;

  const token = localStorage.getItem("token");
  const { students, loading } = useEnrolledStudents();
  const {
    subjectsData: allSubjectsData,
    fetchSubjectsData,
    fetchStudentMarks,
    bulkSaveMarks,
  } = useStudentMarks();

  const formatSubjectName = (urlString) => {
    return urlString
      .replace(/([a-zA-Z])-([a-zA-Z])/g, "$1 - $2")
      .replace(/\s+/g, " ")
      .trim();
  };

  // ✅ Safe subject finding with null checks
  const formattedSubjectName = formatSubjectName(subjectId);
  const subject = subjectsData?.find((sub) => {
    return (
      sub.subName === formattedSubjectName ||
      sub.title === formattedSubjectName ||
      sub.subName?.replace(/\s+/g, "") === subjectId.replace(/\s+/g, "")
    );
  });

  // ✅ Redirect if no subject data is available
  useEffect(() => {
    if (!subjectsData) {
      navigate("/SALU-PORTAL-FYP/EnterMarks");
      return;
    }
  }, [subjectsData, navigate]);

  // Fetch subject type and all subjects data
  useEffect(() => {
    const determineSubjectType = async () => {
      if (subject) {
        await fetchSubjectsData();

        // Debug logging
        console.log("Subject from location.state:", subject);
        console.log("All subjects data:", allSubjectsData);

        // Try multiple ways to find the subject
        const currentSubject = allSubjectsData.find((sub) => {
          // Try exact match first
          if (
            sub.name === subject.subName &&
            sub.department === subject.department
          ) {
            return true;
          }
          // Try with formatted name
          if (
            sub.name === formattedSubjectName &&
            sub.department === subject.department
          ) {
            return true;
          }
          // Try with URL subjectId
          if (sub.name === subjectId && sub.department === subject.department) {
            return true;
          }
          return false;
        });

        console.log("Found subject:", currentSubject);

        if (currentSubject) {
          setSubjectType(currentSubject.type || "Theory");
        } else {
          // If not found in API, check if subject name contains "Practical"
          const subjectName = subject.subName || subjectId || "";
          if (subjectName.toLowerCase().includes("practical")) {
            setSubjectType("Practical");
          } else {
            setSubjectType("Theory");
          }
        }
      }
    };

    determineSubjectType();
  }, [subject, allSubjectsData, subjectId, formattedSubjectName]);

  // Get student display name - updated for student_name field
  const getStudentDisplayName = (student) => {
    if (student.student_name) return student.student_name;
    if (student.name) return student.name;
    if (student.firstName && student.lastName)
      return `${student.firstName} ${student.lastName}`;
    if (student.fullName) return student.fullName;
    return "Unknown Student";
  };

  // Get student roll number
  const getStudentRollNo = (student) => {
    return student.roll_no || student.rollNo || student.rollNumber || "N/A";
  };

  // Filter enrolled students by semester and department
  useEffect(() => {
    if (students && subject) {
      const enrolledStudents = students
        .filter((student) => student.current_semester === subject.semester)
        .filter((student) => student.department === subject.department);

      setStudentsEnrolledinSubject(enrolledStudents);

      // Load existing marks for all students
      loadExistingMarks(enrolledStudents);
    }
  }, [students, subject]);

  // Load existing marks for students
  const loadExistingMarks = async (studentsList) => {
    const marks = {};

    for (const student of studentsList) {
      const rollNo = getStudentRollNo(student);
      const existingMarks = await fetchStudentMarks(
        rollNo,
        subject?.subName || subjectId,
        subject?.semester,
        subject?.department
      );

      marks[rollNo] = {
        sessional:
          existingMarks.sessional_marks?.toString() ||
          existingMarks.sessional?.toString() ||
          "",
        mid:
          existingMarks.mid_term_marks?.toString() ||
          existingMarks.mid?.toString() ||
          "",
        final:
          existingMarks.final_term_marks?.toString() ||
          existingMarks.finalMarks?.toString() ||
          "",
      };
    }

    setStudentMarks(marks);
  };

  // Handle mark change for a student with validation
  const handleMarkChange = (rollNo, field, value) => {
    // Validate input based on field type and subject type
    if (value === "") {
      setStudentMarks((prev) => ({
        ...prev,
        [rollNo]: {
          ...prev[rollNo],
          [field]: value,
        },
      }));
      return;
    }

    const numValue = parseFloat(value);

    if (isNaN(numValue)) {
      return; // Don't update if not a number
    }

    // Validate ranges
    if (field === "sessional" && (numValue < 0 || numValue > 20)) {
      toast.error(`Sessional marks must be between 0 and 20`, {
        position: "top-center",
        autoClose: 3000,
        theme: "light",
      });
      return;
    }

    if (field === "mid" && (numValue < 0 || numValue > 30)) {
      toast.error(`Mid term marks must be between 0 and 30`, {
        position: "top-center",
        autoClose: 3000,
        theme: "light",
      });
      return;
    }

    if (field === "final" && (numValue < 0 || numValue > 50)) {
      toast.error(`Final marks must be between 0 and 50`, {
        position: "top-center",
        autoClose: 3000,
        theme: "light",
      });
      return;
    }

    setStudentMarks((prev) => ({
      ...prev,
      [rollNo]: {
        ...prev[rollNo],
        [field]: value,
      },
    }));
  };

  // Check if student has any marks entered
  const hasMarksEntered = (marks) => {
    if (subjectType === "Practical") {
      return marks.final && marks.final.trim() !== "";
    } else {
      return (
        (marks.sessional && marks.sessional.trim() !== "") ||
        (marks.mid && marks.mid.trim() !== "") ||
        (marks.final && marks.final.trim() !== "")
      );
    }
  };

  // Validate marks for a student
  const validateStudentMarks = (student, marks, isBulkOperation = false) => {
    const studentName = getStudentDisplayName(student);

    if (!hasMarksEntered(marks)) {
      if (!isBulkOperation) {
        toast.error(`Please enter marks for ${studentName}`, {
          position: "top-center",
          autoClose: 3000,
          theme: "light",
        });
      }
      return {
        isValid: false,
        error: `No marks entered for ${studentName}`,
      };
    }

    if (subjectType === "Practical") {
      const finalMarksNum = parseFloat(marks.final);
      if (finalMarksNum > 50 || finalMarksNum < 0) {
        if (!isBulkOperation) {
          toast.error(
            `Final marks must be between 0 and 50 for ${studentName}`,
            {
              position: "top-center",
              autoClose: 3000,
              theme: "light",
            }
          );
        }
        return {
          isValid: false,
          error: `Final marks must be between 0 and 50 for ${studentName}`,
        };
      }
    } else {
      // For theory subjects, validate all entered marks
      if (marks.sessional) {
        const sessionalMarks = parseFloat(marks.sessional);
        if (sessionalMarks < 0 || sessionalMarks > 20) {
          if (!isBulkOperation) {
            toast.error(
              `Sessional marks must be between 0 and 20 for ${studentName}`,
              {
                position: "top-center",
                autoClose: 3000,
                theme: "light",
              }
            );
          }
          return {
            isValid: false,
            error: `Sessional marks must be between 0 and 20 for ${studentName}`,
          };
        }
      }

      if (marks.mid) {
        const midMarks = parseFloat(marks.mid);
        if (midMarks < 0 || midMarks > 30) {
          if (!isBulkOperation) {
            toast.error(
              `Mid term marks must be between 0 and 30 for ${studentName}`,
              {
                position: "top-center",
                autoClose: 3000,
                theme: "light",
              }
            );
          }
          return {
            isValid: false,
            error: `Mid term marks must be between 0 and 30 for ${studentName}`,
          };
        }
      }

      if (marks.final) {
        const finalMarks = parseFloat(marks.final);
        if (finalMarks < 0 || finalMarks > 50) {
          if (!isBulkOperation) {
            toast.error(
              `Final marks must be between 0 and 50 for ${studentName}`,
              {
                position: "top-center",
                autoClose: 3000,
                theme: "light",
              }
            );
          }
          return {
            isValid: false,
            error: `Final marks must be between 0 and 50 for ${studentName}`,
          };
        }
      }
    }

    return { isValid: true };
  };

  // Calculate and update CGPA for a student
  const calculateAndUpdateCGPA = async (student) => {
    try {
      const API = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
      const rollNo = getStudentRollNo(student);

      // Get all marks for the student
      const marksResponse = await axios.get(
        `${API}/api/student-marks/by-roll/${rollNo}`
      );

      if (!marksResponse.data.success) {
        return 0;
      }

      const allMarks = marksResponse.data.data;

      // Get all subjects data
      const subjectsResponse = await axios.get(`${API}/api/subjects`);
      if (!subjectsResponse.data.success) {
        return 0;
      }

      const allSubjects = subjectsResponse.data.data;

      const marksBySemester = {};

      allMarks.forEach((mark) => {
        const semester = mark.semester;
        if (!marksBySemester[semester]) {
          marksBySemester[semester] = [];
        }
        marksBySemester[semester].push(mark);
      });

      const semesterGPAs = [];

      Object.keys(marksBySemester).forEach((semester) => {
        const semesterMarks = marksBySemester[semester];
        const semesterSubjects = allSubjects.filter(
          (subject) =>
            subject.department === student.department &&
            subject.semester === semester
        );

        const hasAllSubjects = semesterSubjects.every((subject) => {
          const subjectMark = semesterMarks.find(
            (mark) => mark.subject === subject.name
          );

          if (subject.type === "Practical") {
            // For practical, only final marks are required
            return subjectMark && subjectMark.final_term_marks !== null;
          } else {
            // For theory, all marks are required
            return (
              subjectMark &&
              subjectMark.sessional_marks !== null &&
              subjectMark.mid_term_marks !== null &&
              subjectMark.final_term_marks !== null
            );
          }
        });

        if (hasAllSubjects && semesterMarks.length > 0) {
          const semesterGPA = calculateSemesterGPA(semesterMarks, allSubjects);
          semesterGPAs.push(semesterGPA);
        }
      });

      const cgpa = calculateCGPA(semesterGPAs);

      // Update admission CGPA if form_id exists
      const form_id = student.form_id;
      if (form_id) {
        const status = student.status;
        const updateData = {
          status: status,
          remarks: null,
          cgpa: cgpa,
        };

        await axios.patch(
          `${API}/api/admissions/updateStatus/${form_id}`,
          updateData
        );
      }

      return cgpa;
    } catch (error) {
      console.error("Error calculating CGPA:", error);
      return 0;
    }
  };

  // Save marks for a single student
  const saveMarksForStudent = async (student, isBulkOperation = false) => {
    const rollNo = getStudentRollNo(student);
    const marks = studentMarks[rollNo] || {};

    // Validate marks
    const validation = validateStudentMarks(student, marks, isBulkOperation);
    if (!validation.isValid) {
      return { success: false, error: validation.error };
    }

    try {
      const subjectResult = calculateSubjectGPA(
        marks.sessional,
        marks.mid,
        marks.final,
        subjectType
      );

      const marksData = {
        rollNo: rollNo,
        studentName: getStudentDisplayName(student),
        department: student.department || subject?.department,
        semester: student.current_semester || subject?.semester,
        subject: subject?.subName || subjectId,
        sessional: subjectType === "Practical" ? null : marks.sessional || null,
        mid: subjectType === "Practical" ? null : marks.mid || null,
        finalMarks: marks.final || null,
        gpa: subjectResult.subjectGPA,
        obtained_marks: subjectResult.obtainedMarks,
        total_marks: subjectResult.totalMarks,
        subject_type: subjectType,
      };

      const API = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
      await axios.post(`${API}/api/student-marks/upsert`, marksData);

      // Calculate and update CGPA
      const cgpa = await calculateAndUpdateCGPA(student);

      return {
        success: true,
        studentName: getStudentDisplayName(student),
        cgpa: cgpa,
      };
    } catch (error) {
      console.error(`Error saving marks for ${rollNo}:`, error);
      return {
        success: false,
        error: `Failed to save marks for ${getStudentDisplayName(student)}`,
      };
    }
  };

  // Save individual student marks
  const handleIndividualSave = async (student) => {
    const rollNo = getStudentRollNo(student);

    setIndividualSaving((prev) => ({ ...prev, [rollNo]: true }));

    const result = await saveMarksForStudent(student, false);

    setIndividualSaving((prev) => ({ ...prev, [rollNo]: false }));

    if (result.success) {
      const cgpaMessage =
        result.cgpa > 0 ? ` (CGPA: ${result.cgpa.toFixed(2)})` : "";
      toast.success(`Marks saved for ${result.studentName}${cgpaMessage}`, {
        position: "top-center",
        autoClose: 3000,
        theme: "light",
      });
    }
    // Error messages are handled in validateStudentMarks for individual operations
  };

  // Save all marks (bulk operation)
  const saveAllMarks = async () => {
    // Check if any student has marks entered
    const studentsWithMarks = filteredStudents.filter((student) => {
      const rollNo = getStudentRollNo(student);
      const marks = studentMarks[rollNo] || {};
      return hasMarksEntered(marks);
    });

    if (studentsWithMarks.length === 0) {
      toast.error("No marks entered for any student", {
        position: "top-center",
        autoClose: 3000,
        theme: "light",
      });
      return;
    }

    setBulkSaving(true);

    const toastId = toast.info("Saving marks for all students...", {
      position: "top-center",
      autoClose: false,
      theme: "light",
    });

    let successCount = 0;
    let errorCount = 0;

    for (const student of filteredStudents) {
      const rollNo = getStudentRollNo(student);
      const marks = studentMarks[rollNo] || {};

      // Only save if student has marks entered
      if (hasMarksEntered(marks)) {
        const result = await saveMarksForStudent(student, true);
        if (result.success) {
          successCount++;
        } else {
          errorCount++;
        }
      }
    }

    // Dismiss the progress toast
    toast.dismiss(toastId);

    // Show clean result message
    if (errorCount === 0) {
      toast.success(
        `${successCount}/${filteredStudents.length} students' marks saved successfully`,
        {
          position: "top-center",
          autoClose: 4000,
          theme: "light",
        }
      );
    } else if (successCount === 0) {
      toast.error(`Failed to save marks for all ${errorCount} students`, {
        position: "top-center",
        autoClose: 4000,
        theme: "light",
      });
    } else {
      toast.warning(
        `${successCount}/${filteredStudents.length} students saved, ${errorCount} failed`,
        {
          position: "top-center",
          autoClose: 4000,
          theme: "light",
        }
      );
    }

    setBulkSaving(false);
  };

  // Search Filter
  const filteredStudents = studentsEnrolledinSubject.filter((student) => {
    const studentName = getStudentDisplayName(student).toLowerCase();
    const rollNo = getStudentRollNo(student).toLowerCase();
    const department = student.department?.toLowerCase() || "";
    const searchTerm = query.toLowerCase();

    return (
      studentName.includes(searchTerm) ||
      rollNo.includes(searchTerm) ||
      department.includes(searchTerm)
    );
  });

  // Pagination
  const pageCount = Math.ceil(filteredStudents.length / pageSize);
  const currentPageRows = filteredStudents.slice(
    (page - 1) * pageSize,
    page * pageSize
  );

  // Transform students for table display
  const transformedRows = currentPageRows.map((student, index) => {
    const rollNo = getStudentRollNo(student);
    const marks = studentMarks[rollNo] || {};

    return {
      rollNo: rollNo,
      studentName: getStudentDisplayName(student),
      department: student.department || "N/A",
      semester: student.current_semester || subject?.semester || "N/A",
      subject: subject?.subName || subjectId,
      sessionalMarks: marks.sessional || "",
      midMarks: marks.mid || "",
      finalMarks: marks.final || "",
      originalStudent: student,
      subjectData: subject,
    };
  });

  // Table Columns (Serial No removed)
  const columns = [
    { key: "rollNo", label: "Roll No" },
    { key: "studentName", label: "Student Name" },
    { key: "department", label: "Department" },
  ];

  // Actions with inline input fields
  const actions = [
    {
      label: "Marks",
      render: (row) => {
        const rollNo = row.rollNo;
        const marks = studentMarks[rollNo] || {
          sessional: "",
          mid: "",
          final: "",
        };
        const isSaving = individualSaving[rollNo];

        return (
          <div className="flex items-center gap-2 flex-wrap">
            {subjectType === "Practical" ? (
              <input
                type="number"
                placeholder="Final (0-50)"
                value={marks.final}
                onChange={(e) =>
                  handleMarkChange(rollNo, "final", e.target.value)
                }
                className="max-w-[120px] border-2 outline-none border-gray-500 dark:text-white !px-2 !py-1 "
                min="0"
                max="50"
                step="0.5"
              />
            ) : (
              <>
                <input
                  type="number"
                  placeholder="Sessional (0-20)"
                  value={marks.sessional}
                  onChange={(e) =>
                    handleMarkChange(rollNo, "sessional", e.target.value)
                  }
                  className="max-w-[120px] border-2 outline-none border-gray-500 dark:text-white !px-2 !py-1 "
                  min="0"
                  max="20"
                  step="0.5"
                />
                <input
                  type="number"
                  placeholder="Mid (0-30)"
                  value={marks.mid}
                  onChange={(e) =>
                    handleMarkChange(rollNo, "mid", e.target.value)
                  }
                  className="max-w-[120px] border-2 outline-none border-gray-500 dark:text-white !px-2 !py-1 "
                  min="0"
                  max="30"
                  step="0.5"
                />
                <input
                  type="number"
                  placeholder="Final (0-50)"
                  value={marks.final}
                  onChange={(e) =>
                    handleMarkChange(rollNo, "final", e.target.value)
                  }
                  className="max-w-[120px] border-2 outline-none border-gray-500 dark:text-white !px-2 !py-1 "
                  min="0"
                  max="50"
                  step="0.5"
                />
              </>
            )}
            <button
              onClick={() => handleIndividualSave(row.originalStudent)}
              disabled={isSaving || bulkSaving}
              className="!px-3 !py-1 bg-green-500 text-white hover:bg-green-600 transition disabled:opacity-50 cursor-pointer min-w-[80px]"
            >
              {isSaving ? "Saving..." : "Save"}
            </button>
          </div>
        );
      },
    },
  ];

  // ✅ Show loading or error state if no subject data
  if (!subjectsData) {
    return (
      <div
        className="sm:!px-[40px] md:!px-[80px] !px-5 !py-[20px] min-h-[calc(100vh-90px)] w-[100%] bg-white dark:bg-gray-900 flex items-center justify-center"
        style={{
          backgroundImage: `url(${Background})`,
          backgroundSize: "cover",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center",
        }}
      >
        <div className="text-center">
          <h2 className="text-xl text-red-500 mb-4">
            No subject data available
          </h2>
          <p className="text-gray-600 mb-4">
            Please navigate from the Enter Marks page.
          </p>
          <BackButton url={"/SALU-PORTAL-FYP/EnterMarks"} />
        </div>
      </div>
    );
  }

  // ✅ Show error if subject not found
  if (!subject) {
    return (
      <div
        className="sm:!px-[40px] md:!px-[80px] !px-5 !py-[20px] min-h-[calc(100vh-90px)] w-[100%] bg-white dark:bg-gray-900 flex items-center justify-center"
        style={{
          backgroundImage: `url(${Background})`,
          backgroundSize: "cover",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center",
        }}
      >
        <div className="text-center">
          <h2 className="text-xl text-red-500 mb-4">Subject not found</h2>
          <p className="text-gray-600 mb-4">
            Subject "{subjectId}" not found in the available subjects.
          </p>
          <BackButton url={"/SALU-PORTAL-FYP/EnterMarks"} />
        </div>
      </div>
    );
  }

  /** ⏳ Loader */
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
      <ToastContainer />

      <div className="flex flex-col gap-3 w-full min-h-[80vh] bg-[#D5BBE0] rounded-md !p-5">
        <div className="flex justify-between items-center gap-3">
          <div className="flex items-center gap-3">
            <BackButton url={"/SALU-PORTAL-FYP/EnterMarks"} />
            <h1 className="text-2xl sm:text-3xl md:text-4xl !py-3 font-bold text-gray-900 dark:text-white">
              Enter Marks For Subject - {subject?.subName || subjectId}
            </h1>
          </div>
          <button
            onClick={saveAllMarks}
            disabled={bulkSaving || filteredStudents.length === 0}
            className="!px-4 !py-2 bg-green-500 text-white hover:bg-green-600 transition disabled:opacity-50 cursor-pointer"
          >
            {bulkSaving ? (
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Saving All...
              </span>
            ) : (
              `Save All Marks (${filteredStudents.length})`
            )}
          </button>
        </div>

        <hr className="border-t-[3px] border-gray-900 dark:border-white mb-4" />

        {/* Department, Year, and Semester Information */}
        <div className="flex flex-col sm:flex-row gap-4 mb-4">
          <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 !p-3 flex-1 min-w-0">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Department
            </p>
            <p className="font-semibold text-gray-900 dark:text-white truncate">
              {subject?.department || "N/A"}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 !p-3 flex-1 min-w-0">
            <p className="text-sm text-gray-600 dark:text-gray-400">Semester</p>
            <p className="font-semibold text-gray-900 dark:text-white">
              {subject?.semester || "N/A"}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 !p-3 flex-1 min-w-0">
            <p className="text-sm text-gray-600 dark:text-gray-400">Year</p>
            <p className="font-semibold text-gray-900 dark:text-white">
              {subject?.year ||
                Math.ceil((subject?.semester || 1) / 2) ||
                "N/A"}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 !p-3 flex-1 min-w-0">
            <p className="text-sm text-gray-600 dark:text-gray-400">Type</p>
            <p className="font-semibold text-gray-900 dark:text-white">
              {subjectType}
            </p>
          </div>
        </div>

        {/* Subject Type Info */}
        {subjectType === "Practical" ? (
          <div className="bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700 !p-3 mb-4 rounded">
            <p className="text-sm text-blue-700 dark:text-blue-300">
              ℹ️ This is a Practical subject. Only Final marks (0-50) are
              required. GPA will be calculated based on percentage.
            </p>
          </div>
        ) : (
          <div className="bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700 !p-3 mb-4 rounded">
            <p className="text-sm text-blue-700 dark:text-blue-300">
              ℹ️ This is a Theory subject. Marks ranges: Sessional (0-20), Mid
              Term (0-30), Final (0-50). Total marks will be calculated out of
              100.
            </p>
          </div>
        )}

        {/* Bulk Operation Info */}
        <div className="bg-yellow-50 dark:bg-yellow-900 border border-yellow-200 dark:border-yellow-700 !p-3 mb-4 rounded">
          <p className="text-sm text-yellow-700 dark:text-yellow-300">
            💡 <strong>Tip:</strong> Use individual "Save" buttons for specific
            students or "Save All Marks" to update all students at once. "Save
            All Marks" will only save students who have marks entered.
          </p>
        </div>

        {/* Search and Table Section */}
        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 !mb-4">
          {/* Search Input - Now on the right side */}
          <div className="w-full xl:w-80 flex-shrink-0">
            <input
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setPage(1);
              }}
              placeholder="Search students by name, roll number, or department..."
              className="w-full !px-3 !py-2 border-2 border-[#a5a5a5] outline-none bg-[#f9f9f9] text-[#2a2a2a] dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
            />
          </div>
        </div>

        {/* Table */}
        <DataTable columns={columns} rows={transformedRows} actions={actions} />

        {/* Footer & Pagination */}
        <div className="flex flex-col gap-5 sm:flex-row items-center justify-between mt-4">
          <span className="font-bold text-[1.3rem] text-gray-900 dark:text-white">
            Total Students : {filteredStudents.length}
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
