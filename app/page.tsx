import Footer from "@/components/homepage/Footer";
import Hero from "@/components/homepage/Hero";
import MenuSection from "@/components/homepage/MenuSection";
import { Suspense } from "react";

export default function Home() {
  return (
    <>
      <Hero />
      <Suspense fallback={<div>Loading menu...</div>}>
        <MenuSection variant="landing" />
      </Suspense>
      <Footer />
    </>
  );
}
