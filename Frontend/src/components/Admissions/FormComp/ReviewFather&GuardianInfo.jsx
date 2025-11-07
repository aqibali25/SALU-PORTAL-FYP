import { useLocation } from "react-router-dom";
import InputContainer from "../../InputContainer";

const ReviewFatherInfo = () => {
  const location = useLocation();

  // Get full form data
  const formData = location.state?.form?.data;
  const fatherInfo = formData?.father_info;
  const guardianInfo = formData?.guardian_info;

  if (!fatherInfo && !guardianInfo) {
    return (
      <p className="text-center text-gray-700 dark:text-gray-200 mt-10">
        No father or guardian information found.
      </p>
    );
  }

  // Render both sections if available
  return (
    <div className="flex flex-col w-full justify-evenly items-center gap-8 !mt-6 !p-4">
      <div className="flex flex-col w-full justify-evenly items-center gap-6">
        <h1 className="text-2xl dark:text-white">Father Information</h1>

        <InputContainer
          htmlFor="fatherName"
          title="Father Name"
          value={fatherInfo.name || ""}
          disabled
        />

        <InputContainer
          width="40%"
          htmlFor="fatherCnic"
          title="Father CNIC"
          value={fatherInfo.cnic_number || ""}
          disabled
        />

        <InputContainer
          htmlFor="fatherMobile"
          title="Father Mobile No"
          value={fatherInfo.mobile_number || ""}
          disabled
        />

        <InputContainer
          htmlFor="fatherOccupation"
          title="Father Occupation"
          value={fatherInfo.occupation || "N/A"}
          disabled
        />
      </div>

      <div className="flex flex-col w-full justify-evenly items-center gap-6 border-t border-gray-400 !pt-6">
        <h1 className="text-2xl dark:text-white">Guardian Information</h1>

        <InputContainer
          htmlFor="guardianName"
          title="Guardian Name"
          value={guardianInfo.name || ""}
          disabled
        />

        <InputContainer
          width="40%"
          htmlFor="guardianCnic"
          title="Guardian CNIC"
          value={guardianInfo.cnic_number || ""}
          disabled
        />

        <InputContainer
          htmlFor="guardianMobile"
          title="Guardian Mobile No"
          value={guardianInfo.mobile_number || ""}
          disabled
        />

        <InputContainer
          htmlFor="guardianOccupation"
          title="Guardian Occupation"
          value={guardianInfo.occupation || "N/A"}
          disabled
        />
      </div>
    </div>
  );
};

export default ReviewFatherInfo;
