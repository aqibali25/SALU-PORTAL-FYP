import Background from "../../assets/Background.png";
import InputContainer from "../InputContainer";
import ProfilePic from "../../assets/Profile.png";
import BackButton from "../BackButton";
import { useEffect } from "react";

const Profile = () => {
  useEffect(() => {
    document.title = "SALU Portal | Profile ";
  });
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
      {/* Outer wrapper */}
      <div className="flex flex-col gap-3 w-full min-h-[80vh] bg-[#D5BBE0] rounded-md !p-5">
        <div className="flex justify-start items-center gap-3">
          <BackButton></BackButton>
          <h1 className="text-2xl sm:text-3xl md:text-4xl py-3 font-bold text-gray-900 dark:text-white">
            Profile
          </h1>
        </div>

        {/* Divider */}
        <hr className="border-t-[3px] border-gray-900 dark:border-white mb-4" />

        {/* Main Layout - Left Panel & Form */}
        <div className="flex flex-col md:flex-row justify-evenly items-stretch min-h-[60vh] w-full md:!p-10 !p-6 bg-white dark:bg-gray-900 rounded-md overflow-hidden">
          {/* Left Section */}
          <div className="flex flex-col gap-6 items-center justify-center min-w-[20%] text-gray-900 dark:text-gray-100 font-medium">
            <img
              className="rounded-full w-[200px] h-[200px]"
              src={ProfilePic}
              alt=""
            />
            <h1 className="text-4xl font-bold">Aqib Ali</h1>
          </div>

          {/* Right Section - Form */}
          <div className="flex flex-col justify-center items-center gap-6 w-full md:w-[70%]  sm:p-8 space-y-6 overflow-auto">
            {/* First Name */}
            <InputContainer
              title="First Name"
              htmlFor="firstName"
              placeholder="Enter first name"
              required
            />

            {/* Last Name */}
            <InputContainer
              title="Last Name"
              htmlFor="lastName"
              placeholder="Enter last name"
              required
            />

            {/* Email */}
            <InputContainer
              title="Email"
              htmlFor="email"
              inputType="email"
              placeholder="name@example.com"
              required
            />

            {/* Contact Number */}
            <InputContainer
              title="Contact No."
              htmlFor="contact"
              inputType="tel"
              placeholder="03xx-xxxxxxx"
              required
            />

            {/* Address */}
            <InputContainer
              title="Address"
              htmlFor="address"
              inputType="textarea"
              placeholder="House #, Street, City"
              rows={4}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
