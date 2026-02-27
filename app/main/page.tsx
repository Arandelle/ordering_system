import CategoryCarousel from "@/components/main/CategoryCarousel";
import HeroVideo from "@/components/main/HeroVideo";
import MainLocationSection from "@/components/main/MainLocationSection";
import MissionVision from "@/components/main/MissionVision";
import ProductMain from "@/components/main/ProductMain";

const MainPage = () => {
  return (
    <>
      <HeroVideo />
      <CategoryCarousel />
      <ProductMain />
      <MissionVision />
      <MainLocationSection /> {/** Includes order now CTA */}
    </>
  );
};

export default MainPage;
