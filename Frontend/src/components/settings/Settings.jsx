import { useEffect } from "react";
import Background from "../../assets/Background.png";
import BackButton from "../BackButton";

const Sittings = () => {
  useEffect(() => {
    document.title = "SALU Portal | Settings ";
  });
  return (
    <div
      className="!p-[25px] !px-[80px] min-h-[calc(100vh-90px)] w-[100%] bg-white dark:bg-gray-900"
      style={{
        backgroundImage: `url(${Background})`,
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center",
      }}
    >
      <div className="flex flex-col gap-3 w-full min-h-[80vh] bg-[#D5BBE0] rounded-md !p-5">
        <div className="flex justify-start items-center gap-3">
          <BackButton></BackButton>
          <h1 className="text-2xl sm:text-3xl md:text-4xl py-3 font-bold text-gray-900 dark:text-white">
            Settings
          </h1>
        </div>
        <hr className="border-t-[3px] border-gray-900 dark:border-white mb-4" />
        <div className="flex flex-col justify-start items-center min-h-[60vh] w-full bg-white dark:bg-gray-900 rounded-md overflow-x-auto"></div>
      </div>
    </div>
  );
};

export default Sittings;
