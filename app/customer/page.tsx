import Footer from "@/components/customer/homepage/Footer";
import Hero from "@/components/customer/homepage/Hero";
import HeroPromo from "@/components/customer/homepage/HeroPromo";
import LocationsSection from "@/components/customer/homepage/Location";
import MenuSection from "@/components/customer/homepage/MenuSection";
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
      <LocationsSection />
      <Footer />
    </>
  );
}
