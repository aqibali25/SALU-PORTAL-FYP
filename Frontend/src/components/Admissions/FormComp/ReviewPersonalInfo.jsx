import InputContainer from "../../InputContainer";

const ReviewPersonalInfo = () => {
  return (
    <div className="flex flex-col w-full justify-evenly items-center gap-6 !mt-10 !p-4">
      <InputContainer
        htmlFor="firstName"
        title="First Name"
        value="Aqib"
        disabled
      />
      <InputContainer
        htmlFor="lastName"
        title="Last Name"
        value="Ali"
        disabled
      />

      {/* Gender */}
      <InputContainer htmlFor="gender" title="Gender" value="Male" disabled />

      {/* Date of Birth split into 3 inputs (DD/MM/YYYY) */}
      <div className="flex w-full max-w-[800px] flex-col md:flex-row gap-[8px] md:gap-5">
        <label className="w-auto md:w-1/4 text-start md:text-right text-gray-900 dark:text-white">
          Date of Birth:
        </label>

        <input
          id="dobDay"
          type="text"
          value="15"
          disabled
          placeholder="DD"
          className="w-[15%] !px-2 !py-1 border-2 border-[#a5a5a5] outline-none bg-[#f9f9f9] text-[#2a2a2a] dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 disabled:opacity-60 disabled:cursor-not-allowed"
        />
        <input
          id="dobMonth"
          type="text"
          value="05"
          disabled
          placeholder="MM"
          className="w-[15%] !px-2 !py-1 border-2 border-[#a5a5a5] outline-none bg-[#f9f9f9] text-[#2a2a2a] dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 disabled:opacity-60 disabled:cursor-not-allowed"
        />
        <input
          id="dobYear"
          type="text"
          value="2000"
          disabled
          placeholder="YYYY"
          className="w-[25%] !px-2 !py-1 border-2 border-[#a5a5a5] outline-none bg-[#f9f9f9] text-[#2a2a2a] dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 disabled:opacity-60 disabled:cursor-not-allowed"
        />
      </div>

      {/* CNIC as a single input now */}
      <InputContainer
        htmlFor="cnic"
        title="CNIC"
        value="12345-1234567-1"
        disabled
      />

      {/* Other fields */}
      <InputContainer
        htmlFor="religion"
        title="Religion"
        value="Islam"
        disabled
      />
      <InputContainer
        htmlFor="nativeLanguage"
        title="Native Language"
        value="Urdu"
        disabled
      />
      <InputContainer
        htmlFor="bloodGroup"
        title="Blood Group"
        value="B+"
        disabled
      />
      <InputContainer
        htmlFor="province"
        title="Province"
        value="Sindh"
        disabled
      />
      <InputContainer htmlFor="city" title="City" value="Karachi" disabled />
      <InputContainer
        htmlFor="postalAddress"
        title="Postal Address"
        value="123 Street, Karachi"
        disabled
      />
      <InputContainer
        htmlFor="permanentAddress"
        title="Permanent Address"
        value="456 Street, Sukkur"
        disabled
      />
    </div>
  );
};

export default ReviewPersonalInfo;
