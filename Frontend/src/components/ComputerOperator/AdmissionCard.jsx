import { Link } from "react-router-dom";

const AdmissionCard = ({ title, bgColor, borderColor, iconBg, Icon }) => {
  return (
    <div
      className="flex flex-col items-center justify-center gap-5 w-55 h-70 !p-6 rounded-lg shadow-sm"
      style={{ backgroundColor: bgColor, border: `1px solid ${borderColor}` }}
    >
      {/* Icon Section */}
      <div
        className="flex items-center justify-center w-20 h-20 rounded-md"
        style={{ backgroundColor: iconBg }}
      >
        {Icon && <Icon className="text-white text-5xl" />}
      </div>

      {/* Title */}
      <h2 className="text-gray-800 text-xl font-medium">{title}</h2>

      {/* Button */}
      <Link
        to="/SALU-PORTAL-FYP/"
        className="!px-4 !py-1 bg-white border border-gray-300 text-gray-800 "
        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = bgColor)}
        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "white")}
      >
        View All
      </Link>
    </div>
  );
};

export default AdmissionCard;
