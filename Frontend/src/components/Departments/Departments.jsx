import { FaClipboardCheck } from "react-icons/fa";
import Background from "../../assets/Background.png";
import SubjectCardsLayout from "../SubjectCardsSection";

const Departments = () => {
  const departmentCards = [
    {
      id: 1,
      title: "Add Department",
      bgColor: "#FFFBEB",
      borderColor: "#FACC15",
      iconBg: "#FACC15",
      Icon: FaClipboardCheck,
    },
    {
      id: 2,
      title: "View Departments",
      bgColor: "#EFF6FF",
      borderColor: "#3B82F6",
      iconBg: "#3B82F6",
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
        title="Departments"
        subjects={departmentCards}
        routePrefix="Departments"
      />
    </div>
  );
};

export default Departments;
