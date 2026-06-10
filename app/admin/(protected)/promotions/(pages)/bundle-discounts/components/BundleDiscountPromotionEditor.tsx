import React from "react";
import { BundleDiscountPromotion } from "../type";
import { BundleDiscountPromotionConfig } from "@/types/promotions/bundle-discount.type";

type BundleDiscountPromotionEditorProps = {
  promotion: BundleDiscountPromotion | BundleDiscountPromotionConfig;
  mode: "create" | "edit";
};

const PERCENTAGE_PRESETS = [10, 15, 20, 25, 30, 50];

const BundleDiscountPromotionEditor = ({
  promotion,
  mode = "create",
}: BundleDiscountPromotionEditorProps) => {
  return (
    <form className="space-y-6">
      <div className="rounded-xl border border-stone-100"></div>
    </form>
  );
};

export default BundleDiscountPromotionEditor;
