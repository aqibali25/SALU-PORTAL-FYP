import React from "react";
import InputContainer from "../../InputContainer";

const ReviewAcademicInfo = ({ title, data }) => {
  return (
    <div className="flex flex-col w-full justify-evenly items-center gap-6 !mt-6 !p-4">
      {/* <h5 className="text-2xl dark:text-white">{title} Record</h5> */}

      <InputContainer
        htmlFor="group"
        title="Group"
        value={data.group || ""}
        disabled
      />

      <InputContainer
        width="40%"
        htmlFor="degreeYear"
        title="Degree Year"
        value={data.degreeYear || ""}
        disabled
      />

      <InputContainer
        width="40%"
        htmlFor="seatNo"
        title="Seat No"
        value={data.seatNo || ""}
        disabled
      />

      <InputContainer
        htmlFor="institutionName"
        title={title === "Matriculation" ? "School Name" : "College Name"}
        value={data.institutionName || ""}
        disabled
      />

      <InputContainer
        htmlFor="board"
        title="Board"
        value={data.board || ""}
        disabled
      />

      <InputContainer
        width="40%"
        htmlFor="totalMarks"
        title="Total Marks"
        value={data.totalMarks || ""}
        disabled
      />

      <InputContainer
        htmlFor="marksObtained"
        title="Marks Obtained"
        value={data.marksObtained || ""}
        disabled
      />

      <InputContainer
        htmlFor="percentage"
        title="Percentage"
        value={data.percentage || ""}
        disabled
      />
    </div>
  );
};

export default ReviewAcademicInfo;
