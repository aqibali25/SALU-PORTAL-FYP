import { useState, useEffect } from "react";
import BackButton from "../BackButton";
import Background from "./../../assets/Background.png";
import { FiChevronLeft } from "react-icons/fi";
import ReviewProgramOfStudy from "./FormComp/ReviewProgramOfStudy";
import ReviewPersonalInfo from "./FormComp/ReviewPersonalInfo";
import ReviewFatherInfo from "./FormComp/ReviewFather&GuardianInfo";
import ReviewAcademicInfo from "./FormComp/ReviewAcademicInfo";
import ReviewDocuments from "./FormComp/ReviewDocuments";
import ApprovedMessage from "./ApprovedMessage";
import RevertAndTrashMessage from "./RevertAndTrashMessage";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ReviewForm = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    document.title = "SALU Portal | Review Form";
  }, []);

  const [step, setStep] = useState(() => {
    const savedStep = localStorage.getItem("reviewFormStep");
    return savedStep ? Number(savedStep) : 1;
  });

  useEffect(() => {
    localStorage.setItem("reviewFormStep", step);
  }, [step]);

  const [showApproved, setShowApproved] = useState(false);
  const [showRevert, setShowRevert] = useState(false);
  const [showTrash, setShowTrash] = useState(false);

  const stepTitles = {
    1: "Program of Study",
    2: "Personal Information",
    3: "Father & Guardian Information",
    4: "Academic Record",
    5: "Photo & Documents",
  };

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return <ReviewProgramOfStudy />;
      case 2:
        return <ReviewPersonalInfo />;
      case 3:
        return <ReviewFatherInfo />;
      case 4:
        return <ReviewAcademicInfo />;
      case 5:
        return <ReviewDocuments />;
      default:
        return null;
    }
  };

  const handleBack = () => {
    if (step > 1) setStep((prev) => prev - 1);
    else window.history.back();
  };

  const handleNext = () => {
    if (step < Object.keys(stepTitles).length) setStep((prev) => prev + 1);
  };

  // Approve function
  const handleApprove = async () => {
    setShowApproved(false); // close modal
    const formData = location.state?.form?.data;
    if (!formData?.form_id) {
      toast.error("Form ID missing!", { position: "top-center" });
      return;
    }

    const backendBaseUrl =
      import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";
    try {
      await axios.patch(
        `${backendBaseUrl}/api/admissions/updateStatus/${formData.form_id}`,
        { status: "Approved" }
      );
      toast.success("Form approved successfully!", { position: "top-center" });
      navigate("/SALU-PORTAL-FYP/Admissions/PendingForms");
    } catch (err) {
      console.error(err);
      toast.error("Failed to approve form", { position: "top-center" });
    }
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
      <ToastContainer />
      <div className="flex flex-col gap-3 w-full min-h-[80vh] bg-[#D5BBE0] rounded-md !p-5">
        <div className="flex justify-start items-center gap-3">
          <BackButton />
          <h1 className="text-[1.4rem] sm:text-3xl md:text-4xl !py-3 font-bold text-gray-900 dark:text-white">
            Review Form
          </h1>
        </div>
        <hr className="border-t-[3px] border-gray-900 dark:border-white mb-4" />

        <div className="relative flex flex-col justify-center items-center gap-5 min-h-[60vh] w-full md:!p-10 !pt-10 !p-3 bg-white dark:bg-gray-900 rounded-md overflow-hidden">
          <div className="flex justify-start items-center gap-3 absolute top-0 left-0 w-full text-[1rem] sm:text-2xl !px-5 !py-2 bg-[#D6D6D6] rounded-tl-md rounded-tr-md border-gray-500">
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

          {renderStepContent()}

          <div className="w-full flex justify-end mt-4">
            {step === Object.keys(stepTitles).length ? (
              <div className="flex justify-evenly w-70 gap-3">
                <button
                  type="button"
                  onClick={() => setShowApproved(true)}
                  className="cursor-pointer relative overflow-hidden !px-[10px] !py-[5px] border-2 border-[#e5b300] text-white text-[0.8rem] font-medium bg-transparent transition-all duration-300 ease-linear
                       before:content-[''] before:absolute before:inset-x-0 before:bottom-0 before:h-full before:bg-[#e5b300] before:transition-all before:duration-300 before:ease-linear hover:before:h-0 disabled:opacity-60"
                >
                  <span className="relative z-10">Approve</span>
                </button>
                {/* Revert / Trash buttons */}
                <button
                  type="button"
                  onClick={() => setShowRevert(true)}
                  className="cursor-pointer relative overflow-hidden !px-[10px] !py-[5px] border-2 border-[#e5b300] text-white text-[0.8rem] font-medium bg-transparent transition-all duration-300 ease-linear
                       before:content-[''] before:absolute before:inset-x-0 before:bottom-0 before:h-full before:bg-[#e5b300] before:transition-all before:duration-300 before:ease-linear hover:before:h-0 disabled:opacity-60"
                >
                  <span className="relative z-10">Revert</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowTrash(true)}
                  className="cursor-pointer relative overflow-hidden !px-[10px] !py-[5px] border-2 border-[#e5b300] text-white text-[0.8rem] font-medium bg-transparent transition-all duration-300 ease-linear
                       before:content-[''] before:absolute before:inset-x-0 before:bottom-0 before:h-full before:bg-[#e5b300] before:transition-all before:duration-300 before:ease-linear hover:before:h-0 disabled:opacity-60"
                >
                  <span className="relative z-10">Trash</span>
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleNext}
                className="cursor-pointer relative overflow-hidden !px-[15px] !py-[5px] border-2 border-[#e5b300] text-white text-[0.8rem] font-medium bg-transparent transition-all duration-300 ease-linear
                       before:content-[''] before:absolute before:inset-x-0 before:bottom-0 before:h-full before:bg-[#e5b300] before:transition-all before:duration-300 before:ease-linear hover:before:h-0 disabled:opacity-60"
              >
                <span className="relative z-10">Next</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      <ApprovedMessage
        open={showApproved}
        onClose={handleApprove}
        onCancel={() => setShowApproved(false)}
      />

      <RevertAndTrashMessage
        open={showRevert}
        onCancel={() => setShowRevert(false)}
        onClose={() => navigate("/SALU-PORTAL-FYP/Admissions/PendingForms")}
        type="revert"
      />

      <RevertAndTrashMessage
        open={showTrash}
        onCancel={() => setShowTrash(false)}
        onClose={() => navigate("/SALU-PORTAL-FYP/Admissions/PendingForms")}
        type="trash"
      />
    </div>
  );
};

export default ReviewForm;
