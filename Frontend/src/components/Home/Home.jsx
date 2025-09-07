import Card from "./Card";
import { faUserPlus, faCog } from "@fortawesome/free-solid-svg-icons";
import Background from "../../assets/Background.png";

const Home = () => {
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
        gap-y-0
        !p-10 !px-20
        min-h-[calc(100vh-90px)]
        w-full
        bg-white dark:bg-gray-900
        justify-between
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
            min-w-[220px] 
            max-[1031px]:grow 
            h-[150px]
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
