import Card from "./Card";
import { faUserPlus } from "@fortawesome/free-solid-svg-icons";
import Background from "../../assets/Background.png";

const Home = () => {
  return (
    <div
      className="flex gap-[50px] !p-[25px] !px-[80px] min-h-[calc(100vh-90px)] w-[100%] bg-white dark:bg-gray-900"
      style={{
        backgroundImage: `url(${Background})`,
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center",
      }}
    >
      <Card
        Heading={"Profile"}
        isImg={true}
        color1={"#4F1A60"}
        color2={"#D5BBE0"}
      />
      <Card
        Heading={"Add User"}
        isImg={false}
        Icon={faUserPlus}
        color1={"#FDDE09"}
        color2={"#FFF4AB"}
      />
    </div>
  );
};

export default Home;
