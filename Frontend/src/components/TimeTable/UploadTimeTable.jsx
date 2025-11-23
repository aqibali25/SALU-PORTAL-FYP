import { useState, useEffect } from "react";
import Background from "../../assets/Background.png";
import BackButton from "../BackButton";
import { FaClipboardCheck } from "react-icons/fa";
import { COLOR_COMBINATIONS } from "../../Hooks/useColorCombination";
import { useDepartments } from "../../Hooks/HomeCards";
import FileUploadOverlay from "./FileUploadOverlay";

const UploadTimeTable = () => {
  const [departmentCards, setDepartmentCards] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [showOverlay, setShowOverlay] = useState(false);
  const {
    departmentsArray,
    loading: departmentsLoading,
    error: departmentsError,
  } = useDepartments();

  // Transform departments into cards with unique colors
  useEffect(() => {
    if (departmentsArray && departmentsArray.length > 0) {
      const transformedDepartments = departmentsArray.map(
        (department, index) => {
          const colorIndex = index % COLOR_COMBINATIONS.length;
          const colors = COLOR_COMBINATIONS[colorIndex];

          // Handle both string and object departments
          const departmentTitle =
            typeof department === "string"
              ? department
              : department.name || department.title || "Unknown Department";

          const departmentId =
            typeof department === "object"
              ? department.id || department.departmentId || index
              : index;

          return {
            title: departmentTitle,
            departmentId: departmentId,
            ...colors,
            Icon: FaClipboardCheck,
          };
        }
      );

      setDepartmentCards(transformedDepartments);
    } else {
      setDepartmentCards([]);
    }
  }, [departmentsArray]);

  // Function to handle department card click
  const handleDepartmentClick = (department) => {
    setSelectedDepartment(department);
    setShowOverlay(true);
  };

  // Function to close overlay
  const closeOverlay = () => {
    setShowOverlay(false);
    setSelectedDepartment(null);
  };

  // Show loading state
  if (departmentsLoading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-90px)] bg-white dark:bg-gray-900">
        <div className="w-16 h-16 border-4 border-yellow-400 border-dashed rounded-full animate-spin"></div>
      </div>
    );
  }

  // Show error state
  if (departmentsError) {
    return (
      <div
        className="sm:!px-[40px] md:!px-[80px] !px-5 !py-[20px] min-h-[calc(100vh-90px)] w-full bg-white dark:bg-gray-900 flex items-center justify-center"
        style={{
          backgroundImage: `url(${Background})`,
          backgroundSize: "cover",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center",
        }}
      >
        <div className="text-lg text-red-500 dark:text-red-400 text-center">
          Error loading departments: {departmentsError}
        </div>
      </div>
    );
  }

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
      <div className="flex flex-col gap-3 w-full min-h-[80vh] bg-[#D5BBE0] rounded-md !p-5">
        <div className="flex justify-start items-center gap-3">
          <BackButton url={"/SALU-PORTAL-FYP/TimeTable"} />
          <h1 className="text-2xl sm:text-3xl md:text-4xl py-3 font-bold text-gray-900 dark:text-white">
            Upload Time Table
          </h1>
        </div>

        <hr className="border-t-[3px] border-gray-900 dark:border-white mb-4" />

        <div className="flex flex-wrap items-center justify-center gap-5 min-h-[60vh] w-full bg-white dark:bg-gray-900 rounded-md overflow-x-auto !p-5">
          {departmentCards.length === 0 ? (
            <h1 className="w-full text-center text-2xl text-red-600">
              No departments available!
            </h1>
          ) : (
            departmentCards.map((card, index) => (
              <div
                key={index}
                className="flex flex-col items-center justify-center gap-5 w-60 h-75 !p-4 rounded-lg shadow-sm"
                style={{
                  backgroundColor: card.bgColor,
                  border: `1px solid ${card.borderColor}`,
                }}
              >
                {/* Icon Section */}
                <div
                  className="flex items-center justify-center w-20 h-20 rounded-md"
                  style={{ backgroundColor: card.iconBg }}
                >
                  {card.Icon && <card.Icon className="text-white text-5xl" />}
                </div>

                {/* Title */}
                <h2 className="text-gray-800 text-xl text-center font-medium">
                  {card.title}
                </h2>

                {/* Button */}
                <button
                  onClick={() => handleDepartmentClick(card)}
                  className={`!px-4 !py-1 bg-white border text-gray-800 text-center transition-colors duration-200 cursor-pointer`}
                  style={{ borderColor: card.iconBg }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = card.bgColor;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "white";
                  }}
                >
                  {"View All"}
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Overlay for File Upload */}
      {showOverlay && selectedDepartment && (
        <FileUploadOverlay
          department={selectedDepartment}
          onClose={closeOverlay}
        />
      )}
    </div>
  );
};

export default UploadTimeTable;
