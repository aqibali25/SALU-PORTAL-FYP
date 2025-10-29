import React from "react";
import InputContainer from "../../InputContainer";

const ReviewAcademicInfo = ({ title }) => {
  return (
    <div className="flex flex-col w-full justify-evenly items-center gap-8 !mt-6 !p-4">
      <div className="flex flex-col w-full justify-evenly items-center gap-6 !mt-6 !p-4">
        <h3 className="text-2xl dark:text-white">Matriculation Record</h3>

        <InputContainer htmlFor="group" title="Group" value={""} disabled />

        <InputContainer
          width="40%"
          htmlFor="degreeYear"
          title="Degree Year"
          value={""}
          disabled
        />

        <InputContainer
          width="40%"
          htmlFor="seatNo"
          title="Seat No"
          value={""}
          disabled
        />

        <InputContainer
          htmlFor="institutionName"
          title={"School Name"}
          value={""}
          disabled
        />

        <InputContainer htmlFor="board" title="Board" value={" "} disabled />

        <InputContainer
          width="40%"
          htmlFor="totalMarks"
          title="Total Marks"
          value={""}
          disabled
        />

        <InputContainer
          htmlFor="marksObtained"
          title="Marks Obtained"
          value={""}
          disabled
        />

        <InputContainer
          htmlFor="percentage"
          title="Percentage"
          value={""}
          disabled
        />
      </div>
      <div className="flex flex-col w-full justify-evenly items-center gap-6 border-t border-gray-400 !pt-6">
        <h3 className="text-2xl dark:text-white">Intermediate Record</h3>

        <InputContainer htmlFor="group" title="Group" value={""} disabled />

        <InputContainer
          width="40%"
          htmlFor="degreeYear"
          title="Degree Year"
          value={""}
          disabled
        />

        <InputContainer
          width="40%"
          htmlFor="seatNo"
          title="Seat No"
          value={""}
          disabled
        />

        <InputContainer
          htmlFor="institutionName"
          title={"College Name"}
          value={""}
          disabled
        />

        <InputContainer htmlFor="board" title="Board" value={""} disabled />

        <InputContainer
          width="40%"
          htmlFor="totalMarks"
          title="Total Marks"
          value={""}
          disabled
        />

        <InputContainer
          htmlFor="marksObtained"
          title="Marks Obtained"
          value={""}
          disabled
        />

        <InputContainer
          htmlFor="percentage"
          title="Percentage"
          value={""}
          disabled
        />
      </div>
    </div>
  );
};

export default ReviewAcademicInfo;
