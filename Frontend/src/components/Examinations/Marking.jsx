import { FaClipboardCheck } from "react-icons/fa";
import Background from "../../assets/Background.png";
import SubjectCardsLayout from "../SubjectCardsSection";

const Marking = () => {
  const username = JSON.parse(localStorage.getItem("user")).username;

  const subjectCards = [
    {
      id: 1,
      title: "OOP",
      bgColor: "#FFFBEB",
      borderColor: "#FACC15",
      iconBg: "#FACC15",
      Icon: FaClipboardCheck,
    },
    {
      id: 2,
      title: "DAA",
      bgColor: "#EFF6FF",
      borderColor: "#3B82F6",
      iconBg: "#3B82F6",
      Icon: FaClipboardCheck,
    },
    {
      id: 3,
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
      <SubjectCardsLayout
        title={username}
        subjects={subjectCards}
        routePrefix="EnterMarks/Subject"
      />
    </div>
  );
};

export default Marking;
