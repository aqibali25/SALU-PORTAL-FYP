import { useState, useEffect } from "react";
import Profile from "../../assets/Profile.png";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Cookies from "js-cookie";
import { toast } from "react-toastify";
import axios from "axios";

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
  const [profileImage, setProfileImage] = useState(null);
  const [imageLoading, setImageLoading] = useState(false);
  const userRole = Cookies.get("role")?.toLowerCase(); // Convert to lowercase
  const API = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

  // Fetch profile image when this is a profile card and user has access
  useEffect(() => {
    if (isImg) {
      fetchProfileImage();
    }
  }, [isImg]);

  // Fetch profile image from API
  const fetchProfileImage = async () => {
    try {
      setImageLoading(true);
      const token = localStorage.getItem("token");

      if (!token) {
        console.warn("No token found in localStorage");
        return;
      }

      const response = await axios.get(`${API}/api/users/profile-image`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        responseType: "blob",
        withCredentials: true,
      });

      // Create URL for the image blob
      const imageUrl = URL.createObjectURL(response.data);
      setProfileImage(imageUrl);
    } catch (err) {
      console.error("Error fetching profile image:", err);
      // If no profile image exists or error occurs, profileImage will remain null
    } finally {
      setImageLoading(false);
    }
  };

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

  // Determine which image to display for profile cards
  const getProfileImage = () => {
    if (!hasAccess) {
      return Profile; // Return default image if no access
    }
    return profileImage || Profile; // Return fetched image or default
  };

  // Clean up the object URL when component unmounts
  useEffect(() => {
    return () => {
      if (profileImage) {
        URL.revokeObjectURL(profileImage);
      }
    };
  }, [profileImage]);

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
            ? "hover:scale-102 hover:shadow-lg"
            : "opacity-60 cursor-not-allowed grayscale"
        }
      `}
      style={{
        background: `linear-gradient(to bottom right, ${color1}, ${color2})`,
      }}
      onClick={handleClick}
    >
      {isImg ? (
        <div className="relative">
          {imageLoading ? (
            <div className="w-[70px] h-[70px] rounded-full bg-gray-300 flex items-center justify-center">
              <div className="w-6 h-6 border-2 border-yellow-400 border-dashed rounded-full animate-spin"></div>
            </div>
          ) : (
            <img
              className="w-[70px] h-[70px] rounded-full object-cover border-2 border-gray-300"
              src={getProfileImage()}
              alt="Profile"
              onError={(e) => {
                // Fallback to default image if the fetched image fails to load
                e.target.src = Profile;
              }}
            />
          )}
        </div>
      ) : (
        <FontAwesomeIcon
          icon={Icon}
          size="3x"
          className={`${hasAccess ? "text-gray-900" : "text-gray-500"}`}
        />
      )}
      <h1
        className={`uppercase text-lg font-semibold !pt-2 text-center ${
          hasAccess ? "text-gray-900" : "text-gray-600"
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
