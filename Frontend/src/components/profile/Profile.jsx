import { useEffect, useState } from "react";
import axios from "axios";
import Background from "../../assets/Background.png";
import InputContainer from "../InputContainer";
import ProfilePic from "../../assets/Profile.png"; // Default profile image
import BackButton from "../BackButton";
import { rolesArray } from "../../Hooks/HomeCards";

const Profile = () => {
  const [userData, setUserData] = useState(null);
  const [profileImage, setProfileImage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [imageLoading, setImageLoading] = useState(true);
  const API = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

  useEffect(() => {
    document.title = "SALU Portal | Profile";
    fetchUserData();
    fetchProfileImage();
  }, []);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const res = await axios.get(`${API}/api/users/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        withCredentials: true,
      });

      const userWithFormattedRole = {
        ...res.data,
        role: rolesArray.find((role) => role.toLowerCase() === res.data.role),
      };

      setUserData(userWithFormattedRole);
    } catch (err) {
      console.error("Error fetching profile data:", err);
      alert(err.response?.data?.message || "Failed to load profile.");
    } finally {
      setLoading(false);
    }
  };

  const fetchProfileImage = async () => {
    try {
      setImageLoading(true);
      const token = localStorage.getItem("token");

      const response = await axios.get(`${API}/api/auth/profile-image`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        responseType: "blob", // Important for image data
        withCredentials: true,
      });

      // Create URL for the image blob
      const imageUrl = URL.createObjectURL(response.data);
      setProfileImage(imageUrl);
    } catch (err) {
      console.error("Error fetching profile image:", err);
      // If no profile image exists, profileImage will remain null and default image will be used
    } finally {
      setImageLoading(false);
    }
  };

  // Clean up the object URL when component unmounts
  useEffect(() => {
    return () => {
      if (profileImage) {
        URL.revokeObjectURL(profileImage);
      }
    };
  }, [profileImage]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-90px)] bg-white dark:bg-gray-900">
        <div className="w-16 h-16 border-4 border-yellow-400 border-dashed rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div
      className="sm:!px-[40px] md:!px-[80px] !px-5 !py-[20px] min-h-[calc(100vh-90px)] w-[100%] bg-white dark:bg-gray-900"
      style={{
        backgroundImage: `url(${Background})`,
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center",
      }}
    >
      <div className="flex flex-col gap-3 w-full min-h-[80vh] bg-[#D5BBE0] rounded-md !p-5">
        <div className="flex justify-start items-center gap-3">
          <BackButton />
          <h1 className="text-2xl sm:text-3xl md:text-4xl py-3 font-bold text-gray-900 dark:text-white">
            Profile
          </h1>
        </div>

        <hr className="border-t-[3px] border-gray-900 dark:border-white mb-4" />

        <div className="flex flex-col md:flex-row justify-evenly items-stretch min-h-[60vh] w-full md:!p-10 !p-6 bg-white dark:bg-gray-900 rounded-md overflow-hidden">
          {/* Left Section */}
          <div className="flex flex-col gap-6 items-center justify-center min-w-[20%] text-gray-900 dark:text-gray-100 font-medium">
            {imageLoading ? (
              <div className="w-[200px] h-[200px] rounded-full bg-gray-300 dark:bg-gray-700 flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-yellow-400 border-dashed rounded-full animate-spin"></div>
              </div>
            ) : (
              <img
                className="rounded-full w-[200px] h-[200px] object-cover border-2 border-gray-300 dark:border-gray-600"
                src={profileImage || ProfilePic}
                alt="Profile"
                onError={(e) => {
                  // If the fetched image fails to load, fall back to default image
                  e.target.src = ProfilePic;
                }}
              />
            )}
            <h1 className="text-4xl font-bold">
              {userData?.username || "User"}
            </h1>
          </div>

          {/* Right Section */}
          <div className="flex flex-col justify-center items-center gap-6 w-full md:w-[70%] sm:p-8 space-y-6 overflow-auto">
            <InputContainer
              title="Name"
              htmlFor="Name"
              placeholder="Enter Name"
              value={userData?.username || ""}
              disabled
            />

            <InputContainer
              title="Email"
              htmlFor="email"
              inputType="email"
              placeholder="name@example.com"
              value={userData?.email || ""}
              disabled
            />

            <InputContainer
              title="CNIC No."
              htmlFor="cnic"
              inputType="text"
              placeholder="451XX-XXXXXXX-X"
              value={userData?.cnic || ""}
              disabled
            />

            <InputContainer
              title="Role"
              htmlFor="role"
              inputType="text"
              placeholder="Role"
              value={userData?.role || ""}
              disabled
            />

            {userData?.department && (
              <InputContainer
                title="Department"
                htmlFor="department"
                inputType="text"
                placeholder="Department"
                value={userData.department}
                disabled
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
