import Profile from "../../assets/Profile.png";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Cookies from "js-cookie";
import { toast } from "react-toastify";

const Card = ({
  isImg = false,
  Heading,
  Icon,
  color1,
  color2,
  link,
  roles = [],
}) => {
  const navigate = useNavigate();
  const userRole = Cookies.get("role")?.toLowerCase(); // Convert to lowercase

  const handleClick = (e) => {
    e.preventDefault();

    // Check if user has access to this card
    if (roles.length > 0 && !roles.includes(userRole)) {
      toast.error(
        `Access denied! You don't have permission to access ${Heading}.`,
        {
          position: "top-center",
          autoClose: 3000,
        }
      );
      return;
    }

    navigate(`/SALU-PORTAL-FYP/${link}`);
  };

  const hasAccess = roles.length === 0 || roles.includes(userRole);

  return (
    <div
      className={`
        h-full w-full
        rounded-[10px] shadow-md
        !p-6
        flex flex-col items-center justify-around
        cursor-pointer transition-all duration-300
        ${
          hasAccess
            ? "hover:scale-105 hover:shadow-lg"
            : "opacity-60 cursor-not-allowed grayscale"
        }
      `}
      style={{
        background: `linear-gradient(to bottom right, ${color1}, ${color2})`,
      }}
      onClick={handleClick}
    >
      {isImg ? (
        <img
          className="w-[70px] h-[70px] rounded-full"
          src={Profile}
          alt="Profile"
        />
      ) : (
        <FontAwesomeIcon
          icon={Icon}
          size="3x"
          className={`${
            hasAccess ? "text-gray-800 dark:text-white" : "text-gray-500"
          }`}
        />
      )}
      <h1
        className={`uppercase text-xl font-semibold !pt-2 text-center ${
          hasAccess ? "text-gray-900 dark:text-white" : "text-gray-600"
        }`}
      >
        {Heading}
        {!hasAccess && (
          <span className="block text-xs font-normal normal-case mt-1 text-red-600">
            No Access
          </span>
        )}
      </h1>
    </div>
  );
};

export default Card;
