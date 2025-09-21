import { FiChevronLeft } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

export default function BackButton() {
  const navigate = useNavigate();

  return (
    <div
      className="flex justify-center items-center cursor-pointer"
      onClick={() => navigate(-1)}
    >
      <FiChevronLeft className="text-gray-900 dark:text-white" size={30} />
      <FiChevronLeft
        className="!ml-[-18px] text-gray-900 dark:text-white"
        size={30}
      />
      <FiChevronLeft
        className="!ml-[-18px] text-gray-900 dark:text-white"
        size={30}
      />
    </div>
  );
}
