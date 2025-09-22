import InputContainer from "../../InputContainer";

const ReviewFatherInfo = ({ title, data }) => {
  return (
    <div className="flex flex-col w-full justify-evenly items-center gap-6 !mt-6 !p-4">
      <h1 className="text-2xl dark:text-white">{title} Information</h1>

      <InputContainer
        htmlFor="name"
        title={`${title} Name`}
        value={data.name || ""}
        disabled
      />

      {/* CNIC as normal InputContainer with 30% width */}
      <InputContainer
        width="40%"
        htmlFor="cnic"
        title={`${title} CNIC`}
        value={data.cnic || ""}
        disabled
      />

      <InputContainer
        htmlFor="mobileNumber"
        title={`${title} Mobile No`}
        value={data.mobileNumber || ""}
        disabled
      />

      <InputContainer
        htmlFor="occupation"
        title={`${title} Occupation`}
        value={data.occupation || ""}
        disabled
      />
    </div>
  );
};

export default ReviewFatherInfo;
