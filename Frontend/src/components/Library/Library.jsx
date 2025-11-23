import React from "react";
import { FaBookOpen } from "react-icons/fa";
import Background from "../../assets/Background.png";
import BackButton from "../BackButton";
import AdmissionCard from "../Admissions/AdmissionCard";
import cookie from "js-cookie";

const Library = () => {
  const userRole = cookie.get("role");

  const libraryCards = [
    userRole !== "student" && {
      id: 1,
      title: "Add Book",
      bgColor: "#F0FDF4",
      borderColor: "#22C55E",
      iconBg: "#22C55E",
      Icon: FaBookOpen,
      btntext: "Add Book",
    },
    {
      id: 2,
      title: "Total Books",
      bgColor: "#EFF6FF",
      borderColor: "#3B82F6",
      iconBg: "#3B82F6",
      Icon: FaBookOpen,
    },
    userRole !== "student" && {
      id: 3,
      title: "Issue Book",
      bgColor: "#F3E8FF",
      borderColor: "#A855F7",
      iconBg: "#A855F7",
      Icon: FaBookOpen,
      btntext: "Issue Book",
    },
    {
      id: 4,
      title: "Issued Books",
      bgColor: "#FFFBEB",
      borderColor: "#F59E0B",
      iconBg: "#F59E0B",
      Icon: FaBookOpen,
    },
    {
      id: 5,
      title: "Overdue Books",
      bgColor: "#FEF2F2",
      borderColor: "#EF4444",
      iconBg: "#EF4444",
      Icon: FaBookOpen,
    },
  ].filter(Boolean); // This removes any false values

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
      {/* Integrated LibraryCardsLayout directly */}
      <div className="flex flex-col gap-3 w-full min-h-[80vh] bg-[#D5BBE0] rounded-md !p-5">
        <div className="flex justify-start items-center gap-3">
          <BackButton />
          <h1 className="text-2xl sm:text-3xl md:text-4xl py-3 font-bold text-gray-900 dark:text-white">
            Library
          </h1>
        </div>

        <hr className="border-t-[3px] border-gray-900 dark:border-white mb-4" />

        <div className="flex flex-wrap items-center justify-center gap-5 min-h-[60vh] w-full bg-white dark:bg-gray-900 rounded-md overflow-x-auto !p-5">
          {libraryCards.length === 0 ? (
            <h1 className="w-full text-center text-2xl text-red-600">
              You don't have any Library options available yet!
            </h1>
          ) : (
            libraryCards.map((card, index) => (
              <AdmissionCard
                key={card.id} // Use card.id instead of index for better performance
                title={card.title}
                bgColor={card.bgColor}
                borderColor={card.borderColor}
                iconBg={card.iconBg}
                Icon={card.Icon}
                btntext={card.btntext}
                to={`Library/${card.title.replace(/\s+/g, "")}`}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Library;
