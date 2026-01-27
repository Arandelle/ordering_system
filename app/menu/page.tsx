import React, { Suspense } from "react";
import FullMenuSection from "./FullMenuSection";

const page = () => {
  return <Suspense fallback={<div>Loading menu...</div>}>
    <FullMenuSection />
  </Suspense>;
};

export default page;
