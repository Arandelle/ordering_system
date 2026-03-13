import HeroVideo from "@/components/main/HeroBanner";
import MainLocationSection from "@/components/main/MainLocationSection";
import MissionVision from "@/components/main/MissionVision";
import ProductMain from "@/components/main/ProductMain";
import EventsPage from "../customer/events/page";

const MainPage = () => {
  return (
    <>
      <HeroVideo />
      <ProductMain />
      <MissionVision />
      <MainLocationSection /> {/** Includes order now CTA */}
      <div className="pt-1 bg-gray-500">
        <EventsPage />
      </div>
    </>
  );
};

export default MainPage;
