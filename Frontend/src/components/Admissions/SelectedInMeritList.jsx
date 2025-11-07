import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import Background from "../../assets/Background.png";
import BackButton from "../BackButton";
import InputContainer from "../InputContainer";

const SelectedInMaritList = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const formDataFromState = location.state?.form || {};

  const meritListOptions = [
    "1st Merit List",
    "2nd Merit List",
    "3rd Merit List",
  ];
  const departmentOptions = [
    "Computer Science",
    "Business Administration",
    "English Linguistics and Literature",
  ];

  const [formData, setFormData] = useState({
    cnic: formDataFromState.cnic || "",
    obtainedmarks: "",
    totalmarks: "",
    percentage: "",
    merit_list: "",
    department: "",
  });

  const [candidate, setCandidate] = useState(null);
  const [loading, setLoading] = useState(false);

  // ✅ Fetch candidate on mount
  useEffect(() => {
    document.title = `SALU Portal | Select Merit List`;

    const fetchCandidate = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(
          `http://localhost:5000/api/admissions/enrolled/list`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const allAdmissions = res.data?.data || [];
        const found = allAdmissions.find(
          (item) => item.cnic === formDataFromState.cnic
        );

        if (!found) {
          toast.error("No record found for this candidate!", {
            position: "top-center",
          });
          return;
        }

        console.log("Candidate Found:", found);
        setCandidate(found);
        // fill in initial marks data
        setFormData((prev) => ({
          ...prev,
          obtainedmarks: found.entryTestObtained || "",
          totalmarks: found.entryTestTotal || "",
          percentage: found.entryTestPercentage || "",
          merit_list: found.meritList || "",
          department: found.department || "",
        }));
      } catch (err) {
        console.error("Error fetching candidate:", err);
        toast.error("Failed to fetch candidate data!", {
          position: "top-center",
        });
      }
    };

    if (formDataFromState.cnic) {
      fetchCandidate();
    }
  }, [formDataFromState.cnic]);

  // ✅ Handle change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ✅ Handle submit - send to API (following your working pattern)
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!candidate) {
      toast.error("Candidate not found. Cannot submit!");
      return;
    }

    if (!formData.merit_list || !formData.department) {
      toast.error("Please select both merit list and department!", {
        position: "top-center",
      });
      return;
    }

    setLoading(true);
    const token = localStorage.getItem("token");

    try {
      // ✅ 1. Send marks data to updateMarks API endpoint
      const marksData = {
        obtained_marks: formData.obtainedmarks,
        total_marks: formData.totalmarks,
        percentage: formData.percentage,
        merit_list: formData.merit_list,
        department: formData.department,
      };

      // ✅ Add optional values only if present
      if (formData.passing_marks) {
        marksData.passing_marks = formData.passing_marks;
      }
      if (candidate.feeStatus) {
        marksData.fee_status = candidate.feeStatus;
      }

      console.log("📤 Sending Marks Data:", marksData);

      const marksResponse = await axios.put(
        `http://localhost:5000/api/admissions/updateMarks/${formDataFromState.form_id}`,
        marksData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      console.log("✅ Marks API Response:", marksResponse.data);

      // ✅ 2. Update status separately using the status API to "Selected"
      const statusResponse = await axios.patch(
        `http://localhost:5000/api/admissions/updateStatus/${formDataFromState.form_id}`,
        { status: "Selected" },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("✅ Status API Response:", statusResponse.data);

      toast.success("Candidate added to merit list successfully!");

      setTimeout(() => {
        navigate("/SALU-PORTAL-FYP/Admissions/PassedCandidates");
      }, 1200);
    } catch (err) {
      console.error("❌ Error updating candidate:", err);

      // More detailed error handling
      if (err.response?.status === 404) {
        toast.error("Candidate record not found in database!", {
          position: "top-center",
        });
      } else if (err.response?.data?.message) {
        toast.error(
          `Failed to update candidate: ${err.response.data.message}`,
          {
            position: "top-center",
          }
        );
      } else {
        toast.error("Failed to update candidate!", {
          position: "top-center",
        });
      }
    } finally {
      setLoading(false);
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
          <BackButton url={"-1"} />
          <h1 className="text-2xl sm:text-3xl md:text-4xl py-3 font-bold text-gray-900 dark:text-white">
            Select Merit List
          </h1>
        </div>

        <hr className="border-t-[3px] border-gray-900 dark:border-white mb-4" />

        <form
          onSubmit={handleSubmit}
          className="flex flex-col justify-center items-center gap-5 min-h-[60vh] w-full bg-white dark:bg-gray-900 rounded-md overflow-x-auto !p-6"
        >
          {/* Candidate Info */}
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
            disabled
          />

          {/* Merit List Select */}
          <div className="flex w-full max-w-[800px] items-start md:items-center justify-start flex-col md:flex-row gap-[8px] md:gap-5 [@media(max-width:550px)]:gap-[5px]">
            <label
              htmlFor="merit_list"
              className="w-auto md:w-1/4 text-start md:text-right text-gray-900 dark:text-white"
            >
              <span className="text-[#ff0000] mr-1">*</span>Merit List:
            </label>
            <select
              id="merit_list"
              name="merit_list"
              required
              value={formData.merit_list}
              onChange={handleChange}
              className="w-[40%] [@media(max-width:768px)]:!w-full min-w-0 !px-2 !py-1 border-2 border-[#a5a5a5] outline-none bg-[#f9f9f9] text-[#2a2a2a] dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
              disabled={loading}
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

          {/* Department Select */}
          <div className="flex w-full max-w-[800px] items-start md:items-center justify-start flex-col md:flex-row gap-[8px] md:gap-5 [@media(max-width:550px)]:gap-[5px]">
            <label
              htmlFor="department"
              className="w-auto md:w-1/4 text-start md:text-right text-gray-900 dark:text-white"
            >
              <span className="text-[#ff0000] mr-1">*</span>Department:
            </label>
            <select
              id="department"
              name="department"
              required
              value={formData.department}
              onChange={handleChange}
              className="w-[40%] [@media(max-width:768px)]:!w-full min-w-0 !px-2 !py-1 border-2 border-[#a5a5a5] outline-none bg-[#f9f9f9] text-[#2a2a2a] dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
              disabled={loading}
            >
              <option value="" disabled>
                [Select an Option]
              </option>
              {departmentOptions.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>

          {/* Submit */}
          <div className="w-full flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="cursor-pointer relative overflow-hidden !px-[15px] !py-[5px] border-2 border-[#e5b300] text-white text-[0.8rem] font-medium bg-transparent transition-all duration-300 ease-linear
                         before:content-[''] before:absolute before:inset-x-0 before:bottom-0 before:h-full before:bg-[#e5b300] before:transition-all before:duration-300 before:ease-linear hover:before:h-0 disabled:opacity-60"
            >
              <span className="relative z-10">
                {loading ? "Saving..." : "Save"}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SelectedInMaritList;
