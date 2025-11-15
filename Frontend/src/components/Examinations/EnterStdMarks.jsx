import { useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import BackButton from "../BackButton";
import Background from "../../assets/Background.png";
import InputContainer from "../InputContainer";

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

function calculateSubjectGPA(sessional, mid, final) {
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

function calculateSemesterGPA(subjects) {
  if (!subjects.length) return 0;

  let totalGP = 0;
  let validSubjectsCount = 0;

  subjects.forEach((sub) => {
    const totalMarks =
      (parseFloat(sub.sessional_marks) || 0) +
      (parseFloat(sub.mid_term_marks) || 0) +
      (parseFloat(sub.final_term_marks) || 0);

    if (
      sub.sessional_marks !== null &&
      sub.mid_term_marks !== null &&
      sub.final_term_marks !== null
    ) {
      const gp = getGradePoint(totalMarks);
      totalGP += gp;
      validSubjectsCount++;
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

const EnterStdMarks = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const studentData = location.state?.row || {};
  const status = studentData.originalStudent?.status;
  const form_id = studentData.originalStudent?.form_id;

  const [sessional, setSessional] = useState("");
  const [mid, setMid] = useState("");
  const [finalMarks, setFinalMarks] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [calculatedCGPA, setCalculatedCGPA] = useState(0);

  useEffect(() => {
    const fetchExistingMarks = async () => {
      if (
        !studentData.rollNo ||
        !studentData.subject ||
        !studentData.semester ||
        !studentData.department
      ) {
        setLoading(false);
        return;
      }

      try {
        const API =
          import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

        const params = {
          rollNo: studentData.rollNo,
          subject: studentData.subject,
          semester: studentData.semester,
          department: studentData.department,
        };

        const response = await axios.get(`${API}/api/student-marks`, {
          params,
        });

        if (response.data && response.data.success) {
          const existingData = response.data.data;

          if (Array.isArray(existingData)) {
            const studentRecord = existingData.find(
              (item) =>
                item.student_roll_no === studentData.rollNo ||
                item.rollNo === studentData.rollNo
            );

            if (studentRecord) {
              setSessional(
                studentRecord.sessional_marks?.toString() ||
                  studentRecord.sessional?.toString() ||
                  ""
              );
              setMid(
                studentRecord.mid_term_marks?.toString() ||
                  studentRecord.mid?.toString() ||
                  ""
              );
              setFinalMarks(
                studentRecord.final_term_marks?.toString() ||
                  studentRecord.finalMarks?.toString() ||
                  ""
              );
            }
          } else {
            setSessional(
              existingData.sessional_marks?.toString() ||
                existingData.sessional?.toString() ||
                ""
            );
            setMid(
              existingData.mid_term_marks?.toString() ||
                existingData.mid?.toString() ||
                ""
            );
            setFinalMarks(
              existingData.final_term_marks?.toString() ||
                existingData.finalMarks?.toString() ||
                ""
            );
          }
        }
      } catch (error) {
        if (error.response && error.response.status !== 404) {
          toast.error("Failed to load existing marks data", {
            position: "top-center",
            autoClose: 3000,
            theme: "light",
          });
        }
      } finally {
        setLoading(false);
      }
    };

    fetchExistingMarks();
  }, [
    studentData.rollNo,
    studentData.subject,
    studentData.semester,
    studentData.department,
  ]);

  const updateAdmissionCGPA = async (cgpa) => {
    if (!form_id) return; // ✅ Removed cgpa === 0 check

    try {
      const API = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

      const updateData = {
        status: status,
        remarks: null,
        cgpa: cgpa, // ✅ This will send 0 when CGPA is 0
      };

      console.log("📤 Sending CGPA update:", {
        url: `${API}/api/admissions/updateStatus/${form_id}`,
        data: updateData,
      });

      const response = await axios.patch(
        `${API}/api/admissions/updateStatus/${form_id}`,
        updateData
      );

      console.log("✅ CGPA update response:", response.data);
    } catch (error) {
      console.error("❌ Error updating admission CGPA:", error);
      if (error.response) {
        console.error("Error response:", error.response.data);
      }
    }
  };

  const calculateAndUpdateCGPA = async () => {
    try {
      const API = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

      const marksResponse = await axios.get(
        `${API}/api/student-marks/by-roll/${studentData.rollNo}`
      );

      if (!marksResponse.data.success) {
        return 0;
      }

      const allMarks = marksResponse.data.data;

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
            subject.department === studentData.department &&
            subject.semester === semester
        );

        const hasAllSubjects = semesterSubjects.every((subject) =>
          semesterMarks.some(
            (mark) =>
              mark.subject === subject.name &&
              mark.sessional_marks !== null &&
              mark.mid_term_marks !== null &&
              mark.final_term_marks !== null
          )
        );

        if (hasAllSubjects && semesterMarks.length > 0) {
          const semesterGPA = calculateSemesterGPA(semesterMarks);
          semesterGPAs.push(semesterGPA);
        }
      });

      const cgpa = calculateCGPA(semesterGPAs);
      setCalculatedCGPA(cgpa);

      // ✅ Update CGPA in admissions (will send even if cgpa is 0)
      await updateAdmissionCGPA(cgpa);

      return cgpa;
    } catch (error) {
      console.error("Error calculating CGPA:", error);
      return 0;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!sessional && !mid && !finalMarks) {
      toast.error("⚠️ Please enter at least one section mark to update!", {
        position: "top-center",
        autoClose: 3000,
        theme: "colored",
      });
      return;
    }

    setSubmitting(true);

    const subjectResult = calculateSubjectGPA(sessional, mid, finalMarks);

    const marksData = {
      rollNo: studentData.rollNo,
      studentName: studentData.studentName,
      department: studentData.department,
      semester: studentData.semester,
      subject: studentData.subject,
      sessional: sessional || null,
      mid: mid || null,
      finalMarks: finalMarks || null,
      gpa: subjectResult.subjectGPA,
      obtained_marks: subjectResult.obtainedMarks,
      total_marks: subjectResult.totalMarks,
    };

    try {
      const API = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

      await axios.post(`${API}/api/student-marks/upsert`, marksData, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      toast.info("📊 Calculating CGPA...", {
        position: "top-center",
        autoClose: 2000,
      });

      const newCGPA = await calculateAndUpdateCGPA();

      toast.success(
        `Marks saved successfully! ${
          newCGPA > 0 ? `CGPA: ${newCGPA.toFixed(2)}` : ""
        }`,
        {
          position: "top-center",
          autoClose: 3000,
          theme: "light",
        }
      );

      setTimeout(() => {
        navigate(
          `/SALU-PORTAL-FYP/EnterMarks/Subject/${studentData.subject.replace(
            /\s+/g,
            ""
          )}`
        );
      }, 2000);
    } catch (error) {
      let errorMessage = "Failed to save marks. Please try again.";

      if (error.response) {
        errorMessage = error.response.data.message || errorMessage;
      } else if (error.request) {
        errorMessage = "Network error. Please check your connection.";
      }

      toast.error(errorMessage, {
        position: "top-center",
        autoClose: 3000,
        theme: "light",
      });
    } finally {
      setSubmitting(false);
    }
  };

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

      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-3 w-full min-h-[80vh] bg-[#D5BBE0] rounded-md !p-5"
      >
        <div className="flex justify-start items-center gap-3">
          <BackButton url={"-1"} />
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl py-3 font-bold text-gray-900 dark:text-white">
              {sessional || mid || finalMarks
                ? "Edit Marks for"
                : "Enter Marks for"}{" "}
              - {studentData.studentName || "Student"}
            </h1>
          </div>
        </div>

        <hr className="border-t-[3px] border-gray-900 dark:border-white mb-4" />

        <div className="flex flex-col justify-center items-center gap-5 min-h-[60vh] w-full !p-5 bg-white dark:bg-gray-900 rounded-md">
          <InputContainer
            title="Student Name"
            htmlFor="studentName"
            inputType="text"
            value={studentData.studentName || ""}
            readOnly={true}
          />
          <InputContainer
            title="Student Roll No."
            htmlFor="rollNo"
            inputType="text"
            value={studentData.rollNo || ""}
            readOnly={true}
          />
          <InputContainer
            title="Department"
            htmlFor="department"
            inputType="text"
            value={studentData.department || ""}
            readOnly={true}
          />
          <InputContainer
            title="Semester"
            htmlFor="semester"
            inputType="text"
            value={studentData.semester || ""}
            readOnly={true}
          />
          <InputContainer
            title="Subject"
            htmlFor="subject"
            inputType="text"
            value={studentData.subject || ""}
            readOnly={true}
          />

          <InputContainer
            placeholder="Enter Sessional Marks"
            title="Sessional Marks"
            htmlFor="sessionalMarks"
            inputType="number"
            value={sessional}
            onChange={(e) => setSessional(e.target.value)}
            min="0"
            max="100"
          />
          <InputContainer
            placeholder="Enter Mid Term Marks"
            title="Mid Term Marks"
            htmlFor="midTermMarks"
            inputType="number"
            value={mid}
            onChange={(e) => setMid(e.target.value)}
            min="0"
            max="100"
          />
          <InputContainer
            placeholder="Enter Final Term Marks"
            title="Final Term Marks"
            htmlFor="finalTermMarks"
            inputType="number"
            value={finalMarks}
            onChange={(e) => setFinalMarks(e.target.value)}
            min="0"
            max="100"
          />

          <div className="w-full flex justify-end mt-4">
            <button
              type="submit"
              disabled={submitting}
              className="cursor-pointer relative overflow-hidden !px-[15px] !py-[5px] border-2 border-[#e5b300] text-white text-[0.8rem] font-medium bg-transparent transition-all duration-300 ease-linear
                         before:content-[''] before:absolute before:inset-x-0 before:bottom-0 before:h-full before:bg-[#e5b300] before:transition-all before:duration-300 before:ease-linear hover:before:h-0 disabled:opacity-60"
            >
              <span className="relative z-10">
                {submitting
                  ? "Saving & Calculating CGPA..."
                  : sessional || mid || finalMarks
                  ? "Update Marks & CGPA"
                  : "Save & Calculate CGPA"}
              </span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default EnterStdMarks;
