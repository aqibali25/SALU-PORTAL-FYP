import { useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import BackButton from "../BackButton";
import Background from "../../assets/Background.png";
import InputContainer from "../InputContainer";

const EnterStdMarks = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // ✅ Get student data passed from previous page
  const studentData = location.state?.row || {};

  // ✅ Form states
  const [sessional, setSessional] = useState("");
  const [mid, setMid] = useState("");
  const [finalMarks, setFinalMarks] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  // ✅ Fetch existing marks data on component mount
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

        // ✅ Build query parameters for the GET request
        const params = {
          rollNo: studentData.rollNo,
          subject: studentData.subject,
          semester: studentData.semester,
          department: studentData.department,
        };

        console.log("📋 Fetching existing marks with params:", params);

        const response = await axios.get(`${API}/api/student-marks`, {
          params,
        });
        console.log("✅ Response from server:", response.data);

        if (response.data && response.data.success) {
          const existingData = response.data.data;
          console.log("✅ Existing marks data:", existingData);

          // ✅ Check if existingData is an array or object
          if (Array.isArray(existingData)) {
            // If it's an array, find the specific student record
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
              console.log(
                "✅ Existing marks loaded from array:",
                studentRecord
              );
            }
          } else {
            // If it's a single object, use it directly
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
            console.log("✅ Existing marks loaded from object:", existingData);
          }
        }
      } catch (error) {
        console.error("❌ Error fetching existing marks:", error);
        // Don't show error toast for 404 (no existing data) - that's expected
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

    const marksData = {
      rollNo: studentData.rollNo,
      studentName: studentData.studentName,
      department: studentData.department,
      semester: studentData.semester,
      subject: studentData.subject,
      sessional: sessional || null,
      mid: mid || null,
      finalMarks: finalMarks || null,
    };

    try {
      const API = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
      const response = await axios.post(
        `${API}/api/student-marks/upsert`,
        marksData,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      toast.success("Marks saved successfully!", {
        position: "top-center",
        autoClose: 2500,
        theme: "light",
      });

      setTimeout(() => {
        navigate(
          `/SALU-PORTAL-FYP/EnterMarks/Subject/${studentData.subject.replace(
            /\s+/g,
            ""
          )}`
        );
      }, 1500);
    } catch (error) {
      console.error("❌ Error saving marks:", error);

      let errorMessage = "Failed to save marks. Please try again.";

      if (error.response) {
        // Server responded with error status
        console.error("Error response:", error.response.data);
        errorMessage = error.response.data.message || errorMessage;
      } else if (error.request) {
        // Request made but no response received
        console.error("Error request:", error.request);
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

  // ✅ Show loading state while fetching data
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
          <h1 className="text-2xl sm:text-3xl md:text-4xl py-3 font-bold text-gray-900 dark:text-white">
            {sessional || mid || finalMarks
              ? "Edit Marks for"
              : "Enter Marks for"}{" "}
            - {studentData.studentName || "Student"}
          </h1>
        </div>

        <hr className="border-t-[3px] border-gray-900 dark:border-white mb-4" />

        <div className="flex flex-col justify-center items-center gap-5 min-h-[60vh] w-full !p-5 bg-white dark:bg-gray-900 rounded-md">
          {/* Static Info */}
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

          {/* Marks Inputs */}
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
                  ? "Saving..."
                  : sessional || mid || finalMarks
                  ? "Update Marks"
                  : "Save & Proceed"}
              </span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default EnterStdMarks;
