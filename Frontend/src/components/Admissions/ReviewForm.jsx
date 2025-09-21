import { useState, useEffect } from "react";
import BackButton from "../BackButton";
import Background from "./../../assets/Background.png";
import { FiChevronLeft } from "react-icons/fi";
import ReviewProgramOfStudy from "./FormComp/ReviewProgramOfStudy";
import ReviewPersonalInfo from "./FormComp/ReviewPersonalInfo";
import ReviewFatherInfo from "./FormComp/ReviewFather&GuardianInfo";
import ReviewAcademicInfo from "./FormComp/ReviewAcademicInfo"; // new component

export const ReviewForm = () => {
  // Persist step in localStorage
  const [step, setStep] = useState(() => {
    const savedStep = localStorage.getItem("reviewFormStep");
    return savedStep ? Number(savedStep) : 1;
  });

  useEffect(() => {
    localStorage.setItem("reviewFormStep", step);
  }, [step]);

  // Fake data (replace with DB values)
  const intermediateData = {
    group: "Pre-Engineering",
    degreeYear: "2023",
    seatNo: "123456",
    institutionName: "Karachi College",
    board: "Sindh Board",
    totalMarks: "1100",
    marksObtained: "990",
    percentage: "90%",
  };

  const matriculationData = {
    group: "Science",
    degreeYear: "2021",
    seatNo: "654321",
    institutionName: "Karachi School",
    board: "Sindh Board",
    totalMarks: "850",
    marksObtained: "765",
    percentage: "90%",
  };

  const fatherData = {
    name: "Aqib Ali",
    mobileNumber: "03001234567",
    occupation: "Engineer",
  };

  const guardianData = {
    name: "Ahmed Ali",
    mobileNumber: "03109876543",
    occupation: "Teacher",
  };

  // Step titles
  const stepTitles = {
    1: "Program of Study",
    2: "Personal Information",
    3: "Intermediate Academic Record",
    4: "Matriculation Academic Record",
    5: "Father & Guardian Information",
  };

  // Step content
  const renderStepContent = () => {
    switch (step) {
      case 1:
        return <ReviewProgramOfStudy />;
      case 2:
        return <ReviewPersonalInfo />;
      case 3:
        return (
          <>
            <ReviewFatherInfo title="Father" data={fatherData} />
            <hr className="my-4 w-full border-gray-400" />
            <ReviewFatherInfo title="Guardian" data={guardianData} />
          </>
        );
      case 4:
        return (
          <ReviewAcademicInfo title="Matriculation" data={matriculationData} />
        );
      case 5:
        return (
          <ReviewAcademicInfo title="Intermediate" data={intermediateData} />
        );

      default:
        return <div className="text-xl font-bold">All Steps Completed 🎉</div>;
    }
  };

  // Back button
  const handleBack = () => {
    if (step > 1) setStep((prev) => prev - 1);
    else window.history.back();
  };

  // Next button
  const handleNext = () => {
    if (step < Object.keys(stepTitles).length) setStep((prev) => prev + 1);
    else console.log("Finished");
  };

  return (
    <div
      className="sm:!px-[40px] md:!px-[80px] !px-5 !py-[20px] min-h-[calc(100vh-90px)] w-full bg-white dark:bg-gray-900"
      style={{
        backgroundImage: `url(${Background})`,
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center",
      }}
    >
      <div className="flex flex-col gap-3 w-full min-h-[80vh] bg-[#D5BBE0] rounded-md !p-5">
        {/* Page heading */}
        <div className="flex justify-start items-center gap-3">
          <BackButton />
          <h1 className="text-[1.4rem] sm:text-3xl md:text-4xl !py-3 font-bold text-gray-900 dark:text-white">
            Review Form
          </h1>
        </div>
        <hr className="border-t-[3px] border-gray-900 dark:border-white mb-4" />

        {/* Inner content */}
        <div className="relative flex flex-col justify-center items-center gap-5 min-h-[60vh] w-full md:!p-10 !p-6 bg-white dark:bg-gray-900 rounded-md overflow-hidden">
          {/* Header bar */}
          <div className="flex justify-start items-center gap-3 absolute top-0 left-0 w-full text-[1.3rem] sm:text-2xl !px-5 !py-2 bg-[#D6D6D6] rounded-tl-md rounded-tr-md border-gray-500">
            <div
              className="flex justify-center items-center cursor-pointer"
              onClick={handleBack}
            >
              <FiChevronLeft className="text-gray-900" size={30} />
              <FiChevronLeft className="!ml-[-18px] text-gray-900" size={30} />
              <FiChevronLeft className="!ml-[-18px] text-gray-900" size={30} />
            </div>
            <h1>{stepTitles[step]}</h1>
          </div>

          {/* Step content */}
          {renderStepContent()}

          <div className="w-full flex justify-end mt-4">
            <button
              type="button"
              onClick={handleNext}
              className="cursor-pointer relative overflow-hidden !px-[15px] !py-[5px] border-2 border-[#e5b300] text-white text-[0.8rem] font-medium bg-transparent transition-all duration-300 ease-linear
                       before:content-[''] before:absolute before:inset-x-0 before:bottom-0 before:h-full before:bg-[#e5b300] before:transition-all before:duration-300 before:ease-linear hover:before:h-0 disabled:opacity-60"
            >
              <span className="relative z-10">
                {step === Object.keys(stepTitles).length ? "Finish" : "Next"}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReviewForm;
