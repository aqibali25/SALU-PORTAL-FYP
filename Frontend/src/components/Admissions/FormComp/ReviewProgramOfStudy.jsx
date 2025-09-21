// src/components/Admissions/ReviewProgramOfStudy.jsx
import InputContainer from "../../InputContainer";

const ReviewProgramOfStudy = () => {
  return (
    <div className="flex flex-col w-full justify-evenly items-center gap-6 !mt-10">
      <InputContainer
        value="Applied Department"
        title="Applied Department"
        htmlFor="appliedDepartment"
        inputType="text"
        disabled
      />
      <InputContainer
        value="Computer Science"
        title="First Choice"
        htmlFor="firstChoice"
        inputType="text"
        disabled
      />
      <InputContainer
        value="Business Administration"
        title="Second Choice"
        htmlFor="secondChoice"
        inputType="text"
        disabled
      />
      <InputContainer
        value="English Language And Literature"
        title="Third Choice"
        htmlFor="thirdChoice"
        inputType="text"
        disabled
      />
    </div>
  );
};

export default ReviewProgramOfStudy;
