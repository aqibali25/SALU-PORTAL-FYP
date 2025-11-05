import { FaClipboardCheck } from "react-icons/fa";
import Background from "../../assets/Background.png";
import SubjectCardsSection from "../SubjectCardsSection";

const Attendance = () => {
  const username = JSON.parse(localStorage.getItem("user")).username;

  const subjectCards = [
    {
      title: "OOP",
      bgColor: "#FFFBEB",
      borderColor: "#FACC15",
      iconBg: "#FACC15",
      Icon: FaClipboardCheck,
    },
    {
      title: "DAA",
      bgColor: "#EFF6FF",
      borderColor: "#3B82F6",
      iconBg: "#3B82F6",
      Icon: FaClipboardCheck,
    },
    {
      title: "FYP-II",
      bgColor: "#FEF2F2",
      borderColor: "#EF4444",
      iconBg: "#EF4444",
      Icon: FaClipboardCheck,
    },
  ];

  return (
    <div
      className="sm:!px-[40px] md:!px-[80px] !px-5 !py-[20px] min-h-[calc(100vh-90px)] w-full bg-white dark:bg-gray-900"
      style={{
        backgroundImage: `url(${Background})`,
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center",
      }}
    >
      <SubjectCardsSection
        title={username}
        subjects={subjectCards}
        routePrefix="Attendance"
      />
    </div>
  );
};

export default Attendance;
