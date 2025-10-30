import React from "react";
import InputContainer from "../../InputContainer";
import { useLocation } from "react-router-dom";

const ReviewAcademicInfo = ({ title }) => {
  const location = useLocation();

  // Get full form data
  const formData = location.state?.form?.data;
  const matricRecord = formData.matriculation_latest;
  const interRecord = formData.intermediate_latest;
  console.log("🎓 Matriculation Record:", matricRecord);
  console.log("🎓 Intermediate Record:", interRecord);

  return (
    <div className="flex flex-col w-full justify-evenly items-center gap-8 !mt-6 !p-4">
      <div className="flex flex-col w-full justify-evenly items-center gap-6 !mt-6 !p-4">
        <h3 className="text-2xl dark:text-white">Matriculation Record</h3>

        <InputContainer
          htmlFor="group"
          title="Group"
          value={matricRecord.group_name || ""}
          disabled
        />

        <InputContainer
          width="40%"
          htmlFor="degreeYear"
          title="Degree Year"
          value={matricRecord?.degree_year || ""}
          disabled
        />

        <InputContainer
          width="40%"
          htmlFor="seatNo"
          title="Seat No"
          value={matricRecord?.seat_no || ""}
          disabled
        />

        <InputContainer
          htmlFor="institutionName"
          title={"School Name"}
          value={matricRecord?.institution_name || ""}
          disabled
        />

        <InputContainer
          htmlFor="board"
          title="Board"
          value={matricRecord.board || " "}
          disabled
        />

        <InputContainer
          width="40%"
          htmlFor="totalMarks"
          title="Total Marks"
          value={matricRecord?.total_marks || ""}
          disabled
        />

        <InputContainer
          htmlFor="marksObtained"
          title="Marks Obtained"
          value={matricRecord?.marks_obtained || ""}
          disabled
        />

        <InputContainer
          htmlFor="percentage"
          title="Percentage"
          value={matricRecord?.percentage || ""}
          disabled
        />
      </div>
      <div className="flex flex-col w-full justify-evenly items-center gap-6 border-t border-gray-400 !pt-6">
        <h3 className="text-2xl dark:text-white">Intermediate Record</h3>

        <InputContainer
          htmlFor="group"
          title="Group"
          value={interRecord.group_name || ""}
          disabled
        />

        <InputContainer
          width="40%"
          htmlFor="degreeYear"
          title="Degree Year"
          value={interRecord?.degree_year || ""}
          disabled
        />

        <InputContainer
          width="40%"
          htmlFor="seatNo"
          title="Seat No"
          value={interRecord?.seat_no || ""}
          disabled
        />

        <InputContainer
          htmlFor="institutionName"
          title={"College Name"}
          value={interRecord?.institution_name || ""}
          disabled
        />

        <InputContainer
          htmlFor="board"
          title="Board"
          value={interRecord.board || ""}
          disabled
        />

        <InputContainer
          width="40%"
          htmlFor="totalMarks"
          title="Total Marks"
          value={interRecord?.total_marks || ""}
          disabled
        />

        <InputContainer
          htmlFor="marksObtained"
          title="Marks Obtained"
          value={interRecord?.marks_obtained || ""}
          disabled
        />

        <InputContainer
          htmlFor="percentage"
          title="Percentage"
          value={interRecord?.percentage || ""}
          disabled
        />
      </div>
    </div>
  );
};

export default ReviewAcademicInfo;
