import React, { Suspense } from "react";
import MenuSection from "./components/MenuSection";
import MenuSectionSkeleton from "@/components/ui/MenuSectionSkeleton";

const page = () => {
  return (
    <div className="max-w-360 mx-auto mt-12 mb-3">
      <div className="mx-4">
        <Suspense fallback={<MenuSectionSkeleton />}>
          <MenuSection /> {/** Includes the banner */}
        </Suspense>
      </div>
    </div>
  );
};

export default page;
