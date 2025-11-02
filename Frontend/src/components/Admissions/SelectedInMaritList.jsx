import { useEffect, useState } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import Background from "../../assets/Background.png";
import BackButton from "../BackButton";
import InputContainer from "../InputContainer";

const SelectedInMaritList = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const formDataFromState = location.state?.form || {};

  const [formData, setFormData] = useState({
    name: formDataFromState.student_name || "",
    father_name: formDataFromState.father_name || "",
    cnic: formDataFromState.cnic || "",
    obtainedmarks: "",
    totalmarks: "50",
    percentage: "",
    merit_list: "",
    department: "",
  });

  const [submitting, setSubmitting] = useState(false);

  const meritListOptions = [
    "1st Merit List",
    "2nd Merit List",
    "3rd Merit List",
  ];

  const departmentOptions = [
    "Computer Science",
    "Business Administration",
    "English Language and Literature",
  ];

  useEffect(() => {
    document.title = `SALU Portal | Add Test Marks`;
  }, []);

  // ✅ Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ✅ Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const token = localStorage.getItem("token");

      const updatedData = {
        form_id: formDataFromState.form_id,
        obtained_marks: formData.obtainedmarks,
        total_marks: formData.totalmarks,
        percentage: formData.percentage,
        merit_list: formData.merit_list,
        department: formData.department,
        status: "Passed",
      };

      console.log("📤 Sending marks data:", updatedData);

      const res = await axios.put(
        `http://localhost:5000/api/admissions/updateMarks/${formDataFromState.form_id}`,
        updatedData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      console.log("✅ Response:", res.data);
      alert("Marks added and status updated to Passed successfully!");
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
            Select Marit List
          </h1>
        </div>

        <hr className="border-t-[3px] border-gray-900 dark:border-white mb-4" />

        <form
          onSubmit={handleSubmit}
          className="flex flex-col justify-center items-center gap-5 min-h-[60vh] w-full bg-white dark:bg-gray-900 rounded-md overflow-x-auto !p-6"
        >
          {/* Candidate Info */}
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

          {/* Marks Info */}
          <InputContainer
            title="Obtained Marks"
            name="obtainedmarks"
            inputType="text"
            value={formData.obtainedmarks}
            onChange={handleChange}
            disabled
          />
          <InputContainer
            title="Total Marks"
            name="totalmarks"
            inputType="text"
            value={formData.totalmarks}
            disabled
          />
          <InputContainer
            title="Percentage"
            name="percentage"
            inputType="text"
            value={formData.percentage}
            onChange={handleChange}
          />
          <div className="flex w-full max-w-[800px] items-start md:items-center justify-start flex-col md:flex-row gap-[8px] md:gap-5 [@media(max-width:550px)]:gap-[5px]">
            <label
              htmlFor="merit_list"
              className="w-auto md:w-1/4 text-start md:text-right text-gray-900 dark:text-white"
            >
              <span className="text-[#ff0000] mr-1">*</span>
              Merit List:
            </label>
            <select
              id="merit_list"
              name="merit_list" // ✅ added
              required
              value={formData.merit_list}
              onChange={handleChange} // ✅ works now
              className="w-[40%] [@media(max-width:768px)]:!w-full min-w-0 !px-2 !py-1 border-2 border-[#a5a5a5] outline-none bg-[#f9f9f9] text-[#2a2a2a] dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
            >
              <option value="" disabled>
                [Select an Option]
              </option>
              {meritListOptions.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
          </div>

          <div className="flex w-full max-w-[800px] items-start md:items-center justify-start flex-col md:flex-row gap-[8px] md:gap-5 [@media(max-width:550px)]:gap-[5px]">
            <label
              htmlFor="department"
              className="w-auto md:w-1/4 text-start md:text-right text-gray-900 dark:text-white"
            >
              <span className="text-[#ff0000] mr-1">*</span>
              Department:
            </label>
            <select
              id="department"
              name="department" // ✅ added
              required
              value={formData.department}
              onChange={handleChange} // ✅ works now
              className="w-[40%] [@media(max-width:768px)]:!w-full min-w-0 !px-2 !py-1 border-2 border-[#a5a5a5] outline-none bg-[#f9f9f9] text-[#2a2a2a] dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
            >
              <option value="" disabled>
                [Select an Option]
              </option>
              {departmentOptions.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
          </div>

          {/* Submit button */}
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

export default SelectedInMaritList;
