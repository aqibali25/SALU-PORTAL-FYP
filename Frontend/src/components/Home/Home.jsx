import Card from "./Card";
import Background from "../../assets/Background.png";
import { useEffect } from "react";
import { cards } from "../../Hooks/HomeCards";
import Cookies from "js-cookie";

const Home = () => {
  useEffect(() => {
    document.title = "SALU Portal | Home ";
  });

  const userRole = Cookies.get("role")?.toLowerCase(); // Convert to lowercase

  // Filter cards based on lowercase user role
  const filteredCards = cards.filter((card) => card.roles.includes(userRole));

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
        items-start
      "
      style={{
        backgroundImage: `url(${Background})`,
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center",
      }}
    >
      {filteredCards.map((card) => (
        <div
          key={card.id}
          className="
            basis-[16%] 
            min-w-[200px] 
            max-[950px]:grow 
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
            roles={card.roles}
          />
        </div>
      ))}
    </div>
  );
};

export default Home;
