import Card from "./Card";
import Background from "../../assets/Background.png";
import { useEffect } from "react";
import { cards } from "../../Hooks/HomeCards";

const Home = () => {
  useEffect(() => {
    document.title = "SALU Portal | Home ";
  });

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
