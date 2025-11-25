import React, { useEffect } from "react";
import { FaClipboardCheck } from "react-icons/fa";
import Background from "../../assets/Background.png";
import BackButton from "../BackButton";
import AdmissionCard from "../Admissions/AdmissionCard";
import cookie from "js-cookie";

const Subjects = () => {
  const userRole = cookie.get("role");
  console.log(userRole);
  useEffect(() => {
    document.title = "SALU Portal | Subjects";
  }, []);

  const subjectCards = [
    userRole !== "student" &&
      userRole !== "teacher" && {
        id: 1,
        title: "Add Subject",
        bgColor: "#FFFBEB",
        borderColor: "#FACC15",
        iconBg: "#FACC15",
        Icon: FaClipboardCheck,
      },
    {
      id: 2,
      title: "View Subject",
      bgColor: "#EFF6FF",
      borderColor: "#3B82F6",
      iconBg: "#3B82F6",
      Icon: FaClipboardCheck,
    },
  ].filter(Boolean);

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
      {/* Integrated SubjectCardsLayout directly */}
      <div className="flex flex-col gap-3 w-full min-h-[80vh] bg-[#D5BBE0] rounded-md !p-5">
        <div className="flex justify-start items-center gap-3">
          <BackButton />
          <h1 className="text-2xl sm:text-3xl md:text-4xl py-3 font-bold text-gray-900 dark:text-white">
            Subjects
          </h1>
        </div>

        <hr className="border-t-[3px] border-gray-900 dark:border-white mb-4" />

        <div className="flex flex-wrap items-center justify-start gap-5 min-h-[60vh] w-full bg-white dark:bg-gray-900 rounded-md overflow-x-auto !p-5">
          {subjectCards.length === 0 ? (
            <h1 className="w-full text-center text-2xl text-red-600">
              You don't have any Subjects assigned yet!
            </h1>
          ) : (
            subjectCards.map((card, index) => (
              <AdmissionCard
                key={index}
                title={card.title}
                bgColor={card.bgColor}
                borderColor={card.borderColor}
                iconBg={card.iconBg}
                Icon={card.Icon}
                to={`Subjects/${card.title.replace(/\s+/g, "")}`}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Subjects;
