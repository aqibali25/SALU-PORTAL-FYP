import { LuFileText, LuRotateCcw, LuTrash2 } from "react-icons/lu";
import { AiOutlineClockCircle, AiOutlineCheckCircle } from "react-icons/ai";

import Background from "../../assets/Background.png";
import AdmissionCard from "./AdmissionCard";
import BackButton from "../BackButton";

const ComputerOperator = () => {
  // Object for cards
  const cardData = [
    {
      id: 1,
      title: "Recived Forms",
      bgColor: "#EFF6FF",
      borderColor: "#3B82F6",
      iconBg: "#3B82F6",
      Icon: LuFileText,
      to: "Admissions/RecivedForms",
    },
    {
      id: 2,
      title: "Approved Forms",
      bgColor: "#ECFDF5",
      borderColor: "#22C55E",
      iconBg: "#22C55E",
      Icon: AiOutlineCheckCircle,
      to: "Admissions/ApprovedForms",
    },
    {
      id: 3,
      title: "Pending Forms",
      bgColor: "#FEFCE8",
      borderColor: "#FACC15",
      iconBg: "#FACC15",
      Icon: AiOutlineClockCircle,
      to: "Admissions/PendingForms",
    },
    {
      id: 4,
      title: "Revert Forms",
      bgColor: "#ECFEFF",
      borderColor: "#06B6D4",
      iconBg: "#06B6D4",
      Icon: LuRotateCcw,
      to: "Admissions/RevertForms",
    },
    {
      id: 5,
      title: "Trash Forms",
      bgColor: "#FEF2F2",
      borderColor: "#EF4444",
      iconBg: "#EF4444",
      Icon: LuTrash2,
      to: "Admissions/TrashForms",
    },
  ];

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
      <div className="flex flex-col gap-3 w-full min-h-[80vh] bg-[#D5BBE0] rounded-md !p-5">
        <div className="flex justify-start items-center gap-3">
          <BackButton></BackButton>
          <h1 className="text-2xl sm:text-3xl md:text-4xl py-3 font-bold text-gray-900 dark:text-white">
            Computer Operator
          </h1>
        </div>
        <hr className="border-t-[3px] border-gray-900 dark:border-white mb-4" />

        {/* Cards Section */}
        <div className="flex flex-wrap items-center justify-center gap-5 min-h-[60vh] w-full bg-white dark:bg-gray-900 rounded-md overflow-x-auto !p-5">
          {cardData.map((card) => (
            <AdmissionCard
              key={card.id}
              title={card.title}
              bgColor={card.bgColor}
              borderColor={card.borderColor}
              iconBg={card.iconBg}
              Icon={card.Icon}
              to={card.to}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ComputerOperator;
