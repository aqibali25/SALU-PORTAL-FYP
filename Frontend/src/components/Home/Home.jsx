import Card from "./Card";
import {
  faUserPlus,
  faCog,
  faUsers,
  faComputer,
  faBookOpen,
  faCalendarAlt,
} from "@fortawesome/free-solid-svg-icons";
import Background from "../../assets/Background.png";
import { useEffect } from "react";

const Home = () => {
  useEffect(() => {
    document.title = "SALU Portal | Home ";
  });

  const cards = [
    {
      id: 1,
      Heading: "Profile",
      link: "Profile",
      isImg: true,
      color1: "#4F1A60",
      color2: "#f5f5f5",
    },
    {
      id: 2,
      Heading: "Add User",
      link: "Adduser",
      isImg: false,
      Icon: faUserPlus,
      color1: "#FDDE09",
      color2: "#f5f5f5",
    },
    {
      id: 3,
      Heading: "List Users",
      link: "ListUsers",
      isImg: false,
      Icon: faUsers,
      color1: "#E40070",
      color2: "#f5f5f5",
    },
    {
      id: 4,
      Heading: "Admissions",
      link: "Admissions",
      isImg: false,
      Icon: faComputer,
      color1: "#22b508",
      color2: "#f5f5f5",
    },
    {
      id: 5,
      Heading: "Subject Allocation",
      link: "SubjectAllocation",
      isImg: false,
      Icon: faBookOpen,
      color1: "#CA4DFF",
      color2: "#f5f5f5",
    },
    {
      id: 6,
      Heading: "Attendance",
      link: "Attendance",
      isImg: false,
      Icon: faCalendarAlt,
      color1: "#007BFF", // calm blue for attendance
      color2: "#f5f5f5",
    },
    {
      id: 7,
      Heading: "Settings",
      link: "Settings",
      isImg: false,
      Icon: faCog,
      color1: "#09FDEE",
      color2: "#f5f5f5",
    },
  ];

  return (
    <div
      className="
        flex flex-wrap
        gap-x-6
        gap-y-3
        !p-10 !max-px-20
        min-h-[calc(100vh-96px)]
        w-full
        bg-white dark:bg-gray-900
        justify-center
      "
      style={{
        backgroundImage: `url(${Background})`,
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center",
      }}
    >
      {cards.map((card) => (
        <div
          key={card.id}
          className="
            basis-[20%] 
            min-w-[200px] 
            max-[950px]:grow 
            h-[180px]
          "
        >
          <Card
            Heading={card.Heading}
            link={card.link}
            isImg={card.isImg}
            Icon={card.Icon}
            color1={card.color1}
            color2={card.color2}
          />
        </div>
      ))}
    </div>
  );
};

export default Home;
