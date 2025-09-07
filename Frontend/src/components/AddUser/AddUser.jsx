import Background from "../../assets/Background.png";
import InputContainer from "../InputContainer";

const AddUser = () => {
  return (
    <div
      className="
         sm:!px-[40px] md:!px-[80px] !px-5
         !py-[20px]
         min-h-[calc(100vh-90px)] w-[100%] bg-white dark:bg-gray-900
      "
      style={{
        backgroundImage: `url(${Background})`,
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center",
      }}
    >
      {/* Main container */}
      <form className="flex flex-col gap-3 w-full min-h-[80vh] bg-[#D5BBE0] rounded-md !p-5">
        {/* Heading */}
        <h1 className="text-2xl sm:text-3xl md:text-4xl py-3 font-bold text-gray-900 dark:text-white">
          Add Users
        </h1>

        {/* Divider */}
        <hr className="border-t-[3px] border-gray-900 dark:border-white mb-4" />

        {/* Content Section */}
        <div className="flex flex-col justify-center items-center gap-5 min-h-[60vh] w-full !p-5 bg-white dark:bg-gray-900 rounded-md">
          {/* User Name */}
          <InputContainer
            title="User Name"
            htmlFor="userName"
            inputType="text"
            required
          />

          {/* User Email */}
          <InputContainer
            title="User Email"
            htmlFor="userEmail"
            inputType="email"
            required
          />

          {/* User Password */}
          <InputContainer
            title="User Password"
            htmlFor="userPassword"
            inputType="password"
            required
          />

          {/* User Confirm Password */}
          <InputContainer
            title="User Confirm Password"
            htmlFor="userConfirmPassword"
            inputType="password"
            required
          />

          {/* User Role (Select) – colors only */}
          <div
            className="
                flex w-full max-w-[800px]
                items-start md:items-center justify-start
                flex-col md:flex-row
                gap-[8px] md:gap-5
                [@media(max-width:550px)]:gap-[5px]
              "
          >
            <label
              htmlFor="userRole"
              className="w-auto md:w-1/4 text-start md:text-right text-gray-900 dark:text-white"
            >
              <span className="text-[#ff0000] mr-1">*</span>
              User Role:
            </label>

            <select
              id="userRole"
              required
              defaultValue=""
              className="
                  w-full md:w-auto
                  [@media(max-width:768px)]:!w-full
                  min-w-0 flex-1
                  px-2 py-1
                  border-2 border-[#a5a5a5] outline-none
                  bg-[#f9f9f9] text-[#2a2a2a]
                  dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100
                "
            >
              <option value="" disabled>
                [Select an Option]
              </option>
              <option value="admin">Admin</option>
              <option value="faculty">Faculty</option>
              <option value="student">Student</option>
              <option value="staff">Staff</option>
              <option value="guest">Guest</option>
            </select>
            {/* </div> */}
          </div>
          <button className="bg-amber-400 !px-10 !py-2" type="submit">
            {" "}
            Submit
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddUser;
