import Background from "../../assets/Background.png";

const Sittings = () => {
  return (
    <div
      className="!p-[25px] !px-[80px] min-h-[calc(100vh-90px)] w-[100%] bg-white dark:bg-gray-900"
      style={{
        backgroundImage: `url(${Background})`,
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center",
      }}
    >
      Sittings
    </div>
  );
};

export default Sittings;
