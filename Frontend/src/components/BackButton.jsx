import { FiChevronLeft } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

export default function BackButton({ url }) {
  const navigate = useNavigate();

  const handleClick = () => {
    if (url === "-1") {
      // Go back one step in navigation history
      navigate(-1);
    } else if (url) {
      // Navigate to specific URL
      navigate(url);
    } else {
      // Default: redirect to home page
      navigate("/SALU-PORTAL-FYP/");
    }
  };

  return (
    <div
      className="flex justify-center items-center cursor-pointer"
      onClick={handleClick}
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
