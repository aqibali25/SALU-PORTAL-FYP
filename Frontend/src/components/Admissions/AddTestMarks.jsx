import { useEffect, useState } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import Background from "../../assets/Background.png";
import BackButton from "../BackButton";
import InputContainer from "../InputContainer";

const AddTestMarks = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const formDataFromState = location.state?.form || {};
  console.log(formDataFromState);

  const [formData, setFormData] = useState({
    name: formDataFromState.student_name || "",
    father_name: formDataFromState.father_name || "",
    cnic: formDataFromState.cnic || "",
    obtainedmarks: "",
    totalmarks: "",
    passingmarks: "",
    percentage: "",
  });

  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    document.title = `SALU Portal | Add Test Marks`;
  }, []);

  // ✅ Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => {
      const updated = { ...prev, [name]: value };
      const obtained = Number(updated.obtainedmarks);
      const total = Number(updated.totalmarks);

      if (!isNaN(obtained) && !isNaN(total) && total > 0) {
        updated.percentage = ((obtained / total) * 100).toFixed(2);
      } else {
        updated.percentage = "";
      }

      return updated;
    });
  };

  // ✅ Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.obtainedmarks.trim() || !formData.totalmarks.trim()) {
      alert("Please enter obtained and total marks.");
      return;
    }

    const obtained = Number(formData.obtainedmarks);
    const total = Number(formData.totalmarks);
    const passing = Number(formData.passingmarks);

    if (isNaN(obtained) || obtained < 0 || obtained > total) {
      alert(
        "Please enter a valid obtained marks value between 0 and total marks."
      );
      return;
    }

    const percentage = ((obtained / total) * 100).toFixed(2);
    const passStatus = obtained >= passing ? "Passed" : "Failed";

    setFormData((prev) => ({ ...prev, percentage }));

    setSubmitting(true);
    try {
      const token = localStorage.getItem("token");

      // ✅ Include status as "Selected"
      const updatedData = {
        form_id: formDataFromState.form_id,
        obtained_marks: obtained,
        total_marks: total,
        passing_marks: passing,
        percentage,
        status: passStatus,
        selection_status: passStatus,
      };

      console.log("📤 Sending marks data:", updatedData);

      await axios.put(
        `http://localhost:5000/api/admissions/updateMarks/${formDataFromState.form_id}`,
        updatedData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      alert(`Marks added successfully! Candidate has ${passStatus}.`);
      navigate("/SALU-PORTAL-FYP/Admissions/AppearedInTest");
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
            placeholder="Enter Passing Marks"
            title="Passing Marks"
            name="passingmarks"
            inputType="number"
            value={formData.passingmarks}
            onChange={handleChange}
            required
          />

          <InputContainer
            placeholder="Enter Obtained Marks"
            title="Obtained Marks"
            name="obtainedmarks"
            inputType="number"
            value={formData.obtainedmarks}
            onChange={handleChange}
            required
          />

          <InputContainer
            placeholder="Enter Total Marks"
            title="Total Marks"
            name="totalmarks"
            inputType="number"
            value={formData.totalmarks}
            onChange={handleChange}
            required
          />

          <InputContainer
            title="Percentage"
            name="percentage"
            inputType="text"
            value={formData.percentage}
            required
            disabled
          />

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
