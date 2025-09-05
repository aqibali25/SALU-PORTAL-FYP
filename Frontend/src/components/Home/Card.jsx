import Profile from "../../assets/Profile.png";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const Card = ({ isImg = false, Heading, Icon, color1, color2 }) => {
  return (
    <Link
      to={
        Heading === "Profile"
          ? "/SALU-PORTAL-FYP/Profile"
          : "/SALU-PORTAL-FYP/Adduser"
      }
      className="no-underline h-[150px] w-[220px] rounded-[10px] shadow-md !p-6 flex flex-col items-center justify-around"
      style={{
        background: `linear-gradient(to bottom right,${color1} , ${color2})`,
      }}
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
          size="4x"
          className="text-white dark:text-gray-800"
        />
      )}
      <h1 className="uppercase text-xl font-semibold pt-[8px] text-white dark:text-gray-900">
        {Heading}
      </h1>
    </Link>
  );
};

export default Card;
