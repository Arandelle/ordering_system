import BestSellers from "@/components/customer/homepage/BestSellers";
import HeroPromo from "@/components/customer/homepage/HeroPromo";
import LocationsSection from "@/components/customer/homepage/Location";
import MenuSection from "@/components/customer/homepage/MenuSection";
import StickyScrollProducts from "@/components/customer/homepage/StickyScrollProducts";
import StorySection from "@/components/customer/homepage/StorySection";
import Testimonials from "@/components/customer/homepage/Testimonials";
import MenuSectionSkeleton from "@/components/ui/MenuSectionSkeleton";
import { Suspense } from "react";

export default function Home() {
  return (
    <>
      <HeroPromo />
      {/* <Hero /> */}
      <Suspense fallback={<MenuSectionSkeleton />}>
        <MenuSection variant="landing" />
      </Suspense>
      <StorySection />
      <BestSellers />
      <StickyScrollProducts />
      <Testimonials />
      <LocationsSection />
    </>
  );
}
