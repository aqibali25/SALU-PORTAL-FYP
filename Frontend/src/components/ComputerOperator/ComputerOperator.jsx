import { LuClipboardList } from "react-icons/lu";
import Background from "../../assets/Background.png";
import AdmissionCard from "./AdmissionCard";

const ComputerOperator = () => {
  // Object for cards
  const cardData = [
    {
      id: 1,
      title: "Admissions",
      bgColor: "#FEFCE8", // Light yellow background
      borderColor: "#FACC15", // Yellow border
      iconBg: "#FACC15", // Yellow icon background
      Icon: LuClipboardList, // Outlined clipboard icon
    },
    {
      id: 2,
      title: "Approved Form",
      bgColor: "#EFF6FF", // Light blue background
      borderColor: "#3B82F6", // Blue border
      iconBg: "#3B82F6", // Blue icon background
      Icon: LuClipboardList,
    },
    {
      id: 3,
      title: "Pending Form",
      bgColor: "#ECFEFF", // Light teal background
      borderColor: "#06B6D4", // Teal border
      iconBg: "#06B6D4", // Teal icon background
      Icon: LuClipboardList,
    },
    {
      id: 4,
      title: "Revert Form",
      bgColor: "#ECFDF5", // Light green background
      borderColor: "#22C55E", // Green border
      iconBg: "#22C55E", // Green icon background
      Icon: LuClipboardList,
    },
    {
      id: 5,
      title: "Trash Form",
      bgColor: "#FEF2F2", // Light red background
      borderColor: "#EF4444", // Red border
      iconBg: "#EF4444", // Red icon background
      Icon: LuClipboardList,
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
        {/* Header Section */}
        <h1 className="text-2xl sm:text-3xl md:text-4xl py-3 font-bold text-gray-900 dark:text-white">
          Computer Operator
        </h1>
        <hr className="border-t-[3px] border-gray-900 dark:border-white mb-4" />

        {/* Cards Section */}
        <div className="flex flex-wrap items-center justify-center gap-5 min-h-[60vh] w-full bg-white dark:bg-gray-900 rounded-md overflow-x-auto p-5">
          {cardData.map((card) => (
            <AdmissionCard
              key={card.id}
              title={card.title}
              bgColor={card.bgColor}
              borderColor={card.borderColor}
              iconBg={card.iconBg}
              Icon={card.Icon}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ComputerOperator;
