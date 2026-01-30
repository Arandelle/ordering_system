import React, { Suspense } from "react";
import FullMenuSection from "./FullMenuSection";
import MenuSectionSkeleton from "@/components/ui/MenuSectionSkeleton";

const page = () => {
  return (
    <Suspense fallback={<MenuSectionSkeleton />}>
      <FullMenuSection />
    </Suspense>
  );
};

export default page;
