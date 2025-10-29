import { useLocation } from "react-router-dom";
import InputContainer from "../../InputContainer";

const ReviewPersonalInfo = () => {
  const location = useLocation();
  const formData = location.state?.form?.data;
  const cnic = formData?.cnic;
  const personalInfo = formData?.personal_info;

  console.log("📦 Personal Info Data:", personalInfo);

  if (!personalInfo) {
    return (
      <p className="text-center text-gray-700 dark:text-gray-200 mt-10">
        No personal information found.
      </p>
    );
  }

  const [dobYear, dobMonth, dobDay] = personalInfo.dob
    ? personalInfo.dob.split("-")
    : ["", "", ""];

  return (
    <div className="flex flex-col w-full justify-evenly items-center gap-6 !mt-10 !p-4">
      <InputContainer
        htmlFor="firstName"
        title="First Name"
        value={personalInfo.first_name || ""}
        disabled
      />
      <InputContainer
        htmlFor="lastName"
        title="Last Name"
        value={personalInfo.last_name || ""}
        disabled
      />

      {/* Gender */}
      <InputContainer
        htmlFor="gender"
        title="Gender"
        value={personalInfo.gender || ""}
        disabled
      />

      {/* Date of Birth */}
      <div className="flex w-full max-w-[800px] flex-col md:flex-row gap-[8px] md:gap-5">
        <label className="w-auto md:w-1/4 text-start md:text-right text-gray-900 dark:text-white">
          Date of Birth:
        </label>
        <div className="flex gap-3 w-70">
          <input
            id="dobDay"
            type="text"
            value={dobDay || ""}
            disabled
            placeholder="DD"
            className="w-[20%] !px-2 !py-1 border-2 border-[#a5a5a5] outline-none bg-[#f9f9f9] text-[#2a2a2a] dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 disabled:opacity-60 disabled:cursor-not-allowed"
          />
          <input
            id="dobMonth"
            type="text"
            value={dobMonth || ""}
            disabled
            placeholder="MM"
            className="w-[20%] !px-2 !py-1 border-2 border-[#a5a5a5] outline-none bg-[#f9f9f9] text-[#2a2a2a] dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 disabled:opacity-60 disabled:cursor-not-allowed"
          />
          <input
            id="dobYear"
            type="text"
            value={dobYear || ""}
            disabled
            placeholder="YYYY"
            className="w-[30%] !px-2 !py-1 border-2 border-[#a5a5a5] outline-none bg-[#f9f9f9] text-[#2a2a2a] dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 disabled:opacity-60 disabled:cursor-not-allowed"
          />
        </div>
      </div>

      {/* CNIC (from data or URL fallback) */}
      <InputContainer
        width="30%"
        htmlFor="cnic"
        title="CNIC"
        value={personalInfo.cnic || cnic || ""}
        disabled
        className="sm:w-full"
      />

      {/* Religion */}
      <InputContainer
        width="40%"
        htmlFor="religion"
        title="Religion"
        value={personalInfo.religion || ""}
        disabled
        className="sm:w-full"
      />

      {/* Native Language */}
      <InputContainer
        width="40%"
        htmlFor="nativeLanguage"
        title="Native Language"
        value={personalInfo.native_language || "N/A"}
        disabled
      />

      {/* Blood Group */}
      <InputContainer
        htmlFor="bloodGroup"
        title="Blood Group"
        value={personalInfo.blood_group || "N/A"}
        disabled
      />

      {/* Province */}
      <InputContainer
        width="40%"
        htmlFor="province"
        title="Province"
        value={personalInfo.province || ""}
        disabled
        className="sm:w-full"
      />

      {/* City */}
      <InputContainer
        width="40%"
        htmlFor="city"
        title="City"
        value={personalInfo.city || ""}
        disabled
        className="sm:w-full"
      />

      {/* Addresses */}
      <InputContainer
        htmlFor="postalAddress"
        title="Postal Address"
        value={personalInfo.postal_address || ""}
        disabled
      />
      <InputContainer
        htmlFor="permanentAddress"
        title="Permanent Address"
        value={personalInfo.permanent_address || ""}
        disabled
      />
    </div>
  );
};

export default ReviewPersonalInfo;
