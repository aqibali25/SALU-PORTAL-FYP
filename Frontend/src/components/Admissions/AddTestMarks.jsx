import { useEffect, useState } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import Background from "../../assets/Background.png";
import BackButton from "../BackButton";
import InputContainer from "../InputContainer";

const AddTestMarks = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const formDataFromState = location.state?.form || {}; // ✅ Data passed from previous page

  const [formData, setFormData] = useState({
    name: formDataFromState.student_name || "",
    father_name: formDataFromState.father_name || "",
    cnic: formDataFromState.cnic || "",
    obtainedmarks: "",
    totalmarks: "50",
  });

  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    document.title = `SALU Portal | Add Test Marks`;
  }, []);

  // ✅ Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // ✅ Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const token = localStorage.getItem("token");

      // ✅ Prepare payload
      const updatedData = {
        form_id: formDataFromState.form_id,
        obtained_marks: formData.obtainedmarks,
        total_marks: formData.totalmarks,
        status: "Passed",
      };

      console.log("📤 Sending marks data:", updatedData);

      // ✅ API call to update marks and status
      const res = await axios.put(
        `http://localhost:5000/api/admissions/updateMarks/${formDataFromState.form_id}`,
        updatedData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      console.log("✅ Response:", res.data);
      alert("Marks added and status updated to Passed successfully!");

      // ✅ Redirect back to list
      navigate("/SALU-PORTAL-FYP/Admissions/Forms/Appeared");
    } catch (err) {
      console.error("❌ Error submitting marks:", err);
      alert(
        err.response?.data?.message ||
          "Failed to submit marks. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="!p-[25px] md:!px-[80px] min-h-[calc(100vh-90px)] w-full bg-white dark:bg-gray-900"
      style={{
        backgroundImage: `url(${Background})`,
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center",
      }}
    >
      <div className="flex flex-col gap-3 w-full min-h-[80vh] bg-[#D5BBE0] rounded-md !p-5">
        <div className="flex justify-start items-center gap-3">
          <BackButton />
          <h1 className="text-2xl sm:text-3xl md:text-4xl py-3 font-bold text-gray-900 dark:text-white">
            Add Entry Test Marks
          </h1>
        </div>

        <hr className="border-t-[3px] border-gray-900 dark:border-white mb-4" />

        <form
          onSubmit={handleSubmit}
          className="flex flex-col justify-center items-center gap-5 min-h-[60vh] w-full bg-white dark:bg-gray-900 rounded-md overflow-x-auto !p-6"
        >
          <InputContainer
            title="Candidate Name"
            name="name"
            inputType="text"
            value={formData.name}
            disabled
          />

          <InputContainer
            title="Father's Name"
            name="father_name"
            inputType="text"
            value={formData.father_name}
            disabled
          />

          <InputContainer
            title="Candidate CNIC"
            name="cnic"
            inputType="text"
            value={formData.cnic}
            disabled
          />

          <InputContainer
            title="Obtained Marks"
            name="obtainedmarks"
            inputType="text"
            value={formData.obtainedmarks}
            onChange={handleChange}
          />

          <InputContainer
            title="Total Marks"
            name="totalmarks"
            inputType="text"
            value={formData.totalmarks}
            disabled
          />

          {/* ✅ Submit button */}
          <div className="w-full flex justify-end">
            <button
              type="submit"
              disabled={submitting}
              className="cursor-pointer relative overflow-hidden !px-[15px] !py-[5px] border-2 border-[#e5b300] text-white text-[0.8rem] font-medium bg-transparent transition-all duration-300 ease-linear
                         before:content-[''] before:absolute before:inset-x-0 before:bottom-0 before:h-full before:bg-[#e5b300] before:transition-all before:duration-300 before:ease-linear hover:before:h-0 disabled:opacity-60"
            >
              <span className="relative z-10">
                {submitting ? "Saving..." : "Save"}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddTestMarks;
