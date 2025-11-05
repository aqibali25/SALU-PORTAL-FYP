import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    // ✅ Validation: Check if any field has a value
    if (!sessional && !mid && !finalMarks) {
      toast.error("⚠️ Please enter at least one section mark to update!", {
        position: "top-right",
        autoClose: 3000,
        theme: "colored",
      });
      return;
    }

    setSubmitting(true);

    // ✅ Prepare data
    const marksData = {
      rollNo: studentData.rollNo,
      studentName: studentData.studentName,
      department: studentData.department,
      semester: studentData.semester,
      subject: studentData.subject,
      sessional,
      mid,
      finalMarks,
    };

    console.log("📘 Marks Data Ready to Save:", marksData);

    try {
      // ✅ Send marks data to backend API
      // Uncomment this when backend is ready
      // await axios.post("/api/enroll-students/marks", marksData);

      toast.success("Marks saved successfully!", {
        position: "top-right",
        autoClose: 2500,
        theme: "light",
      });

      setTimeout(() => {
        navigate("/SALU-PORTAL-FYP/EnterMarks");
      }, 1500);
    } catch (error) {
      toast.error(" Failed to save marks. Please try again.", {
        position: "top-right",
        autoClose: 3000,
        theme: "light",
      });
      console.error("Error saving marks:", error);
    } finally {
      setSubmitting(false);
    }
  };

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
            Enter Marks for - {studentData.studentName || "Student"}
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
          />
          <InputContainer
            placeholder="Enter Mid Term Marks"
            title="Mid Term Marks"
            htmlFor="midTermMarks"
            inputType="number"
            value={mid}
            onChange={(e) => setMid(e.target.value)}
          />
          <InputContainer
            placeholder="Enter Final Term Marks"
            title="Final Term Marks"
            htmlFor="finalTermMarks"
            inputType="number"
            value={finalMarks}
            onChange={(e) => setFinalMarks(e.target.value)}
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
                {submitting ? "Saving..." : "Save & Proceed"}
              </span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default EnterStdMarks;
