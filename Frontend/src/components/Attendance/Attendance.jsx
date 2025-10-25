import { FaClipboardCheck } from "react-icons/fa";
import Background from "../../assets/Background.png";
import BackButton from "../BackButton";
import AdmissionCard from "../Admissions/AdmissionCard";

const Attendance = () => {
  const subjectCards = [
    {
      id: 1,
      title: "OOP",
      bgColor: "#FFFBEB",
      borderColor: "#FACC15",
      iconBg: "#FACC15",
      Icon: FaClipboardCheck,
      to: "Attendance/OOP",
    },
    {
      id: 2,
      title: "DAA",
      bgColor: "#EFF6FF",
      borderColor: "#3B82F6",
      iconBg: "#3B82F6",
      Icon: FaClipboardCheck,
      to: "Attendance/DAA",
    },
    {
      id: 3,
      title: "FYP-II",
      bgColor: "#FEF2F2",
      borderColor: "#EF4444",
      iconBg: "#EF4444",
      Icon: FaClipboardCheck,
      to: "Attendance/FYP-II",
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
            Dr. Shahid Ali Mahar
          </h1>
        </div>
        <hr className="border-t-[3px] border-gray-900 dark:border-white mb-4" />

        {/* Cards Section */}
        <div className="flex flex-wrap items-center justify-start gap-5 min-h-[60vh] w-full bg-white dark:bg-gray-900 rounded-md overflow-x-auto !p-5">
          {subjectCards.map((card) => (
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

export default Attendance;
