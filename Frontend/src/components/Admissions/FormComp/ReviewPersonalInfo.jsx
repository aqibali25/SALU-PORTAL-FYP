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

      {/* Date of Birth split into 3 inputs */}
      <div className="flex w-full max-w-[800px] flex-col md:flex-row gap-[8px] md:gap-5">
        <label className="w-auto md:w-1/4 text-start md:text-right text-gray-900 dark:text-white">
          Date of Birth:
        </label>
        <div className="flex gap-3 w-70">
          <input
            id="dobDay"
            type="text"
            value="15"
            disabled
            placeholder="DD"
            className="w-[20%] !px-2 !py-1 border-2 border-[#a5a5a5] outline-none bg-[#f9f9f9] text-[#2a2a2a] dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 disabled:opacity-60 disabled:cursor-not-allowed"
          />
          <input
            id="dobMonth"
            type="text"
            value="05"
            disabled
            placeholder="MM"
            className="w-[20%] !px-2 !py-1 border-2 border-[#a5a5a5] outline-none bg-[#f9f9f9] text-[#2a2a2a] dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 disabled:opacity-60 disabled:cursor-not-allowed"
          />
          <input
            id="dobYear"
            type="text"
            value="2000"
            disabled
            placeholder="YYYY"
            className="w-[30%] !px-2 !py-1 border-2 border-[#a5a5a5] outline-none bg-[#f9f9f9] text-[#2a2a2a] dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 disabled:opacity-60 disabled:cursor-not-allowed"
          />
        </div>
      </div>

      {/* CNIC */}
      <InputContainer
        width="30%"
        htmlFor="cnic"
        title="CNIC"
        value="12345-1234567-1"
        disabled
        className="sm:w-full" // full width on small screens
      />

      {/* Religion */}
      <InputContainer
        width="40%"
        htmlFor="religion"
        title="Religion"
        value="Islam"
        disabled
        className="sm:w-full"
      />

      {/* Native Language */}
      <InputContainer
        width="40%"
        htmlFor="nativeLanguage"
        title="Native Language"
        value="Urdu"
        disabled
      />

      {/* Blood Group */}
      <InputContainer
        htmlFor="bloodGroup"
        title="Blood Group"
        value="B+"
        disabled
      />

      {/* Province */}
      <InputContainer
        width="40%"
        htmlFor="province"
        title="Province"
        value="Sindh"
        disabled
        className="sm:w-full"
      />

      {/* City */}
      <InputContainer
        width="40%"
        htmlFor="city"
        title="City"
        value="Karachi"
        disabled
        className="sm:w-full"
      />

      {/* Addresses */}
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
