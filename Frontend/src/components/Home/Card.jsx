import Profile from "../../assets/Profile.png";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const Card = ({ isImg = false, Heading, Icon, color1, color2, link }) => {
  return (
    <Link
      to={`/SALU-PORTAL-FYP/${link}`}
      className="
        no-underline
        h-full w-full
        rounded-[10px] shadow-md
        !p-6
        flex flex-col items-center justify-around
      "
      style={{
        background: `linear-gradient(to bottom right, ${color1}, ${color2})`,
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
          className="text-gray-800 dark:text-white "
        />
      )}
      <h1 className="uppercase text-xl font-semibold !pt-2 text-center  text-gray-900 dark:text-white">
        {Heading}
      </h1>
    </Link>
  );
};

export default Card;
