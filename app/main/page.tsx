import About from '@/components/main/About';
import ContactUs from '@/components/main/ContactUs';
import HeroVideo from '@/components/main/HeroVideo';
import HowToFranchise from '@/components/main/HowToFranchise';
import MainLocationSection from '@/components/main/MainLocationSection';
import MissionVision from '@/components/main/MissionVision';
import NewsSection from '@/components/main/NewsSection';
import ProductMain from '@/components/main/ProductMain';

const MainPage = () => {
  return (
  <>
    <HeroVideo />
    <ProductMain />
    {/* <About /> */}
    <MissionVision />
    <NewsSection />
    <HowToFranchise />
    <MainLocationSection /> {/** Included how to franchise and CTA button*/}
    {/* <ContactUs /> */}
  </>
  )
}

export default MainPage