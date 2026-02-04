import About from '@/components/main/About';
import ContactUs from '@/components/main/ContactUs';
import HeroVideo from '@/components/main/HeroVideo';
import MainFooterSection from '@/components/main/MainFooterSection';
import MainLocationSection from '@/components/main/MainLocationSection';
import MissionVision from '@/components/main/MissionVision';
import ProductMain from '@/components/main/ProductMain';

const MainPage = () => {
  return (
  <>
    <HeroVideo />
    <ProductMain />
    <About /> {/** Included the mission and vission */}
    <MainLocationSection />
    <ContactUs />
    <MainFooterSection />
  </>
  )
}

export default MainPage