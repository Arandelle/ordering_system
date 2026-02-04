import About from '@/components/main/About';
import ContactUs from '@/components/main/ContactUs';
import HeroVideo from '@/components/main/HeroVideo';
import MainLocationSection from '@/components/main/MainLocationSection';
import MissionVision from '@/components/main/MissionVision';
import NewsSection from '@/components/main/NewsSection';
import ProductMain from '@/components/main/ProductMain';

const MainPage = () => {
  return (
  <>
    <HeroVideo />
    <ProductMain />
    <About />
    <MissionVision />
    <NewsSection />
    <MainLocationSection /> {/** Included how to franchise and CTA button*/}
    <ContactUs />
  </>
  )
}

export default MainPage