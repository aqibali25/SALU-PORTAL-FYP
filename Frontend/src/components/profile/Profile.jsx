import { useEffect, useState } from "react";
import axios from "axios";
import Background from "../../assets/Background.png";
import InputContainer from "../InputContainer";
import ProfilePic from "../../assets/Profile.png";
import BackButton from "../BackButton";

const Profile = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const API = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

  useEffect(() => {
    document.title = "SALU Portal | Profile";
    fetchUserData();
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

      console.log("User Data Response:", res.data); // 👈 Add this
      setUserData(res.data);
    } catch (err) {
      console.error("Error fetching profile data:", err);
      alert(err.response?.data?.message || "Failed to load profile.");
    } finally {
      setLoading(false);
    }
  };

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
            <img
              className="rounded-full w-[200px] h-[200px]"
              src={ProfilePic}
              alt="Profile"
            />
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
              title="Cnic No."
              htmlFor="cnic"
              inputType="text"
              placeholder="451XX-XXXXXXX-X"
              value={
                userData?.cnic || userData?.userCnic || userData?.UserCnic || ""
              }
              disabled
            />

            <InputContainer
              title="Role"
              htmlFor="role"
              inputType="text"
              placeholder="Role"
              value={userData?.role || ""}
              disabled
              rows={4}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
