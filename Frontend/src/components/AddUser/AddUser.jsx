import { useEffect, useState } from "react";
import Cookies from "js-cookie";

import Background from "../../assets/Background.png";
import CnicInput from "../CNICInput";
import InputContainer from "../InputContainer";

const AddUser = () => {
  const [cnic, setCnic] = useState("");

  useEffect(() => {
    // Safe on client; avoids SSR/hydration issues
    setCnic(Cookies.get("cnic") ?? "");
  }, []);

  return (
    <div
      className="sm:!px-[40px] md:!px-[80px] !px-5 !py-[20px] min-h-[calc(100vh-90px)] w-[100%] bg-white dark:bg-gray-900"
      style={{
        backgroundImage: `url(${Background})`,
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center",
      }}
    >
      <form className="flex flex-col gap-3 w-full min-h-[80vh] bg-[#D5BBE0] rounded-md !p-5">
        <h1 className="text-2xl sm:text-3xl md:text-4xl py-3 font-bold text-gray-900 dark:text-white">
          Add Users
        </h1>

        <hr className="border-t-[3px] border-gray-900 dark:border-white mb-4" />

        <div className="flex flex-col justify-center items-center gap-5 min-h-[60vh] w-full !p-5 bg-white dark:bg-gray-900 rounded-md">
          <InputContainer
            placeholder="Enter Username"
            title="User Name"
            htmlFor="name"
            inputType="text"
            required
          />
          <InputContainer
            placeholder="Enter Useremail Address"
            title="User Email"
            htmlFor="userEmail"
            inputType="email"
            required
          />
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
              htmlFor="cnic"
              className="
      w-auto md:w-1/4
      text-start md:text-right
      text-gray-900 dark:text-white
    "
            >
              <span className="text-[#ff0000] mr-1">*</span>
              CNIC:
            </label>

            <CnicInput id="cnic" value={cnic} readOnly width="70%" />
          </div>

          <InputContainer
            placeholder="Enter Password"
            title="User Password"
            htmlFor="userPassword"
            inputType="password"
            required
          />
          <InputContainer
            placeholder="Enter Confirm Password"
            title="User Confirm Password"
            htmlFor="userConfirmPassword"
            inputType="password"
            required
          />

          <div className="flex w-full max-w-[800px] items-start md:items-center justify-start flex-col md:flex-row gap-[8px] md:gap-5 [@media(max-width:550px)]:gap-[5px]">
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
              className="w-full md:w-auto [@media(max-width:768px)]:!w-full min-w-0 flex-1 !px-2 !py-1 border-2 border-[#a5a5a5] outline-none bg-[#f9f9f9] text-[#2a2a2a] dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
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
          </div>

          <div className="w-full flex justify-end mt-4">
            <button
              type="submit"
              className="
              cursor-pointer
      relative overflow-hidden
      !px-[15px] !py-[5px]
      border-2 border-[#e5b300]
      text-white text-[0.8rem] font-medium
      bg-transparent
      transition-all duration-300 ease-linear

      before:content-[''] before:absolute
      before:inset-x-0 before:bottom-0
      before:h-full before:bg-[#e5b300]
      before:transition-all before:duration-300 before:ease-linear
      hover:before:h-0
    "
            >
              <span className="relative z-10">Save &amp; Proceed</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AddUser;
