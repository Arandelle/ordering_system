import About from "@/components/main/About";
import HeroVideo from "@/components/main/HeroBanner";
import MainIntro from "@/components/main/MainIntro";
import MainLocationSection from "@/components/main/MainLocationSection";
import WhatWeServe from "@/components/main/WhatWeServe";

const MainPage = () => {
  return (
    <>
      <HeroVideo />
      <MainIntro />
      <About />
      <WhatWeServe />
      <MainLocationSection /> {/** Includes order now CTA */}
    </>
  );
};

export default MainPage;
