import Footer from "@/components/homepage/Footer";
import Hero from "@/components/homepage/Hero";
import LocationsSection from "@/components/homepage/Location";
import MenuSection from "@/components/homepage/MenuSection";
import MenuSectionSkeleton from "@/components/ui/MenuSectionSkeleton";
import { Suspense } from "react";

export default function Home() {
  return (
    <>
      <Hero />
      <Suspense fallback={<MenuSectionSkeleton />}>
        <MenuSection variant="landing" />
      </Suspense>
      <LocationsSection />
      <Footer />
    </>
  );
}
