import { useEffect, useState } from "react";
import Background from "../../assets/Background.png";
import BackButton from "../BackButton";
import { Link, useParams } from "react-router-dom";
import InputContainer from "../InputContainer";
import useSubjectAllocation, {
  initialAllocations,
} from "../../Hooks/useSubjectAllocation";

const AssigningSubject = () => {
  const { subjectId } = useParams();
  const subjectName = subjectId.replace(/-\d+$/, "");

  const selectedSubject = initialAllocations.find(
    (item) => item.subName.replace(/\s+/g, "").toUpperCase() === subjectName
  );

  const [formData, setFormData] = useState(
    selectedSubject || {
      saId: "",
      subName: subjectName,
      teacherName: "",
      department: "",
      semester: "",
      creditHours: "",
      year: "",
    }
  );

  const [submitting, setSubmitting] = useState(false);

  const teachers = Array.from(
    new Set(initialAllocations.map((item) => item.teacherName))
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitting(true);

    setTimeout(() => {
      console.log("📤 Saved Data:", formData);
      setSubmitting(false);
    }, 1000);
  };

  useEffect(() => {
    document.title = `SALU Portal | Subject Allocation ${subjectName}`;
  }, [subjectName]);

  return (
    <div
      className="!p-[25px] !px-[80px] min-h-[calc(100vh-90px)] w-[100%] bg-white dark:bg-gray-900"
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
            Subject Allocation - {subjectName}
          </h1>
        </div>
        <hr className="border-t-[3px] border-gray-900 dark:border-white mb-4" />

        <form
          onSubmit={handleSubmit}
          className="flex flex-col justify-center items-center gap-5 min-h-[60vh] w-full bg-white dark:bg-gray-900 rounded-md overflow-x-auto !p-6"
        >
          <InputContainer
            placeholder="Enter Subjects Allocation ID"
            title="Subjects Allocation ID"
            htmlFor="saId"
            inputType="text"
            name="saId"
            value={formData.saId}
            onChange={handleChange}
            required
            disabled
          />

          <InputContainer
            placeholder="Enter Subject Name"
            title="Subject Name"
            htmlFor="subName"
            inputType="text"
            name="subName"
            value={formData.subName}
            onChange={handleChange}
            required
            disabled
          />

          <div className="flex w-full max-w-[800px] items-start md:items-center justify-start flex-col md:flex-row gap-[8px] md:gap-5 [@media(max-width:550px)]:gap-[5px]">
            <label
              htmlFor="teacherName"
              className="w-auto md:w-1/4 text-start md:text-right text-gray-900 dark:text-white"
            >
              <span className="text-[#ff0000] mr-1">*</span>
              Teacher Name:
            </label>
            <select
              id="teacherName"
              name="teacherName"
              required
              value={formData.teacherName}
              onChange={handleChange}
              className="w-[40%] [@media(max-width:768px)]:!w-full min-w-0 !px-2 !py-1 border-2 border-[#a5a5a5] outline-none bg-[#f9f9f9] text-[#2a2a2a] dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
            >
              <option value="" disabled>
                [Select a Teacher]
              </option>
              {teachers.map((teacher) => (
                <option key={teacher} value={teacher}>
                  {teacher}
                </option>
              ))}
            </select>
          </div>

          <InputContainer
            placeholder="Enter Department"
            title="Department"
            htmlFor="department"
            inputType="text"
            name="department"
            value={formData.department}
            onChange={handleChange}
            required
            disabled
          />

          <InputContainer
            placeholder="Enter Semester"
            title="Semester"
            htmlFor="semester"
            inputType="text"
            name="semester"
            value={formData.semester}
            onChange={handleChange}
            required
            disabled
          />

          <InputContainer
            placeholder="Enter Credit Hours"
            title="Credit Hours"
            htmlFor="creditHours"
            inputType="text"
            name="creditHours"
            value={formData.creditHours}
            onChange={handleChange}
            required
            disabled
          />

          <InputContainer
            placeholder="Enter Year"
            title="Year"
            htmlFor="year"
            inputType="text"
            name="year"
            value={formData.year}
            onChange={handleChange}
            required
            disabled
          />

          <div className="w-full flex justify-end ">
            <Link
              to="/SALU-PORTAL-FYP/SubjectAllocation"
              type="submit"
              disabled={submitting}
              className="cursor-pointer relative overflow-hidden !px-[15px] !py-[5px] border-2 border-[#e5b300] text-white text-[0.8rem] font-medium bg-transparent transition-all duration-300 ease-linear
                         before:content-[''] before:absolute before:inset-x-0 before:bottom-0 before:h-full before:bg-[#e5b300] before:transition-all before:duration-300 before:ease-linear hover:before:h-0 disabled:opacity-60"
            >
              <span className="relative z-10">
                {submitting ? "Saving..." : "Assign Subject"}
              </span>
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AssigningSubject;
