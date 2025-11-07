import { useLocation } from "react-router-dom";
import InputContainer from "../../InputContainer";

const ReviewProgramOfStudy = () => {
  const location = useLocation();
  const formData = location.state?.form?.data;
  const programData = formData?.program_of_study;

  if (!programData) {
    return (
      <p className="text-center text-gray-700 dark:text-gray-200 mt-10">
        No program of study data found.
      </p>
    );
  }

  return (
    <div className="flex flex-col w-full justify-evenly items-center gap-6 !mt-10">
      <InputContainer
        width="50%"
        value={programData.applied_department || ""}
        title="Applied Department"
        htmlFor="appliedDepartment"
        inputType="text"
        disabled
      />
      <InputContainer
        width="50%"
        value={programData.first_choice || ""}
        title="First Choice"
        htmlFor="firstChoice"
        inputType="text"
        disabled
      />
      <InputContainer
        width="50%"
        value={programData.second_choice || ""}
        title="Second Choice"
        htmlFor="secondChoice"
        inputType="text"
        disabled
      />
      <InputContainer
        width="50%"
        value={programData.third_choice || ""}
        title="Third Choice"
        htmlFor="thirdChoice"
        inputType="text"
        disabled
      />
    </div>
  );
};

export default ReviewProgramOfStudy;
