'use client';

import SectionHeader from "@/app/admin/components/SectionHeader";
import { DEFAULT_BUNDLE_PROMOTION_DISCOUNT } from "@/types/promotions/bundle-discount.type";
import BundleDiscountPromotionEditor from "../components/BundleDiscountPromotionEditor";

const page = () => {
  return (
    <div className="space-y-6">
      <SectionHeader
        title="Create Bundle Discount"
        subTitle="Manage your bundle discount - either same items, different items, or combo items"
      />
      <BundleDiscountPromotionEditor
        promotion={DEFAULT_BUNDLE_PROMOTION_DISCOUNT}
        mode="create"
      />
    </div>
  );
};

export default page;
