import Header from "@/components/main/Header";
import Footer from "@/components/ui/Footer";
import MenuSectionSkeleton from "@/components/ui/MenuSectionSkeleton";
import React, { Suspense } from "react";

export default function layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Suspense fallback={<MenuSectionSkeleton />}>
        <Header />
      </Suspense>
      {children}
      <Footer variant="marketing"/>
    </>
  );
}
