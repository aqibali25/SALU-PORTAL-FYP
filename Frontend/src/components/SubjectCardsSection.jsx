import BackButton from "./BackButton";
import AdmissionCard from "../components/Admissions/AdmissionCard";

const SubjectCardsLayout = ({ title, subjects, routePrefix }) => {
  return (
    <div className="flex flex-col gap-3 w-full min-h-[80vh] bg-[#D5BBE0] rounded-md !p-5">
      <div className="flex justify-start items-center gap-3">
        <BackButton />
        <h1 className="text-2xl sm:text-3xl md:text-4xl py-3 font-bold text-gray-900 dark:text-white">
          {title}
        </h1>
      </div>

      <hr className="border-t-[3px] border-gray-900 dark:border-white mb-4" />

      <div className="flex flex-wrap items-center justify-start gap-5 min-h-[60vh] w-full bg-white dark:bg-gray-900 rounded-md overflow-x-auto !p-5">
        {subjects.length === 0 ? (
          <h1 className="w-full text-center text-2xl text-red-600">
            You don't have any subject assigned yet!
          </h1>
        ) : (
          subjects.map((card) => (
            <AdmissionCard
              key={card.id}
              title={card.title}
              bgColor={card.bgColor}
              borderColor={card.borderColor}
              iconBg={card.iconBg}
              Icon={card.Icon}
              to={`${routePrefix}/${card.title.replace(/\s+/g, "")}`}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default SubjectCardsLayout;
